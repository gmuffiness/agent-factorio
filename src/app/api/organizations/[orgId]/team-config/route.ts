import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgMember, requireOrgAdmin } from "@/lib/auth";

function mapMcp(m: Record<string, unknown>) {
  return { id: m.id, orgId: m.org_id, name: m.name, command: m.command, args: m.args ?? [], env: m.env ?? {}, isGlobal: m.is_global, status: m.status, createdBy: m.created_by, createdAt: m.created_at };
}
function mapSkill(s: Record<string, unknown>) {
  return { id: s.id, orgId: s.org_id, name: s.name, slug: s.slug, description: s.description, content: s.content, keywords: s.keywords ?? [], secondaryKeywords: s.secondary_keywords ?? [], isGlobal: s.is_global, status: s.status, createdBy: s.created_by, createdAt: s.created_at };
}
function mapHook(h: Record<string, unknown>) {
  return { id: h.id, orgId: h.org_id, name: h.name, event: h.event, description: h.description, scriptContent: h.script_content, scriptType: h.script_type, env: h.env ?? {}, isGlobal: h.is_global, status: h.status, createdBy: h.created_by, createdAt: h.created_at };
}

/**
 * GET /api/organizations/[orgId]/team-config
 * Returns all team standard config items (MCP servers, skills, hooks). Member access.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  const memberCheck = await requireOrgMember(orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = getSupabase();

  const [{ data: mcpServers }, { data: skills }, { data: hooks }] = await Promise.all([
    supabase.from("team_standard_mcp_servers").select("*").eq("org_id", orgId).order("name"),
    supabase.from("team_standard_skills").select("*").eq("org_id", orgId).order("name"),
    supabase.from("team_standard_hooks").select("*").eq("org_id", orgId).order("name"),
  ]);

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mcpServers: (mcpServers ?? []).map((m: any) => mapMcp(m)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    skills: (skills ?? []).map((s: any) => mapSkill(s)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hooks: (hooks ?? []).map((h: any) => mapHook(h)),
  });
}

/**
 * POST /api/organizations/[orgId]/team-config
 * Create a new team standard config item. Admin only.
 * Body: { type: "mcp" | "skills" | "hooks", ...fields }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  const adminCheck = await requireOrgAdmin(orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const body = await request.json();
  const { type } = body as { type: "mcp" | "skills" | "hooks" };

  if (!type || !["mcp", "skills", "hooks"].includes(type)) {
    return NextResponse.json({ error: "type must be one of: mcp, skills, hooks" }, { status: 400 });
  }

  const supabase = getSupabase();
  const createdBy = adminCheck.user.id;

  if (type === "mcp") {
    const { name, command, args, env, isGlobal } = body as {
      name: string; command?: string; args?: string[]; env?: Record<string, string>; isGlobal?: boolean;
    };
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const { data, error } = await supabase.from("team_standard_mcp_servers")
      .insert({ org_id: orgId, name, command: command ?? "", args: args ?? [], env: env ?? {}, is_global: isGlobal ?? false, created_by: createdBy })
      .select("id").single();
    if (error) { console.error("[team-config POST mcp]", error); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
    return NextResponse.json({ id: data.id }, { status: 201 });
  }

  if (type === "skills") {
    const { name, slug, description, content, keywords, secondaryKeywords, isGlobal } = body as {
      name: string; slug?: string; description?: string; content?: string;
      keywords?: string[]; secondaryKeywords?: string[]; isGlobal?: boolean;
    };
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const { data, error } = await supabase.from("team_standard_skills")
      .insert({ org_id: orgId, name, slug: slug ?? name.toLowerCase().replace(/\s+/g, "-"), description: description ?? "", content: content ?? "", keywords: keywords ?? [], secondary_keywords: secondaryKeywords ?? [], is_global: isGlobal ?? false, created_by: createdBy })
      .select("id").single();
    if (error) { console.error("[team-config POST skills]", error); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
    return NextResponse.json({ id: data.id }, { status: 201 });
  }

  // type === "hooks"
  const { name, event, description, scriptContent, scriptType, env, isGlobal } = body as {
    name: string; event: string; description?: string; scriptContent?: string; scriptType?: string;
    env?: Record<string, string>; isGlobal?: boolean;
  };
  if (!name || !event) return NextResponse.json({ error: "name and event are required" }, { status: 400 });

  const { data, error } = await supabase.from("team_standard_hooks")
    .insert({ org_id: orgId, name, event, description: description ?? "", script_content: scriptContent ?? "", script_type: scriptType ?? "bash", env: env ?? {}, is_global: isGlobal ?? false, created_by: createdBy })
    .select("id").single();
  if (error) { console.error("[team-config POST hooks]", error); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
