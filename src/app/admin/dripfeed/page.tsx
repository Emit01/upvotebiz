import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import AdminDripfeedClient from "@/components/admin/AdminDripfeedClient";

const PAGE_SIZE = 20;

export default async function AdminDripfeedPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const currencySymbol = await getOption("currency_symbol", "$");
  const status = searchParams.status || "all";
  const search = searchParams.search || "";
  const page = Math.max(1, parseInt(searchParams.page || "1"));

  const where: any = { is_drip_feed: 1 };
  if (status !== "all") where.status = status;
  if (search && !isNaN(Number(search))) where.id = Number(search);

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

  const serialized = orders.map((o) => ({
    id: o.id,
    email: userMap[Number(o.uid)] ?? "",
    service_id: o.service_id ?? "",
    link: o.link ?? "",
    quantity: o.quantity ?? "",
    runs: o.runs ?? 0,
    interval: o.interval ?? 0,
    charge: Number(o.charge ?? 0),
    status: o.status ?? "pending",
    created: o.created?.toISOString() ?? "",
  }));

  return <AdminDripfeedClient orders={serialized} total={total} page={page} pageSize={PAGE_SIZE} currentStatus={status} search={search} currencySymbol={currencySymbol} />;
}
