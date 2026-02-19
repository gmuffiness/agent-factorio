"use client";

import { useAppStore } from "@/stores/app-store";
import { formatCurrency, cn } from "@/lib/utils";
import { AnnouncementDropdown } from "./AnnouncementDropdown";

export function TopBar() {
  const organization = useAppStore((s) => s.organization);
  const getTotalMonthlyCost = useAppStore((s) => s.getTotalMonthlyCost);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);

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
      </div>
    </header>
  );
}
