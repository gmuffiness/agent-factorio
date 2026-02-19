/**
 * agentfloor status — Show registration status for current project
 */
import { readLocalConfig, getDefaultOrg, findProjectRoot } from "../lib/config.mjs";
import { label, heading, warn, success } from "../lib/log.mjs";

export async function statusCommand() {
  const projectRoot = findProjectRoot();
  const localConfig = readLocalConfig(projectRoot);

  if (!localConfig) {
    warn("No agent registered in this project.");
    console.log('Run `agentfloor push` to register.');
    return;
  }

  const org = getDefaultOrg();

  heading("Agent Status");
  label("Agent ID", localConfig.agentId);
  label("Agent name", localConfig.agentName);
  label("Vendor", localConfig.vendor);
  label("Model", localConfig.model);
  label("Organization", org?.orgName || localConfig.orgId);
  label("Hub URL", localConfig.hubUrl);
  label("Last pushed", localConfig.pushedAt || "unknown");
  console.log();
  success("Agent is registered.");
}
