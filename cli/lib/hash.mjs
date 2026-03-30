/**
 * Merkle-tree style config hashing utilities
 */
import { createHash } from "crypto";

/**
 * Compute SHA-256 hash of an object (sorted keys for determinism)
 * @param {unknown} obj
 * @returns {string} hex digest
 */
export function computeHash(obj) {
  const json = JSON.stringify(obj, (_key, value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce((sorted, k) => {
        sorted[k] = value[k];
        return sorted;
      }, {});
    }
    return value;
  });
  return createHash("sha256").update(json).digest("hex");
}

/**
 * Compute per-category hashes + root hash for the team config
 * @param {{ mcpServers?: unknown[], skills?: unknown[], hooks?: unknown[] }} config
 * @returns {{ mcpServersHash: string, skillsHash: string, hooksHash: string, rootHash: string }}
 */
export function computeConfigHash({ mcpServers = [], skills = [], hooks = [] }) {
  const mcpServersHash = computeHash(mcpServers);
  const skillsHash = computeHash(skills);
  const hooksHash = computeHash(hooks);
  const rootHash = computeHash({ mcpServersHash, skillsHash, hooksHash });
  return { mcpServersHash, skillsHash, hooksHash, rootHash };
}
