"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/db/supabase-browser";

interface PublicOrg {
  id: string;
  name: string;
  description: string;
  departmentCount: number;
  agentCount: number;
  skillCount: number;
  mcpToolCount: number;
  vendors: string[];
}

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

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicOrgs, setPublicOrgs] = useState<PublicOrg[]>([]);

  useEffect(() => {
    getSupabaseBrowser().auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    fetch("/api/public/organizations")
      .then((res) => res.json())
      .then((data: PublicOrg[]) => {
        if (Array.isArray(data)) setPublicOrgs(data);
      })
      .catch(() => {});
  }, []);

  const authHref = isLoggedIn ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🏘️</span>
            <span className="text-lg font-bold tracking-tight">AgentFactorio</span>
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

      {/* Quickstart */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-2 text-center text-2xl font-bold tracking-tight">
            Quickstart
          </h2>
          <p className="mb-8 text-center text-sm text-slate-400">
            Register your agent in under a minute
          </p>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
            <div className="space-y-6">
              <div className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-sm font-bold text-emerald-400">
                  01
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold">Login &amp; join your organization</h3>
                  <CodeBlock>npx agent-factorio login</CodeBlock>
                  <p className="text-sm text-slate-400">
                    Email verification, then create or join an org with an invite code.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-sm font-bold text-emerald-400">
                  02
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold">Push your agent</h3>
                  <CodeBlock>npx agent-factorio push</CodeBlock>
                  <p className="text-sm text-slate-400">
                    Auto-detects git, skills, MCP tools, and CLAUDE.md from your project.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="https://github.com/gmuffiness/agent-factorio/blob/main/docs/cli.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-slate-800"
                >
                  CLI Docs
                  <span aria-hidden="true">&rarr;</span>
                </a>
                <a
                  href="https://www.npmjs.com/package/agent-factorio"
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
          </div>
        </div>
      </section>

      {/* Featured Organizations */}
      {publicOrgs.length > 0 && (
        <section className="relative pb-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-2 text-center text-2xl font-bold tracking-tight">
              Featured Organizations
            </h2>
            <p className="mb-8 text-center text-sm text-slate-400">
              Explore how teams organize their AI agent fleets
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicOrgs.map((org) => (
                <Link
                  key={org.id}
                  href={`/org/${org.id}/overview`}
                  className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-emerald-500/40 hover:bg-slate-900"
                >
                  <h3 className="text-lg font-semibold group-hover:text-emerald-400">
                    {org.name}
                  </h3>
                  {org.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {org.description}
                    </p>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">{org.agentCount}</p>
                      <p className="text-slate-500">Agents</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">{org.departmentCount}</p>
                      <p className="text-slate-500">Departments</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">{org.skillCount}</p>
                      <p className="text-slate-500">Skills</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">{org.mcpToolCount}</p>
                      <p className="text-slate-500">MCP Tools</p>
                    </div>
                  </div>
                  {org.vendors.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {org.vendors.map((v) => (
                        <span
                          key={v}
                          className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs capitalize text-slate-300"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
                    View Organization
                    <span aria-hidden="true">&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span>🏘️</span>
            <span>AgentFactorio</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/gmuffiness/agent-factorio"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-slate-300"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/agent-factorio"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-slate-300"
            >
              npm
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} AgentFactorio. Open source under MIT.</p>
        </div>
      </footer>
    </div>
  );
}
