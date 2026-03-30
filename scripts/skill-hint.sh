#!/bin/bash
# AgentFactorio Skill Hint — UserPromptSubmit hook
#
# Reads ~/.agent-factorio/skill-rules.json and performs 2-tier keyword
# matching against the current prompt. If a match is found, prints a
# one-line hint to stdout which Claude Code will display to the user.
#
# Must be fast (<50ms) and fail silently on any error.
#
# Hook receives the prompt via the PROMPT environment variable.

RULES_FILE="$HOME/.agent-factorio/skill-rules.json"

# Bail early if rules file doesn't exist (not yet synced)
[ ! -f "$RULES_FILE" ] && exit 0

# Use Node.js for reliable JSON parsing and matching logic
node -e "
const fs = require('fs');

let config;
try {
  config = JSON.parse(fs.readFileSync(process.env.HOME + '/.agent-factorio/skill-rules.json', 'utf8'));
} catch (e) {
  process.exit(0);
}

const prompt = (process.env.PROMPT || '').toLowerCase();
if (!prompt) process.exit(0);

const rules = config.rules || [];

// Global negative keywords — collected from all rules (deduplicated)
const negativeSet = new Set();
for (const rule of rules) {
  for (const kw of (rule.negativeKeywords || [])) {
    negativeSet.add(kw.toLowerCase());
  }
}

// Step 1: Negative keyword check — bail if any match
for (const neg of negativeSet) {
  if (prompt.includes(neg)) process.exit(0);
}

// Step 2: 2-tier matching
let bestMatch = null;
let bestConfidence = 0;

for (const rule of rules) {
  const primary = (rule.primaryKeywords || []);
  const secondary = (rule.secondaryKeywords || []);

  // Primary tier — any single keyword triggers a match
  const matchedPrimary = primary.filter(kw => prompt.includes(kw.toLowerCase()));
  if (matchedPrimary.length > 0) {
    if (0.9 > bestConfidence) {
      bestConfidence = 0.9;
      bestMatch = rule;
    }
    continue;
  }

  // Secondary tier — need 2+ matches
  const matchedSecondary = secondary.filter(kw => prompt.includes(kw.toLowerCase()));
  if (matchedSecondary.length >= 2) {
    if (0.7 > bestConfidence) {
      bestConfidence = 0.7;
      bestMatch = rule;
    }
  }
}

if (bestMatch && bestConfidence >= 0.7) {
  process.stdout.write('💡 Try /' + bestMatch.slug + ' — ' + bestMatch.description + '\n');
}
" 2>/dev/null

exit 0
