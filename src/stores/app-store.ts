import { create } from "zustand";
import type { Organization, Department, Agent, Vendor } from "@/types";
import { mockOrganization } from "@/data/mock-data";

interface AppState {
  organization: Organization;
  selectedDepartmentId: string | null;
  selectedAgentId: string | null;
  viewMode: "map" | "cost" | "skills";
  zoomLevel: number;
  // Actions
  selectDepartment: (id: string | null) => void;
  selectAgent: (id: string | null) => void;
  setViewMode: (mode: "map" | "cost" | "skills") => void;
  setZoomLevel: (level: number) => void;
  clearSelection: () => void;
  // Computed helpers
  getSelectedDepartment: () => Department | null;
  getSelectedAgent: () => Agent | null;
  getTotalMonthlyCost: () => number;
  getVendorCostBreakdown: () => Record<Vendor, number>;
}

export const useAppStore = create<AppState>((set, get) => ({
  organization: mockOrganization,
  selectedDepartmentId: null,
  selectedAgentId: null,
  viewMode: "map",
  zoomLevel: 1,

  selectDepartment: (id) =>
    set({ selectedDepartmentId: id, selectedAgentId: null }),

  selectAgent: (id) =>
    set({ selectedAgentId: id, selectedDepartmentId: null }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setZoomLevel: (level) => set({ zoomLevel: level }),

  clearSelection: () =>
    set({ selectedDepartmentId: null, selectedAgentId: null }),

  getSelectedDepartment: () => {
    const { organization, selectedDepartmentId } = get();
    if (!selectedDepartmentId) return null;
    return (
      organization.departments.find((d) => d.id === selectedDepartmentId) ??
      null
    );
  },

  getSelectedAgent: () => {
    const { organization, selectedAgentId } = get();
    if (!selectedAgentId) return null;
    for (const dept of organization.departments) {
      const agent = dept.agents.find((a) => a.id === selectedAgentId);
      if (agent) return agent;
    }
    return null;
  },

  getTotalMonthlyCost: () => {
    const { organization } = get();
    return organization.departments.reduce(
      (sum, dept) => sum + dept.monthlySpend,
      0,
    );
  },

  getVendorCostBreakdown: () => {
    const { organization } = get();
    const breakdown: Record<Vendor, number> = {
      anthropic: 0,
      openai: 0,
      google: 0,
    };
    for (const dept of organization.departments) {
      for (const agent of dept.agents) {
        breakdown[agent.vendor] += agent.monthlyCost;
      }
    }
    return breakdown;
  },
}));
