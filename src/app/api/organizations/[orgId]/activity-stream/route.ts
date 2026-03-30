import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgMember } from "@/lib/auth";

/**
 * GET /api/organizations/[orgId]/activity-stream
 * SSE endpoint for real-time activity updates.
 * Auth: Supabase Auth session (requireOrgMember)
 *
 * Streams Server-Sent Events by polling activity_events every 2s.
 * Sends a heartbeat comment every 30s to keep the connection alive.
 *
 * Event format:
 *   event: activity
 *   data: { agentId, sessionId, eventType, toolName, taskDescription, timestamp }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;

  const memberCheck = await requireOrgMember(orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = getSupabase();
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    start(controller) {
      let closed = false;
      let lastSeenAt = new Date().toISOString();

      function send(data: Record<string, unknown>) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: activity\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      }

      function cleanup() {
        closed = true;
        if (pollTimer) clearInterval(pollTimer);
        if (heartbeatTimer) clearInterval(heartbeatTimer);
      }

      // Poll activity_events every 2s
      const pollTimer = setInterval(async () => {
        if (closed) {
          cleanup();
          return;
        }
        try {
          const { data: events } = await supabase
            .from("activity_events")
            .select("agent_id, session_id, event_type, tool_name, task_description, created_at")
            .eq("org_id", orgId)
            .gt("created_at", lastSeenAt)
            .order("created_at", { ascending: true })
            .limit(50);

          if (events && events.length > 0) {
            for (const row of events) {
              send({
                agentId: row.agent_id,
                sessionId: row.session_id,
                eventType: row.event_type,
                toolName: row.tool_name ?? null,
                taskDescription: row.task_description ?? null,
                timestamp: row.created_at,
              });
            }
            lastSeenAt = events[events.length - 1].created_at;
          }
        } catch (err) {
          console.error("[activity-stream] Poll error:", err);
        }
      }, 2_000);

      // Heartbeat every 30s to keep connection alive
      const heartbeatTimer = setInterval(() => {
        if (closed) {
          cleanup();
          return;
        }
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          cleanup();
        }
      }, 30_000);

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
