#!/usr/bin/env node
/**
 * Install AgentFactorio plugin into any Claude Code project.
 *
 * Usage:
 *   node /path/to/agent-factorio/scripts/install-to-project.mjs [target-dir]
 *
 * If target-dir is omitted, installs into the current working directory.
 *
 * What it does:
 *   1. Creates .claude/commands/agent-factorio-setup.md (the /agent-factorio:setup command)
 *   2. Adds .agent-factorio/ to .gitignore
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = process.argv[2] || process.cwd();

const SKILL_SOURCE = path.join(__dirname, "..", "skills", "setup", "SKILL.md");
const COMMAND_DIR = path.join(targetDir, ".claude", "commands");
const COMMAND_FILE = path.join(COMMAND_DIR, "agent-factorio-setup.md");
const GITIGNORE = path.join(targetDir, ".gitignore");

function main() {
  // 1. Copy skill file as a Claude Code command
  if (!fs.existsSync(SKILL_SOURCE)) {
    console.error("ERROR: SKILL.md not found at", SKILL_SOURCE);
    process.exit(1);
  }

  fs.mkdirSync(COMMAND_DIR, { recursive: true });
  fs.copyFileSync(SKILL_SOURCE, COMMAND_FILE);
  console.log(`✓ Installed /agent-factorio:setup command → ${COMMAND_FILE}`);

  // 2. Add .agent-factorio/ to .gitignore
  if (fs.existsSync(GITIGNORE)) {
    const content = fs.readFileSync(GITIGNORE, "utf-8");
    if (!content.includes(".agent-factorio/")) {
      fs.appendFileSync(GITIGNORE, "\n# AgentFactorio local config\n.agent-factorio/\n");
      console.log("✓ Added .agent-factorio/ to .gitignore");
    } else {
      console.log("✓ .agent-factorio/ already in .gitignore");
    }
  } else {
    fs.writeFileSync(GITIGNORE, "# AgentFactorio local config\n.agent-factorio/\n");
    console.log("✓ Created .gitignore with .agent-factorio/");
  }

  console.log("\nDone! Now open Claude Code in this project and run:");
  console.log("  /agent-factorio-setup");
}

main();
