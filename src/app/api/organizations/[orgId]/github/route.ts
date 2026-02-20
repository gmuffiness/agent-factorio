import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";
import { requireOrgMember, requireOrgAdmin } from "@/lib/auth";
import { getInstallationUrl } from "@/lib/github-app";

/**
 * GET — List GitHub installations for this org.
 * Also returns the installation URL for connecting new accounts.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  const memberCheck = await requireOrgMember(orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = getSupabase();

  const { data: installations, error } = await supabase
    .from("github_installations")
    .select("id, installation_id, github_account_login, github_account_type, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let installUrl: string | null = null;
  try {
    installUrl = getInstallationUrl(orgId);
  } catch {
    // GITHUB_APP_CLIENT_ID not configured — GitHub integration unavailable
  }

  return NextResponse.json({
    installations: installations ?? [],
    installUrl,
  });
}

/**
 * DELETE — Remove a GitHub installation link (DB only).
 * The user must manually uninstall the GitHub App from GitHub settings.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  const adminCheck = await requireOrgAdmin(orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const body = await request.json();
  const { installationId } = body;

  if (!installationId) {
    return NextResponse.json(
      { error: "installationId is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from("github_installations")
    .delete()
    .eq("org_id", orgId)
    .eq("id", installationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
