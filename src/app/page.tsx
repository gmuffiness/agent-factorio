"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/db/supabase-browser";

type Persona = "admin" | "developer";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute right-3 top-3 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-300"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="relative rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-300">
      <CopyButton text={children} />
      <pre className="overflow-x-auto pr-16">{children}</pre>
    </div>
  );
}

function AdminContent({ authHref }: { authHref: string }) {
  return (
    <div className="space-y-8">
      <div className="flex gap-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-sm font-bold text-emerald-400">
          01
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="font-semibold">Clone &amp; deploy</h3>
          <CodeBlock>{`git clone https://github.com/gmuffiness/agentfloor.git
cd agentfloor
pnpm install && pnpm dev`}</CodeBlock>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-sm font-bold text-emerald-400">
          02
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Sign in &amp; create your organization</h3>
          <p className="mt-1.5 text-sm text-slate-400">
            Get a 6-character invite code to share with your team.
          </p>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-sm font-bold text-emerald-400">
          03
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Share the invite code with your team</h3>
          <p className="mt-1.5 text-sm text-slate-400">
            Agents will appear on your floor as developers register them.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Link
          href={authHref}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold transition-colors hover:bg-emerald-500"
        >
          Get Started
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

function DeveloperContent() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <p className="text-lg font-medium leading-relaxed text-slate-200">
          Run{" "}
          <code className="rounded-md bg-slate-800 px-2 py-1 font-mono text-emerald-400">
            npx agentfloor login
          </code>{" "}
          in your terminal and follow the prompts to join AgentFloor.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-300">
          That&apos;s it. The CLI will:
        </p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 text-emerald-400">&#10003;</span>
            Connect to your team&apos;s hub
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 text-emerald-400">&#10003;</span>
            Verify your email
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-0.5 text-emerald-400">&#10003;</span>
            Join your organization
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-300">
          Then push your agent:
        </p>
        <CodeBlock>npx agentfloor push</CodeBlock>
        <p className="text-sm text-slate-400">
          Auto-detects git, skills, MCP tools, and CLAUDE.md.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href="https://github.com/gmuffiness/agentfloor/blob/main/docs/cli.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-slate-800"
        >
          View CLI Docs
          <span aria-hidden="true">&rarr;</span>
        </a>
        <a
          href="https://www.npmjs.com/package/agentfloor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-slate-800"
        >
          npm
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-4.5h6m0 0v6m0-6L9.75 14.25" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [persona, setPersona] = useState<Persona>("admin");

  useEffect(() => {
    getSupabaseBrowser().auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const authHref = isLoggedIn ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🏘️</span>
            <span className="text-lg font-bold tracking-tight">AgentFloor</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-emerald-500"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-emerald-500"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-24 text-center sm:pt-32">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
            The central hub for your{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AI agents
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
            One place to register, monitor, and manage every agent across your organization.
          </p>
        </div>
      </section>

      {/* Persona Toggle */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-2xl px-6">
          {/* Toggle cards */}
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => setPersona("admin")}
              className={`rounded-xl border px-5 py-4 text-left transition-all ${
                persona === "admin"
                  ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧑</span>
                <div>
                  <p className="font-semibold">I&apos;m a Hub Admin</p>
                  <p className="text-xs text-slate-400">Deploy &amp; manage the hub</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setPersona("developer")}
              className={`rounded-xl border px-5 py-4 text-left transition-all ${
                persona === "developer"
                  ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-semibold">I&apos;m an Agent Developer</p>
                  <p className="text-xs text-slate-400">Register agents via CLI</p>
                </div>
              </div>
            </button>
          </div>

          {/* Content panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
            {persona === "admin" ? (
              <AdminContent authHref={authHref} />
            ) : (
              <DeveloperContent />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span>🏘️</span>
            <span>AgentFloor</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/gmuffiness/agentfloor"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-slate-300"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/agentfloor"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-slate-300"
            >
              npm
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} AgentFloor. Open source under MIT.</p>
        </div>
      </footer>
    </div>
  );
}
