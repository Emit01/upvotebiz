import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma, { isDatabaseReachable } from "@/lib/prisma";
import { getOption } from "@/lib/options";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbAvailable = await isDatabaseReachable();

  if (!dbAvailable) {
    redirect("/login");
  }

  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.warn("[dashboard] Session check failed:", error instanceof Error ? error.message : error);
    redirect("/login");
  }

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any)?.isAdmin) {
    redirect("/admin/statistics");
  }

  const uid = (session.user as any).uid;
  let ticketsNeedingActionCount = 0;
  let balance = 0;
  let currencySymbol = "$";

  try {
    const [ticketCount, user, symbol] = await Promise.all([
      prisma.tickets.count({
        where: { uid, user_read: 0, status: { not: "closed" } },
      }),
      prisma.general_users.findUnique({ where: { id: uid }, select: { balance: true } }),
      getOption("currency_symbol", "$"),
    ]);
    ticketsNeedingActionCount = ticketCount;
    balance = Number(user?.balance ?? 0);
    currencySymbol = symbol;
  } catch (error) {
    console.warn("[dashboard] Failed to fetch dashboard data:", error instanceof Error ? error.message : error);
  }

  return (
    <div className="font-apple flex min-h-screen bg-[#f5f5f7] dark:bg-surface-secondary text-[#1d1d1f] dark:text-[var(--label-primary)] antialiased">
      <Sidebar ticketsNeedingActionCount={ticketsNeedingActionCount} />
      <div className="ml-[256px] flex flex-1 flex-col min-w-0 bg-[#f5f5f7] dark:bg-surface-secondary">
        <DashboardHeader balance={balance} currencySymbol={currencySymbol} />
        <main className="flex flex-1 flex-col min-h-0 px-6 py-6 animate-fade-in w-full">{children}</main>
      </div>
    </div>
  );
}
