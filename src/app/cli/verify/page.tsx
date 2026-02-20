"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function CliVerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function verify() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !anonKey) {
        setStatus("error");
        setMessage("Missing Supabase configuration.");
        return;
      }

      // Extract loginToken from URL search params
      const params = new URLSearchParams(window.location.search);
      const loginToken = params.get("loginToken");

      if (!loginToken) {
        setStatus("error");
        setMessage("Missing login token. Please use the link from your email.");
        return;
      }

      // Supabase puts auth tokens in the URL hash after magic link redirect
      const hashParams = new URLSearchParams(
        window.location.hash.replace("#", "")
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (!accessToken) {
        setStatus("error");
        setMessage("Authentication failed. The link may have expired. Please try logging in again.");
        return;
      }

      // Set session from hash tokens
      const supabase = createClient(url, anonKey);
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });

      if (sessionError || !sessionData.user) {
        setStatus("error");
        setMessage("Failed to authenticate. The link may have expired.");
        return;
      }

      const userId = sessionData.user.id;

      // Mark the CLI login session as verified
      const res = await fetch("/api/cli/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginToken, userId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setStatus("error");
        setMessage(data?.error || "Verification failed. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("Email verified! You can close this tab and return to your terminal.");
    }

    verify();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="mx-4 max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <h1 className="mb-4 text-xl font-semibold">AgentFactorio CLI Login</h1>

        {status === "loading" && (
          <div className="space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
            <p className="text-zinc-400">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-2xl text-green-400">
              &#10003;
            </div>
            <p className="text-green-400">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-2xl text-red-400">
              &#10007;
            </div>
            <p className="text-red-400">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
