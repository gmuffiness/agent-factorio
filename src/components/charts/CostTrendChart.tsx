"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyCost } from "@/types";

interface Props {
  data: MonthlyCost[];
}

export default function CostTrendChart({ data }: Props) {
  const chartData = data.map((d) => ({
    month: d.month,
    Anthropic: d.byVendor.anthropic,
    OpenAI: d.byVendor.openai,
    Google: d.byVendor.google,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
        <Legend />
        <Area
          type="monotone"
          dataKey="Anthropic"
          stackId="1"
          stroke="#F97316"
          fill="#F97316"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="OpenAI"
          stackId="1"
          stroke="#22C55E"
          fill="#22C55E"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="Google"
          stackId="1"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
