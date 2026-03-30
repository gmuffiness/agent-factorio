import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabase } from "@/db/supabase";
import { requireCliAuth } from "@/lib/cli-auth";

function computeETag(data: unknown): string {
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

/**
 * GET /api/cli/skill-rules
 * Returns skill keyword rules for local skill suggestion matching.
 * Supports ETag-based conditional requests.
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

  // Fetch team standard skills + global skills with keywords
  const [{ data: teamSkills }, { data: globalSkills }] = await Promise.all([
    supabase
      .from("team_standard_skills")
      .select("name, keywords, secondary_keywords")
      .eq("org_id", orgId)
      .eq("status", "active"),
    supabase
      .from("skills")
      .select("name, category, keywords, secondary_keywords")
      .not("keywords", "eq", "[]"),
  ]);

  const seen = new Set<string>();
  const rules: Array<{
    skillName: string;
    keywords: string[];
    secondaryKeywords: string[];
    category: string;
  }> = [];

  // Team standard skills first (org-specific), then global skills
  for (const s of (teamSkills ?? [])) {
    if (seen.has(s.name)) continue;
    const kw: string[] = Array.isArray(s.keywords) ? s.keywords : [];
    if (kw.length === 0) continue;
    seen.add(s.name);
    rules.push({
      skillName: s.name,
      keywords: kw,
      secondaryKeywords: Array.isArray(s.secondary_keywords) ? s.secondary_keywords : [],
      category: "generation",
    });
  }

  for (const s of (globalSkills ?? [])) {
    if (seen.has(s.name)) continue;
    const kw: string[] = Array.isArray(s.keywords) ? s.keywords : [];
    if (kw.length === 0) continue;
    seen.add(s.name);
    rules.push({
      skillName: s.name,
      keywords: kw,
      secondaryKeywords: Array.isArray(s.secondary_keywords) ? s.secondary_keywords : [],
      category: s.category,
    });
  }

  // Compute ETag from stable data only (exclude timestamps for cacheability)
  const etag = computeETag({ orgId, rules });

  const payload = {
    orgId,
    rules,
    updatedAt: new Date().toISOString(),
  };
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  return NextResponse.json(payload, { headers: { ETag: etag } });
}
