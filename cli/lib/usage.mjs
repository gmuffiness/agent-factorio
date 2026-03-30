/**
 * Usage event reporting (OTEL-style telemetry)
 * Fail-open: never throws, logs a warning on failure.
 */
import { getDefaultOrg } from "./config.mjs";
import { apiCall } from "./api.mjs";
import { warn } from "./log.mjs";

/**
 * Report a usage event to the hub.
 * @param {string} eventType - e.g. "pull", "push", "login"
 * @param {Record<string, unknown>} [metadata]
 * @returns {Promise<void>}
 */
export async function reportUsageEvent(eventType, metadata = {}) {
  try {
    const org = getDefaultOrg();
    if (!org?.authToken || !org?.hubUrl) return;

    await apiCall(org.hubUrl, "/api/cli/usage", {
      method: "POST",
      authToken: org.authToken,
      body: {
        eventType,
        orgId: org.orgId,
        memberId: org.memberId || undefined,
        metadata,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    warn(`Usage reporting failed (non-fatal): ${err.message}`);
  }
}
