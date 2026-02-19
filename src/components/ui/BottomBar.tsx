"use client";

import { useAppStore } from "@/stores/app-store";
import { getVendorColor, getVendorLabel, formatCurrency, cn } from "@/lib/utils";
import type { Vendor } from "@/types";

export function BottomBar() {
  const organization = useAppStore((s) => s.organization);
  const getVendorCostBreakdown = useAppStore((s) => s.getVendorCostBreakdown);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);

  const breakdown = getVendorCostBreakdown();
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const totalAgents = organization.departments.reduce(
    (sum, dept) => sum + dept.agents.length,
    0
  );

  const vendors: Vendor[] = ["anthropic", "openai", "google"];

  return (
    <footer
      className={cn(
        "fixed bottom-0 right-0 z-40 flex h-10 items-center justify-between bg-slate-800 px-4 text-sm text-white transition-[left] duration-300",
        collapsed ? "left-16" : "left-60"
      )}
    >
      <div className="flex items-center gap-4">
        {vendors.map((vendor) => {
          const pct = total > 0 ? ((breakdown[vendor] / total) * 100).toFixed(0) : "0";
          return (
            <div key={vendor} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getVendorColor(vendor) }}
              />
              <span className="text-slate-300">
                {getVendorLabel(vendor)} {pct}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-slate-400">
        {totalAgents} agents
      </div>
    </footer>
  );
}
