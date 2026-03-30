import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgAdmin } from "@/lib/auth";

const TABLE_MAP = {
  mcp: "team_standard_mcp_servers",
  skills: "team_standard_skills",
  hooks: "team_standard_hooks",
} as const;

type ConfigType = keyof typeof TABLE_MAP;

const ALLOWED_FIELDS: Record<ConfigType, string[]> = {
  mcp: ["name", "command", "args", "env", "is_global", "status"],
  skills: ["name", "slug", "description", "content", "keywords", "secondary_keywords", "is_global", "status"],
  hooks: ["name", "event", "description", "script_content", "script_type", "env", "is_global", "status"],
};

// camelCase body key → snake_case DB column
const FIELD_MAP: Record<string, string> = {
  isGlobal: "is_global",
  secondaryKeywords: "secondary_keywords",
  scriptContent: "script_content",
  scriptType: "script_type",
};

/**
 * PATCH /api/organizations/[orgId]/team-config/[type]/[id]
 * Update a team standard config item. Admin only.
 * [type] must be one of: mcp, skills, hooks
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; type: string; id: string }> },
) {
  const { orgId, type, id } = await params;

  if (!Object.keys(TABLE_MAP).includes(type)) {
    return NextResponse.json({ error: "type must be one of: mcp, skills, hooks" }, { status: 400 });
  }

  const adminCheck = await requireOrgAdmin(orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const body = await request.json();
  const supabase = getSupabase();
  const table = TABLE_MAP[type as ConfigType];
  const allowed = ALLOWED_FIELDS[type as ConfigType];

  const { data: existing } = await supabase.from(table).select("id, org_id").eq("id", id).maybeSingle();
  if (!existing || existing.org_id !== orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  for (const [bodyKey, value] of Object.entries(body)) {
    if (bodyKey === "type") continue;
    const dbKey = FIELD_MAP[bodyKey] ?? bodyKey;
    if (allowed.includes(dbKey)) updates[dbKey] = value;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error } = await supabase.from(table).update(updates).eq("id", id);
  if (error) {
    console.error(`[team-config PATCH ${type}]`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ updated: true });
}

/**
 * DELETE /api/organizations/[orgId]/team-config/[type]/[id]
 * Delete a team standard config item. Admin only.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; type: string; id: string }> },
) {
  const { orgId, type, id } = await params;

  if (!Object.keys(TABLE_MAP).includes(type)) {
    return NextResponse.json({ error: "type must be one of: mcp, skills, hooks" }, { status: 400 });
  }

  const adminCheck = await requireOrgAdmin(orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const supabase = getSupabase();
  const table = TABLE_MAP[type as ConfigType];

  const { data: existing } = await supabase.from(table).select("id, org_id").eq("id", id).maybeSingle();
  if (!existing || existing.org_id !== orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    console.error(`[team-config DELETE ${type}]`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
