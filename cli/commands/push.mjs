/**
 * agent-factorio push — Detect and push agent config to hub
 */
import * as path from "path";
import { choose } from "../lib/prompt.mjs";
import { getDefaultOrg, readLocalConfig, writeLocalConfig, findProjectRoot } from "../lib/config.mjs";
import { authApiCall } from "../lib/api.mjs";
import { detectAll } from "../lib/detect.mjs";
import { success, error, info, label, heading } from "../lib/log.mjs";


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

  // 4. Vendor & Model — detect from Claude Code session, fall back to saved, then prompt
  const session = detected.claudeCodeSession;
  let vendor;
  let model;

  if (session.vendor && session.model) {
    vendor = session.vendor;
    model = session.model;
    label("Vendor", `${vendor} (session)`);
    label("Model", `${model} (session)`);
  } else if (localConfig?.vendor && localConfig?.model) {
    vendor = localConfig.vendor;
    model = localConfig.model;
    label("Vendor", `${vendor} (saved)`);
    label("Model", `${model} (saved)`);
  } else {
    const vendorOptions = ["anthropic", "openai", "google"];
    if (!vendor) {
      ({ value: vendor } = await choose("Vendor", vendorOptions));
    }
    const modelOptions = getModelOptions(vendor);
    ({ value: model } = await choose("Model", modelOptions));
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

function getModelOptions(vendor) {
  switch (vendor) {
    case "anthropic":
      return ["claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"];
    case "openai":
      return ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"];
    case "google":
      return ["gemini-2.0-flash", "gemini-2.0-pro", "gemini-1.5-pro"];
    default:
      return ["default"];
  }
}
