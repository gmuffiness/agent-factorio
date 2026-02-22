"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/db/supabase-browser";
import { trackOrgFork } from "@/lib/analytics";

export default function ForkButton({ orgId, orgName }: { orgId: string; orgName: string }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSupabaseBrowser()
      .auth.getUser()
      .then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  const handleFork = async () => {
    if (!isLoggedIn) {
      router.push(`/login?next=/explore/${orgId}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/fork-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceOrgId: orgId, name: `${orgName} (fork)` }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Fork failed");
        return;
      }

      trackOrgFork(orgId);
      router.push(`/org/${data.id}/overview`);
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleFork}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5v4.5m0 0a3 3 0 103 3m-3-3h7.5M15.75 4.5v4.5m0 0a3 3 0 11-3 3" />
        </svg>
        {loading ? "Forking..." : isLoggedIn ? "Fork Organization" : "Sign in to Fork"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
