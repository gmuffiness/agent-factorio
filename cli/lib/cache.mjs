/**
 * Local config cache for team standard config (MCP servers, skills, hooks)
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const CACHE_DIR = path.join(os.homedir(), ".agent-factorio");
const CACHE_FILE = path.join(CACHE_DIR, "config-cache.json");
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * @typedef {{ mcpServers: unknown[], skills: unknown[], hooks: unknown[] }} TeamConfig
 * @typedef {{ config: TeamConfig, etag: string | null, fetchedAt: string }} CacheEntry
 */

/** @returns {CacheEntry | null} */
export function getCachedConfig() {
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {TeamConfig} config
 * @param {string | null} etag
 */
export function setCachedConfig(config, etag) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  /** @type {CacheEntry} */
  const entry = {
    config,
    etag: etag || null,
    fetchedAt: new Date().toISOString(),
  };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(entry, null, 2) + "\n");
}

/**
 * Returns true if the cache exists and is less than 5 minutes old
 * @returns {boolean}
 */
export function isCacheValid() {
  const cached = getCachedConfig();
  if (!cached?.fetchedAt) return false;
  const age = Date.now() - new Date(cached.fetchedAt).getTime();
  return age < CACHE_TTL_MS;
}
