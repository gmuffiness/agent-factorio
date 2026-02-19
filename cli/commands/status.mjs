/**
 * agentfloor status — Show registration status for current project
 */
import { readLocalConfig, getDefaultOrg, findProjectRoot } from "../lib/config.mjs";
import { label, heading, warn, success } from "../lib/log.mjs";

export async function statusCommand() {
  const org = getDefaultOrg();

  // Account info
  heading("Account");
  if (org) {
    label("Name", org.memberName || "(not set)");
    label("Email", org.email || "(not set)");
    label("Member ID", org.memberId || "(not set)");
    label("Organization", org.orgName);
    label("Org ID", org.orgId);
    label("Invite code", org.inviteCode);
    label("Hub URL", org.hubUrl);
  } else {
    warn("Not logged in. Run `agentfloor login` first.");
  }

  console.log();

  // Agent info
  const projectRoot = findProjectRoot();
  const localConfig = readLocalConfig(projectRoot);

  heading("Agent");
  if (!localConfig) {
    warn("No agent registered in this project.");
    console.log('Run `agentfloor push` to register.');
    return;
  }

  label("Agent ID", localConfig.agentId);
  label("Agent name", localConfig.agentName);
  label("Vendor", localConfig.vendor);
  label("Model", localConfig.model);
  label("Last pushed", localConfig.pushedAt || "unknown");
  console.log();
  success("Agent is registered.");
}
