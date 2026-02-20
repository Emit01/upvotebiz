import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate, currencyFormat } from "@/lib/utils";
import { getOption } from "@/lib/options";

const ITEMS_PER_PAGE = 20;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; p?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;
  const [currencySymbol, user] = await Promise.all([
    getOption("currency_symbol", "$"),
    prisma.general_users.findUnique({ where: { id: uid }, select: { balance: true } }),
  ]);
  const balance = Number(user?.balance ?? 0);

  const filterStatus = resolvedSearchParams.status ? parseInt(resolvedSearchParams.status) : undefined;
  const page = Math.max(1, parseInt(resolvedSearchParams.p || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: any = { uid };
  if (filterStatus !== undefined && !isNaN(filterStatus) && filterStatus !== 3) {
    where.status = filterStatus;
  }

  const [transactions, totalCount, statusCounts] = await Promise.all([
    prisma.general_transaction_logs.findMany({ where, orderBy: { id: "desc" }, skip, take: ITEMS_PER_PAGE }),
    prisma.general_transaction_logs.count({ where }),
    prisma.general_transaction_logs.groupBy({ by: ["status"], _count: { id: true }, where: { uid } }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const statusMap: Record<number, { label: string; color: string; dot: string }> = {
    0: { label: "Waiting", color: "bg-amber-50 text-amber-600 border border-amber-100", dot: "bg-amber-500" },
    1: { label: "Completed", color: "bg-emerald-50 text-emerald-600 border border-emerald-100", dot: "bg-emerald-500" },
    [-1]: { label: "Failed", color: "bg-red-50 text-red-500 border border-red-100", dot: "bg-red-500" },
  };

  const statusCountMap: Record<number, number> = {};
  for (const sc of statusCounts) { if (sc.status !== null) statusCountMap[sc.status] = sc._count.id; }

  const baseUrl = "/transactions" + (filterStatus !== undefined && !isNaN(filterStatus) ? `?status=${filterStatus}` : "");

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <h1 className="text-title-2 text-label-primary">Transactions</h1>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-[var(--label-primary)]">
            Balance: <span className="text-[var(--accent)]">{currencySymbol}{currencyFormat(balance)}</span>
          </span>
          <Link
            href="/add-funds"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-[12px] font-medium text-white transition-colors hover:opacity-90"
          >
            Add Funds
          </Link>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 flex-shrink-0">
        {[
          { status: 1, label: "Completed", icon: "text-emerald-500 bg-emerald-50" },
          { status: 0, label: "Waiting", icon: "text-amber-500 bg-amber-50" },
          { status: -1, label: "Failed", icon: "text-red-500 bg-red-50" },
        ].map((item) => (
          <div key={item.status} className="card-hover p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-label-tertiary">{item.label}</p>
                <p className="text-[20px] font-semibold tracking-[-0.02em] text-label-primary leading-none mt-1">{statusCountMap[item.status] || 0}</p>
              </div>
              <div className={`rounded-lg p-1.5 ${item.icon}`}>
                <div className={`h-1.5 w-1.5 rounded-full ${statusMap[item.status]?.dot}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden flex flex-col transactions-log">
        <div className="overflow-x-auto transactions-log-body">
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 bg-[var(--surface-primary)] z-[1]">
              <tr className="border-b border-separator">
                <th className="px-3 py-2 text-left text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-24 shrink-0">#</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-[22%]">Method</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-28">Amount</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-20">Status</th>
                <th className="px-3 py-2 text-right text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-24">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[14px] text-[var(--label-tertiary)]">No transactions found</td>
                </tr>
              ) : (
                transactions.map((txn, i) => {
                  const statusInfo = statusMap[txn.status ?? 0] || statusMap[0];
                  return (
                    <tr key={txn.id} className={`transition-colors hover:bg-surface-secondary/50 ${i < transactions.length - 1 ? "border-b border-separator-light" : ""}`}>
                      <td className="px-3 py-2 text-[14px] font-medium text-label-secondary whitespace-nowrap overflow-hidden text-ellipsis">#{txn.id}</td>
                      <td className="px-3 py-2 text-center text-[14px] capitalize font-medium text-label-primary">{(txn.type || "—") as string}</td>
                      <td className="px-3 py-2 text-center text-[14px] font-semibold">{currencySymbol}{currencyFormat(txn.amount)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[12px] font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-[13px] text-label-tertiary">{formatDate(txn.created)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-separator px-4 py-2.5 flex-shrink-0">
            <p className="text-[12px] font-medium text-label-tertiary">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <Link href={`${baseUrl}${baseUrl.includes("?") ? "&" : "?"}p=${page - 1}`} className="rounded px-2.5 py-1 text-[12px] font-medium text-label-secondary hover:bg-surface-secondary">Prev</Link>
              )}
              {(() => {
                const maxShow = 5;
                const start = totalPages <= maxShow ? 1 : Math.max(1, Math.min(page - 1, totalPages - maxShow + 1));
                const end = Math.min(totalPages, start + maxShow - 1);
                const pages: number[] = [];
                for (let i = start; i <= end; i++) pages.push(i);
                return pages.map((p) => (
                  <Link
                    key={p}
                    href={`${baseUrl}${baseUrl.includes("?") ? "&" : "?"}p=${p}`}
                    className={`rounded px-2.5 py-1 text-[12px] font-medium min-w-[1.5rem] text-center ${p === page ? "bg-[var(--accent)] text-white" : "text-label-secondary hover:bg-surface-secondary"}`}
                  >
                    {p}
                  </Link>
                ));
              })()}
              {page < totalPages && (
                <Link href={`${baseUrl}${baseUrl.includes("?") ? "&" : "?"}p=${page + 1}`} className="rounded px-2.5 py-1 text-[12px] font-medium text-label-secondary hover:bg-surface-secondary">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
