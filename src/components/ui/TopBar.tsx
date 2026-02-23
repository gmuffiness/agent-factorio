"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { useOrgId } from "@/hooks/useOrgId";
import { formatCurrency, cn } from "@/lib/utils";
import { getSupabaseBrowser } from "@/db/supabase-browser";
import { AnnouncementDropdown } from "./AnnouncementDropdown";

export function TopBar() {
  const organization = useAppStore((s) => s.organization);
  const getTotalMonthlyCost = useAppStore((s) => s.getTotalMonthlyCost);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const orgId = useOrgId();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string | null; avatarUrl: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const menuRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/members`);
      if (!res.ok) return;
      const data = await res.json();
      const currentId = data.currentMemberId;
      const member = (data.members ?? []).find((m: { id: string }) => m.id === currentId);
      if (member) setCurrentUser({ name: member.name, email: member.email, avatarUrl: member.avatarUrl });
    } catch {
      // ignore
    }
  }, [orgId]);

  useEffect(() => { fetchCurrentUser(); }, [fetchCurrentUser]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (feedbackRef.current && !feedbackRef.current.contains(e.target as Node)) {
        setFeedbackOpen(false);
      }
    }
    if (menuOpen || feedbackOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, feedbackOpen]);

  const handleSendFeedback = async () => {
    if (!feedbackMsg.trim()) return;
    setFeedbackStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedbackMsg, name: currentUser?.name, email: currentUser?.email }),
      });
      if (res.ok) {
        setFeedbackStatus("sent");
        setFeedbackMsg("");
        setTimeout(() => { setFeedbackOpen(false); setFeedbackStatus("idle"); }, 1500);
      } else {
        setFeedbackStatus("error");
      }
    } catch {
      setFeedbackStatus("error");
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 flex h-12 items-center justify-between bg-slate-900 px-4 text-white border-b border-slate-700/50 transition-[left] duration-300",
        collapsed ? "left-16" : "left-60"
      )}
    >
      <div className="text-sm font-medium text-slate-300">
        {organization.name}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-300">
          {formatCurrency(getTotalMonthlyCost())}/mo
        </span>
        <AnnouncementDropdown />

        {/* Feedback */}
        <div className="relative" ref={feedbackRef}>
          <button
            onClick={() => { setFeedbackOpen((v) => !v); setFeedbackStatus("idle"); }}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Feedback
          </button>
          {feedbackOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 rounded-lg border border-slate-700 bg-slate-800 shadow-xl p-4 z-50">
              {feedbackStatus === "sent" ? (
                <div className="text-sm text-green-400 text-center py-2">Feedback sent! Thank you.</div>
              ) : (
                <>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Send us feedback</label>
                  <textarea
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={3}
                    className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                  {feedbackStatus === "error" && (
                    <p className="text-xs text-red-400 mt-1">Failed to send. Please try again.</p>
                  )}
                  <button
                    onClick={handleSendFeedback}
                    disabled={feedbackStatus === "sending" || !feedbackMsg.trim()}
                    className="mt-2 w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {feedbackStatus === "sending" ? "Sending..." : "Send"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        {currentUser && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-600"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white ring-2 ring-slate-600">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border border-slate-700 bg-slate-800 shadow-xl py-1 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-700">
                  <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
                  {currentUser.email && (
                    <div className="text-xs text-slate-400 truncate mt-0.5">{currentUser.email}</div>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href={`/org/${orgId}/settings`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 20V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" />
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                    Org Settings
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Dashboard
                  </Link>
                </div>

                {/* Log out */}
                <div className="border-t border-slate-700 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
