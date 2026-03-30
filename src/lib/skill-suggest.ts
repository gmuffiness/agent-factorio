import type { SupabaseClient } from "@supabase/supabase-js";
import type { TeamStandardSkill } from "@/types";
import { generateSkillRules, matchSkillForPrompt } from "./skill-rules";

export interface SkillSuggestionResult {
  skillName: string;
  slug: string;
  confidence: number;
  description: string;
  category: string;
}

/**
 * Server-side skill suggestion: fetches team standard skills from DB,
 * generates keyword rules, and runs 2-tier matching against the prompt.
 *
 * Returns an array of suggestions (sorted by confidence descending).
 * Only suggestions with confidence >= 0.7 are included.
 */
export async function suggestSkills(
  prompt: string,
  orgId: string,
  supabase: SupabaseClient
): Promise<SkillSuggestionResult[]> {
  // Fetch team standard skills for the org
  const { data, error } = await supabase
    .from("team_standard_skills")
    .select("*")
    .eq("org_id", orgId);

  if (error || !data || data.length === 0) {
    return [];
  }

  const skills = data as TeamStandardSkill[];
  const config = generateSkillRules(skills);
  const match = matchSkillForPrompt(prompt, config.rules);

  if (!match || match.confidence < 0.7) {
    return [];
  }

  return [
    {
      skillName: match.skillName,
      slug: match.slug,
      confidence: match.confidence,
      description: match.description,
      category: match.category,
    },
  ];
}
