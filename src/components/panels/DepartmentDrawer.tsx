"use client";

import { useAppStore } from "@/stores/app-store";
import { formatCurrency, getVendorColor, getVendorLabel, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import CostPieChart from "@/components/charts/CostPieChart";
import CostTrendChart from "@/components/charts/CostTrendChart";
import type { Vendor } from "@/types";

export function DepartmentDrawer() {
  const getSelectedDepartment = useAppStore((s) => s.getSelectedDepartment);
  const selectDepartment = useAppStore((s) => s.selectDepartment);
  const selectAgent = useAppStore((s) => s.selectAgent);

  const department = getSelectedDepartment();
  const isOpen = department !== null;

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
          "fixed right-0 top-0 z-50 h-full w-[400px] overflow-y-auto bg-white shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {department && (
          <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {department.name}
              </h2>
              <button
                onClick={() => selectDepartment(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Monthly Cost</div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatCurrency(department.monthlySpend)}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Agents</div>
                <div className="text-sm font-semibold text-slate-900">
                  {department.agents.length}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Budget</div>
                <div className="mt-1">
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${Math.min(100, (department.monthlySpend / department.budget) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {Math.round((department.monthlySpend / department.budget) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Cost by Vendor */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Cost by Vendor
              </h3>
              <CostPieChart
                data={(["anthropic", "openai", "google"] as Vendor[])
                  .map((vendor) => ({
                    name: getVendorLabel(vendor),
                    value: department.agents
                      .filter((a) => a.vendor === vendor)
                      .reduce((sum, a) => sum + a.monthlyCost, 0),
                    color: getVendorColor(vendor),
                  }))
                  .filter((d) => d.value > 0)}
              />
            </div>

            {/* Agents List */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Agents</h3>
              <div className="space-y-2">
                {department.agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => selectAgent(agent.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <span
                      className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: getVendorColor(agent.vendor) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900">
                        {agent.name}
                      </div>
                      <div className="text-xs text-slate-500">{agent.model}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-medium text-slate-900">
                        {formatCurrency(agent.monthlyCost)}
                      </div>
                      <StatusBadge status={agent.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Trend */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Cost Trend
              </h3>
              <CostTrendChart data={department.costHistory} />
            </div>

            {/* Skill Matrix */}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">
                Skill Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-1 pr-2 text-left font-medium text-slate-500">
                        Skill
                      </th>
                      {department.agents.map((agent) => (
                        <th
                          key={agent.id}
                          className="px-1 py-1 text-center font-medium text-slate-500"
                        >
                          {agent.name.split(" ").pop()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const allSkills = Array.from(
                        new Set(
                          department.agents.flatMap((a) =>
                            a.skills.map((s) => s.id)
                          )
                        )
                      );
                      const skillMap = new Map(
                        department.agents
                          .flatMap((a) => a.skills)
                          .map((s) => [s.id, s])
                      );
                      return allSkills.map((skillId) => {
                        const skill = skillMap.get(skillId)!;
                        return (
                          <tr key={skillId} className="border-b border-slate-100">
                            <td className="py-1 pr-2 text-slate-600">
                              {skill.icon} {skill.name}
                            </td>
                            {department.agents.map((agent) => (
                              <td key={agent.id} className="px-1 py-1 text-center">
                                {agent.skills.some((s) => s.id === skillId) ? (
                                  <span className="text-green-500">&#10003;</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
