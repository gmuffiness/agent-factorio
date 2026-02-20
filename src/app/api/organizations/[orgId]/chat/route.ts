import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgMember } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

interface AgentRow {
  id: string;
  name: string;
  vendor: string;
  model: string;
}

function buildSystemPrompt(
  agent: AgentRow,
  contexts: { type: string; content: string; source_file: string | null }[],
  skills: { name: string }[],
  mcpTools: { name: string; server: string }[],
  otherAgents: AgentRow[]
): string {
  let prompt = `You are acting as the AI agent "${agent.name}" (${agent.vendor}/${agent.model}).\n\n`;

  if (otherAgents.length > 0) {
    prompt += `## Group Chat Participants\nYou are in a group conversation with these other agents:\n`;
    for (const other of otherAgents) {
      prompt += `- ${other.name} (${other.vendor}/${other.model})\n`;
    }
    prompt += `\nCollaborate naturally. Refer to other agents by name if needed. Avoid repeating what others have said.\n\n`;
  }

  for (const ctx of contexts) {
    const label = ctx.type === "claude_md" ? "CLAUDE.md" : ctx.type === "readme" ? "README" : ctx.source_file ?? "Context";
    prompt += `## ${label}\n${ctx.content}\n\n`;
  }

  if (skills.length > 0) {
    prompt += `## Available Skills\n${skills.map((s) => `- ${s.name}`).join("\n")}\n\n`;
  }

  if (mcpTools.length > 0) {
    prompt += `## MCP Tools\n${mcpTools.map((t) => `- ${t.name} (server: ${t.server})`).join("\n")}\n\n`;
  }

  prompt += "Answer questions based on the project context above. Be helpful and concise.";
  return prompt;
}

async function fetchAgentContext(supabase: ReturnType<typeof getSupabase>, agentId: string) {
  const [ctxRes, skillsRes, mcpRes] = await Promise.all([
    supabase.from("agent_context").select("type, content, source_file").eq("agent_id", agentId),
    supabase.from("agent_skills").select("skill_id, skills(name)").eq("agent_id", agentId),
    supabase.from("mcp_tools").select("name, server").eq("agent_id", agentId),
  ]);

  const contexts = ctxRes.data ?? [];
  const skills = (skillsRes.data ?? []).map((s: Record<string, unknown>) => {
    const skillData = s.skills as { name: string } | null;
    return { name: skillData?.name ?? "" };
  }).filter((s: { name: string }) => s.name);
  const mcpTools = mcpRes.data ?? [];

  return { contexts, skills, mcpTools };
}

async function streamAnthropicResponse(
  agent: AgentRow,
  systemPrompt: string,
  messages: { role: string; content: string }[]
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });
  const stream = await client.messages.stream({
    model: agent.model || "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  });
  return { stream };
}

async function streamOpenAIResponse(
  agent: AgentRow,
  systemPrompt: string,
  messages: { role: string; content: string }[]
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const client = new OpenAI({ apiKey });
  const stream = await client.chat.completions.create({
    model: agent.model || "gpt-4o",
    messages: [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    stream: true,
  });
  return { stream };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  const memberCheck = await requireOrgMember(orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const body = await request.json();
  const { agentId, agentIds, conversationId, message } = body;

  // Support both single agentId (backward compat) and agentIds array
  const resolvedAgentIds: string[] = agentIds ?? (agentId ? [agentId] : []);

  if (resolvedAgentIds.length === 0 || !message) {
    return new Response(JSON.stringify({ error: "agentId(s) and message are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getSupabase();

  // Fetch all agents
  const { data: agentsData, error: agentsErr } = await supabase
    .from("agents")
    .select("id, name, vendor, model")
    .in("id", resolvedAgentIds);

  if (agentsErr || !agentsData || agentsData.length === 0) {
    return new Response(JSON.stringify({ error: "Agent(s) not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const agents: AgentRow[] = agentsData;

  // Create or reuse conversation
  let convId = conversationId;
  const now = new Date().toISOString();

  if (!convId) {
    convId = `conv-${Date.now()}`;
    const title = message.length > 50 ? message.slice(0, 50) + "..." : message;
    await supabase.from("conversations").insert({
      id: convId,
      org_id: orgId,
      agent_id: agents[0].id, // backward compat: first agent
      title,
      created_at: now,
      updated_at: now,
    });

    // Insert all participants
    const participantRows = agents.map((a) => ({
      id: `cp-${convId}-${a.id}`,
      conversation_id: convId,
      agent_id: a.id,
      joined_at: now,
    }));
    await supabase.from("conversation_participants").insert(participantRows);
  }

  // Save user message
  const userMsgId = `msg-${Date.now()}-u`;
  await supabase.from("messages").insert({
    id: userMsgId,
    conversation_id: convId,
    role: "user",
    content: message,
    created_at: now,
  });

  // Build message history
  const { data: history } = await supabase
    .from("messages")
    .select("role, content, agent_id")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true });

  const chatMessages = (history ?? []).map((m: { role: string; content: string; agent_id?: string | null }) => ({
    role: m.role as string,
    content: m.content,
  })).filter((m) => m.role !== "system");

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Stream responses from each agent sequentially
        for (const agent of agents) {
          const otherAgents = agents.filter((a) => a.id !== agent.id);
          const { contexts, skills, mcpTools } = await fetchAgentContext(supabase, agent.id);
          const systemPrompt = buildSystemPrompt(agent, contexts, skills, mcpTools, otherAgents);

          // Signal which agent is responding
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ agentStart: true, agentId: agent.id, agentName: agent.name, agentVendor: agent.vendor })}\n\n`));

          let fullResponse = "";

          if (agent.vendor === "anthropic") {
            const { stream } = await streamAnthropicResponse(agent, systemPrompt, chatMessages);
            for await (const event of stream) {
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                const text = event.delta.text;
                fullResponse += text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text, agentId: agent.id, agentName: agent.name })}\n\n`));
              }
            }
          } else if (agent.vendor === "openai") {
            const { stream } = await streamOpenAIResponse(agent, systemPrompt, chatMessages);
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content;
              if (text) {
                fullResponse += text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text, agentId: agent.id, agentName: agent.name })}\n\n`));
              }
            }
          } else {
            fullResponse = `Vendor "${agent.vendor}" is not yet supported for chat.`;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fullResponse, agentId: agent.id, agentName: agent.name })}\n\n`));
          }

          // Save assistant message with agent_id
          const msgId = `msg-${Date.now()}-a-${agent.id}`;
          await supabase.from("messages").insert({
            id: msgId,
            conversation_id: convId,
            role: "assistant",
            content: fullResponse,
            created_at: new Date().toISOString(),
            agent_id: agent.id,
          });

          // Add to chat history for next agent
          chatMessages.push({ role: "assistant", content: `[${agent.name}]: ${fullResponse}` });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ agentDone: true, agentId: agent.id })}\n\n`));
        }

        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`));
        controller.close();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
