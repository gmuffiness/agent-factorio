/**
 * agentfloor logout — Delete global config
 */
import { deleteGlobalConfig, GLOBAL_CONFIG } from "../lib/config.mjs";
import { success, warn } from "../lib/log.mjs";
import * as fs from "fs";

export async function logoutCommand() {
  try {
    fs.accessSync(GLOBAL_CONFIG);
  } catch {
    warn("Not logged in.");
    return;
  }

  deleteGlobalConfig();
  success("Logged out. Global config removed.");
}
