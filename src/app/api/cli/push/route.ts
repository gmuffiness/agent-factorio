import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";

/**
 * POST /api/cli/push
 * CLI-only agent push endpoint — no Supabase Auth required.
 * Handles both create and update based on whether agentId is provided.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = getSupabase();

  const {
    agentId,
    agentName,
    vendor,
    model,
    orgId,
    departmentName,
    description,
    mcpTools,
    context,
  } = body;

  if (!agentName || !vendor || !model || !orgId) {
    return NextResponse.json(
      { error: "agentName, vendor, model, and orgId are required" },
      { status: 400 },
    );
  }

  // Verify org exists
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .single();

  if (!org) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 },
    );
  }

  // If agentId provided, try to update
  if (agentId) {
    const { data: existing } = await supabase
      .from("agents")
      .select("id, dept_id")
      .eq("id", agentId)
      .single();

    if (existing) {
      // Update agent fields
      await supabase
        .from("agents")
        .update({
          name: agentName,
          vendor,
          model,
          description: description || `Pushed via CLI at ${new Date().toISOString()}`,
          last_active: new Date().toISOString(),
        })
        .eq("id", agentId);

      // Update MCP tools: delete old, insert new
      if (mcpTools) {
        await supabase.from("mcp_tools").delete().eq("agent_id", agentId);
        if (mcpTools.length > 0) {
          const mcpInserts = mcpTools.map(
            (m: string | { name: string; server?: string }) => {
              const name = typeof m === "string" ? m : m.name;
              return {
                id: `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                agent_id: agentId,
                name,
                server: typeof m === "object" ? (m.server ?? "") : "",
                icon: "",
                description: "",
                category: "api",
              };
            },
          );
          await supabase.from("mcp_tools").insert(mcpInserts);
        }
      }

      // Update context: delete old, insert new
      if (context) {
        await supabase.from("agent_context").delete().eq("agent_id", agentId);
        if (context.length > 0) {
          const now = new Date().toISOString();
          const contextInserts = context.map(
            (ctx: { type: string; content: string; sourceFile?: string }) => ({
              id: `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              agent_id: agentId,
              type: ctx.type ?? "custom",
              content: ctx.content,
              source_file: ctx.sourceFile ?? null,
              updated_at: now,
            }),
          );
          await supabase.from("agent_context").insert(contextInserts);
        }
      }

      return NextResponse.json({
        id: agentId,
        updated: true,
        message: `Agent "${agentName}" updated successfully`,
      });
    }

    // Agent not found — fall through to create
  }

  // Create new agent — resolve department
  let deptId: string | undefined;

  // Try to find existing department
  const { data: deptRows } = await supabase
    .from("departments")
    .select("id")
    .eq("org_id", orgId)
    .limit(1);

  if (deptRows?.length) {
    deptId = deptRows[0].id;
  } else {
    // Create default department
    deptId = `dept-${Date.now()}`;
    await supabase.from("departments").insert({
      id: deptId,
      org_id: orgId,
      name: departmentName || "Engineering",
      description: "",
      budget: 0,
      monthly_spend: 0,
      primary_vendor: vendor,
      layout_x: 50,
      layout_y: 50,
      layout_w: 300,
      layout_h: 240,
      created_at: new Date().toISOString(),
    });
  }

  const newAgentId = `agent-${Date.now()}`;
  const now = new Date().toISOString();

  await supabase.from("agents").insert({
    id: newAgentId,
    dept_id: deptId,
    name: agentName,
    description: description || `Pushed via CLI at ${now}`,
    vendor,
    model,
    status: "active",
    monthly_cost: 0,
    tokens_used: 0,
    pos_x: Math.random() * 200 + 50,
    pos_y: Math.random() * 150 + 80,
    last_active: now,
    created_at: now,
  });

  // Create MCP tools
  if (mcpTools?.length) {
    const mcpInserts = mcpTools.map(
      (m: string | { name: string; server?: string }) => {
        const name = typeof m === "string" ? m : m.name;
        return {
          id: `mcp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          agent_id: newAgentId,
          name,
          server: typeof m === "object" ? (m.server ?? "") : "",
          icon: "",
          description: "",
          category: "api",
        };
      },
    );
    await supabase.from("mcp_tools").insert(mcpInserts);
  }

  // Save context
  if (context?.length) {
    const contextInserts = context.map(
      (ctx: { type: string; content: string; sourceFile?: string }) => ({
        id: `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        agent_id: newAgentId,
        type: ctx.type ?? "custom",
        content: ctx.content,
        source_file: ctx.sourceFile ?? null,
        updated_at: now,
      }),
    );
    await supabase.from("agent_context").insert(contextInserts);
  }

  return NextResponse.json(
    {
      id: newAgentId,
      departmentId: deptId,
      updated: false,
      message: `Agent "${agentName}" registered successfully`,
    },
    { status: 201 },
  );
}
