/**
 * agent-factorio pull — Pull team standard config (MCP servers, skills, hooks) to local machine
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { getDefaultOrg } from "../lib/config.mjs";
import { apiCall } from "../lib/api.mjs";
import { getCachedConfig, setCachedConfig } from "../lib/cache.mjs";
import { computeConfigHash } from "../lib/hash.mjs";
import { reportUsageEvent } from "../lib/usage.mjs";
import { success, error, info, warn, label, heading } from "../lib/log.mjs";

const HOME = os.homedir();
const CLAUDE_JSON = path.join(HOME, ".claude.json");
const SKILLS_DIR = path.join(HOME, ".claude", "skills");
const HOOKS_DIR = path.join(HOME, ".claude", "hooks");
const AF_DIR = path.join(HOME, ".agent-factorio");
const MANAGED_KEYS_FILE = path.join(AF_DIR, "managed-keys.json");
const SKILL_RULES_FILE = path.join(AF_DIR, "skill-rules.json");

/** @returns {{ mcpServers: string[], skills: string[], hooks: string[] }} */
function readManagedKeys() {
  try {
    const raw = fs.readFileSync(MANAGED_KEYS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { mcpServers: [], skills: [], hooks: [] };
  }
}

/** @param {{ mcpServers: string[], skills: string[], hooks: string[] }} keys */
function writeManagedKeys(keys) {
  fs.mkdirSync(AF_DIR, { recursive: true });
  fs.writeFileSync(MANAGED_KEYS_FILE, JSON.stringify(keys, null, 2) + "\n");
}

/**
 * Install MCP servers by merging into ~/.claude.json
 * @param {Array<{ name: string, command: string, args?: string[], env?: Record<string, string> }>} mcpServers
 * @param {string[]} managedKeys - previously managed server names
 * @returns {string[]} new managed keys
 */
function installMcpServers(mcpServers, managedKeys) {
  let claudeJson = {};
  try {
    const raw = fs.readFileSync(CLAUDE_JSON, "utf-8");
    claudeJson = JSON.parse(raw);
  } catch {
    // file doesn't exist yet — start fresh
  }

  if (!claudeJson.mcpServers) {
    claudeJson.mcpServers = {};
  }

  // mcpServers is an array of { name, command, args, env, ... }
  const newKeys = [];
  for (const mcp of mcpServers) {
    const key = mcp.name;
    claudeJson.mcpServers[key] = {
      command: mcp.command,
      args: mcp.args || [],
      env: mcp.env || {},
    };
    newKeys.push(key);
  }

  fs.writeFileSync(CLAUDE_JSON, JSON.stringify(claudeJson, null, 2) + "\n");
  return newKeys;
}

/**
 * Install skills into ~/.claude/skills/{slug}/SKILL.md
 * @param {Array<{ slug: string, content: string }>} skills
 * @returns {string[]} managed skill slugs
 */
function installSkills(skills) {
  const managed = [];
  for (const skill of skills) {
    const skillDir = path.join(SKILLS_DIR, skill.slug);
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, "SKILL.md"), skill.content);
    managed.push(skill.slug);
  }
  return managed;
}

/**
 * Install hooks into ~/.claude/hooks/{event}/{name}.sh
 * @param {Array<{ event: string, name: string, content: string }>} hooks
 * @returns {string[]} managed hook paths (relative: event/name.sh)
 */
function installHooks(hooks) {
  const managed = [];
  for (const hook of hooks) {
    const hookDir = path.join(HOOKS_DIR, hook.event);
    fs.mkdirSync(hookDir, { recursive: true });
    const hookPath = path.join(hookDir, `${hook.name}.sh`);
    fs.writeFileSync(hookPath, hook.scriptContent || hook.content || "");
    fs.chmodSync(hookPath, 0o755);
    managed.push(`${hook.event}/${hook.name}.sh`);
  }
  return managed;
}

/**
 * Install the skill-hint hook script
 * @param {string} scriptContent
 */
function installSkillHintHook(scriptContent) {
  const hookDir = path.join(HOOKS_DIR, "UserPromptSubmit");
  fs.mkdirSync(hookDir, { recursive: true });
  const hookPath = path.join(hookDir, "af-skill-hint.sh");
  fs.writeFileSync(hookPath, scriptContent);
  fs.chmodSync(hookPath, 0o755);
}

export function pullCommand(program) {
  program
    .command("pull")
    .description("Pull team standard config (MCP servers, skills, hooks) from hub to local machine")
    .action(async () => {
      const org = getDefaultOrg();
      if (!org) {
        error("Not logged in. Run `agent-factorio login` first.");
        process.exit(1);
      }

      heading("Pulling team config...");

      // --- Fetch team config with ETag cache ---
      const cached = getCachedConfig();
      const etag = cached?.etag || null;

      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${org.authToken}` };
      if (etag) {
        headers["If-None-Match"] = etag;
      }

      let teamConfig;
      let newEtag = etag;

      try {
        const url = `${org.hubUrl.replace(/\/$/, "")}/api/cli/config?orgId=${encodeURIComponent(org.orgId)}`;
        const res = await fetch(url, { headers });

        if (res.status === 304) {
          info("Config is up to date (cached).");
          teamConfig = cached.config;
        } else if (res.ok) {
          teamConfig = await res.json();
          newEtag = res.headers.get("etag") || null;
          setCachedConfig(teamConfig, newEtag);
        } else {
          const body = await res.json().catch(() => ({}));
          error(`Failed to fetch team config: ${body?.error || res.statusText}`);
          process.exit(1);
        }
      } catch (err) {
        error(`Network error: ${err.message}`);
        process.exit(1);
      }

      const { mcpServers = [], skills = [], hooks = [] } = teamConfig;

      // Compute hashes for change detection (Merkle-tree sync)
      const hashes = computeConfigHash({
        mcpServers: Object.values(mcpServers),
        skills,
        hooks,
      });

      // Load previously managed keys
      const prevManaged = readManagedKeys();

      // --- Install MCP servers ---
      const managedMcpKeys = installMcpServers(mcpServers, prevManaged.mcpServers);

      // --- Install skills ---
      const managedSkillKeys = installSkills(skills);

      // --- Install hooks ---
      const managedHookKeys = installHooks(hooks);

      // --- Fetch skill-rules ---
      try {
        const rulesUrl = `${org.hubUrl.replace(/\/$/, "")}/api/cli/skill-rules?orgId=${encodeURIComponent(org.orgId)}`;
        const rulesRes = await fetch(rulesUrl, { headers });
        if (rulesRes.ok) {
          const rules = await rulesRes.json();
          fs.mkdirSync(AF_DIR, { recursive: true });
          fs.writeFileSync(SKILL_RULES_FILE, JSON.stringify(rules, null, 2) + "\n");

          // Install skill-hint hook if the rules include a hook script
          if (rules.skillHintScript) {
            installSkillHintHook(rules.skillHintScript);
          }
        } else {
          warn("Could not fetch skill-rules (non-fatal).");
        }
      } catch (err) {
        warn(`Skill-rules fetch failed (non-fatal): ${err.message}`);
      }

      // --- Save managed keys ---
      writeManagedKeys({
        mcpServers: managedMcpKeys,
        skills: managedSkillKeys,
        hooks: managedHookKeys,
      });

      // --- Report usage event (fail-open) ---
      await reportUsageEvent("pull", {
        mcpServersCount: managedMcpKeys.length,
        skillsCount: managedSkillKeys.length,
        hooksCount: managedHookKeys.length,
        rootHash: hashes.rootHash,
      });

      // --- Summary ---
      console.log("");
      success(
        `Synced ${managedMcpKeys.length} MCP server(s), ${managedSkillKeys.length} skill(s), ${managedHookKeys.length} hook(s)`
      );
      label("MCP servers hash", hashes.mcpServersHash.slice(0, 12));
      label("Skills hash", hashes.skillsHash.slice(0, 12));
      label("Hooks hash", hashes.hooksHash.slice(0, 12));
    });
}
