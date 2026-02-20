/**
 * GitHub App helpers for installation-based authentication.
 *
 * Provides JWT generation, installation token retrieval,
 * and installation URL construction for the GitHub App OAuth flow.
 */

import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generate a JWT for GitHub App authentication.
 * Uses the App's private key to sign a short-lived token.
 */
export async function generateJWT(): Promise<string> {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error("Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY");
  }

  // Decode PEM — env vars may use literal \n
  const pem = privateKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60, // issued 60s ago to account for clock drift
    exp: now + 10 * 60, // 10 minute expiration (max allowed)
    iss: appId,
  };

  // Import the RSA private key
  const pemBody = pem
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, "")
    .replace(/-----END RSA PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Build JWT
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );

  const sig = base64url(signature);
  return `${header}.${body}.${sig}`;
}

function base64url(input: string | ArrayBuffer): string {
  let b64: string;
  if (typeof input === "string") {
    b64 = btoa(input);
  } else {
    b64 = btoa(String.fromCharCode(...new Uint8Array(input)));
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Get an installation access token for a given installation ID.
 * These tokens are valid for 1 hour.
 */
export async function getInstallationToken(
  installationId: number | bigint
): Promise<string> {
  const jwt = await generateJWT();

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AgentFloor-GitHub-App",
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `Failed to get installation token (${res.status}): ${err}`
    );
  }

  const data = await res.json();
  return data.token as string;
}

/**
 * Get installation details from GitHub API.
 */
export async function getInstallationInfo(
  installationId: number | bigint
): Promise<{ account_login: string; account_type: string }> {
  const jwt = await generateJWT();

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "AgentFloor-GitHub-App",
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `Failed to get installation info (${res.status}): ${err}`
    );
  }

  const data = await res.json();
  return {
    account_login: data.account?.login ?? "",
    account_type: data.account?.type ?? "User",
  };
}

/**
 * Build the GitHub App installation URL.
 * Encodes orgId in the state parameter so the callback knows which org to link.
 */
export function getInstallationUrl(orgId: string): string {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing GITHUB_APP_CLIENT_ID");
  }

  const appSlug = process.env.GITHUB_APP_SLUG || "agentfloor";
  const state = encodeURIComponent(orgId);
  return `https://github.com/apps/${appSlug}/installations/new?state=${state}`;
}

/**
 * Find an installation that matches a given repo owner for an org.
 * Looks up github_installations where github_account_login matches the owner.
 */
export async function findInstallationForRepo(
  supabase: SupabaseClient,
  orgId: string,
  owner: string
): Promise<{ installation_id: number } | null> {
  const { data } = await supabase
    .from("github_installations")
    .select("installation_id")
    .eq("org_id", orgId)
    .ilike("github_account_login", owner)
    .maybeSingle();

  if (!data) return null;
  return { installation_id: Number(data.installation_id) };
}
