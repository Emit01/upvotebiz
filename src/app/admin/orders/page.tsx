import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import AdminOrdersClient from "@/components/admin/AdminOrdersClient";

const STATUSES = ["all", "pending", "processing", "inprogress", "completed", "partial", "canceled", "refunded", "error", "fail"];
const PAGE_SIZE = 20;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; field?: string; page?: string };
}) {
  const currencySymbol = await getOption("currency_symbol", "$");
  const status = searchParams.status || "all";
  const search = searchParams.search || "";
  const field = searchParams.field || "all";
  const page = Math.max(1, parseInt(searchParams.page || "1"));

  const where: any = {
    NOT: [
      { service_type: "subscriptions" },
      { is_drip_feed: 1 },
    ],
  };
  if (status !== "all") where.status = status;

  let searchUids: string[] = [];
  if (search && (field === "all" || field === "email")) {
    const matchedUsers = await prisma.general_users.findMany({
      where: { email: { contains: search } },
      select: { id: true },
      take: 100,
    });
    searchUids = matchedUsers.map((u) => String(u.id));
  }

  const searchConditions: any[] = [];
  if (search) {
    if (field === "all") {
      if (!isNaN(Number(search))) searchConditions.push({ id: Number(search) });
      searchConditions.push({ link: { contains: search } });
      if (searchUids.length) searchConditions.push({ uid: { in: searchUids } });
    } else if (field === "email") {
      if (searchUids.length) searchConditions.push({ uid: { in: searchUids } });
    } else {
      searchConditions.push({ [field]: { contains: search } });
    }
  }

  const fullWhere = {
    ...where,
    ...(searchConditions.length ? { OR: searchConditions } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where: fullWhere,
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.orders.count({ where: fullWhere }),
  ]);

  const userIds = Array.from(new Set(orders.map((o) => Number(o.uid)).filter(Boolean)));
  const serviceIds = Array.from(new Set(orders.map((o) => Number(o.service_id)).filter(Boolean)));
  const providerIds = Array.from(new Set(orders.map((o) => o.api_provider_id).filter(Boolean))) as number[];

  const [users, services, providers] = await Promise.all([
    userIds.length ? prisma.general_users.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } }) : [],
    serviceIds.length ? prisma.services.findMany({ where: { id: { in: serviceIds } }, select: { id: true, name: true } }) : [],
    providerIds.length ? prisma.api_providers.findMany({ where: { id: { in: providerIds } }, select: { id: true, name: true } }) : [],
  ]);

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));
  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s.name]));
  const providerMap = Object.fromEntries(providers.map((p) => [p.id, p.name]));

  const statusCounts: Record<string, number> = {};
  const countResults: any[] = await prisma.$queryRawUnsafe(
    `SELECT status, COUNT(*) as cnt FROM orders WHERE service_type != 'subscriptions' AND is_drip_feed != 1 GROUP BY status`
  );
  let allCount = 0;
  for (const r of countResults) {
    statusCounts[r.status] = Number(r.cnt);
    allCount += Number(r.cnt);
  }
  statusCounts["all"] = allCount;

  const serialized = orders.map((o) => ({
    id: o.id,
    email: userMap[Number(o.uid)] ?? "",
    serviceName: serviceMap[Number(o.service_id)] ?? `#${o.service_id}`,
    providerName: providerMap[o.api_provider_id ?? 0] ?? (o.type === "api" ? "API" : "Manual"),
    link: o.link ?? "",
    quantity: o.quantity ?? "",
    charge: Number(o.charge ?? 0),
    status: o.status ?? "pending",
    note: o.note ?? "",
    start_counter: o.start_counter ?? "",
    remains: o.remains ?? "",
    created: o.created?.toISOString() ?? "",
    apiServiceId: o.api_service_id ?? "",
    apiOrderId: o.api_order_id ?? 0,
  }));

  return (
    <AdminOrdersClient
      orders={serialized}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      statuses={STATUSES}
      statusCounts={statusCounts}
      currentStatus={status}
      search={search}
      field={field}
      currencySymbol={currencySymbol}
    />
  );
}
