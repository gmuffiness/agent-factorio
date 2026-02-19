import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * POST /api/cli/login
 * CLI-only login endpoint — no Supabase Auth required.
 * Supports two actions:
 *   - { action: "join", inviteCode, memberName? } — join existing org via invite code
 *   - { action: "create", orgName, memberName? } — create new org
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, inviteCode, orgName, memberName } = body;

  const supabase = getSupabase();

  if (action === "join") {
    if (!inviteCode) {
      return NextResponse.json(
        { error: "inviteCode is required" },
        { status: 400 },
      );
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, invite_code")
      .eq("invite_code", inviteCode.toUpperCase())
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 },
      );
    }

    // Add as CLI member (no user_id, identified by name)
    const displayName = memberName || "CLI User";
    const now = new Date().toISOString();

    // Check if CLI member with same name already exists
    const { data: existing } = await supabase
      .from("org_members")
      .select("id, role")
      .eq("org_id", org.id)
      .eq("name", displayName)
      .is("user_id", null)
      .maybeSingle();

    if (!existing) {
      await supabase.from("org_members").insert({
        id: `member-${Date.now()}`,
        org_id: org.id,
        name: displayName,
        role: "member",
        status: "active",
        user_id: null,
        joined_at: now,
      });
    }

    return NextResponse.json({
      orgId: org.id,
      orgName: org.name,
      inviteCode: org.invite_code,
    });
  }

  if (action === "create") {
    if (!orgName) {
      return NextResponse.json(
        { error: "orgName is required" },
        { status: 400 },
      );
    }

    const id = `org-${Date.now()}`;
    const now = new Date().toISOString();
    const code = generateInviteCode();
    const displayName = memberName || "CLI User";

    const { error: orgError } = await supabase.from("organizations").insert({
      id,
      name: orgName,
      total_budget: 0,
      invite_code: code,
      created_by: displayName,
      creator_user_id: null,
      created_at: now,
    });

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // Add creator as admin member
    await supabase.from("org_members").insert({
      id: `member-${Date.now()}`,
      org_id: id,
      name: displayName,
      role: "admin",
      status: "active",
      user_id: null,
      joined_at: now,
    });

    return NextResponse.json(
      { orgId: id, orgName, inviteCode: code },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { error: 'Invalid action. Use "join" or "create".' },
    { status: 400 },
  );
}
