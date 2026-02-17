"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, getVendorColor, getVendorLabel } from "@/lib/utils";
import CostPieChart from "@/components/charts/CostPieChart";
import CostTrendChart from "@/components/charts/CostTrendChart";
import type { MonthlyCost, Vendor } from "@/types";

export default function CostPage() {
  const organization = useAppStore((s) => s.organization);
  const fetchOrganization = useAppStore((s) => s.fetchOrganization);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);
  const getTotalMonthlyCost = useAppStore((s) => s.getTotalMonthlyCost);
  const getVendorCostBreakdown = useAppStore((s) => s.getVendorCostBreakdown);

  const totalCost = getTotalMonthlyCost();
  const vendorBreakdown = getVendorCostBreakdown();

  // Pie chart data
  const pieData = (Object.keys(vendorBreakdown) as Vendor[]).map((vendor) => ({
    name: getVendorLabel(vendor),
    value: vendorBreakdown[vendor],
    color: getVendorColor(vendor),
  }));

  // Department breakdown sorted descending
  const deptData = [...organization.departments]
    .sort((a, b) => b.monthlySpend - a.monthlySpend)
    .map((d) => ({
      name: d.name,
      spend: d.monthlySpend,
      vendor: d.primaryVendor,
    }));

  // Aggregated monthly cost trend across all departments
  const monthMap = new Map<string, MonthlyCost>();
  for (const dept of organization.departments) {
    for (const mc of dept.costHistory) {
      const existing = monthMap.get(mc.month);
      if (existing) {
        existing.amount += mc.amount;
        existing.byVendor.anthropic += mc.byVendor.anthropic;
        existing.byVendor.openai += mc.byVendor.openai;
        existing.byVendor.google += mc.byVendor.google;
      } else {
        monthMap.set(mc.month, {
          month: mc.month,
          amount: mc.amount,
          byVendor: { ...mc.byVendor },
        });
      }
    }
  }
  const trendData = Array.from(monthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  // Month-over-month change from aggregated cost history
  const lastMonthTotal = trendData[trendData.length - 1]?.amount ?? 0;
  const prevMonthTotal = trendData[trendData.length - 2]?.amount ?? 0;
  const momChange = prevMonthTotal > 0 ? ((lastMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;

  // Top 5 agents by cost
  const allAgents = organization.departments.flatMap((d) =>
    d.agents.map((a) => ({
      ...a,
      departmentName: d.name,
    })),
  );
  const topAgents = [...allAgents]
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-gray-100"
          >
            &larr; Back to Map
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Cost Overview</h1>
        </div>

        {/* Summary Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-sm text-gray-500">This Month Total</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalCost)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Month-over-Month</p>
              <p
                className={`text-lg font-semibold ${momChange >= 0 ? "text-red-500" : "text-green-500"}`}
              >
                {momChange >= 0 ? "+" : ""}
                {momChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Two-column: Vendor Breakdown + Department Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vendor Breakdown */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Vendor Breakdown
            </h2>
            <CostPieChart data={pieData} />
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2">Vendor</th>
                  <th className="pb-2 text-right">Cost</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {pieData.map((d) => (
                  <tr key={d.name} className="border-b last:border-0">
                    <td className="py-2 flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.name}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(d.value)}
                    </td>
                    <td className="py-2 text-right">
                      {((d.value / totalCost) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Department Breakdown */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Department Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData} layout="vertical">
                <XAxis
                  type="number"
                  fontSize={12}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={12}
                  width={110}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                  {deptData.map((entry, index) => (
                    <Cell
                      key={`dept-${index}`}
                      fill={getVendorColor(entry.vendor)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Trend */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Cost Trend
          </h2>
          <CostTrendChart data={trendData} />
        </div>

        {/* Top Agents */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Top Agents by Cost
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">Rank</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Vendor</th>
                <th className="pb-2 text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              {topAgents.map((agent, i) => (
                <tr key={agent.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{i + 1}</td>
                  <td className="py-2">{agent.name}</td>
                  <td className="py-2 text-gray-500">
                    {agent.departmentName}
                  </td>
                  <td className="py-2">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{
                        backgroundColor: getVendorColor(agent.vendor),
                      }}
                    >
                      {getVendorLabel(agent.vendor)}
                    </span>
                  </td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(agent.monthlyCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
