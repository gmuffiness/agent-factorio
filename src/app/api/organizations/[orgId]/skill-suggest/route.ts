import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgMember } from "@/lib/auth";
import type { SkillSuggestion } from "@/types";

/**
 * POST /api/organizations/[orgId]/skill-suggest
 * Given a list of detected keywords/tool names from an agent's environment,
 * return skill suggestions ranked by keyword match confidence.
 * Body: { keywords: string[] }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  const memberCheck = await requireOrgMember(orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const body = await request.json();
  const { keywords } = body as { keywords: string[] };

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: "keywords array is required and must not be empty" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Fetch team standard skills (org-specific) and global skills with keywords
  const [{ data: teamSkills }, { data: globalSkills }] = await Promise.all([
    supabase
      .from("team_standard_skills")
      .select("name, keywords, secondary_keywords")
      .eq("org_id", orgId)
      .eq("status", "active"),
    supabase
      .from("skills")
      .select("name, category, keywords, secondary_keywords"),
  ]);

  const normalizedInput = keywords.map((k) => k.toLowerCase().trim());
  const seen = new Set<string>();
  const suggestions: SkillSuggestion[] = [];

  // Combine: team skills first (no category column), then global skills
  const allSkills: Array<{ name: string; category: string; keywords: unknown; secondary_keywords: unknown }> = [
    ...(teamSkills ?? []).map((s) => ({ ...s, category: "generation" as string })),
    ...(globalSkills ?? []),
  ];

  for (const skill of allSkills) {
    if (seen.has(skill.name)) continue;
    seen.add(skill.name);

    const primaryKw: string[] = Array.isArray(skill.keywords) ? skill.keywords as string[] : [];
    const secondaryKw: string[] = Array.isArray(skill.secondary_keywords) ? skill.secondary_keywords as string[] : [];

    if (primaryKw.length === 0 && secondaryKw.length === 0) continue;

    const matchedPrimary = primaryKw.filter((kw) =>
      normalizedInput.some((inp) => inp.includes(kw.toLowerCase()) || kw.toLowerCase().includes(inp)),
    );
    const matchedSecondary = secondaryKw.filter((kw) =>
      normalizedInput.some((inp) => inp.includes(kw.toLowerCase()) || kw.toLowerCase().includes(inp)),
    );

    const matchedKeywords = [...matchedPrimary, ...matchedSecondary];
    if (matchedKeywords.length === 0) continue;

    const rawScore = matchedPrimary.length * 1.0 + matchedSecondary.length * 0.5;
    const maxScore = primaryKw.length * 1.0 + secondaryKw.length * 0.5;
    const confidence = Math.min(1, rawScore / Math.max(maxScore, 1));

    suggestions.push({
      skillName: skill.name,
      confidence: Math.round(confidence * 100) / 100,
      matchedKeywords,
      category: skill.category as SkillSuggestion["category"],
    });
  }

  // Sort by confidence descending
  suggestions.sort((a, b) => b.confidence - a.confidence);

  return NextResponse.json({ suggestions });
}
