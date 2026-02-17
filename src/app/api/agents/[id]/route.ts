import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents, agentSkills, plugins, mcpTools, usageHistory, skills, departments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agentRows = db.select().from(agents).where(eq(agents.id, id)).all();
  if (agentRows.length === 0) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
  const agent = agentRows[0];

  // Skills
  const allSkills = db.select().from(skills).all();
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));
  const agentSkillRows = db.select().from(agentSkills).where(eq(agentSkills.agentId, id)).all();
  const agentSkillList = agentSkillRows.map((as) => skillMap.get(as.skillId)).filter(Boolean);

  // Plugins
  const pluginRows = db.select().from(plugins).where(eq(plugins.agentId, id)).all();

  // MCP Tools
  const mcpRows = db.select().from(mcpTools).where(eq(mcpTools.agentId, id)).all();

  // Usage History
  const usageRows = db.select().from(usageHistory).where(eq(usageHistory.agentId, id)).all();

  return NextResponse.json({
    ...agent,
    position: { x: agent.posX, y: agent.posY },
    skills: agentSkillList,
    plugins: pluginRows,
    mcpTools: mcpRows,
    usageHistory: usageRows.map((u) => ({ date: u.date, tokens: u.tokens, cost: u.cost, requests: u.requests })),
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = db.select().from(agents).where(eq(agents.id, id)).all();
  if (existing.length === 0) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.vendor !== undefined) updates.vendor = body.vendor;
  if (body.model !== undefined) updates.model = body.model;
  if (body.status !== undefined) updates.status = body.status;
  if (body.monthlyCost !== undefined) updates.monthlyCost = body.monthlyCost;
  if (body.deptId !== undefined) updates.deptId = body.deptId;

  if (Object.keys(updates).length > 0) {
    db.update(agents).set(updates).where(eq(agents.id, id)).run();
  }

  // Update skills if provided
  if (body.skillIds) {
    db.delete(agentSkills).where(eq(agentSkills.agentId, id)).run();
    for (const skillId of body.skillIds) {
      db.insert(agentSkills).values({ agentId: id, skillId }).run();
    }
  }

  // Recalculate department spend if cost changed
  if (body.monthlyCost !== undefined || body.deptId !== undefined) {
    const agent = db.select().from(agents).where(eq(agents.id, id)).all()[0];
    const deptAgents = db.select().from(agents).where(eq(agents.deptId, agent.deptId)).all();
    const totalSpend = deptAgents.reduce((sum, a) => sum + a.monthlyCost, 0);
    db.update(departments).set({ monthlySpend: totalSpend }).where(eq(departments.id, agent.deptId)).run();
  }

  return NextResponse.json({ message: "Agent updated" });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(agents).where(eq(agents.id, id)).all();
  if (existing.length === 0) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const deptId = existing[0].deptId;
  db.delete(agents).where(eq(agents.id, id)).run();

  // Recalculate department spend
  const deptAgents = db.select().from(agents).where(eq(agents.deptId, deptId)).all();
  const totalSpend = deptAgents.reduce((sum, a) => sum + a.monthlyCost, 0);
  db.update(departments).set({ monthlySpend: totalSpend }).where(eq(departments.id, deptId)).run();

  return NextResponse.json({ message: "Agent deleted" });
}
