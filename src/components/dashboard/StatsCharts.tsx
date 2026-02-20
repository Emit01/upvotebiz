"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/ThemeProvider";

interface ChartDataPoint {
  date: string; completed: number; pending: number; processing: number;
  inprogress: number; canceled: number; partial: number; totalSpent: number;
}

export default function StatsCharts({ chartData }: { chartData: ChartDataPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#2D2D2E" : "#F0F2F4";
  const axisColor = isDark ? "#6A6A6A" : "#a8a8a8";
  const tooltipBg = isDark ? "#2D2D2E" : "#1C1C1C";

  const formattedData = chartData.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gProcessing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4500" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#FF4500" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a8a8a8" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#a8a8a8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisColor, fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis tick={{ fontSize: 10, fill: axisColor, fontWeight: 500 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: "none",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 500,
              padding: "10px 14px",
              color: "#fff",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            }}
            itemStyle={{ color: "#fff", padding: "1px 0" }}
            labelStyle={{ color: "#999", fontSize: "11px", marginBottom: "4px" }}
            cursor={{ stroke: "#FF4500", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fill="url(#gCompleted)" name="Completed" dot={false} activeDot={{ r: 4, fill: "#10b981", stroke: isDark ? "#1A1A1B" : "#fff", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="processing" stroke="#FF4500" strokeWidth={2} fill="url(#gProcessing)" name="Processing" dot={false} activeDot={{ r: 4, fill: "#FF4500", stroke: isDark ? "#1A1A1B" : "#fff", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="pending" stroke="#a8a8a8" strokeWidth={1.5} fill="url(#gPending)" name="Pending" dot={false} activeDot={{ r: 3, fill: "#a8a8a8", stroke: isDark ? "#1A1A1B" : "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
