/**
 * agentfloor connect — Poll hub for messages, relay to local OpenClaw Gateway
 */
import { readLocalConfig, findProjectRoot } from "../lib/config.mjs";
import { success, error, info, label, heading } from "../lib/log.mjs";

const POLL_INTERVAL_MS = 2000;
const LOCAL_GATEWAY_URL = "http://localhost:18789";

export async function connectCommand() {
  const projectRoot = findProjectRoot();
  const localConfig = readLocalConfig(projectRoot);

  if (!localConfig?.agentId || !localConfig?.hubUrl || !localConfig?.pollToken) {
    error(
      "Missing agentId, hubUrl, or pollToken in .agentfloor/config.json.\n" +
      "Run `agentfloor push` with runtimeType=openclaw first."
    );
    process.exit(1);
  }

  const { agentId, hubUrl, pollToken, agentName } = localConfig;
  const pollUrl = `${hubUrl}/api/agents/${agentId}/poll`;
  const respondUrl = `${hubUrl}/api/agents/${agentId}/respond`;
  const headers = {
    Authorization: `Bearer ${pollToken}`,
    "Content-Type": "application/json",
  };

  heading("AgentFloor Connector");
  label("Agent", agentName || agentId);
  label("Hub", hubUrl);
  label("Gateway", LOCAL_GATEWAY_URL);
  info(`Polling every ${POLL_INTERVAL_MS / 1000}s... (Ctrl+C to stop)\n`);

  // Graceful shutdown
  let running = true;
  process.on("SIGINT", () => {
    running = false;
    info("\nShutting down connector...");
    process.exit(0);
  });

  while (running) {
    try {
      // 1. Poll for pending messages
      const pollRes = await fetch(pollUrl, { headers });
      if (!pollRes.ok) {
        const errText = await pollRes.text().catch(() => "");
        error(`Poll failed (${pollRes.status}): ${errText}`);
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      const { items } = await pollRes.json();

      if (!items || items.length === 0) {
        await sleep(POLL_INTERVAL_MS);
        continue;
      }

      // 2. Process each item
      for (const item of items) {
        info(`Received message: "${item.message.slice(0, 60)}${item.message.length > 60 ? "..." : ""}"`);

        try {
          // 3. Forward to local OpenClaw Gateway
          const gwRes = await fetch(`${LOCAL_GATEWAY_URL}/api/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: item.message,
              history: item.history,
            }),
          });

          if (!gwRes.ok) {
            const errText = await gwRes.text().catch(() => "Gateway error");
            error(`Gateway returned ${gwRes.status}: ${errText}`);

            // Report failure back to hub
            await fetch(respondUrl, {
              method: "POST",
              headers,
              body: JSON.stringify({
                queueItemId: item.queueItemId,
                content: `[Error] Gateway returned ${gwRes.status}: ${errText}`,
              }),
            });
            continue;
          }

          // Collect response — handle both SSE and plain JSON
          let responseText = "";
          const contentType = gwRes.headers.get("content-type") || "";

          if (contentType.includes("text/event-stream") && gwRes.body) {
            // Parse SSE stream
            const reader = gwRes.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const parsed = JSON.parse(line.slice(6));
                    const text = parsed.text ?? parsed.content ?? "";
                    if (text) responseText += text;
                  } catch {
                    responseText += line.slice(6);
                  }
                }
              }
            }
          } else {
            // Plain JSON response
            const data = await gwRes.json().catch(() => null);
            responseText = data?.content ?? data?.text ?? data?.message ?? JSON.stringify(data);
          }

          // 4. Send response back to hub
          const respondRes = await fetch(respondUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              queueItemId: item.queueItemId,
              content: responseText,
            }),
          });

          if (respondRes.ok) {
            success(`Response sent (${responseText.length} chars)`);
          } else {
            const errText = await respondRes.text().catch(() => "");
            error(`Failed to send response: ${errText}`);
          }
        } catch (gwErr) {
          error(`Gateway error: ${gwErr.message}`);
          // Report failure
          await fetch(respondUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              queueItemId: item.queueItemId,
              content: `[Error] ${gwErr.message}`,
            }),
          }).catch(() => {});
        }
      }
    } catch (pollErr) {
      error(`Poll error: ${pollErr.message}`);
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
