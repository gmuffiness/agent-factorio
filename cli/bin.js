#!/usr/bin/env node

/**
 * AgentFactorio CLI — register and manage agents from any project
 *
 * Usage:
 *   npx agent-factorio login     # Connect to hub + join organization
 *   npx agent-factorio push      # Push agent config to hub
 *   npx agent-factorio status    # Show registration status
 *   npx agent-factorio whoami    # Show login info
 *   npx agent-factorio logout    # Remove global config
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Command } from "commander";
import { loginCommand } from "./commands/login.mjs";
import { pushCommand } from "./commands/push.mjs";
import { statusCommand } from "./commands/status.mjs";
import { whoamiCommand } from "./commands/whoami.mjs";
import { logoutCommand } from "./commands/logout.mjs";
import { connectCommand } from "./commands/connect.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8"));

const program = new Command();

program
  .name("agent-factorio")
  .description("AgentFactorio CLI — AI Agent Fleet Management")
  .version(pkg.version);

program
  .command("login")
  .description("Connect to an AgentFactorio hub and join an organization")
  .action(loginCommand);

program
  .command("push")
  .description("Detect and push agent configuration to the hub")
  .action(pushCommand);

program
  .command("status")
  .description("Show registration status for the current project")
  .action(statusCommand);

program
  .command("whoami")
  .description("Show login info (hub URL, organizations)")
  .action(whoamiCommand);

program
  .command("logout")
  .description("Remove global config and log out")
  .action(logoutCommand);

program
  .command("connect")
  .description("Poll hub and relay messages to local OpenClaw Gateway")
  .action(connectCommand);

program.parse();
