"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/stores/app-store";
import { useOrgId } from "@/hooks/useOrgId";
import type { Skill, SkillCategory } from "@/types";
import { getVendorLabel } from "@/lib/utils";

interface SkillEntry {
  skill: Skill;
  agents: Array<{ name: string; department: string; vendor: string }>;
  departments: string[];
}

const categories: Array<{ label: string; value: SkillCategory | "all" }> = [
  { label: "All", value: "all" },
  { label: "Generation", value: "generation" },
  { label: "Review", value: "review" },
  { label: "Testing", value: "testing" },
  { label: "Documentation", value: "documentation" },
  { label: "Debugging", value: "debugging" },
  { label: "Deployment", value: "deployment" },
];

export default function SkillsPage() {
  const orgId = useOrgId();
  const organization = useAppStore((s) => s.organization);
  const teamConfig = useAppStore((s) => s.teamConfig);
  const fetchTeamConfig = useAppStore((s) => s.fetchTeamConfig);
  const [filter, setFilter] = useState<SkillCategory | "all">("all");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamConfig(orgId);
  }, [orgId, fetchTeamConfig]);

  // Collect all unique skills with their agents and departments
  const skillMap = new Map<string, SkillEntry>();
  for (const dept of organization.departments) {
    for (const agent of dept.agents) {
      for (const skill of agent.skills) {
        let entry = skillMap.get(skill.id);
        if (!entry) {
          entry = { skill, agents: [], departments: [] };
          skillMap.set(skill.id, entry);
        }
        entry.agents.push({
          name: agent.name,
          department: dept.name,
          vendor: getVendorLabel(agent.vendor),
        });
        if (!entry.departments.includes(dept.name)) {
          entry.departments.push(dept.name);
        }
      }
    }
  }

  const allSkillEntries = Array.from(skillMap.values());
  const filtered =
    filter === "all"
      ? allSkillEntries
      : allSkillEntries.filter((e) => e.skill.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/org/${orgId}`}
            className="rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-100"
          >
            &larr; Back to Map
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Skill Catalog</h1>
        </div>

        {/* Team Standard Skills */}
        {teamConfig && teamConfig.skills.length > 0 && (
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Team Standard Skills</h2>
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                Team
              </span>
            </div>
            <p className="mb-4 text-sm text-amber-700">
              These skills are defined at the organization level and distributed to all agents.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teamConfig.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                    <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                      Team
                    </span>
                  </div>
                  {skill.description && (
                    <p className="mb-3 text-xs text-gray-500">{skill.description}</p>
                  )}
                  {skill.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skill.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === cat.value
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skill Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => {
            const isExpanded = expandedSkill === entry.skill.id;
            return (
              <div
                key={entry.skill.id}
                className="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                onClick={() =>
                  setExpandedSkill(isExpanded ? null : entry.skill.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.skill.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {entry.skill.name}
                      </h3>
                      <span className="inline-block mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 capitalize">
                        {entry.skill.category}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {entry.agents.length} agent{entry.agents.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  {entry.skill.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {entry.departments.map((dept) => (
                    <span
                      key={dept}
                      className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {dept}
                    </span>
                  ))}
                </div>

                {(entry.skill as Skill & { keywords?: string[] }).keywords?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(entry.skill as Skill & { keywords?: string[] }).keywords!.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : null}

                {isExpanded && (
                  <div className="mt-4 border-t pt-3">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Agents with this skill:
                    </p>
                    <ul className="space-y-1">
                      {entry.agents.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-700">{a.name}</span>
                          <span className="text-gray-400">
                            {a.department} &middot; {a.vendor}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
