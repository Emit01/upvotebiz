import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import Sidebar from "@/components/layout/Sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any)?.isAdmin) {
    redirect("/admin/statistics");
  }

  const uid = (session.user as any).uid;
  const [ticketsNeedingActionCount, user, currencySymbol] = await Promise.all([
    prisma.tickets.count({
      where: { uid, user_read: 0, status: { not: "closed" } },
    }),
    prisma.general_users.findUnique({ where: { id: uid }, select: { balance: true } }),
    getOption("currency_symbol", "$"),
  ]);
  const balance = Number(user?.balance ?? 0);

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
