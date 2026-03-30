#!/usr/bin/env node
/**
 * AgentFactorio activity daemon
 * Watches the Claude Code JSONL transcript and reports activity events to the Hub.
 * Spawned by session-start.mjs — runs as a detached background process.
 *
 * CLI args: <agentId> <hubUrl> <authToken> <sessionId> <orgId>
 */
import fs from "fs";
import path from "path";
import os from "os";

const [, , agentId, hubUrl, authToken, sessionId, orgId] = process.argv;

if (!agentId || !hubUrl || !authToken || !sessionId || !orgId) {
  process.stderr.write(
    "[AF:daemon] Missing required args: agentId hubUrl authToken sessionId orgId\n"
  );
  process.exit(1);
}

const PID_FILE = path.join("/tmp", `af-daemon-${agentId}.pid`);
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const POLL_INTERVAL_MS = 2000; // fallback polling interval

// ── Dedup stale daemon ────────────────────────────────────────────────────────

try {
  if (fs.existsSync(PID_FILE)) {
    const existingPid = parseInt(fs.readFileSync(PID_FILE, "utf-8").trim(), 10);
    try {
      process.kill(existingPid, 0);
      process.stderr.write(
        `[AF:daemon] Already running (PID ${existingPid}). Exiting.\n`
      );
      process.exit(0);
    } catch {
      // stale PID — continue
    }
  }
} catch {
  // ignore
}

fs.writeFileSync(PID_FILE, String(process.pid));

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function postActivity(eventType, extra = {}) {
  try {
    await fetch(`${hubUrl}/api/cli/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        agentId,
        orgId,
        sessionId,
        eventType,
        ...extra,
      }),
    });
  } catch {
    // best-effort — silently ignore network failures
  }
}

// ── Tool status formatting ────────────────────────────────────────────────────

function formatToolStatus(toolName, input) {
  switch (toolName) {
    case "Read":
      return `Reading ${input?.file_path ? path.basename(input.file_path) : "file"}`;
    case "Edit":
      return `Editing ${input?.file_path ? path.basename(input.file_path) : "file"}`;
    case "Write":
      return `Writing ${input?.file_path ? path.basename(input.file_path) : "file"}`;
    case "Bash": {
      const cmd = input?.command ?? "";
      const desc = input?.description ?? "";
      return `Running: ${desc || cmd.slice(0, 50)}`;
    }
    case "Grep":
      return "Searching code";
    case "Glob":
      return "Searching files";
    default:
      return `Using ${toolName}`;
  }
}

// ── JSONL transcript location ─────────────────────────────────────────────────

function findTranscriptPath() {
  // Encode cwd: replace / with - (skip leading slash)
  const cwd = process.env.AF_PROJECT_ROOT || process.cwd();
  // Claude encodes path by replacing / with - (dropping leading /)
  const encoded = cwd.replace(/^\//, "").replace(/\//g, "-");
  const dir = path.join(os.homedir(), ".claude", "projects", encoded);
  const file = path.join(dir, `${sessionId}.jsonl`);
  return file;
}

// ── JSONL watcher ─────────────────────────────────────────────────────────────

let fileOffset = 0;
let fsWatcher = null;
let pollTimer = null;
let transcriptPath = null;

function processNewLines(filePath) {
  let fd;
  try {
    fd = fs.openSync(filePath, "r");
    const stat = fs.fstatSync(fd);
    if (stat.size <= fileOffset) return;

    const buf = Buffer.alloc(stat.size - fileOffset);
    fs.readSync(fd, buf, 0, buf.length, fileOffset);
    fileOffset = stat.size;

    const chunk = buf.toString("utf-8");
    const lines = chunk.split("\n").filter((l) => l.trim());

    for (const line of lines) {
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }

      // Claude Code JSONL format: { type, message: { role, content: [...] } }
      if (entry?.type !== "assistant") continue;
      const content = entry?.message?.content;
      if (!Array.isArray(content)) continue;

      for (const block of content) {
        if (block?.type !== "tool_use") continue;
        const toolName = block.name ?? "";
        const input = block.input ?? {};
        const taskDesc = formatToolStatus(toolName, input);

        postActivity("tool_use", {
          toolName,
          taskDescription: taskDesc,
          metadata: { toolId: block.id },
        });
      }
    }
  } catch {
    // file may not exist yet or be locked — ignore
  } finally {
    if (fd !== undefined) {
      try { fs.closeSync(fd); } catch { /* ignore */ }
    }
  }
}

function startWatching(filePath) {
  transcriptPath = filePath;
  process.stderr.write(`[AF:daemon] Watching transcript: ${filePath}\n`);

  // Try fs.watch first
  try {
    fsWatcher = fs.watch(filePath, (eventType) => {
      if (eventType === "change") {
        processNewLines(filePath);
      }
    });

    fsWatcher.on("error", () => {
      fsWatcher = null;
      startPolling(filePath);
    });
  } catch {
    // fs.watch failed — fall back to polling
    startPolling(filePath);
  }
}

function startPolling(filePath) {
  process.stderr.write(`[AF:daemon] Falling back to polling: ${filePath}\n`);
  pollTimer = setInterval(() => processNewLines(filePath), POLL_INTERVAL_MS);
}

function waitForTranscript() {
  const filePath = findTranscriptPath();
  if (fs.existsSync(filePath)) {
    startWatching(filePath);
    return;
  }

  // Poll until the file appears (Claude creates it shortly after session start)
  const waitTimer = setInterval(() => {
    if (fs.existsSync(filePath)) {
      clearInterval(waitTimer);
      startWatching(filePath);
    }
  }, 1000);

  // Give up after 60s if transcript never appears
  setTimeout(() => clearInterval(waitTimer), 60_000);
}

// ── Heartbeat ─────────────────────────────────────────────────────────────────

const heartbeatTimer = setInterval(() => {
  postActivity("heartbeat");
}, HEARTBEAT_INTERVAL_MS);

// ── Shutdown ──────────────────────────────────────────────────────────────────

function cleanup() {
  clearInterval(heartbeatTimer);
  if (pollTimer) clearInterval(pollTimer);
  if (fsWatcher) {
    try { fsWatcher.close(); } catch { /* ignore */ }
  }
  try { fs.unlinkSync(PID_FILE); } catch { /* ignore */ }
}

async function shutdown(signal) {
  process.stderr.write(`[AF:daemon] ${signal} received. Sending session_end.\n`);
  await postActivity("session_end");
  cleanup();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("exit", () => cleanup());

// ── Start ─────────────────────────────────────────────────────────────────────

process.stderr.write(
  `[AF:daemon] Started (PID ${process.pid}) — agent=${agentId} session=${sessionId}\n`
);

await postActivity("session_start");
waitForTranscript();
