import type { TeamStandardSkill, SkillCategory } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SkillRule {
  skillName: string;
  slug: string;
  description: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  negativeKeywords: string[];
  category: SkillCategory;
}

export interface SkillRulesConfig {
  rules: SkillRule[];
  version: string;
  generatedAt: string;
}

export interface SkillMatch {
  skillName: string;
  slug: string;
  description: string;
  category: SkillCategory;
  confidence: number;
  matchedKeywords: string[];
}

// ── Negative Keywords ─────────────────────────────────────────────────────────

/**
 * Global negative keywords — if any of these appear in the prompt,
 * skip all skill matching entirely. Prevents suggestions on casual or
 * debug-style prompts where a skill recommendation would be unhelpful.
 */
export const NEGATIVE_KEYWORDS: string[] = [
  // Greetings
  "hello",
  "hi",
  "hey",
  "howdy",
  "greetings",
  // Acknowledgements
  "thanks",
  "thank you",
  "thank you so much",
  "cheers",
  "appreciate",
  // Questions / explanations
  "what is",
  "what are",
  "what does",
  "how does",
  "how do",
  "explain",
  "describe",
  "define",
  "tell me about",
  "can you explain",
  "can you describe",
  "why does",
  "why is",
  // Help / support
  "help",
  "help me understand",
  "i need help",
  "assist me",
  // Debugging / fixing
  "debug",
  "fix",
  "solve",
  "resolve",
  "error",
  "exception",
  "traceback",
  "stacktrace",
  "stack trace",
  "bug",
  // General questions
  "show me",
  "give me",
  "find",
  "search",
  "look up",
  "lookup",
  "list",
  "summarize",
  // Small talk
  "good morning",
  "good afternoon",
  "good evening",
  "good night",
  "how are you",
];

// ── Default skill rule templates by category ──────────────────────────────────

const DEFAULT_RULES_BY_CATEGORY: Record<
  SkillCategory,
  { primaryKeywords: string[]; secondaryKeywords: string[] }
> = {
  generation: {
    primaryKeywords: ["generate", "create", "build", "scaffold", "write", "implement"],
    secondaryKeywords: ["code", "file", "component", "module", "template", "boilerplate"],
  },
  review: {
    primaryKeywords: ["review", "audit", "check", "inspect", "assess"],
    secondaryKeywords: ["code", "pr", "pull request", "change", "diff", "quality"],
  },
  testing: {
    primaryKeywords: ["test", "spec", "coverage", "unit test", "integration test", "e2e"],
    secondaryKeywords: ["assert", "mock", "stub", "jest", "vitest", "playwright", "cypress"],
  },
  documentation: {
    primaryKeywords: ["document", "docs", "readme", "jsdoc", "comment"],
    secondaryKeywords: ["api", "guide", "tutorial", "reference", "example"],
  },
  debugging: {
    primaryKeywords: ["diagnose", "investigate", "trace", "profile", "breakpoint"],
    secondaryKeywords: ["performance", "memory", "leak", "slow", "crash", "hang"],
  },
  deployment: {
    primaryKeywords: ["deploy", "release", "ship", "publish", "push"],
    secondaryKeywords: ["ci", "cd", "pipeline", "docker", "kubernetes", "staging", "production"],
  },
};

// ── slugify ───────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── generateSkillRules ────────────────────────────────────────────────────────

/**
 * Transforms an array of TeamStandardSkill into a SkillRulesConfig
 * suitable for local keyword matching (e.g., writing to skill-rules.json).
 *
 * Each skill's stored `keywords` are used as primaryKeywords and
 * `secondaryKeywords` as secondaryKeywords. Category-based defaults fill
 * in any gaps so every rule has at least some keywords to match on.
 */
export function generateSkillRules(skills: TeamStandardSkill[]): SkillRulesConfig {
  const rules: SkillRule[] = skills.map((skill) => {
    const category = (skill as TeamStandardSkill & { category?: string }).category as SkillCategory | undefined;
    const categoryDefaults = (category ? DEFAULT_RULES_BY_CATEGORY[category] : undefined) ?? {
      primaryKeywords: [],
      secondaryKeywords: [],
    };

    const primaryKeywords =
      skill.keywords.length > 0 ? skill.keywords : categoryDefaults.primaryKeywords;

    const secondaryKeywords =
      skill.secondaryKeywords.length > 0
        ? skill.secondaryKeywords
        : categoryDefaults.secondaryKeywords;

    return {
      skillName: skill.name,
      slug: slugify(skill.name),
      description: skill.description,
      primaryKeywords,
      secondaryKeywords,
      negativeKeywords: NEGATIVE_KEYWORDS,
      category: category ?? "generation",
    };
  });

  return {
    rules,
    version: "1",
    generatedAt: new Date().toISOString(),
  };
}

// ── matchSkillForPrompt ───────────────────────────────────────────────────────

/**
 * 2-tier keyword matching — finds the best skill match for a given prompt.
 *
 * Algorithm:
 * 1. Lowercase the prompt.
 * 2. Check global negative keywords across ALL rules — if any match, return null.
 * 3. For each rule:
 *    a. Primary tier: if ANY single primary keyword appears → match (confidence 0.9)
 *    b. Secondary tier: if 2+ secondary keywords appear → match (confidence 0.7)
 * 4. Return the highest-confidence match, or null if none found.
 */
export function matchSkillForPrompt(
  prompt: string,
  rules: SkillRule[]
): SkillMatch | null {
  const lower = prompt.toLowerCase();

  // Step 1: Global negative keyword check (word-boundary matching)
  for (const neg of NEGATIVE_KEYWORDS) {
    const pattern = new RegExp(`\\b${neg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (pattern.test(lower)) {
      return null;
    }
  }

  // Step 2: Per-rule negative keyword check (rule-specific overrides if any differ)
  // (Currently all rules share the same NEGATIVE_KEYWORDS, but this allows future
  //  per-rule customisation without API changes.)
  for (const rule of rules) {
    for (const neg of rule.negativeKeywords) {
      if (!NEGATIVE_KEYWORDS.includes(neg)) {
        const pattern = new RegExp(`\\b${neg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
        if (pattern.test(lower)) {
          return null;
        }
      }
    }
  }

  let bestMatch: SkillMatch | null = null;

  for (const rule of rules) {
    // Primary keyword check — single keyword is enough
    const matchedPrimary = rule.primaryKeywords.filter((kw) =>
      lower.includes(kw.toLowerCase())
    );

    if (matchedPrimary.length > 0) {
      const candidate: SkillMatch = {
        skillName: rule.skillName,
        slug: rule.slug,
        description: rule.description,
        category: rule.category,
        confidence: 0.9,
        matchedKeywords: matchedPrimary,
      };
      if (!bestMatch || candidate.confidence > bestMatch.confidence) {
        bestMatch = candidate;
      }
      continue;
    }

    // Secondary keyword check — need 2+ matches
    const matchedSecondary = rule.secondaryKeywords.filter((kw) =>
      lower.includes(kw.toLowerCase())
    );

    if (matchedSecondary.length >= 2) {
      const candidate: SkillMatch = {
        skillName: rule.skillName,
        slug: rule.slug,
        description: rule.description,
        category: rule.category,
        confidence: 0.7,
        matchedKeywords: matchedSecondary,
      };
      if (!bestMatch || candidate.confidence > bestMatch.confidence) {
        bestMatch = candidate;
      }
    }
  }

  return bestMatch;
}
