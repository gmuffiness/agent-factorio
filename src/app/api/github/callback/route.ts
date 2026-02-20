import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { getInstallationInfo } from "@/lib/github-app";

/**
 * GitHub App installation callback.
 *
 * After a user installs the GitHub App on their org/account,
 * GitHub redirects here with installation_id and setup_action.
 * We store the installation in DB and redirect back to Settings.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get("installation_id");
  const setupAction = searchParams.get("setup_action");
  const state = searchParams.get("state"); // orgId

  if (!installationId || !state) {
    return NextResponse.json(
      { error: "Missing installation_id or state" },
      { status: 400 }
    );
  }

  // Only process install/update actions
  if (setupAction === "request") {
    // User requested access but org admin hasn't approved yet
    return NextResponse.redirect(
      new URL(`/org/${state}/settings?github=requested`, request.url)
    );
  }

  try {
    // Fetch installation details from GitHub
    const info = await getInstallationInfo(Number(installationId));

    const supabase = getSupabase();
    const now = new Date().toISOString();

    // Upsert the installation record
    await supabase.from("github_installations").upsert(
      {
        id: `ghi-${installationId}`,
        org_id: state,
        installation_id: Number(installationId),
        github_account_login: info.account_login,
        github_account_type: info.account_type,
        created_at: now,
        updated_at: now,
      },
      { onConflict: "org_id,installation_id" }
    );

    // Redirect back to settings with success indicator
    return NextResponse.redirect(
      new URL(`/org/${state}/settings?github=connected`, request.url)
    );
  } catch (err) {
    console.error("[github-callback] Error:", err);
    return NextResponse.redirect(
      new URL(`/org/${state}/settings?github=error`, request.url)
    );
  }
}
