"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, DollarSign, ShoppingCart, MessageSquare, Wallet, Scale,
  Calculator, TrendingUp,
  List, CheckCircle, Loader, Clock, PieChart as PieChartIcon, AlertCircle, XSquare, RotateCcw,
} from "lucide-react";
import { formatDate, currencyFormat } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

const iconMap: Record<string, any> = {
  Users, DollarSign, ShoppingCart, MessageSquare, Wallet, Scale, Calculator, TrendingUp,
  List, CheckCircle, Loader, Clock, PieChart: PieChartIcon, AlertCircle, XSquare, RotateCcw,
};

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
};

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981",
  processing: "#3b82f6",
  canceled: "#ef4444",
  pending: "#6b7280",
  partial: "#f97316",
  inprogress: "#f59e0b",
};

interface Props {
  headerStats: { key: string; name: string; value: string; icon: string; color: string }[];
  orderStats: { key: string; name: string; value: number; icon: string; color: string }[];
  statusMap: Record<string, number>;
  splineData: any[];
  recentUsers: { id: number; email: string; name: string; balance: number; status: number; created: string }[];
  bestSellers: { serviceId: string; serviceName: string; totalOrders: number; totalCharge: number }[];
  currencySymbol: string;
}

export default function AdminStatsClient({
  headerStats,
  orderStats,
  statusMap,
  splineData,
  recentUsers,
  bestSellers,
  currencySymbol,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#2D2D2E" : "#f0f2f4";
  const axisColor = isDark ? "#6A6A6A" : "#8e8e93";
  const tooltipBg = isDark ? "#2D2D2E" : "#1c1c1e";
  const dotStroke = isDark ? "#1A1A1B" : "#fff";

  const pieData = Object.entries(statusMap)
    .filter(([, v]) => v > 0)
    .map(([status, value]) => ({ name: status.charAt(0).toUpperCase() + status.slice(1), value, status }));

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headerStats.map((stat) => {
          const Icon = iconMap[stat.icon] || Users;
          const c = colorMap[stat.color] || colorMap.emerald;
          return (
            <div key={stat.key} className="card p-5 flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg} ring-1 ${c.ring}`}>
                <Icon className={`h-5 w-5 ${c.text}`} strokeWidth={1.7} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-label-tertiary truncate">{stat.name}</p>
                <p className="text-[20px] font-bold text-label-primary tracking-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Spline Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-headline text-label-primary mb-4">Orders — Last 7 Days</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={splineData}>
                <defs>
                  {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <linearGradient key={status} id={`admin-grad-${status}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => { const d = new Date(v); return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: tooltipBg, border: "none", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
                  labelStyle={{ color: "#fff", fontSize: 12, marginBottom: 4 }}
                  itemStyle={{ fontSize: 12, padding: "1px 0" }}
                  labelFormatter={(v) => { const d = new Date(v); return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }}
                />
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <Area key={status} type="monotone" dataKey={status} stroke={color} strokeWidth={2}
                    fill={`url(#admin-grad-${status})`} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: dotStroke }}
                    name={status.charAt(0).toUpperCase() + status.slice(1)} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <h3 className="text-headline text-label-primary mb-4">Order Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={2} strokeWidth={0}>
                  {pieData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: tooltipBg, border: "none", borderRadius: 12, padding: "8px 12px" }}
                  itemStyle={{ color: "#fff", fontSize: 12 }}
                />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                  formatter={(value) => <span className="text-[12px] text-label-secondary ml-1">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {orderStats.map((stat) => {
          const Icon = iconMap[stat.icon] || List;
          const c = colorMap[stat.color] || colorMap.emerald;
          return (
            <div key={stat.key} className="card p-4 text-center">
              <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
                <Icon className={`h-4 w-4 ${c.text}`} strokeWidth={1.7} />
              </div>
              <p className="text-[18px] font-bold text-label-primary">{stat.value.toLocaleString()}</p>
              <p className="text-[11px] font-medium text-label-tertiary mt-0.5">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Recent Users + Best Sellers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-separator">
            <h3 className="text-headline text-label-primary">Last 5 Newest Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-separator bg-surface-secondary/50">
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">User</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">Balance</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-separator/50 hover:bg-surface-secondary/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium text-label-primary">{u.name || u.email}</p>
                      <p className="text-[12px] text-label-tertiary">{u.email}</p>
                    </td>
                    <td className="px-5 py-3 text-[13px] font-medium text-label-primary">
                      {currencySymbol}{currencyFormat(u.balance)}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-label-tertiary">
                      {formatDate(u.created)}
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-[13px] text-label-tertiary">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-separator">
            <h3 className="text-headline text-label-primary">Top 5 Best Sellers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-separator bg-surface-secondary/50">
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">Service</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">Orders</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((s, i) => (
                  <tr key={i} className="border-b border-separator/50 hover:bg-surface-secondary/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-[13px] font-medium text-label-primary">{s.serviceName}</p>
                      <p className="text-[12px] text-label-tertiary">ID: {s.serviceId}</p>
                    </td>
                    <td className="px-5 py-3 text-[13px] font-medium text-label-primary">
                      {s.totalOrders.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-medium text-label-primary">
                      {currencySymbol}{currencyFormat(s.totalCharge)}
                    </td>
                  </tr>
                ))}
                {bestSellers.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-[13px] text-label-tertiary">No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
