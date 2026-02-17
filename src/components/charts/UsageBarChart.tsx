"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyUsage } from "@/types";

interface Props {
  data: DailyUsage[];
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function UsageBarChart({ data }: Props) {
  const chartData = data.map((d) => {
    const date = new Date(d.date + "T00:00:00");
    return {
      day: dayNames[date.getDay()],
      tokens: d.tokens,
      cost: d.cost,
      requests: d.requests,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" fontSize={12} />
        <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as { tokens: number; cost: number; requests: number };
            return (
              <div className="rounded-lg border bg-white p-2 text-xs shadow-sm">
                <p className="font-medium">{label}</p>
                <p>Tokens: {d.tokens.toLocaleString()}</p>
                <p>Cost: ${d.cost}</p>
                <p>Requests: {d.requests}</p>
              </div>
            );
          }}
        />
        <Bar dataKey="tokens" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
