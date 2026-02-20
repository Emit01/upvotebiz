import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import AdminRefillClient from "@/components/admin/AdminRefillClient";

const PAGE_SIZE = 20;

export default async function AdminRefillPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const currencySymbol = await getOption("currency_symbol", "$");
  const status = searchParams.status || "all";
  const page = Math.max(1, parseInt(searchParams.page || "1"));

  const where: any = { refill: 1 };
  if (status !== "all") {
    const statusMap: Record<string, number> = { pending: 1, awaiting: 2, inprocess: 3, rejected: 4, fail: 5, complete: 7 };
    if (statusMap[status]) where.refill_status = statusMap[status];
  }

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.orders.count({ where }),
  ]);

  const uids = Array.from(new Set(orders.map((o) => Number(o.uid)).filter(Boolean)));
  const usersArr = uids.length ? await prisma.general_users.findMany({ where: { id: { in: uids } }, select: { id: true, email: true } }) : [];
  const userMap = Object.fromEntries(usersArr.map((u) => [u.id, u.email ?? ""]));

  const refillStatusLabels: Record<number, string> = { 1: "Pending", 2: "Awaiting", 3: "In Process", 4: "Rejected", 5: "Fail", 7: "Complete" };

  const serialized = orders.map((o) => ({
    id: o.id,
    email: userMap[Number(o.uid)] ?? "",
    service_id: o.service_id ?? "",
    link: o.link ?? "",
    quantity: o.quantity ?? "",
    charge: Number(o.charge ?? 0),
    refill_status: o.refill_status ?? 0,
    refill_status_label: refillStatusLabels[o.refill_status ?? 0] ?? "Unknown",
    refill_date: o.refill_date?.toISOString() ?? "",
    created: o.created?.toISOString() ?? "",
  }));

  return <AdminRefillClient orders={serialized} total={total} page={page} pageSize={PAGE_SIZE} currentStatus={status} currencySymbol={currencySymbol} />;
}
