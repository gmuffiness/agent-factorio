/**
 * Auto-detect project configuration: git repo, skills, MCP servers, CLAUDE.md
 */
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { findProjectRoot } from "./config.mjs";

/**
 * Detect git remote URL and repo root
 * @param {string} [projectRoot]
 * @returns {{ repoUrl: string | null, repoRoot: string }}
 */
export function detectGitRepo(projectRoot) {
  const root = projectRoot || findProjectRoot();
  let repoUrl = null;
  try {
    repoUrl = execSync("git remote get-url origin", { cwd: root, encoding: "utf-8" }).trim();
  } catch {
    // no git remote
  }
  return { repoUrl, repoRoot: root };
}

/**
 * Detect skills from .claude/commands/*.md and .claude/skills/ ** /*.md
 * @param {string} [projectRoot]
 * @returns {string[]}
 */
export function detectSkills(projectRoot) {
  const root = projectRoot || findProjectRoot();
  const skills = [];

  // .claude/commands/*.md
  const commandsDir = path.join(root, ".claude", "commands");
  if (fs.existsSync(commandsDir)) {
    for (const file of readdirRecursive(commandsDir, ".md")) {
      const name = extractSkillName(file);
      if (name) skills.push(name);
    }
  }

  // .claude/skills/**/SKILL.md (only the entry-point file per skill)
  const skillsDir = path.join(root, ".claude", "skills");
  if (fs.existsSync(skillsDir)) {
    for (const file of readdirRecursive(skillsDir, ".md")) {
      if (path.basename(file) !== "SKILL.md") continue;
      const name = extractSkillName(file);
      if (name) skills.push(name);
    }
  }

  // Also check top-level skills/ directory (same: only SKILL.md)
  const topSkillsDir = path.join(root, "skills");
  if (fs.existsSync(topSkillsDir)) {
    for (const file of readdirRecursive(topSkillsDir, ".md")) {
      if (path.basename(file) !== "SKILL.md") continue;
      const name = extractSkillName(file);
      if (name) skills.push(name);
    }
  }

  return [...new Set(skills)];
}

/**
 * Detect MCP servers from multiple config locations:
 *  1. .claude/settings.local.json (project-local)
 *  2. .claude/settings.json (project-local)
 *  3. ~/.claude.json (global, project-scoped settings)
 * @param {string} [projectRoot]
 * @returns {string[]}
 */
export function detectMcpServers(projectRoot) {
  const root = projectRoot || findProjectRoot();
  const servers = new Set();

  // 1. Project-local settings
  for (const filename of ["settings.local.json", "settings.json"]) {
    const settingsPath = path.join(root, ".claude", filename);
    try {
      const raw = fs.readFileSync(settingsPath, "utf-8");
      const settings = JSON.parse(raw);
      if (settings.mcpServers && typeof settings.mcpServers === "object") {
        for (const name of Object.keys(settings.mcpServers)) {
          servers.add(name);
        }
      }
    } catch {
      // file not found or invalid JSON
    }
  }

  // 2. Global ~/.claude.json — project-scoped MCP settings
  const resolvedRoot = fs.realpathSync(root);
  const globalConfigPath = path.join(process.env.HOME || "", ".claude.json");
  try {
    const raw = fs.readFileSync(globalConfigPath, "utf-8");
    const config = JSON.parse(raw);
    if (config.projects && typeof config.projects === "object") {
      const projectSettings = config.projects[resolvedRoot];
      if (projectSettings?.mcpServers && typeof projectSettings.mcpServers === "object") {
        for (const name of Object.keys(projectSettings.mcpServers)) {
          if (Object.keys(projectSettings.mcpServers[name]).length > 0) {
            servers.add(name);
          }
        }
      }
    }
  } catch {
    // file not found or invalid JSON
  }

  return [...servers];
}

/**
 * Detect CLAUDE.md content
 * @param {string} [projectRoot]
 * @returns {{ found: boolean, path: string | null, content: string | null }}
 */
export function detectClaudeMd(projectRoot) {
  const root = projectRoot || findProjectRoot();

  // Check .claude/CLAUDE.md first, then root CLAUDE.md
  for (const relPath of [".claude/CLAUDE.md", "CLAUDE.md"]) {
    const fullPath = path.join(root, relPath);
    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      return { found: true, path: relPath, content };
    } catch {
      // not found
    }
  }

  return { found: false, path: null, content: null };
}

/**
 * Detect AI service subscriptions from environment and local tooling
 * @returns {{ name: string, detectionSource: string }[]}
 */
export function detectSubscriptions() {
  const subs = [];

  // Claude Code — check CLAUDECODE env var or ~/.claude directory
  if (process.env.CLAUDE_CODE_VERSION || process.env.CLAUDECODE) {
    subs.push({ name: "Claude Code", detectionSource: "env_var" });
  } else {
    const claudeDir = path.join(process.env.HOME || "", ".claude");
    if (fs.existsSync(claudeDir)) {
      subs.push({ name: "Claude Code", detectionSource: "cli_push" });
    }
  }

  // API keys
  if (process.env.ANTHROPIC_API_KEY) {
    subs.push({ name: "Anthropic API", detectionSource: "env_var" });
  }
  if (process.env.OPENAI_API_KEY) {
    subs.push({ name: "OpenAI API", detectionSource: "env_var" });
  }

  // Cursor
  const cursorDir = path.join(process.env.HOME || "", ".cursor");
  if (fs.existsSync(cursorDir)) {
    subs.push({ name: "Cursor", detectionSource: "cli_push" });
  }

  // GitHub Copilot
  const vscodeExtDir = path.join(process.env.HOME || "", ".vscode", "extensions");
  try {
    if (fs.existsSync(vscodeExtDir)) {
      const entries = fs.readdirSync(vscodeExtDir);
      if (entries.some((e) => e.startsWith("github.copilot"))) {
        subs.push({ name: "GitHub Copilot", detectionSource: "cli_push" });
      }
    }
  } catch {
    // ignore
  }

  // Windsurf
  const windsurfDir = path.join(process.env.HOME || "", ".windsurf");
  if (fs.existsSync(windsurfDir)) {
    subs.push({ name: "Windsurf", detectionSource: "cli_push" });
  }

  return subs;
}

/**
 * Detect vendor and model from Claude Code session data.
 * Reads the latest session JSONL in ~/.claude/projects/{encoded-path}/ and
 * finds the most recent assistant message which contains { model: "..." }.
 * @param {string} [projectRoot]
 * @returns {{ vendor: string | null, model: string | null, version: string | null, sessionId: string | null }}
 */
export function detectClaudeCodeSession(projectRoot) {
  const root = projectRoot || findProjectRoot();
  const result = { vendor: null, model: null, version: null, sessionId: null };

  try {
    const resolvedRoot = fs.realpathSync(root);
    const encodedPath = resolvedRoot.replace(/\//g, "-");
    const claudeProjectDir = path.join(process.env.HOME || "", ".claude", "projects", encodedPath);

    if (!fs.existsSync(claudeProjectDir)) return result;

    // Find JSONL files sorted by modification time (newest first)
    const entries = fs.readdirSync(claudeProjectDir)
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(claudeProjectDir, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    if (entries.length === 0) return result;

    // Read the latest session file from the end to find the most recent assistant message
    const filePath = path.join(claudeProjectDir, entries[0].name);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.trim().split("\n");

    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const data = JSON.parse(lines[i]);
        if (data.type === "assistant" && data.message?.model) {
          result.model = data.message.model;
          result.version = data.version || null;
          result.sessionId = data.sessionId || null;

          // Infer vendor from model name
          if (result.model.startsWith("claude")) {
            result.vendor = "anthropic";
          } else if (result.model.startsWith("gpt") || result.model.startsWith("o1") || result.model.startsWith("o3")) {
            result.vendor = "openai";
          } else if (result.model.startsWith("gemini")) {
            result.vendor = "google";
          }
          break;
        }
      } catch {
        // skip unparseable lines
      }
    }
  } catch {
    // ignore errors (no Claude Code, permission issues, etc.)
  }

  return result;
}

/**
 * Run all detections and return a summary
 * @param {string} [projectRoot]
 */
export function detectAll(projectRoot) {
  const root = projectRoot || findProjectRoot();
  return {
    git: detectGitRepo(root),
    skills: detectSkills(root),
    mcpServers: detectMcpServers(root),
    claudeMd: detectClaudeMd(root),
    subscriptions: detectSubscriptions(),
    claudeCodeSession: detectClaudeCodeSession(root),
  };
}

// --- Helpers ---

/**
 * Recursively find files with a given extension
 * @param {string} dir
 * @param {string} ext
 * @returns {string[]}
 */
function readdirRecursive(dir, ext) {
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...readdirRecursive(fullPath, ext));
      } else if (entry.name.endsWith(ext)) {
        results.push(fullPath);
      }
    }
  } catch {
    // permission error or not found
  }
  return results;
}

/**
 * Extract skill name from a markdown file (first heading or filename)
 * @param {string} filePath
 * @returns {string | null}
 */
function extractSkillName(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    // Try to find first heading
    const match = content.match(/^#\s+(.+)/m);
    if (match) return match[1].trim();
  } catch {
    // fall through
  }
  // Use filename without extension
  const base = path.basename(filePath, ".md");
  if (base === "SKILL" || base === "README") {
    // Use parent directory name
    return path.basename(path.dirname(filePath));
  }
  return base;
}
