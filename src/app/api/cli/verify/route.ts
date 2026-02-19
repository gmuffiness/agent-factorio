import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/db/supabase";

/**
 * POST /api/cli/verify
 * Called by the browser verify page after Supabase Auth magic link callback.
 * Marks the CLI login session as verified.
 */
export async function POST(request: NextRequest) {
  const { loginToken, userId } = await request.json();

  if (!loginToken || !userId) {
    return NextResponse.json(
      { error: "loginToken and userId are required" },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  const { data: session, error: fetchError } = await supabase
    .from("cli_login_sessions")
    .select("id, verified, expires_at")
    .eq("token", loginToken)
    .single();

  if (fetchError || !session) {
    return NextResponse.json(
      { error: "Login session not found" },
      { status: 404 },
    );
  }

  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Login session expired" },
      { status: 410 },
    );
  }

  if (session.verified) {
    return NextResponse.json({ message: "Already verified" });
  }

  const { error: updateError } = await supabase
    .from("cli_login_sessions")
    .update({ verified: true, user_id: userId })
    .eq("token", loginToken);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Verified successfully" });
}
