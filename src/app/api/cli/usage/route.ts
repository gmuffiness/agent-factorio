import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireCliAuth } from "@/lib/cli-auth";
import type { UsageEventType } from "@/types";

/**
 * POST /api/cli/usage
 * Ingest a single usage event from the CLI.
 * Body: { orgId, agentId, eventType, tokensInput, tokensOutput, cost, model, metadata }
 */
export async function POST(request: NextRequest) {
  const authResult = await requireCliAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const body = await request.json();
  const { orgId, agentId, eventType, tokensInput, tokensOutput, cost, model, metadata } = body as {
    orgId: string;
    agentId?: string;
    eventType: UsageEventType;
    tokensInput?: number;
    tokensOutput?: number;
    cost?: number;
    model?: string;
    metadata?: Record<string, unknown>;
  };

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }
  if (!eventType) {
    return NextResponse.json({ error: "eventType is required" }, { status: 400 });
  }

  const validEventTypes: UsageEventType[] = ["session_start", "session_end", "prompt", "tool_use"];
  if (!validEventTypes.includes(eventType)) {
    return NextResponse.json(
      { error: `eventType must be one of: ${validEventTypes.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  // Verify membership
  const { data: member } = await supabase
    .from("org_members")
    .select("id")
    .eq("id", authResult.memberId)
    .eq("org_id", orgId)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Forbidden: not a member of this organization" }, { status: 403 });
  }

  const { error } = await supabase.from("usage_events").insert({
    agent_id: agentId ?? null,
    org_id: orgId,
    event_type: eventType,
    tokens_input: tokensInput ?? 0,
    tokens_output: tokensOutput ?? 0,
    cost: cost ?? 0,
    model: model ?? "",
    metadata: metadata ?? {},
  });

  if (error) {
    console.error("[cli/usage] Failed to insert usage event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ recorded: true }, { status: 201 });
}
