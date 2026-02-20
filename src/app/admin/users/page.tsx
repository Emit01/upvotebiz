import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import AdminUsersClient from "@/components/admin/AdminUsersClient";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currencySymbol = await getOption("currency_symbol", "$");
  const status = resolvedSearchParams.status || "all";
  const search = resolvedSearchParams.search || "";
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1"));

  const where: any = {};
  if (status === "active") where.status = 1;
  else if (status === "inactive") where.status = 0;
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { first_name: { contains: search } },
      { last_name: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.general_users.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, ids: true, email: true, first_name: true, last_name: true,
        balance: true, status: true, created: true,
      },
    }),
    prisma.general_users.count({ where }),
  ]);

  const statusCounts = {
    all: await prisma.general_users.count(),
    active: await prisma.general_users.count({ where: { status: 1 } }),
    inactive: await prisma.general_users.count({ where: { status: 0 } }),
  };

  const serialized = users.map((u) => ({
    id: u.id,
    ids: u.ids ?? "",
    email: u.email ?? "",
    first_name: u.first_name ?? "",
    last_name: u.last_name ?? "",
    balance: Number(u.balance ?? 0),
    status: u.status ?? 0,
    created: u.created?.toISOString() ?? "",
  }));

  return (
    <AdminUsersClient
      users={serialized}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      statusCounts={statusCounts}
      currentStatus={status}
      search={search}
      currencySymbol={currencySymbol}
    />
  );
}
