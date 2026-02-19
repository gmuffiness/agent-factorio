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
 *   - { action: "join", inviteCode, email, memberName? } — join existing org via invite code
 *   - { action: "create", orgName, email, memberName? } — create new org
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, inviteCode, orgName, memberName, email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 },
    );
  }

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

    // Identify CLI member by email
    const displayName = memberName || "CLI User";
    const now = new Date().toISOString();

    // Check if member with same email already exists in this org
    const { data: existing } = await supabase
      .from("org_members")
      .select("id, role")
      .eq("org_id", org.id)
      .eq("email", email)
      .maybeSingle();

    let memberId: string;

    if (existing) {
      memberId = existing.id;
    } else {
      memberId = `member-${Date.now()}`;
      await supabase.from("org_members").insert({
        id: memberId,
        org_id: org.id,
        name: displayName,
        email,
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
      memberId,
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
    const memberId = `member-${Date.now()}`;

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
      id: memberId,
      org_id: id,
      name: displayName,
      email,
      role: "admin",
      status: "active",
      user_id: null,
      joined_at: now,
    });

    return NextResponse.json(
      { orgId: id, orgName, inviteCode: code, memberId },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { error: 'Invalid action. Use "join" or "create".' },
    { status: 400 },
  );
}
