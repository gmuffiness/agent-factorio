import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgMember } from "@/lib/auth";

/**
 * GET /api/organizations/[orgId]/active-sessions
 * Returns agents in this org that currently have an active session.
 * Used for initial state load before SSE connection.
 * Auth: Supabase Auth session (requireOrgMember)
 *
 * Response: Array of agents with non-null session_id:
 *   { id, name, sessionId, sessionStartedAt, currentTask, lastActive, deptId }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;

  const memberCheck = await requireOrgMember(orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = getSupabase();

  // Get all departments in org
  const { data: depts } = await supabase
    .from("departments")
    .select("id")
    .eq("org_id", orgId);

  const deptIds = (depts ?? []).map((d) => d.id);
  if (deptIds.length === 0) {
    return NextResponse.json([]);
  }

  // Fetch agents with active sessions (non-null session_id)
  const { data: agents, error } = await supabase
    .from("agents")
    .select("id, name, dept_id, session_id, session_started_at, current_task, last_active")
    .in("dept_id", deptIds)
    .not("session_id", "is", null);

  if (error) {
    console.error("[active-sessions] Failed to fetch agents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const result = (agents ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    deptId: a.dept_id,
    sessionId: a.session_id,
    sessionStartedAt: a.session_started_at,
    currentTask: a.current_task,
    lastActive: a.last_active,
  }));

  return NextResponse.json(result);
}
