/**
 * agentfloor login — Connect to hub + join organization
 */
import { ask, choose } from "../lib/prompt.mjs";
import { readGlobalConfig, upsertOrg } from "../lib/config.mjs";
import { apiCall, checkHub } from "../lib/api.mjs";
import { success, error, info } from "../lib/log.mjs";

export async function loginCommand() {
  const existing = readGlobalConfig();
  const defaultUrl = existing?.organizations?.[0]?.hubUrl || "";

  // 1. Hub URL
  const hubUrl = await ask("AgentFloor Hub URL", defaultUrl || "http://localhost:3000");
  if (!hubUrl) {
    error("Hub URL is required.");
    process.exit(1);
  }

  // Check connectivity
  const reachable = await checkHub(hubUrl);
  if (!reachable) {
    error(`Cannot connect to ${hubUrl}. Is the hub running?`);
    process.exit(1);
  }
  success("Hub connected.");

  // 2. Create or Join
  const { index: actionIdx } = await choose("Create or join an organization?", [
    "Join existing (invite code)",
    "Create new",
  ]);

  // Common: ask for email and name
  const email = await ask("Your email (used as your identifier)");
  if (!email) {
    error("Email is required.");
    process.exit(1);
  }
  const memberName = await ask("Your name (displayed in the org)", "CLI User");

  if (actionIdx === 1) {
    // Create new org
    const orgName = await ask("Organization name");
    if (!orgName) {
      error("Organization name is required.");
      process.exit(1);
    }

    const res = await apiCall(hubUrl, "/api/cli/login", {
      body: { action: "create", orgName, memberName, email },
    });

    if (!res.ok) {
      error(`Failed to create organization: ${res.data?.error || "Unknown error"}`);
      process.exit(1);
    }

    const { orgId, orgName: name, inviteCode, memberId } = res.data;
    upsertOrg({ hubUrl, orgId, orgName: name, inviteCode, memberName, email, memberId });

    success(`Created "${name}" (${orgId})`);
    info(`Invite code: ${inviteCode} — share with your team!`);
  } else {
    // Join existing
    const inviteCode = await ask("Invite code");
    if (!inviteCode) {
      error("Invite code is required.");
      process.exit(1);
    }

    const res = await apiCall(hubUrl, "/api/cli/login", {
      body: { action: "join", inviteCode, memberName, email },
    });

    if (!res.ok) {
      error(`Failed to join: ${res.data?.error || "Invalid invite code"}`);
      process.exit(1);
    }

    const { orgId, orgName, memberId } = res.data;
    upsertOrg({ hubUrl, orgId, orgName, inviteCode: inviteCode.toUpperCase(), memberName, email, memberId });

    success(`Joined "${orgName}" (${orgId})`);
  }

  console.log("\nLogged in! Run `agentfloor push` in any project to register an agent.");
}
