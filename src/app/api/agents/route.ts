import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents, agentSkills, plugins, mcpTools, usageHistory, departments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dept = searchParams.get("dept");
  const vendor = searchParams.get("vendor");
  const status = searchParams.get("status");

  let rows = db.select().from(agents).all();

  if (dept) rows = rows.filter((a) => a.deptId === dept);
  if (vendor) rows = rows.filter((a) => a.vendor === vendor);
  if (status) rows = rows.filter((a) => a.status === status);

  // Join department name
  const deptRows = db.select().from(departments).all();
  const deptMap = new Map(deptRows.map((d) => [d.id, d.name]));

  const result = rows.map((a) => ({
    ...a,
    departmentName: deptMap.get(a.deptId) ?? "",
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = `agent-${Date.now()}`;
  const now = new Date().toISOString();

  db.insert(agents).values({
    id,
    deptId: body.deptId,
    name: body.name,
    description: body.description ?? "",
    vendor: body.vendor ?? "anthropic",
    model: body.model ?? "",
    status: body.status ?? "idle",
    monthlyCost: body.monthlyCost ?? 0,
    tokensUsed: body.tokensUsed ?? 0,
    posX: body.posX ?? Math.random() * 200 + 50,
    posY: body.posY ?? Math.random() * 150 + 80,
    lastActive: now,
    createdAt: now,
  }).run();

  // Link skills
  if (body.skillIds?.length) {
    for (const skillId of body.skillIds) {
      db.insert(agentSkills).values({ agentId: id, skillId }).run();
    }
  }

  // Create plugins
  if (body.plugins?.length) {
    for (const p of body.plugins) {
      db.insert(plugins).values({
        id: `plugin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentId: id,
        name: p.name,
        icon: p.icon ?? "",
        description: p.description ?? "",
        version: p.version ?? "1.0.0",
        enabled: p.enabled ?? true,
      }).run();
    }
  }

  // Create MCP tools
  if (body.mcpTools?.length) {
    for (const m of body.mcpTools) {
      db.insert(mcpTools).values({
        id: `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentId: id,
        name: m.name,
        server: m.server ?? "",
        icon: m.icon ?? "",
        description: m.description ?? "",
        category: m.category ?? "api",
      }).run();
    }
  }

  // Recalculate department monthly spend
  const deptAgents = db.select().from(agents).where(eq(agents.deptId, body.deptId)).all();
  const totalSpend = deptAgents.reduce((sum, a) => sum + a.monthlyCost, 0);
  db.update(departments).set({ monthlySpend: totalSpend }).where(eq(departments.id, body.deptId)).run();

  return NextResponse.json({ id, message: "Agent created" }, { status: 201 });
}
