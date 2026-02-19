/**
 * agentfloor whoami — Show login info (hub URL, organizations)
 */
import { readGlobalConfig } from "../lib/config.mjs";
import { label, heading, warn } from "../lib/log.mjs";

export async function whoamiCommand() {
  const config = readGlobalConfig();

  if (!config || !config.organizations?.length) {
    warn("Not logged in.");
    console.log('Run `agentfloor login` to connect to a hub.');
    return;
  }

  heading("Login Info");

  for (const org of config.organizations) {
    const isDefault = org.orgId === config.defaultOrg ? " (default)" : "";
    console.log();
    label("Organization", `${org.orgName}${isDefault}`);
    label("Org ID", org.orgId);
    label("Hub URL", org.hubUrl);
    label("Invite code", org.inviteCode);
    if (org.memberName) {
      label("Member name", org.memberName);
    }
  }
  console.log();
}
