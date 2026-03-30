"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useOrgId } from "@/hooks/useOrgId";
import { cn } from "@/lib/utils";

// ── Inline types (worker-1 is adding these to src/types/index.ts) ──────────
interface McpServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

interface TeamSkill {
  id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
  keywords: string[];
}

interface TeamHook {
  id: string;
  name: string;
  event: string;
  scriptType: "bash" | "node" | "python";
  scriptContent: string;
  env: Record<string, string>;
}

interface TeamConfig {
  mcpServers: McpServer[];
  skills: TeamSkill[];
  hooks: TeamHook[];
}

type Tab = "mcp" | "skills" | "hooks";

const HOOK_EVENTS = [
  "PreToolUse",
  "PostToolUse",
  "UserPromptSubmit",
  "Notification",
  "Stop",
];

const SCRIPT_TYPES = ["bash", "node", "python"] as const;

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tryParseJson(s: string): Record<string, string> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

/* ── Shared style tokens (matching settings page dark theme) ── */
const card = "rounded-lg border border-slate-700/80 bg-slate-900 shadow-sm";
const inputBase =
  "rounded-md border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50 w-full";
const btnPrimary =
  "rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-500 disabled:opacity-50";
const btnSecondary =
  "rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:opacity-50";
const labelText = "text-xs font-medium uppercase tracking-wide text-slate-400 mb-1 block";

export default function TeamConfigPage() {
  const orgId = useOrgId();
  const [activeTab, setActiveTab] = useState<Tab>("mcp");
  const [config, setConfig] = useState<TeamConfig>({
    mcpServers: [],
    skills: [],
    hooks: [],
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Add form visibility
  const [showAddMcp, setShowAddMcp] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddHook, setShowAddHook] = useState(false);

  // MCP form state
  const [mcpForm, setMcpForm] = useState({
    name: "",
    command: "",
    args: "",
    env: "",
  });

  // Skill form state
  const [skillForm, setSkillForm] = useState({
    name: "",
    slug: "",
    description: "",
    content: "",
    keywords: "",
  });

  // Hook form state
  const [hookForm, setHookForm] = useState({
    name: "",
    event: HOOK_EVENTS[0],
    scriptType: "bash" as TeamHook["scriptType"],
    scriptContent: "",
    env: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, membersRes] = await Promise.all([
        fetch(`/api/organizations/${orgId}/team-config`),
        fetch(`/api/organizations/${orgId}/members`),
      ]);
      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data);
      }
      if (membersRes.ok) {
        const data = await membersRes.json();
        setIsAdmin(data.currentUserRole === "admin");
      }
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ── MCP CRUD ──────────────────────────────────────────────────────────────
  const handleAddMcp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/team-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mcp",
          name: mcpForm.name,
          command: mcpForm.command,
          args: mcpForm.args
            .split("\n")
            .map((a) => a.trim())
            .filter(Boolean),
          env: tryParseJson(mcpForm.env),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error ?? "Failed to add MCP server");
        return;
      }
      setMcpForm({ name: "", command: "", args: "", env: "" });
      setShowAddMcp(false);
      fetchConfig();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMcp = async (id: string) => {
    if (!confirm("Remove this MCP server?")) return;
    await fetch(`/api/organizations/${orgId}/team-config/mcp/${id}`, {
      method: "DELETE",
    });
    fetchConfig();
  };

  // ── Skill CRUD ────────────────────────────────────────────────────────────
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/team-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "skills",
          name: skillForm.name,
          slug: skillForm.slug || toSlug(skillForm.name),
          description: skillForm.description,
          content: skillForm.content,
          keywords: skillForm.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error ?? "Failed to add skill");
        return;
      }
      setSkillForm({ name: "", slug: "", description: "", content: "", keywords: "" });
      setShowAddSkill(false);
      fetchConfig();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Remove this skill?")) return;
    await fetch(`/api/organizations/${orgId}/team-config/skills/${id}`, {
      method: "DELETE",
    });

    fetchConfig();
  };

  // ── Hook CRUD ─────────────────────────────────────────────────────────────
  const handleAddHook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/team-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hooks",
          name: hookForm.name,
          event: hookForm.event,
          scriptType: hookForm.scriptType,
          scriptContent: hookForm.scriptContent,
          env: tryParseJson(hookForm.env),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveError(err.error ?? "Failed to add hook");
        return;
      }
      setHookForm({
        name: "",
        event: HOOK_EVENTS[0],
        scriptType: "bash",
        scriptContent: "",
        env: "",
      });
      setShowAddHook(false);
      fetchConfig();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHook = async (id: string) => {
    if (!confirm("Remove this hook?")) return;
    await fetch(`/api/organizations/${orgId}/team-config/hooks/${id}`, {
      method: "DELETE",
    });
    fetchConfig();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-400">Loading team config...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-slate-800/90 px-6 py-3 text-slate-300 shadow-lg">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Admin access required
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: "mcp", label: "MCP Servers", count: config.mcpServers.length },
    { id: "skills", label: "Skills", count: config.skills.length },
    { id: "hooks", label: "Hooks", count: config.hooks.length },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6 pb-20 min-h-screen bg-slate-950">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/org/${orgId}`}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:text-white"
        >
          &larr; Back to Map
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Team Config</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Shared MCP servers, skills, and hooks distributed to all agents.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-white",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                activeTab === tab.id
                  ? "bg-amber-600/30 text-amber-300"
                  : "bg-slate-800 text-slate-500",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── MCP Servers Tab ─────────────────────────────────────────────── */}
      {activeTab === "mcp" && (
        <div className="space-y-4">
          <div className={card}>
            <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-200">MCP Servers</h2>
              <button
                onClick={() => setShowAddMcp(!showAddMcp)}
                className={btnPrimary}
              >
                {showAddMcp ? "Cancel" : "+ Add Server"}
              </button>
            </div>

            {/* Inline Add Form */}
            {showAddMcp && (
              <form onSubmit={handleAddMcp} className="border-b border-slate-700/60 bg-slate-800/40 px-5 py-5 space-y-4">
                <h3 className="text-sm font-medium text-slate-300">New MCP Server</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelText}>Name</label>
                    <input
                      type="text"
                      required
                      value={mcpForm.name}
                      onChange={(e) => setMcpForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. filesystem"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelText}>Command</label>
                    <input
                      type="text"
                      required
                      value={mcpForm.command}
                      onChange={(e) => setMcpForm((f) => ({ ...f, command: e.target.value }))}
                      placeholder="e.g. npx"
                      className={inputBase}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelText}>Args (one per line)</label>
                  <textarea
                    rows={3}
                    value={mcpForm.args}
                    onChange={(e) => setMcpForm((f) => ({ ...f, args: e.target.value }))}
                    placeholder="-y&#10;@modelcontextprotocol/server-filesystem&#10;/path/to/dir"
                    className={cn(inputBase, "font-mono text-xs")}
                  />
                </div>
                <div>
                  <label className={labelText}>Env (JSON)</label>
                  <textarea
                    rows={2}
                    value={mcpForm.env}
                    onChange={(e) => setMcpForm((f) => ({ ...f, env: e.target.value }))}
                    placeholder='{"API_KEY": "..."}'
                    className={cn(inputBase, "font-mono text-xs")}
                  />
                </div>
                {saveError && (
                  <p className="text-sm text-red-400">{saveError}</p>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? "Adding..." : "Add Server"}
                  </button>
                  <button type="button" onClick={() => setShowAddMcp(false)} className={btnSecondary}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Table */}
            {config.mcpServers.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No MCP servers configured. Add one to distribute to all agents.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Command</th>
                    <th className="px-5 py-3">Args</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {config.mcpServers.map((server) => (
                    <tr key={server.id} className="border-b border-slate-700/40 last:border-0 hover:bg-slate-800/40">
                      <td className="px-5 py-3 font-medium text-slate-200">{server.name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-400">{server.command}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-400 max-w-xs truncate">
                        {server.args.join(" ")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteMcp(server.id)}
                          className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Skills Tab ──────────────────────────────────────────────────── */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <div className={card}>
            <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-200">Team Standard Skills</h2>
              <button
                onClick={() => setShowAddSkill(!showAddSkill)}
                className={btnPrimary}
              >
                {showAddSkill ? "Cancel" : "+ Add Skill"}
              </button>
            </div>

            {/* Inline Add Form */}
            {showAddSkill && (
              <form onSubmit={handleAddSkill} className="border-b border-slate-700/60 bg-slate-800/40 px-5 py-5 space-y-4">
                <h3 className="text-sm font-medium text-slate-300">New Team Skill</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelText}>Name</label>
                    <input
                      type="text"
                      required
                      value={skillForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setSkillForm((f) => ({ ...f, name, slug: toSlug(name) }));
                      }}
                      placeholder="e.g. Code Review"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelText}>Slug (auto)</label>
                    <input
                      type="text"
                      value={skillForm.slug}
                      onChange={(e) => setSkillForm((f) => ({ ...f, slug: e.target.value }))}
                      placeholder="code-review"
                      className={inputBase}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelText}>Description</label>
                  <input
                    type="text"
                    value={skillForm.description}
                    onChange={(e) => setSkillForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description of what this skill does"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className={labelText}>Content (skill instructions / prompt)</label>
                  <textarea
                    rows={5}
                    required
                    value={skillForm.content}
                    onChange={(e) => setSkillForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="When reviewing code, check for..."
                    className={cn(inputBase, "font-mono text-xs")}
                  />
                </div>
                <div>
                  <label className={labelText}>Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={skillForm.keywords}
                    onChange={(e) => setSkillForm((f) => ({ ...f, keywords: e.target.value }))}
                    placeholder="review, code quality, security"
                    className={inputBase}
                  />
                </div>
                {saveError && (
                  <p className="text-sm text-red-400">{saveError}</p>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? "Adding..." : "Add Skill"}
                  </button>
                  <button type="button" onClick={() => setShowAddSkill(false)} className={btnSecondary}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Table */}
            {config.skills.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No team skills defined yet. Add skills to standardize agent behaviors.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Slug</th>
                    <th className="px-5 py-3">Keywords</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {config.skills.map((skill) => (
                    <tr key={skill.id} className="border-b border-slate-700/40 last:border-0 hover:bg-slate-800/40">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-200">{skill.name}</p>
                        {skill.description && (
                          <p className="text-xs text-slate-500 truncate max-w-xs">{skill.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-400">{skill.slug}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {skill.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Hooks Tab ───────────────────────────────────────────────────── */}
      {activeTab === "hooks" && (
        <div className="space-y-4">
          <div className={card}>
            <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-200">Team Hooks</h2>
              <button
                onClick={() => setShowAddHook(!showAddHook)}
                className={btnPrimary}
              >
                {showAddHook ? "Cancel" : "+ Add Hook"}
              </button>
            </div>

            {/* Inline Add Form */}
            {showAddHook && (
              <form onSubmit={handleAddHook} className="border-b border-slate-700/60 bg-slate-800/40 px-5 py-5 space-y-4">
                <h3 className="text-sm font-medium text-slate-300">New Team Hook</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelText}>Name</label>
                    <input
                      type="text"
                      required
                      value={hookForm.name}
                      onChange={(e) => setHookForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. audit-logger"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className={labelText}>Event</label>
                    <select
                      value={hookForm.event}
                      onChange={(e) => setHookForm((f) => ({ ...f, event: e.target.value }))}
                      className={inputBase}
                    >
                      {HOOK_EVENTS.map((ev) => (
                        <option key={ev} value={ev}>{ev}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelText}>Script Type</label>
                    <select
                      value={hookForm.scriptType}
                      onChange={(e) =>
                        setHookForm((f) => ({
                          ...f,
                          scriptType: e.target.value as TeamHook["scriptType"],
                        }))
                      }
                      className={inputBase}
                    >
                      {SCRIPT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelText}>Script Content</label>
                  <textarea
                    rows={6}
                    required
                    value={hookForm.scriptContent}
                    onChange={(e) => setHookForm((f) => ({ ...f, scriptContent: e.target.value }))}
                    placeholder="#!/bin/bash&#10;echo 'Hook triggered'"
                    className={cn(inputBase, "font-mono text-xs")}
                  />
                </div>
                <div>
                  <label className={labelText}>Env (JSON)</label>
                  <textarea
                    rows={2}
                    value={hookForm.env}
                    onChange={(e) => setHookForm((f) => ({ ...f, env: e.target.value }))}
                    placeholder='{"LOG_LEVEL": "info"}'
                    className={cn(inputBase, "font-mono text-xs")}
                  />
                </div>
                {saveError && (
                  <p className="text-sm text-red-400">{saveError}</p>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? "Adding..." : "Add Hook"}
                  </button>
                  <button type="button" onClick={() => setShowAddHook(false)} className={btnSecondary}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Table */}
            {config.hooks.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No hooks configured yet. Add hooks to inject shared behaviors into all agents.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Event</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {config.hooks.map((hook) => (
                    <tr key={hook.id} className="border-b border-slate-700/40 last:border-0 hover:bg-slate-800/40">
                      <td className="px-5 py-3 font-medium text-slate-200">{hook.name}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-300">
                          {hook.event}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                          {hook.scriptType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteHook(hook.id)}
                          className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
