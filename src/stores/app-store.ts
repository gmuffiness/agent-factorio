import { create } from "zustand";
import type { Organization, Department, Agent, Vendor, Announcement, AnnouncementTargetType, AnnouncementPriority } from "@/types";
import type { MapThemeId } from "@/components/spatial/MapThemes";

export interface AgentActivity {
  sessionId: string;
  currentActivity: string;
  toolName: string | null;
  eventType: string;
  updatedAt: string;
}

// Team config types (worker-1 will add these to src/types/index.ts)
export interface TeamMcpServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

export interface TeamSkill {
  id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
  keywords: string[];
}

export interface TeamHook {
  id: string;
  name: string;
  event: string;
  scriptType: "bash" | "node" | "python";
  scriptContent: string;
  env: Record<string, string>;
}

export interface TeamConfig {
  mcpServers: TeamMcpServer[];
  skills: TeamSkill[];
  hooks: TeamHook[];
}

export interface UsageStats {
  totalEvents: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCost: number;
  byEventType: Record<string, number>;
  byAgent: Record<string, number>;
  byModel: Record<string, number>;
  byDay: Array<{ date: string; count: number; tokensInput: number; tokensOutput: number; cost: number }>;
}

interface AppState {
  organization: Organization;
  currentOrgId: string | null;
  selectedDepartmentId: string | null;
  selectedAgentId: string | null;
  viewMode: "map" | "cost" | "skills";
  zoomLevel: number;
  isLoaded: boolean;
  sidebarCollapsed: boolean;
  lastFetchedAt: number;
  mapTheme: MapThemeId;
  // Team config
  teamConfig: TeamConfig | null;
  teamConfigLoading: boolean;
  // Usage stats
  usageStats: UsageStats | null;
  usageStatsLoading: boolean;
  // Actions
  setCurrentOrgId: (orgId: string) => void;
  setMapTheme: (theme: MapThemeId) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectDepartment: (id: string | null) => void;
  selectAgent: (id: string | null) => void;
  setViewMode: (mode: "map" | "cost" | "skills") => void;
  setZoomLevel: (level: number) => void;
  clearSelection: () => void;
  fetchOrganization: (orgId: string, force?: boolean) => Promise<void>;
  fetchTeamConfig: (orgId: string) => Promise<void>;
  fetchUsageStats: (orgId: string, period?: "week" | "month") => Promise<void>;
  // Announcements
  announcements: Announcement[];
  fetchAnnouncements: (orgId: string) => Promise<void>;
  createAnnouncement: (orgId: string, data: {
    title: string;
    content: string;
    targetType?: AnnouncementTargetType;
    targetId?: string | null;
    priority?: AnnouncementPriority;
    expiresAt?: string | null;
  }) => Promise<void>;
  deleteAnnouncement: (orgId: string, id: string) => Promise<void>;
  // Real-time agent activity
  agentActivities: Record<string, AgentActivity>;
  setAgentActivity: (agentId: string, activity: AgentActivity) => void;
  clearAgentActivity: (agentId: string) => void;
  fetchActiveSessions: (orgId: string) => Promise<void>;
  // Computed helpers
  getSelectedDepartment: () => Department | null;
  getSelectedAgent: () => Agent | null;
  getTotalMonthlyCost: () => number;
  getVendorCostBreakdown: () => Record<Vendor, number>;
}

export const useAppStore = create<AppState>((set, get) => ({
  organization: {
    id: "",
    name: "",
    domain: "",
    totalBudget: 0,
    visibility: "private",
    departments: [],
  },
  currentOrgId: null,
  selectedDepartmentId: null,
  selectedAgentId: null,
  viewMode: "map",
  zoomLevel: 1,
  isLoaded: false,
  sidebarCollapsed: false,
  lastFetchedAt: 0,
  mapTheme: (typeof window !== "undefined"
    ? (localStorage.getItem("agent-factorio-map-theme") as MapThemeId | null) ?? "city"
    : "city") as MapThemeId,
  teamConfig: null,
  teamConfigLoading: false,
  usageStats: null,
  usageStatsLoading: false,
  announcements: [],
  agentActivities: {},

  setAgentActivity: (agentId, activity) =>
    set((s) => ({ agentActivities: { ...s.agentActivities, [agentId]: activity } })),

  clearAgentActivity: (agentId) =>
    set((s) => {
      const next = { ...s.agentActivities };
      delete next[agentId];
      return { agentActivities: next };
    }),

  fetchActiveSessions: async (orgId: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/active-sessions`);
      if (!res.ok) return;
      const sessions = await res.json() as Array<{
        id: string;
        sessionId: string;
        sessionStartedAt: string;
        currentTask: string | null;
        lastActive: string;
      }>;
      const activities: Record<string, AgentActivity> = {};
      for (const s of sessions) {
        activities[s.id] = {
          sessionId: s.sessionId,
          currentActivity: s.currentTask ?? "active",
          toolName: null,
          eventType: "session_start",
          updatedAt: s.lastActive,
        };
      }
      set({ agentActivities: activities });
    } catch {
      console.warn("Failed to fetch active sessions");
    }
  },

  setCurrentOrgId: (orgId) => set({ currentOrgId: orgId }),

  setMapTheme: (theme) => {
    localStorage.setItem("agent-factorio-map-theme", theme);
    set({ mapTheme: theme });
  },

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    localStorage.setItem("agent-factorio-sidebar-collapsed", JSON.stringify(next));
    set({ sidebarCollapsed: next });
  },

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  selectDepartment: (id) =>
    set({ selectedDepartmentId: id, selectedAgentId: null }),

  selectAgent: (id) =>
    set({ selectedAgentId: id, selectedDepartmentId: null }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setZoomLevel: (level) => set({ zoomLevel: level }),

  clearSelection: () =>
    set({ selectedDepartmentId: null, selectedAgentId: null }),

  fetchAnnouncements: async (orgId: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/announcements`);
      if (res.ok) {
        const data: Announcement[] = await res.json();
        set({ announcements: data });
      }
    } catch {
      console.warn("Failed to fetch announcements");
    }
  },

  createAnnouncement: async (orgId: string, data) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await get().fetchAnnouncements(orgId);
      }
    } catch {
      console.warn("Failed to create announcement");
    }
  },

  deleteAnnouncement: async (orgId: string, id: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/announcements/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set({ announcements: get().announcements.filter((a) => a.id !== id) });
      }
    } catch {
      console.warn("Failed to delete announcement");
    }
  },

  fetchTeamConfig: async (orgId: string) => {
    set({ teamConfigLoading: true });
    try {
      const res = await fetch(`/api/organizations/${orgId}/team-config`);
      if (res.ok) {
        const data: TeamConfig = await res.json();
        set({ teamConfig: data });
      }
    } catch {
      console.warn("Failed to fetch team config");
    } finally {
      set({ teamConfigLoading: false });
    }
  },

  fetchUsageStats: async (orgId: string, period: "week" | "month" = "week") => {
    set({ usageStatsLoading: true });
    try {
      const res = await fetch(`/api/organizations/${orgId}/usage?period=${period}`);
      if (res.ok) {
        const data: UsageStats = await res.json();
        set({ usageStats: data });
      }
    } catch {
      console.warn("Failed to fetch usage stats");
    } finally {
      set({ usageStatsLoading: false });
    }
  },

  fetchOrganization: async (orgId: string, force?: boolean) => {
    const state = get();
    const isSameOrg = state.organization.id === orgId;
    const STALE_MS = 30_000; // 30 seconds
    if (
      !force &&
      state.isLoaded &&
      isSameOrg &&
      Date.now() - state.lastFetchedAt < STALE_MS
    ) {
      return; // already fresh
    }
    // Clear stale data and selections immediately when switching orgs
    if (!isSameOrg) {
      set({ isLoaded: false, currentOrgId: orgId, selectedDepartmentId: null, selectedAgentId: null });
    }
    try {
      const res = await fetch(`/api/organizations/${orgId}`);
      if (res.ok) {
        const data: Organization = await res.json();
        set({ organization: data, currentOrgId: orgId, isLoaded: true, lastFetchedAt: Date.now() });
      }
    } catch {
      console.warn("Failed to fetch organization from API");
    }
  },

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
