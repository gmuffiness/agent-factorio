import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabase } from "@/db/supabase";
import { requireCliAuth } from "@/lib/cli-auth";

function computeHash(data: unknown): string {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

/**
 * GET /api/cli/config
 * Returns team standard config (MCP servers, skills, hooks) for the authenticated user's org.
 * Supports ETag-based conditional requests (If-None-Match → 304).
 * Returns: { mcpServers, skills, hooks, configVersion, userId, orgId }
 */
export async function GET(request: NextRequest) {
  const authResult = await requireCliAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
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

  const [{ data: mcpServers }, { data: skills }, { data: hooks }] = await Promise.all([
    supabase.from("team_standard_mcp_servers").select("*").eq("org_id", orgId).eq("status", "active").order("name"),
    supabase.from("team_standard_skills").select("*").eq("org_id", orgId).eq("status", "active").order("name"),
    supabase.from("team_standard_hooks").select("*").eq("org_id", orgId).eq("status", "active").order("name"),
  ]);

  const payload = {
    mcpServers: (mcpServers ?? []).map((m) => ({
      id: m.id,
      orgId: m.org_id,
      name: m.name,
      command: m.command,
      args: m.args ?? [],
      env: m.env ?? {},
      isGlobal: m.is_global,
      status: m.status,
      createdBy: m.created_by,
      createdAt: m.created_at,
    })),
    skills: (skills ?? []).map((s) => ({
      id: s.id,
      orgId: s.org_id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      content: s.content,
      keywords: s.keywords ?? [],
      secondaryKeywords: s.secondary_keywords ?? [],
      isGlobal: s.is_global,
      status: s.status,
      createdBy: s.created_by,
      createdAt: s.created_at,
    })),
    hooks: (hooks ?? []).map((h) => ({
      id: h.id,
      orgId: h.org_id,
      name: h.name,
      event: h.event,
      description: h.description,
      scriptContent: h.script_content,
      scriptType: h.script_type,
      env: h.env ?? {},
      isGlobal: h.is_global,
      status: h.status,
      createdBy: h.created_by,
      createdAt: h.created_at,
    })),
    userId: authResult.userId,
    orgId,
  };

  const configVersion = computeHash(payload);
  const response = { ...payload, configVersion };

  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch === configVersion) {
    return new NextResponse(null, { status: 304, headers: { ETag: configVersion } });
  }

  return NextResponse.json(response, { headers: { ETag: configVersion } });
}
