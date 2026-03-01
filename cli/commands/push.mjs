/**
 * agent-factorio push — Detect and push agent config to hub
 */
import * as path from "path";
import { ask, choose } from "../lib/prompt.mjs";
import { getDefaultOrg, readLocalConfig, writeLocalConfig, findProjectRoot } from "../lib/config.mjs";
import { authApiCall } from "../lib/api.mjs";
import { detectAll } from "../lib/detect.mjs";
import { success, error, info, label, heading } from "../lib/log.mjs";

/**
 * Infer vendor from detected subscriptions and environment
 * @param {{ name: string, detectionSource: string }[]} subscriptions
 * @returns {string | null}
 */
function inferVendor(subscriptions) {
  const subNames = subscriptions.map((s) => s.name);

  // Claude Code or Anthropic API → anthropic
  if (subNames.includes("Claude Code") || subNames.includes("Anthropic API")) {
    return "anthropic";
  }
  // OpenAI API → openai
  if (subNames.includes("OpenAI API")) {
    return "openai";
  }
  // Cursor defaults to anthropic (most common), but could be openai
  if (subNames.includes("Cursor")) {
    return "anthropic";
  }
  // GitHub Copilot → openai
  if (subNames.includes("GitHub Copilot")) {
    return "openai";
  }
  // Windsurf → anthropic
  if (subNames.includes("Windsurf")) {
    return "anthropic";
  }

  return null;
}

/**
 * Infer model from vendor and environment
 * @param {string} vendor
 * @returns {string}
 */
function inferModel(vendor) {
  // Check environment variables
  if (process.env.ANTHROPIC_MODEL) return process.env.ANTHROPIC_MODEL;
  if (process.env.CLAUDE_MODEL) return process.env.CLAUDE_MODEL;
  if (process.env.OPENAI_MODEL) return process.env.OPENAI_MODEL;

  // Default to latest model per vendor
  switch (vendor) {
    case "anthropic":
      return "claude-sonnet-4-6";
    case "openai":
      return "gpt-4o";
    case "google":
      return "gemini-2.0-flash";
    default:
      return "default";
  }
}

export async function pushCommand() {
  // 1. Check login
  const org = getDefaultOrg();
  if (!org) {
    error("Not logged in. Run `agent-factorio login` first.");
    process.exit(1);
  }

  const projectRoot = findProjectRoot();
  const localConfig = readLocalConfig(projectRoot);

  // 2. Auto-detect
  heading("Detecting agent configuration...");
  const detected = detectAll(projectRoot);

  label("Git repo", detected.git.repoUrl || "(none)");
  label("Skills", detected.skills.length > 0
    ? `${detected.skills.join(", ")} (${detected.skills.length})`
    : "(none)");
  label("MCP servers", detected.mcpServers.length > 0
    ? `${detected.mcpServers.join(", ")} (${detected.mcpServers.length})`
    : "(none)");
  label("CLAUDE.md", detected.claudeMd.found
    ? `found (${detected.claudeMd.path})`
    : "(not found)");
  label("Subscriptions", detected.subscriptions.length > 0
    ? `${detected.subscriptions.map((s) => s.name).join(", ")} (auto-detected)`
    : "(none)");

  // 3. Agent name — use saved or auto-detect from directory name
  const agentName = localConfig?.agentName || path.basename(projectRoot);
  label("Agent", localConfig?.agentName ? `${agentName} (saved)` : `${agentName} (auto)`);

  // 4. Vendor — auto-detect from subscriptions, fall back to saved, then prompt
  let vendor;
  if (localConfig?.vendor) {
    vendor = localConfig.vendor;
    label("Vendor", `${vendor} (saved)`);
  } else {
    vendor = inferVendor(detected.subscriptions);
    if (vendor) {
      label("Vendor", `${vendor} (auto-detected)`);
    } else {
      const vendorOptions = ["anthropic", "openai", "google"];
      ({ value: vendor } = await choose("Vendor", vendorOptions));
    }
  }

  // 5. Model — auto-detect from env/vendor, fall back to saved, then prompt
  let model;
  if (localConfig?.model) {
    model = localConfig.model;
    label("Model", `${model} (saved)`);
  } else {
    model = inferModel(vendor);
    label("Model", `${model} (auto-detected)`);
  }

  console.log();

  // 6. Build request body
  const body = {
    agentId: localConfig?.agentId || undefined,
    agentName,
    vendor,
    model,
    orgId: org.orgId,
    memberId: org.memberId || undefined,
    description: `Pushed via CLI at ${new Date().toISOString()}`,
  };

  // Attach MCP tools
  if (detected.mcpServers.length > 0) {
    body.mcpTools = detected.mcpServers.map((name) => ({ name, server: name }));
  }

  // Attach skills
  if (detected.skills.length > 0) {
    body.skills = detected.skills;
  }

  // Attach git repo URL
  if (detected.git.repoUrl) {
    body.repoUrl = detected.git.repoUrl;
  }

  // Attach detected subscriptions
  if (detected.subscriptions.length > 0) {
    body.detectedSubscriptions = detected.subscriptions;
  }

  // Attach CLAUDE.md as context
  if (detected.claudeMd.found) {
    body.context = [{
      type: "claude-md",
      content: detected.claudeMd.content,
      sourceFile: detected.claudeMd.path,
    }];
  }

  // 7. Push to hub
  info(`Pushing to "${org.orgName}" at ${org.hubUrl}...`);

  const res = await authApiCall("/api/cli/push", { body });

  if (!res.ok) {
    error(`Failed to push: ${res.data?.error || "Unknown error"}`);
    process.exit(1);
  }

  const { id: agentId, updated, pollToken } = res.data;

  const configData = {
    hubUrl: org.hubUrl,
    orgId: org.orgId,
    agentId,
    agentName,
    vendor,
    model,
    pushedAt: new Date().toISOString(),
  };

  // Save pollToken if returned (openclaw agents)
  if (pollToken) {
    configData.pollToken = pollToken;
  }

  writeLocalConfig(configData, projectRoot);

  if (updated) {
    success(`Agent updated! (${agentId})`);
  } else {
    success(`Agent registered! (${agentId})`);
  }

  console.log(`\nDashboard: ${org.hubUrl}/org/${org.orgId}`);
}
