import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, departments, agents, skills, agentSkills, plugins, mcpTools, costHistory, usageHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Organization, Department, Agent, Skill, Plugin, McpTool, MonthlyCost, DailyUsage } from "@/types";

export async function GET() {
  const orgs = db.select().from(organizations).all();
  if (orgs.length === 0) {
    return NextResponse.json({ error: "No organization found" }, { status: 404 });
  }
  const org = orgs[0];

  const deptRows = db.select().from(departments).where(eq(departments.orgId, org.id)).all();
  const allSkills = db.select().from(skills).all();
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  const depts: Department[] = [];

  for (const dept of deptRows) {
    const agentRows = db.select().from(agents).where(eq(agents.deptId, dept.id)).all();
    const agentList: Agent[] = [];

    for (const agent of agentRows) {
      // Skills
      const agentSkillRows = db.select().from(agentSkills).where(eq(agentSkills.agentId, agent.id)).all();
      const agentSkillList: Skill[] = agentSkillRows
        .map((as) => skillMap.get(as.skillId))
        .filter((s): s is Skill => s !== undefined) as Skill[];

      // Plugins
      const pluginRows = db.select().from(plugins).where(eq(plugins.agentId, agent.id)).all();
      const pluginList: Plugin[] = pluginRows.map((p) => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        description: p.description,
        version: p.version,
        enabled: p.enabled,
      }));

      // MCP Tools
      const mcpRows = db.select().from(mcpTools).where(eq(mcpTools.agentId, agent.id)).all();
      const mcpList: McpTool[] = mcpRows.map((m) => ({
        id: m.id,
        name: m.name,
        server: m.server,
        icon: m.icon,
        description: m.description,
        category: m.category as McpTool["category"],
      }));

      // Usage History
      const usageRows = db.select().from(usageHistory).where(eq(usageHistory.agentId, agent.id)).all();
      const usageList: DailyUsage[] = usageRows.map((u) => ({
        date: u.date,
        tokens: u.tokens,
        cost: u.cost,
        requests: u.requests,
      }));

      agentList.push({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        vendor: agent.vendor as Agent["vendor"],
        model: agent.model,
        status: agent.status as Agent["status"],
        monthlyCost: agent.monthlyCost,
        tokensUsed: agent.tokensUsed,
        position: { x: agent.posX, y: agent.posY },
        skills: agentSkillList,
        plugins: pluginList,
        mcpTools: mcpList,
        usageHistory: usageList,
        lastActive: agent.lastActive,
        createdAt: agent.createdAt,
      });
    }

    // Cost History
    const costRows = db.select().from(costHistory).where(eq(costHistory.deptId, dept.id)).all();
    const costList: MonthlyCost[] = costRows.map((c) => ({
      month: c.month,
      amount: c.amount,
      byVendor: {
        anthropic: c.anthropic,
        openai: c.openai,
        google: c.google,
      },
    }));

    depts.push({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      budget: dept.budget,
      monthlySpend: dept.monthlySpend,
      layout: { x: dept.layoutX, y: dept.layoutY, width: dept.layoutW, height: dept.layoutH },
      primaryVendor: dept.primaryVendor as Department["primaryVendor"],
      agents: agentList,
      costHistory: costList,
    });
  }

  const result: Organization = {
    id: org.id,
    name: org.name,
    totalBudget: org.totalBudget,
    departments: depts,
  };

  return NextResponse.json(result);
}
