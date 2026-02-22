import { sendGAEvent } from "@next/third-parties/google";

// Typed GA event helper — centralizes all event names for easy auditing
export function trackEvent(
  action: string,
  params?: Record<string, string | number | boolean>
) {
  sendGAEvent("event", action, params ?? {});
}

// ---- Auth ----
export const trackLogin = (method: "google" | "microsoft" | "email") =>
  trackEvent("login", { method });

export const trackSignup = (method: "google" | "microsoft" | "email") =>
  trackEvent("sign_up", { method });

// ---- Organization ----
export const trackOrgCreate = () => trackEvent("org_create");
export const trackOrgJoin = () => trackEvent("org_join");
export const trackOrgFork = (templateOrgId: string) =>
  trackEvent("org_fork", { template_org_id: templateOrgId });

// ---- Agent CRUD ----
export const trackAgentCreate = (vendor: string) =>
  trackEvent("agent_create", { vendor });
export const trackAgentEdit = () => trackEvent("agent_edit");
export const trackAgentDelete = () => trackEvent("agent_delete");

// ---- Chat ----
export const trackChatCreate = (agentCount: number) =>
  trackEvent("chat_create", { agent_count: agentCount });
export const trackChatMessage = () => trackEvent("chat_message_send");

// ---- Navigation / Engagement ----
export const trackPageView = (page: string) =>
  trackEvent("page_view_custom", { page });
export const trackExploreSearch = (query: string) =>
  trackEvent("explore_search", { search_term: query });
export const trackExploreOrgClick = (orgId: string) =>
  trackEvent("explore_org_click", { org_id: orgId });

// ---- Spatial Map ----
export const trackAgentSelect = () => trackEvent("agent_select");
export const trackDepartmentSelect = () => trackEvent("department_select");
