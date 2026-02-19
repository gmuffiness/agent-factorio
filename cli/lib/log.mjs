/**
 * Colored output utilities for CLI
 */

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

export function success(msg) {
  console.log(`${GREEN}\u2713${RESET} ${msg}`);
}

export function error(msg) {
  console.error(`${RED}\u2717${RESET} ${msg}`);
}

export function warn(msg) {
  console.log(`${YELLOW}!${RESET} ${msg}`);
}

export function info(msg) {
  console.log(`${CYAN}i${RESET} ${msg}`);
}

export function dim(msg) {
  console.log(`${DIM}${msg}${RESET}`);
}

export function bold(msg) {
  return `${BOLD}${msg}${RESET}`;
}

export function label(key, value) {
  console.log(`  ${DIM}${key}:${RESET}  ${value}`);
}

export function heading(msg) {
  console.log(`\n${BOLD}${msg}${RESET}`);
}
