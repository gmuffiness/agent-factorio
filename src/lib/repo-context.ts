/**
 * GitHub Repo Context Helper
 *
 * Fetches repository structure and key files via GitHub API
 * to build rich system prompts for "cloud" runtime agents.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { findInstallationForRepo, getInstallationToken } from "@/lib/github-app";

interface RepoInfo {
  owner: string;
  repo: string;
}

interface TreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface RepoContext {
  repoUrl: string;
  owner: string;
  repo: string;
  directoryTree: string;
  keyFiles: { path: string; content: string }[];
}

// In-memory cache: key = "owner/repo", value = { data, timestamp }
const cache = new Map<string, { data: RepoContext; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Key files to auto-fetch (in priority order) */
const KEY_FILE_PATHS = [
  "CLAUDE.md",
  ".claude/CLAUDE.md",
  "README.md",
  "package.json",
  "tsconfig.json",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod",
];

/** Max file size to fetch (skip very large files) */
const MAX_FILE_SIZE = 50_000; // 50KB

/** Max tree depth for directory display */
const MAX_TREE_DEPTH = 3;

/** Max entries in tree display */
const MAX_TREE_ENTRIES = 200;

/**
 * Extract GitHub owner/repo from various URL formats.
 * Supports SSH and HTTPS URLs.
 */
export function extractGitHubRepo(url: string): RepoInfo | null {
  // SSH: git@github.com:owner/repo.git or git@github-alias:owner/repo.git
  const sshMatch = url.match(/^git@[^:]*github[^:]*:([^/]+)\/([^/.]+)/);
  if (sshMatch) return { owner: sshMatch[1], repo: sshMatch[2] };
  // HTTPS: https://github.com/owner/repo
  const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (httpsMatch) return { owner: httpsMatch[1], repo: httpsMatch[2] };
  return null;
}

function githubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "AgentFactorio-Cloud-Runtime",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch the full repo tree (recursive) from GitHub API.
 */
async function fetchRepoTree(
  owner: string,
  repo: string,
  token?: string
): Promise<TreeEntry[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  const res = await fetch(url, { headers: githubHeaders(token) });

  if (!res.ok) {
    if (res.status === 404) throw new Error(`Repository ${owner}/${repo} not found`);
    if (res.status === 401 || res.status === 403)
      throw new Error(`GitHub API auth failed for ${owner}/${repo}. Set GITHUB_TOKEN for private repos.`);
    throw new Error(`GitHub API error ${res.status} fetching tree for ${owner}/${repo}`);
  }

  const data = await res.json();
  return (data.tree ?? []).map((e: { path: string; type: string; size?: number }) => ({
    path: e.path,
    type: e.type as "blob" | "tree",
    size: e.size,
  }));
}

/**
 * Fetch a single file's content from GitHub API (base64 decoded).
 */
async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(url, { headers: githubHeaders(token) });

  if (!res.ok) return null;

  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return null;
}

/**
 * Build a directory tree string from flat tree entries.
 */
function buildDirectoryTree(entries: TreeEntry[]): string {
  const lines: string[] = [];

  for (const entry of entries) {
    const depth = entry.path.split("/").length - 1;
    if (depth > MAX_TREE_DEPTH) continue;
    if (lines.length >= MAX_TREE_ENTRIES) {
      lines.push("... (truncated)");
      break;
    }

    const indent = "  ".repeat(depth);
    const name = entry.path.split("/").pop() ?? entry.path;
    const suffix = entry.type === "tree" ? "/" : "";
    lines.push(`${indent}${name}${suffix}`);
  }

  return lines.join("\n");
}

/**
 * Main function: fetch repo context for a cloud runtime agent.
 * Returns structured context including directory tree and key file contents.
 */
export async function fetchRepoContext(
  repoUrl: string,
  token?: string
): Promise<RepoContext | null> {
  const info = extractGitHubRepo(repoUrl);
  if (!info) return null;

  const cacheKey = `${info.owner}/${info.repo}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Use env token as fallback
  const resolvedToken = token || process.env.GITHUB_TOKEN;

  const tree = await fetchRepoTree(info.owner, info.repo, resolvedToken);
  const directoryTree = buildDirectoryTree(tree);

  // Find which key files exist in the tree
  const existingKeyFiles = KEY_FILE_PATHS.filter((kf) =>
    tree.some((e) => e.path === kf && e.type === "blob" && (e.size ?? 0) <= MAX_FILE_SIZE)
  );

  // Fetch key files in parallel
  const fileResults = await Promise.all(
    existingKeyFiles.map(async (path) => {
      const content = await fetchFileContent(info.owner, info.repo, path, resolvedToken);
      return content ? { path, content } : null;
    })
  );

  const keyFiles = fileResults.filter((f): f is { path: string; content: string } => f !== null);

  const result: RepoContext = {
    repoUrl,
    owner: info.owner,
    repo: info.repo,
    directoryTree,
    keyFiles,
  };

  // Cache result
  cache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

/**
 * Format repo context into a system prompt section.
 */
export function formatRepoContextPrompt(ctx: RepoContext): string {
  let prompt = `## Repository: ${ctx.owner}/${ctx.repo}\n\n`;

  prompt += `### Directory Structure\n\`\`\`\n${ctx.directoryTree}\n\`\`\`\n\n`;

  for (const file of ctx.keyFiles) {
    const ext = file.path.split(".").pop() ?? "";
    prompt += `### ${file.path}\n\`\`\`${ext}\n${file.content}\n\`\`\`\n\n`;
  }

  return prompt;
}

/**
 * Resolve a GitHub token for a given repo URL.
 *
 * 1. Parse owner from repoUrl
 * 2. Look up a matching GitHub App installation for the org
 * 3. If found, generate an installation access token
 * 4. Otherwise fall back to the GITHUB_TOKEN env var
 */
export async function getTokenForRepo(
  supabase: SupabaseClient,
  orgId: string,
  repoUrl: string
): Promise<string | undefined> {
  const info = extractGitHubRepo(repoUrl);
  if (!info) return process.env.GITHUB_TOKEN;

  try {
    const installation = await findInstallationForRepo(supabase, orgId, info.owner);
    if (installation) {
      return await getInstallationToken(installation.installation_id);
    }
  } catch (err) {
    console.error(`[repo-context] Failed to get installation token for ${info.owner}:`, err);
  }

  return process.env.GITHUB_TOKEN;
}
