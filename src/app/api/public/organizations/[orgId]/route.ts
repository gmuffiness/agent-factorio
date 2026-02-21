import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const supabase = getSupabase();

  // Fetch org — must be public
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, description, visibility, forked_from")
    .eq("id", orgId)
    .eq("visibility", "public")
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Fetch fork count + departments in parallel
  const [{ data: forkRows }, { data: deptRows }] = await Promise.all([
    supabase.from("organizations").select("id").eq("forked_from", orgId),
    supabase.from("departments").select("id, name, description, primary_vendor, budget").eq("org_id", orgId),
  ]);

  const forkCount = (forkRows ?? []).length;
  const deptIds = (deptRows ?? []).map((d) => d.id);

  if (deptIds.length === 0) {
    return NextResponse.json(
      {
        id: org.id,
        name: org.name,
        description: org.description ?? "",
        visibility: org.visibility,
        forkedFrom: org.forked_from ?? null,
        forkCount,
        departmentCount: 0,
        agentCount: 0,
        skillCount: 0,
        mcpToolCount: 0,
        vendors: [],
        departments: [],
      },
      {
        headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
      }
    );
  }

  // Fetch agents
  const { data: agentRows } = await supabase
    .from("agents")
    .select("id, dept_id, name, description, vendor, model, status")
    .in("dept_id", deptIds);

  const agentIds = (agentRows ?? []).map((a) => a.id);
  const agentIdFilter = agentIds.length > 0 ? agentIds : ["__none__"];

  // Track vendors
  const vendorSet = new Set<string>();
  for (const agent of agentRows ?? []) {
    vendorSet.add(agent.vendor);
  }

  // Fetch skills, MCP tools, plugins in parallel
  const [
    { data: agentSkillRows },
    { data: skillDefRows },
    { data: mcpRows },
    { data: pluginRows },
  ] = await Promise.all([
    supabase.from("agent_skills").select("agent_id, skill_id").in("agent_id", agentIdFilter),
    supabase.from("skills").select("id, name, category, icon, description"),
    supabase.from("mcp_tools").select("agent_id, id, name, server, icon, description, category").in("agent_id", agentIdFilter),
    supabase.from("plugins").select("agent_id, id, name, icon, description, version, enabled").in("agent_id", agentIdFilter),
  ]);

  // Build skill lookup
  const skillDefs = new Map((skillDefRows ?? []).map((s) => [s.id, s]));

  // Group per-agent data
  const skillsByAgent = new Map<string, { id: string; name: string; category: string; icon: string; description: string }[]>();
  for (const row of agentSkillRows ?? []) {
    if (!skillsByAgent.has(row.agent_id)) skillsByAgent.set(row.agent_id, []);
    const def = skillDefs.get(row.skill_id);
    if (def) {
      skillsByAgent.get(row.agent_id)!.push({
        id: def.id,
        name: def.name,
        category: def.category,
        icon: def.icon ?? "",
        description: def.description ?? "",
      });
    }
  }

  const mcpByAgent = new Map<string, { id: string; name: string; server: string; icon: string; description: string; category: string }[]>();
  for (const row of mcpRows ?? []) {
    if (!mcpByAgent.has(row.agent_id)) mcpByAgent.set(row.agent_id, []);
    mcpByAgent.get(row.agent_id)!.push({
      id: row.id,
      name: row.name,
      server: row.server ?? "",
      icon: row.icon ?? "",
      description: row.description ?? "",
      category: row.category ?? "api",
    });
  }

  const pluginsByAgent = new Map<string, { id: string; name: string; icon: string; description: string; version: string; enabled: boolean }[]>();
  for (const row of pluginRows ?? []) {
    if (!pluginsByAgent.has(row.agent_id)) pluginsByAgent.set(row.agent_id, []);
    pluginsByAgent.get(row.agent_id)!.push({
      id: row.id,
      name: row.name,
      icon: row.icon ?? "",
      description: row.description ?? "",
      version: row.version ?? "1.0.0",
      enabled: row.enabled ?? true,
    });
  }

  // Unique skill/mcp counts across org
  const uniqueSkillIds = new Set((agentSkillRows ?? []).map((r) => r.skill_id));
  const uniqueMcpNames = new Set((mcpRows ?? []).map((r) => r.name));

  // Group agents by department
  const agentsByDept = new Map<string, typeof agentRows>();
  for (const agent of agentRows ?? []) {
    if (!agentsByDept.has(agent.dept_id)) agentsByDept.set(agent.dept_id, []);
    agentsByDept.get(agent.dept_id)!.push(agent);
  }

  const departments = (deptRows ?? []).map((dept) => {
    const agents = agentsByDept.get(dept.id) ?? [];
    return {
      id: dept.id,
      name: dept.name,
      description: dept.description ?? "",
      primaryVendor: dept.primary_vendor ?? null,
      budget: dept.budget ?? 0,
      agentCount: agents.length,
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description ?? "",
        vendor: a.vendor,
        model: a.model ?? "",
        status: a.status,
        skills: skillsByAgent.get(a.id) ?? [],
        mcpTools: mcpByAgent.get(a.id) ?? [],
        plugins: pluginsByAgent.get(a.id) ?? [],
      })),
    };
  });

  return NextResponse.json(
    {
      id: org.id,
      name: org.name,
      description: org.description ?? "",
      visibility: org.visibility,
      forkedFrom: org.forked_from ?? null,
      forkCount,
      departmentCount: deptIds.length,
      agentCount: (agentRows ?? []).length,
      skillCount: uniqueSkillIds.size,
      mcpToolCount: uniqueMcpNames.size,
      vendors: Array.from(vendorSet),
      departments,
    },
    {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    }
  );
}
