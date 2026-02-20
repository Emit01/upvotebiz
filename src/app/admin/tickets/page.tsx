import prisma from "@/lib/prisma";
import AdminTicketsClient from "@/components/admin/AdminTicketsClient";

const PAGE_SIZE = 20;
const STATUSES = ["all", "pending", "answered", "closed"];

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const status = searchParams.status || "all";
  const search = searchParams.search || "";
  const page = Math.max(1, parseInt(searchParams.page || "1"));

  const where: any = {};
  if (status !== "all") where.status = status;
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      ...(!isNaN(Number(search)) ? [{ id: Number(search) }] : []),
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.tickets.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.tickets.count({ where }),
  ]);

  const userIds = Array.from(new Set(tickets.map((t) => t.uid).filter(Boolean))) as number[];
  const users = userIds.length
    ? await prisma.general_users.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } })
    : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.email]));

  const statusCounts: Record<string, number> = { all: await prisma.tickets.count() };
  for (const s of ["pending", "answered", "closed"]) {
    statusCounts[s] = await prisma.tickets.count({ where: { status: s as any } });
  }

  const serialized = tickets.map((t) => ({
    id: t.id,
    subject: t.subject ?? "",
    email: userMap[t.uid ?? 0] ?? "",
    status: t.status ?? "pending",
    admin_read: t.admin_read,
    created: t.created?.toISOString() ?? "",
  }));

  return (
    <AdminTicketsClient
      tickets={serialized}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      statuses={STATUSES}
      statusCounts={statusCounts}
      currentStatus={status}
      search={search}
    />
  );
}
