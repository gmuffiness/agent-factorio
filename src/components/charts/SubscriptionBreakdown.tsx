"use client";

import { formatCurrency, getServiceColor } from "@/lib/utils";

interface ServiceData {
  serviceName: string;
  amount: number;
  memberCount: number;
}

interface SubscriptionBreakdownProps {
  byService: ServiceData[];
  totalCost: number;
}

export default function SubscriptionBreakdown({ byService, totalCost }: SubscriptionBreakdownProps) {
  if (byService.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-gray-400">
        <p>No subscription data yet.</p>
        <p>Members can add subscriptions in Settings, or run <code className="bg-gray-100 px-1 rounded">agentfloor push</code> to auto-detect.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...byService.map((s) => s.amount));

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">By Service</h3>
        <p className="text-lg font-bold text-gray-900">{formatCurrency(totalCost)}/mo total</p>
      </div>
      <div className="space-y-3">
        {byService.map((service) => {
          const pct = totalCost > 0 ? (service.amount / totalCost) * 100 : 0;
          const barWidth = maxAmount > 0 ? (service.amount / maxAmount) * 100 : 0;
          const color = getServiceColor(service.serviceName);

          return (
            <div key={service.serviceName}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{service.serviceName}</span>
                  <span className="text-xs text-gray-400">
                    ({service.memberCount} member{service.memberCount !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(service.amount)}
                  </span>
                  <span className="text-xs text-gray-400 w-10 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${barWidth}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
