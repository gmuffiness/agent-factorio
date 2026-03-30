import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgMember } from "@/lib/auth";

/**
 * GET /api/organizations/[orgId]/usage
 * Returns aggregated usage stats for the org. Member access required.
 * Query params:
 *   - period: "day" | "week" | "month" (convenience shortcut for from/to)
 *   - agentId: filter by agent (optional)
 *   - from: ISO datetime inclusive (optional)
 *   - to: ISO datetime inclusive (optional)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  const memberCheck = await requireOrgMember(orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const { searchParams } = new URL(request.url);
  const agentIdFilter = searchParams.get("agentId");
  const period = searchParams.get("period");
  let from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from && period) {
    const now = new Date();
    if (period === "day") from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    else if (period === "week") from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    else if (period === "month") from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  const supabase = getSupabase();

  let query = supabase.from("usage_events").select("*").eq("org_id", orgId).order("created_at", { ascending: false });
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);
  if (agentIdFilter) query = query.eq("agent_id", agentIdFilter);

  const { data: events, error } = await query;
  if (error) {
    console.error("[organizations/usage GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  const rows = events ?? [];
  const byEventType: Record<string, number> = {};
  const byAgent: Record<string, number> = {};
  const byModel: Record<string, number> = {};
  const byDayMap: Record<string, { count: number; tokensInput: number; tokensOutput: number; cost: number }> = {};
  let totalTokensInput = 0;
  let totalTokensOutput = 0;
  let totalCost = 0;

  for (const e of rows) {
    byEventType[e.event_type] = (byEventType[e.event_type] ?? 0) + 1;
    if (e.agent_id) byAgent[e.agent_id] = (byAgent[e.agent_id] ?? 0) + 1;
    if (e.model) byModel[e.model] = (byModel[e.model] ?? 0) + 1;
    const tokIn = e.tokens_input ?? 0;
    const tokOut = e.tokens_output ?? 0;
    const cost = parseFloat(e.cost ?? 0);
    totalTokensInput += tokIn;
    totalTokensOutput += tokOut;
    totalCost += cost;
    const day = e.created_at.slice(0, 10);
    if (!byDayMap[day]) byDayMap[day] = { count: 0, tokensInput: 0, tokensOutput: 0, cost: 0 };
    byDayMap[day].count += 1;
    byDayMap[day].tokensInput += tokIn;
    byDayMap[day].tokensOutput += tokOut;
    byDayMap[day].cost += cost;
  }

  const byDay = Object.entries(byDayMap)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    totalEvents: rows.length,
    totalTokensInput,
    totalTokensOutput,
    totalCost: Math.round(totalCost * 1000000) / 1000000,
    byEventType,
    byAgent,
    byModel,
    byDay,
    events: rows.map((e) => ({
      id: e.id,
      agentId: e.agent_id,
      orgId: e.org_id,
      eventType: e.event_type,
      tokensInput: e.tokens_input,
      tokensOutput: e.tokens_output,
      cost: parseFloat(e.cost ?? 0),
      model: e.model,
      metadata: e.metadata,
      createdAt: e.created_at,
    })),
  });
}
