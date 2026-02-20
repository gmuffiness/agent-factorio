"use client";

import { useAppStore } from "@/stores/app-store";
import { formatCurrency, getVendorColor, getVendorLabel, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import CostPieChart from "@/components/charts/CostPieChart";
import CostTrendChart from "@/components/charts/CostTrendChart";
import type { Vendor } from "@/types";

export function DepartmentDrawer() {
  const selectedDepartmentId = useAppStore((s) => s.selectedDepartmentId);
  const getSelectedDepartment = useAppStore((s) => s.getSelectedDepartment);
  const selectDepartment = useAppStore((s) => s.selectDepartment);
  const selectAgent = useAppStore((s) => s.selectAgent);

  const department = getSelectedDepartment();
  const isOpen = department !== null;

  // Compute vendor distribution
  const vendorCounts: Record<Vendor, number> = { anthropic: 0, openai: 0, google: 0 };
  const vendorCosts: Record<Vendor, number> = { anthropic: 0, openai: 0, google: 0 };
  if (department) {
    for (const agent of department.agents) {
      vendorCounts[agent.vendor]++;
      vendorCosts[agent.vendor] += agent.monthlyCost;
    }
  }

  // Collect unique skills across department
  const deptSkills = department
    ? Array.from(new Map(department.agents.flatMap((a) => a.skills).map((s) => [s.id, s])).values())
    : [];

  // Collect unique MCP tools
  const deptMcpTools = department
    ? Array.from(new Map(department.agents.flatMap((a) => a.mcpTools).map((t) => [t.id, t])).values())
    : [];

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => selectDepartment(null)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-12 z-50 h-[calc(100%-3rem)] w-[440px] overflow-y-auto bg-white shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {department && (
          <div className="flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-100 p-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {department.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{department.description}</p>
                </div>
                <button
                  onClick={() => selectDepartment(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Spend</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatCurrency(department.monthlySpend)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Budget</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {formatCurrency(department.budget)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Agents</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {department.agents.length}
                  </div>
                </div>
              </div>

              {/* Budget Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Budget Usage</span>
                  <span className={cn(
                    "font-semibold",
                    department.monthlySpend > department.budget ? "text-red-500" : "text-slate-700"
                  )}>
                    {Math.round((department.monthlySpend / department.budget) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      department.monthlySpend > department.budget ? "bg-red-500" : "bg-blue-500"
                    )}
                    style={{
                      width: `${Math.min(100, (department.monthlySpend / department.budget) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Provider Distribution */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Provider Distribution
                </h3>
                <div className="space-y-2">
                  {(["anthropic", "openai", "google"] as Vendor[])
                    .filter((v) => vendorCounts[v] > 0)
                    .map((vendor) => {
                      const pct = department.monthlySpend > 0
                        ? (vendorCosts[vendor] / department.monthlySpend) * 100
                        : 0;
                      return (
                        <div key={vendor} className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: getVendorColor(vendor) }}
                          >
                            {vendorCounts[vendor]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-700">{getVendorLabel(vendor)}</span>
                              <span className="text-slate-500">{formatCurrency(vendorCosts[vendor])}</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: `${pct}%`, backgroundColor: getVendorColor(vendor) }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Cost by Vendor Pie */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Cost Breakdown
                </h3>
                <CostPieChart
                  data={(["anthropic", "openai", "google"] as Vendor[])
                    .map((vendor) => ({
                      name: getVendorLabel(vendor),
                      value: vendorCosts[vendor],
                      color: getVendorColor(vendor),
                    }))
                    .filter((d) => d.value > 0)}
                />
              </div>

              {/* Agents List */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Agents
                </h3>
                <div className="space-y-2">
                  {department.agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => selectAgent(agent.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left transition-all hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm"
                    >
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
                        style={{ backgroundColor: getVendorColor(agent.vendor) }}
                      >
                        {agent.vendor === "anthropic" ? "C" : agent.vendor === "openai" ? "G" : "Ge"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{agent.name}</span>
                          <StatusBadge status={agent.status} />
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{agent.model}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {formatCurrency(agent.monthlyCost)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {agent.skills.length} skills · {agent.mcpTools.length} MCP
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Coverage */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Skill Coverage ({deptSkills.length} skills)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {deptSkills.map((skill) => {
                    const count = department.agents.filter((a) => a.skills.some((s) => s.id === skill.id)).length;
                    return (
                      <div key={skill.id} className="flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-xs">
                        <span>{skill.icon}</span>
                        <span className="text-slate-700">{skill.name}</span>
                        <span className="text-[10px] text-slate-400 ml-0.5">x{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MCP Tools Coverage */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  MCP Tools ({deptMcpTools.length} connected)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {deptMcpTools.map((tool) => (
                    <div key={tool.id} className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-2 py-1 text-xs">
                      <span>{tool.icon}</span>
                      <span className="text-blue-700">{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Trend */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Cost Trend (6 months)
                </h3>
                <CostTrendChart data={department.costHistory} />
              </div>

              {/* Skill Matrix */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Agent × Skill Matrix
                </h3>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="py-2 px-2 text-left font-medium text-slate-500 sticky left-0 bg-slate-50">
                          Skill
                        </th>
                        {department.agents.map((agent) => (
                          <th
                            key={agent.id}
                            className="px-2 py-2 text-center font-medium text-slate-500"
                          >
                            <div
                              className="inline-flex h-5 w-5 items-center justify-center rounded text-white text-[9px] font-bold"
                              style={{ backgroundColor: getVendorColor(agent.vendor) }}
                            >
                              {agent.name.split(" ").pop()?.charAt(0)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deptSkills.map((skill) => (
                        <tr key={skill.id} className="border-t border-slate-50">
                          <td className="py-1.5 px-2 text-slate-600 sticky left-0 bg-white">
                            <span className="mr-1">{skill.icon}</span>
                            {skill.name}
                          </td>
                          {department.agents.map((agent) => (
                            <td key={agent.id} className="px-2 py-1.5 text-center">
                              {agent.skills.some((s) => s.id === skill.id) ? (
                                <span className="text-green-500 font-bold">&#10003;</span>
                              ) : (
                                <span className="text-slate-200">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
