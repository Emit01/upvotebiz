import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import { currencyFormat } from "@/lib/utils";
import AdminStatsClient from "@/components/admin/AdminStatsClient";
import {
  Users, DollarSign, ShoppingCart, MessageSquare, Wallet, Scale,
  Calculator, TrendingUp,
  List, CheckCircle, Loader, Clock, PieChart, AlertCircle, XSquare, RotateCcw,
} from "lucide-react";

async function getHeaderStats(currencySymbol: string) {
  const [totalUsers, totalTickets] = await Promise.all([
    prisma.general_users.count({ where: { status: 1 } }),
    prisma.tickets.count(),
  ]);

  const transactionsAgg = await prisma.general_transaction_logs.aggregate({
    _sum: { amount: true },
    where: { status: 1 },
  });
  const totalTransactions = Number(transactionsAgg._sum.amount ?? 0);

  const usersBalanceAgg = await prisma.general_users.aggregate({
    _sum: { balance: true },
    where: { status: 1 },
  });
  const totalUsersBalance = Number(usersBalanceAgg._sum.balance ?? 0);

  const providersBalanceAgg = await prisma.api_providers.aggregate({
    _sum: { balance: true },
    where: { status: 1 },
  });
  const totalProvidersBalance = Number(providersBalanceAgg._sum.balance ?? 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const profitResults: any[] = await prisma.$queryRawUnsafe(
    `SELECT DATE(changed) as time, SUM(profit) as total_profit FROM orders WHERE changed > ? AND status IN ('completed','partial') GROUP BY DATE(changed)`,
    thirtyDaysAgo
  );

  let profitToday = 0;
  let profit30Days = 0;
  const todayStr = todayStart.toISOString().split("T")[0];
  for (const row of profitResults) {
    const val = Number(row.total_profit ?? 0);
    const dateStr = row.time instanceof Date
      ? row.time.toISOString().split("T")[0]
      : String(row.time);
    profit30Days += val;
    if (dateStr === todayStr) profitToday = val;
  }

  const orderStatusCounts: any[] = await prisma.$queryRawUnsafe(
    `SELECT status, COUNT(id) as total FROM orders GROUP BY status`
  );
  const statusMap: Record<string, number> = {};
  let totalOrders = 0;
  for (const row of orderStatusCounts) {
    const count = Number(row.total);
    statusMap[row.status] = count;
    totalOrders += count;
  }

  return {
    header: [
      { key: "users", name: "Total Users", value: String(totalUsers), icon: "Users", color: "emerald" },
      { key: "transactions", name: "Total Amount Received", value: currencySymbol + currencyFormat(totalTransactions), icon: "DollarSign", color: "blue" },
      { key: "orders", name: "Total Orders", value: String(totalOrders), icon: "ShoppingCart", color: "amber" },
      { key: "tickets", name: "Total Tickets", value: String(totalTickets), icon: "MessageSquare", color: "red" },
      { key: "users_balance", name: "Users' Balance", value: currencySymbol + currencyFormat(totalUsersBalance), icon: "Wallet", color: "emerald" },
      { key: "providers_balance", name: "Providers' Balance", value: currencySymbol + currencyFormat(totalProvidersBalance), icon: "Scale", color: "blue" },
      { key: "profit_today", name: "Profit Today", value: currencySymbol + currencyFormat(profitToday), icon: "Calculator", color: "amber" },
      { key: "profit_30_days", name: "Profit 30 Days", value: currencySymbol + currencyFormat(profit30Days), icon: "TrendingUp", color: "red" },
    ],
    orderStats: [
      { key: "total", name: "Total Orders", value: totalOrders, icon: "List", color: "emerald" },
      { key: "completed", name: "Completed", value: statusMap["completed"] ?? 0, icon: "CheckCircle", color: "blue" },
      { key: "processing", name: "Processing", value: statusMap["processing"] ?? 0, icon: "Loader", color: "amber" },
      { key: "inprogress", name: "In Progress", value: statusMap["inprogress"] ?? 0, icon: "Clock", color: "red" },
      { key: "pending", name: "Pending", value: statusMap["pending"] ?? 0, icon: "PieChart", color: "emerald" },
      { key: "partial", name: "Partial", value: statusMap["partial"] ?? 0, icon: "AlertCircle", color: "blue" },
      { key: "canceled", name: "Canceled", value: statusMap["canceled"] ?? 0, icon: "XSquare", color: "amber" },
      { key: "refunded", name: "Refunded", value: statusMap["refunded"] ?? 0, icon: "RotateCcw", color: "red" },
    ],
    statusMap,
  };
}

async function getChartData() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT status, COUNT(id) as total, DATE(changed) as datetime FROM orders WHERE changed > ? GROUP BY status, DATE(changed)`,
    sevenDaysAgo
  );

  const statuses = ["completed", "processing", "canceled", "pending", "partial", "inprogress"];
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const dataMap: Record<string, Record<string, number>> = {};
  for (const s of statuses) {
    dataMap[s] = {};
    for (const d of days) dataMap[s][d] = 0;
  }
  for (const row of rows) {
    const dateStr = row.datetime instanceof Date
      ? row.datetime.toISOString().split("T")[0]
      : String(row.datetime);
    if (dataMap[row.status] && dataMap[row.status][dateStr] !== undefined) {
      dataMap[row.status][dateStr] = Number(row.total);
    }
  }

  const splineData = days.map((day) => {
    const entry: any = { date: day };
    for (const s of statuses) entry[s] = dataMap[s][day];
    return entry;
  });

  return { splineData, statuses };
}

async function getRecentUsers() {
  const users = await prisma.general_users.findMany({
    orderBy: { created: "desc" },
    take: 5,
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      balance: true,
      status: true,
      created: true,
    },
  });
  return users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    name: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
    balance: Number(u.balance ?? 0),
    status: u.status ?? 0,
    created: u.created?.toISOString() ?? "",
  }));
}

async function getBestSellers() {
  const results: any[] = await prisma.$queryRawUnsafe(
    `SELECT o.service_id, s.name as service_name, COUNT(o.id) as total_orders, SUM(o.charge) as total_charge
     FROM orders o LEFT JOIN services s ON o.service_id = s.id
     GROUP BY o.service_id, s.name ORDER BY total_orders DESC LIMIT 5`
  );
  return results.map((r: any) => ({
    serviceId: String(r.service_id),
    serviceName: r.service_name ?? `Service #${r.service_id}`,
    totalOrders: Number(r.total_orders),
    totalCharge: Number(r.total_charge ?? 0),
  }));
}

export default async function AdminStatisticsPage() {
  const currencySymbol = await getOption("currency_symbol", "$");
  const [stats, chartData, recentUsers, bestSellers] = await Promise.all([
    getHeaderStats(currencySymbol),
    getChartData(),
    getRecentUsers(),
    getBestSellers(),
  ]);

  return (
    <AdminStatsClient
      headerStats={stats.header}
      orderStats={stats.orderStats}
      statusMap={stats.statusMap}
      splineData={chartData.splineData}
      recentUsers={recentUsers}
      bestSellers={bestSellers}
      currencySymbol={currencySymbol}
    />
  );
}
