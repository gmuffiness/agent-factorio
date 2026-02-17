"use client";

import { TopBar } from "@/components/ui/TopBar";
import { BottomBar } from "@/components/ui/BottomBar";
import { DepartmentDrawer } from "@/components/panels/DepartmentDrawer";
import { AgentDrawer } from "@/components/panels/AgentDrawer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="pt-14 pb-10">{children}</main>
      <BottomBar />
      <DepartmentDrawer />
      <AgentDrawer />
    </>
  );
}
