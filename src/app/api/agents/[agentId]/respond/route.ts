import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";

/**
 * POST /api/agents/[agentId]/respond
 * Connector posts the agent's response. Authenticated via Bearer poll_token.
 */
export async function POST(
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
    .select("id, name, vendor, poll_token")
    .eq("id", agentId)
    .single();

  if (!agent || agent.poll_token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { queueItemId, content } = await request.json();

  if (!queueItemId || !content) {
    return NextResponse.json(
      { error: "queueItemId and content are required" },
      { status: 400 }
    );
  }

  // Verify queue item belongs to this agent and is processing
  const { data: queueItem } = await supabase
    .from("agent_message_queue")
    .select("id, conversation_id, status")
    .eq("id", queueItemId)
    .eq("agent_id", agentId)
    .single();

  if (!queueItem) {
    return NextResponse.json({ error: "Queue item not found" }, { status: 404 });
  }

  if (queueItem.status !== "processing") {
    return NextResponse.json(
      { error: `Queue item is ${queueItem.status}, expected processing` },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();

  // Save assistant message
  const msgId = `msg-${Date.now()}-a-${agentId}`;
  await supabase.from("messages").insert({
    id: msgId,
    conversation_id: queueItem.conversation_id,
    role: "assistant",
    content,
    created_at: now,
    agent_id: agentId,
  });

  // Mark queue item as completed
  await supabase
    .from("agent_message_queue")
    .update({ status: "completed", completed_at: now })
    .eq("id", queueItemId);

  // Update conversation.updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: now })
    .eq("id", queueItem.conversation_id);

  return NextResponse.json({
    messageId: msgId,
    conversationId: queueItem.conversation_id,
  });
}
