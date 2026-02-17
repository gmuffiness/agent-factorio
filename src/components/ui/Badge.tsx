"use client";

import type { AgentStatus, Vendor } from "@/types";
import { getVendorColor, getVendorLabel } from "@/lib/utils";

const statusConfig: Record<AgentStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  idle: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Idle" },
  error: { bg: "bg-red-100", text: "text-red-700", label: "Error" },
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export function VendorBadge({ vendor }: { vendor: Vendor }) {
  const color = getVendorColor(vendor);
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: color + "20", color }}
    >
      {getVendorLabel(vendor)}
    </span>
  );
}
