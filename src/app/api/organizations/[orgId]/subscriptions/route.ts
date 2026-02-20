import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgMember } from "@/lib/auth";

function toSnake(row: Record<string, unknown>) {
  return {
    id: row.id,
    memberId: row.member_id,
    orgId: row.org_id,
    serviceName: row.service_name,
    serviceCategory: row.service_category,
    costType: row.cost_type,
    monthlyAmount: row.monthly_amount,
    currency: row.currency,
    billingCycle: row.billing_cycle,
    autoDetected: row.auto_detected,
    detectionSource: row.detection_source,
    isActive: row.is_active,
    startedAt: row.started_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const auth = await requireOrgMember(orgId);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabase();
  const memberId = request.nextUrl.searchParams.get("memberId");

  let query = supabase
    .from("member_subscriptions")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  // Non-admin users can only see their own subscriptions
  if (auth.role !== "admin" && !memberId) {
    const { data: member } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (member) {
      query = query.eq("member_id", member.id);
    }
  } else if (memberId) {
    query = query.eq("member_id", memberId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(toSnake));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const auth = await requireOrgMember(orgId);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const {
    memberId,
    serviceName,
    serviceCategory = "other",
    costType = "subscription",
    monthlyAmount = 0,
    currency = "USD",
    billingCycle = "monthly",
    autoDetected = false,
    detectionSource = "manual",
    notes = "",
  } = body;

  if (!memberId || !serviceName) {
    return NextResponse.json(
      { error: "memberId and serviceName are required" },
      { status: 400 },
    );
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  // Check for existing subscription (same member + service name)
  const { data: existing } = await supabase
    .from("member_subscriptions")
    .select("id")
    .eq("member_id", memberId)
    .eq("service_name", serviceName)
    .eq("org_id", orgId)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { data: updated, error } = await supabase
      .from("member_subscriptions")
      .update({
        service_category: serviceCategory,
        cost_type: costType,
        monthly_amount: monthlyAmount,
        currency,
        billing_cycle: billingCycle,
        is_active: true,
        notes,
        updated_at: now,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(toSnake(updated));
  }

  // Create new
  const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const { data: created, error } = await supabase
    .from("member_subscriptions")
    .insert({
      id,
      member_id: memberId,
      org_id: orgId,
      service_name: serviceName,
      service_category: serviceCategory,
      cost_type: costType,
      monthly_amount: monthlyAmount,
      currency,
      billing_cycle: billingCycle,
      auto_detected: autoDetected,
      detection_source: detectionSource,
      is_active: true,
      notes,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(toSnake(created), { status: 201 });
}
