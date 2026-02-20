import { NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";

export async function GET() {
  const supabase = getSupabase();

  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("id, name, description, visibility")
    .eq("visibility", "public");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }

  if (!orgs || orgs.length === 0) {
    return NextResponse.json([]);
  }

  const orgIds = orgs.map((o) => o.id);

  // Step 1: departments
  const { data: deptRows } = await supabase
    .from("departments")
    .select("id, org_id")
    .in("org_id", orgIds);

  const deptToOrg = new Map<string, string>();
  const deptsByOrg = new Map<string, number>();
  for (const dept of deptRows ?? []) {
    deptToOrg.set(dept.id, dept.org_id);
    deptsByOrg.set(dept.org_id, (deptsByOrg.get(dept.org_id) ?? 0) + 1);
  }

  const deptIds = (deptRows ?? []).map((d) => d.id);
  if (deptIds.length === 0) {
    const result = orgs.map((org) => ({
      id: org.id,
      name: org.name,
      departmentCount: 0,
      agentCount: 0,
      skillCount: 0,
      mcpToolCount: 0,
      vendors: [],
    }));
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
    });
  }

  // Step 2: agents
  const { data: agentRows } = await supabase
    .from("agents")
    .select("id, dept_id, vendor")
    .in("dept_id", deptIds);

  const agentToOrg = new Map<string, string>();
  const agentsByOrg = new Map<string, number>();
  const vendorsByOrg = new Map<string, Set<string>>();
  for (const agent of agentRows ?? []) {
    const orgId = deptToOrg.get(agent.dept_id);
    if (!orgId) continue;
    agentToOrg.set(agent.id, orgId);
    agentsByOrg.set(orgId, (agentsByOrg.get(orgId) ?? 0) + 1);
    if (!vendorsByOrg.has(orgId)) vendorsByOrg.set(orgId, new Set());
    vendorsByOrg.get(orgId)!.add(agent.vendor);
  }

  const agentIds = (agentRows ?? []).map((a) => a.id);
  const agentIdFilter = agentIds.length > 0 ? agentIds : ["__none__"];

  // Step 3: skills + MCP tools in parallel
  const [{ data: skillRows }, { data: mcpRows }] = await Promise.all([
    supabase.from("agent_skills").select("agent_id, skill_id").in("agent_id", agentIdFilter),
    supabase.from("mcp_tools").select("agent_id, name").in("agent_id", agentIdFilter),
  ]);

  const skillCountByOrg = new Map<string, Set<string>>();
  for (const row of skillRows ?? []) {
    const orgId = agentToOrg.get(row.agent_id);
    if (!orgId) continue;
    if (!skillCountByOrg.has(orgId)) skillCountByOrg.set(orgId, new Set());
    skillCountByOrg.get(orgId)!.add(row.skill_id);
  }

  const mcpCountByOrg = new Map<string, Set<string>>();
  for (const row of mcpRows ?? []) {
    const orgId = agentToOrg.get(row.agent_id);
    if (!orgId) continue;
    if (!mcpCountByOrg.has(orgId)) mcpCountByOrg.set(orgId, new Set());
    mcpCountByOrg.get(orgId)!.add(row.name);
  }

  const result = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.description ?? "",
    departmentCount: deptsByOrg.get(org.id) ?? 0,
    agentCount: agentsByOrg.get(org.id) ?? 0,
    skillCount: skillCountByOrg.get(org.id)?.size ?? 0,
    mcpToolCount: mcpCountByOrg.get(org.id)?.size ?? 0,
    vendors: Array.from(vendorsByOrg.get(org.id) ?? []),
  }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" },
  });
}
