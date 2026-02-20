import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";

/**
 * GET /api/agents/[agentId]/poll
 * Connector polls for pending messages. Authenticated via Bearer poll_token.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const supabase = getSupabase();

  // Authenticate via poll_token
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("id, poll_token")
    .eq("id", agentId)
    .single();

  if (!agent || agent.poll_token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Timeout: mark processing items older than 5 minutes as failed
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await supabase
    .from("agent_message_queue")
    .update({ status: "failed", error_message: "Processing timeout", completed_at: new Date().toISOString() })
    .eq("agent_id", agentId)
    .eq("status", "processing")
    .lt("processing_started_at", fiveMinAgo);

  // Cleanup: delete completed/failed items older than 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from("agent_message_queue")
    .delete()
    .eq("agent_id", agentId)
    .in("status", ["completed", "failed"])
    .lt("created_at", oneDayAgo);

  // Fetch pending items
  const { data: pendingItems } = await supabase
    .from("agent_message_queue")
    .select("id, conversation_id, message_content, user_message_id, created_at")
    .eq("agent_id", agentId)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(5);

  if (!pendingItems || pendingItems.length === 0) {
    return NextResponse.json({ items: [] });
  }

  // Mark as processing
  const itemIds = pendingItems.map((item) => item.id);
  const now = new Date().toISOString();
  await supabase
    .from("agent_message_queue")
    .update({ status: "processing", processing_started_at: now })
    .in("id", itemIds);

  // Fetch conversation history for each item
  const itemsWithHistory = await Promise.all(
    pendingItems.map(async (item) => {
      const { data: history } = await supabase
        .from("messages")
        .select("role, content, agent_id")
        .eq("conversation_id", item.conversation_id)
        .order("created_at", { ascending: true });

      const messages = (history ?? [])
        .filter((m: { role: string }) => m.role !== "system")
        .map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        }));

      return {
        queueItemId: item.id,
        conversationId: item.conversation_id,
        message: item.message_content,
        history: messages,
      };
    })
  );

  return NextResponse.json({ items: itemsWithHistory });
}
