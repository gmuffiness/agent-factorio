/**
 * Hub API call helper
 */

/**
 * Make an API request to the AgentFactorio hub
 * @param {string} hubUrl - Base URL of the hub
 * @param {string} path - API path (e.g. "/api/cli/login")
 * @param {{ method?: string, body?: unknown }} [options]
 * @returns {Promise<{ ok: boolean, status: number, data: unknown }>}
 */
export async function apiCall(hubUrl, path, options = {}) {
  const url = `${hubUrl.replace(/\/$/, "")}${path}`;
  const method = options.method || (options.body ? "POST" : "GET");

  const fetchOptions = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { ok: res.ok, status: res.status, data };
}

/**
 * Check if hub is reachable
 * @param {string} hubUrl
 * @returns {Promise<boolean>}
 */
export async function checkHub(hubUrl) {
  try {
    const res = await fetch(`${hubUrl.replace(/\/$/, "")}/api/cli/login`, {
      method: "OPTIONS",
    });
    // Any response (even 405) means the server is reachable
    return res.status < 500;
  } catch {
    // Try a simple GET to the root
    try {
      const res = await fetch(hubUrl);
      return res.ok;
    } catch {
      return false;
    }
  }
}
