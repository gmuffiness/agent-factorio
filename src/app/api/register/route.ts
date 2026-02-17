import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents, agentSkills, plugins, mcpTools, departments, skills, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { agentName, vendor, model, departmentId, departmentName } = body;

  if (!agentName || !vendor || !model) {
    return NextResponse.json(
      { error: "agentName, vendor, and model are required" },
      { status: 400 }
    );
  }

  // Resolve or create department
  let deptId = departmentId;
  if (!deptId && departmentName) {
    // Create new department
    deptId = `dept-${Date.now()}`;
    const orgs = db.select().from(organizations).all();
    const orgId = orgs[0]?.id ?? "org-1";
    const existing = db.select().from(departments).all();
    const maxY = existing.reduce((max, d) => Math.max(max, d.layoutY + d.layoutH), 0);

    db.insert(departments).values({
      id: deptId,
      orgId,
      name: departmentName,
      description: "",
      budget: 0,
      monthlySpend: 0,
      primaryVendor: vendor,
      layoutX: 50,
      layoutY: maxY + 50,
      layoutW: 300,
      layoutH: 240,
      createdAt: new Date().toISOString(),
    }).run();
  }

  if (!deptId) {
    // Default to first department
    const deptRows = db.select().from(departments).all();
    if (deptRows.length === 0) {
      return NextResponse.json({ error: "No departments exist. Provide departmentName to create one." }, { status: 400 });
    }
    deptId = deptRows[0].id;
  }

  // Create agent
  const agentId = `agent-${Date.now()}`;
  const now = new Date().toISOString();

  db.insert(agents).values({
    id: agentId,
    deptId,
    name: agentName,
    description: body.description ?? `Registered via CLI at ${now}`,
    vendor,
    model,
    status: "active",
    monthlyCost: body.monthlyCost ?? 0,
    tokensUsed: 0,
    posX: Math.random() * 200 + 50,
    posY: Math.random() * 150 + 80,
    lastActive: now,
    createdAt: now,
  }).run();

  // Link skills by name
  if (body.skills?.length) {
    const allSkills = db.select().from(skills).all();
    const skillNameMap = new Map(allSkills.map((s) => [s.name.toLowerCase(), s.id]));
    for (const skillName of body.skills) {
      const skillId = skillNameMap.get(skillName.toLowerCase());
      if (skillId) {
        db.insert(agentSkills).values({ agentId, skillId }).run();
      }
    }
  }

  // Create plugins
  if (body.plugins?.length) {
    for (const p of body.plugins) {
      const name = typeof p === "string" ? p : p.name;
      db.insert(plugins).values({
        id: `plugin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentId,
        name,
        icon: typeof p === "object" ? p.icon ?? "" : "",
        description: typeof p === "object" ? p.description ?? "" : "",
        version: typeof p === "object" ? p.version ?? "1.0.0" : "1.0.0",
        enabled: true,
      }).run();
    }
  }

  // Create MCP tools
  if (body.mcpTools?.length) {
    for (const m of body.mcpTools) {
      const name = typeof m === "string" ? m : m.name;
      db.insert(mcpTools).values({
        id: `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agentId,
        name,
        server: typeof m === "object" ? m.server ?? "" : "",
        icon: typeof m === "object" ? m.icon ?? "" : "",
        description: typeof m === "object" ? m.description ?? "" : "",
        category: typeof m === "object" ? m.category ?? "api" : "api",
      }).run();
    }
  }

  // Recalculate department spend
  const deptAgents = db.select().from(agents).where(eq(agents.deptId, deptId)).all();
  const totalSpend = deptAgents.reduce((sum, a) => sum + a.monthlyCost, 0);
  db.update(departments).set({ monthlySpend: totalSpend }).where(eq(departments.id, deptId)).run();

  return NextResponse.json({
    id: agentId,
    departmentId: deptId,
    message: `Agent "${agentName}" registered successfully`,
  }, { status: 201 });
}
