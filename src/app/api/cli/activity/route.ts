import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireCliAuth } from "@/lib/cli-auth";

/**
 * POST /api/cli/activity
 * Receive activity events from the CLI daemon.
 * Auth: CLI Bearer token via requireCliAuth()
 *
 * Body:
 *   agentId      — agent to update
 *   orgId        — organization the agent belongs to
 *   sessionId    — current Claude Code session UUID
 *   eventType    — 'session_start' | 'session_end' | 'tool_use' | 'task_update' | 'heartbeat'
 *   toolName?    — tool that was invoked (for tool_use events)
 *   taskDescription? — current task description (for task_update events)
 *   metadata?    — optional JSON blob
 */
export async function POST(request: NextRequest) {
  const authResult = await requireCliAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { agentId, orgId, sessionId, eventType, toolName, taskDescription, metadata } = body;

  if (!agentId || !orgId || !sessionId || !eventType) {
    return NextResponse.json(
      { error: "agentId, orgId, sessionId, and eventType are required" },
      { status: 400 },
    );
  }

  const validEventTypes = ["session_start", "session_end", "tool_use", "task_update", "heartbeat"];
  if (!validEventTypes.includes(eventType)) {
    return NextResponse.json(
      { error: `eventType must be one of: ${validEventTypes.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  // Verify agent belongs to this org and authenticated member is in org
  const { data: agent } = await supabase
    .from("agents")
    .select("id, dept_id")
    .eq("id", agentId)
    .single();

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // Verify org membership
  const { data: orgMember } = await supabase
    .from("org_members")
    .select("id")
    .eq("id", authResult.memberId)
    .eq("org_id", orgId)
    .maybeSingle();

  if (!orgMember) {
    return NextResponse.json(
      { error: "Forbidden: you are not a member of this organization" },
      { status: 403 },
    );
  }

  const now = new Date().toISOString();

  // Insert activity event
  const { error: insertError } = await supabase.from("activity_events").insert({
    agent_id: agentId,
    org_id: orgId,
    session_id: sessionId,
    event_type: eventType,
    tool_name: toolName ?? null,
    task_description: taskDescription ?? null,
    metadata: metadata ?? {},
    created_at: now,
  });

  if (insertError) {
    console.error("[cli/activity] Failed to insert activity event:", insertError);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Update agent based on event type
  if (eventType === "session_end") {
    // Clear session state, set agent idle
    await supabase
      .from("agents")
      .update({
        session_id: null,
        session_started_at: null,
        current_task: "",
        status: "idle",
        last_active: now,
      })
      .eq("id", agentId);
  } else {
    // Update agent with latest activity
    const agentUpdate: Record<string, unknown> = {
      status: "active",
      last_active: now,
    };

    if (eventType === "session_start") {
      agentUpdate.session_id = sessionId;
      agentUpdate.session_started_at = now;
    }

    if (eventType === "task_update" && taskDescription !== undefined) {
      agentUpdate.current_task = taskDescription;
    }

    if (eventType === "tool_use" && toolName) {
      agentUpdate.current_task = toolName;
    }

    await supabase.from("agents").update(agentUpdate).eq("id", agentId);
  }

  return NextResponse.json({ success: true });
}
