import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { currencyFormat } from "@/lib/utils";
import { getOption } from "@/lib/options";
import StatsCharts from "@/components/dashboard/StatsCharts";

async function getStatistics(uid: number) {
  const uidStr = String(uid);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [user, totalAmountSent, totalOrders, totalTickets, ordersByStatus, recentOrders] =
    await Promise.all([
      prisma.general_users.findUnique({ where: { id: uid }, select: { balance: true } }),
      prisma.general_transaction_logs.aggregate({ _sum: { amount: true }, where: { uid, status: 1 } }),
      prisma.orders.count({ where: { uid: uidStr } }),
      prisma.tickets.count({ where: { uid } }),
      prisma.orders.groupBy({ by: ["status"], _count: { id: true }, where: { uid: uidStr } }),
      prisma.orders.findMany({
        where: { uid: uidStr, changed: { gte: sevenDaysAgo } },
        select: { status: true, charge: true, changed: true },
      }),
    ]);

  const statusCounts: Record<string, number> = {};
  for (const row of ordersByStatus) { if (row.status) statusCounts[row.status] = row._count.id; }

  const days: string[] = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().split("T")[0]); }

  const chartData = days.map((day) => {
    const dayOrders = recentOrders.filter((o) => o.changed && o.changed.toISOString().split("T")[0] === day);
    return {
      date: day,
      completed: dayOrders.filter((o) => o.status === "completed").length,
      pending: dayOrders.filter((o) => o.status === "pending").length,
      processing: dayOrders.filter((o) => o.status === "processing").length,
      inprogress: dayOrders.filter((o) => o.status === "inprogress").length,
      canceled: dayOrders.filter((o) => o.status === "canceled").length,
      partial: dayOrders.filter((o) => o.status === "partial").length,
      totalSpent: dayOrders.reduce((sum, o) => sum + Number(o.charge || 0), 0),
    };
  });

  return {
    balance: Number(user?.balance || 0),
    totalAmountSent: Number(totalAmountSent._sum.amount || 0),
    totalOrders, totalTickets, statusCounts, chartData,
  };
}

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;
  const currencySymbol = await getOption("currency_symbol", "$");
  const stats = await getStatistics(uid);

  const headerCards = [
    { name: "Balance", value: `${currencySymbol}${currencyFormat(stats.balance)}`, icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z", color: "text-emerald-500 bg-emerald-50" },
    { name: "Total Spent", value: `${currencySymbol}${currencyFormat(stats.totalAmountSent)}`, icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-reddit bg-reddit-light" },
    { name: "Total Orders", value: String(stats.totalOrders), icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z", color: "text-blue-500 bg-blue-50" },
    { name: "Tickets", value: String(stats.totalTickets), icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z", color: "text-purple-500 bg-purple-50" },
  ];

  const orderStats = [
    { name: "Total", value: stats.totalOrders, dot: "bg-label-primary" },
    { name: "Completed", value: stats.statusCounts.completed || 0, dot: "bg-emerald-500" },
    { name: "Processing", value: stats.statusCounts.processing || 0, dot: "bg-blue-500" },
    { name: "In Progress", value: stats.statusCounts.inprogress || 0, dot: "bg-amber-500" },
    { name: "Pending", value: stats.statusCounts.pending || 0, dot: "bg-gray-400" },
    { name: "Partial", value: stats.statusCounts.partial || 0, dot: "bg-orange-500" },
    { name: "Canceled", value: stats.statusCounts.canceled || 0, dot: "bg-red-500" },
    { name: "Refunded", value: stats.statusCounts.refunded || 0, dot: "bg-purple-500" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headerCards.map((card, i) => (
          <div key={i} className="card-hover p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-label-tertiary">{card.name}</p>
                <p className="stat-number mt-2">{card.value}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${card.color}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-3 text-subhead font-medium text-label-primary">Orders — Last 7 Days</h3>
          <StatsCharts chartData={stats.chartData} />
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-subhead font-medium text-label-primary">Order Breakdown</h3>
          <div className="space-y-1.5">
            {orderStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors hover:bg-surface-secondary">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2 w-2 rounded-full ${stat.dot}`} />
                  <span className="text-callout text-label-secondary">{stat.name}</span>
                </div>
                <span className="text-callout font-bold text-label-primary">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
