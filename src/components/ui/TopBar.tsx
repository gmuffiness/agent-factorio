"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Map" },
  { href: "/graph", label: "Graph" },
  { href: "/agents", label: "Agents" },
  { href: "/departments", label: "Departments" },
  { href: "/cost", label: "Cost" },
  { href: "/skills", label: "Skills" },
] as const;

export function TopBar() {
  const organization = useAppStore((s) => s.organization);
  const getTotalMonthlyCost = useAppStore((s) => s.getTotalMonthlyCost);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-slate-900 px-4 text-white">
      <div className="flex items-center gap-2">
        <span className="text-xl" role="img" aria-label="factory">
          🏭
        </span>
        <span className="text-lg font-bold">Factorio Agents</span>
      </div>

      <div className="text-sm font-medium text-slate-300">
        {organization.name}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-300">
          {formatCurrency(getTotalMonthlyCost())}/mo
        </span>
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded px-3 py-1 text-sm transition-colors",
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
