import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import AdminTransactionsClient from "@/components/admin/AdminTransactionsClient";

const PAGE_SIZE = 20;

export default async function AdminTransactionsPage({
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
  if (status === "approved") where.status = 1;
  else if (status === "pending") where.status = 0;
  else if (status === "rejected") where.status = 2;

  if (search) {
    const searchUids = await prisma.general_users.findMany({
      where: { email: { contains: search } },
      select: { id: true },
      take: 100,
    });
    const uidList = searchUids.map((u) => u.id);
    where.OR = [
      { note: { contains: search } },
      ...(uidList.length ? [{ uid: { in: uidList } }] : []),
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.general_transaction_logs.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.general_transaction_logs.count({ where }),
  ]);

  const txUids = Array.from(new Set(transactions.map((t) => t.uid).filter(Boolean))) as number[];
  const txUsers = txUids.length ? await prisma.general_users.findMany({ where: { id: { in: txUids } }, select: { id: true, email: true } }) : [];
  const txUserMap = Object.fromEntries(txUsers.map((u) => [u.id, u.email ?? ""]));

  const statusCounts = {
    all: await prisma.general_transaction_logs.count(),
    approved: await prisma.general_transaction_logs.count({ where: { status: 1 } }),
    pending: await prisma.general_transaction_logs.count({ where: { status: 0 } }),
    rejected: await prisma.general_transaction_logs.count({ where: { status: 2 } }),
  };

  const serialized = transactions.map((t) => ({
    id: t.id,
    email: txUserMap[t.uid ?? 0] ?? "",
    type: t.type ?? "",
    amount: Number(t.amount ?? 0),
    memo: t.note ?? "",
    status: t.status ?? 0,
    created: t.created?.toISOString() ?? "",
  }));

  return (
    <AdminTransactionsClient
      transactions={serialized}
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
