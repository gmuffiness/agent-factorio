import type { Vendor, AgentStatus } from "@/types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getVendorColor(vendor: Vendor): string {
  const colors: Record<Vendor, string> = {
    anthropic: "#F97316",
    openai: "#22C55E",
    google: "#3B82F6",
  };
  return colors[vendor];
}

export function getVendorBgColor(vendor: Vendor): string {
  const colors: Record<Vendor, string> = {
    anthropic: "#FFF7ED",
    openai: "#F0FDF4",
    google: "#EFF6FF",
  };
  return colors[vendor];
}

export function getVendorLabel(vendor: Vendor): string {
  const labels: Record<Vendor, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    google: "Google",
  };
  return labels[vendor];
}

export function getStatusColor(status: AgentStatus): string {
  const colors: Record<AgentStatus, string> = {
    active: "#22C55E",
    idle: "#EAB308",
    error: "#EF4444",
  };
  return colors[status];
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
