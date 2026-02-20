"use client";

import { useEffect } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { BottomBar } from "@/components/ui/BottomBar";
import { Sidebar } from "@/components/ui/Sidebar";
import { DepartmentDrawer } from "@/components/panels/DepartmentDrawer";
import { AgentDrawer } from "@/components/panels/AgentDrawer";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    const stored = localStorage.getItem("agent-factorio-sidebar-collapsed");
    if (stored !== null) {
      setSidebarCollapsed(JSON.parse(stored));
    }
  }, [setSidebarCollapsed]);

  return (
    <>
      <Sidebar />
      <TopBar />
      <main
        className={cn(
          "pt-12 pb-10 transition-[margin-left] duration-300",
          collapsed ? "ml-16" : "ml-60"
        )}
      >
        {children}
      </main>
      <BottomBar />
      <DepartmentDrawer />
      <AgentDrawer />
    </>
  );
}
