import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { tickets_status } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import TicketsAddForm from "@/components/dashboard/TicketsAddForm";

const ITEMS_PER_PAGE = 10;

const VALID_STATUSES: tickets_status[] = ["pending", "answered", "closed", "new"];

const statusLabels: Record<string, string> = {
  pending: "Pending",
  answered: "Answered",
  closed: "Closed",
  new: "New",
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; p?: string };
}) {
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;

  const filterStatus = searchParams.status;
  const page = Math.max(1, parseInt(searchParams.p || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: { uid: number; status?: tickets_status } = { uid };
  if (filterStatus && filterStatus !== "all" && VALID_STATUSES.includes(filterStatus as tickets_status)) {
    where.status = filterStatus as tickets_status;
  }

  const [tickets, totalCount, statusCounts] = await Promise.all([
    prisma.tickets.findMany({
      where,
      orderBy: [{ status: "asc" }, { changed: "desc" }],
      skip,
      take: ITEMS_PER_PAGE,
      select: { id: true, subject: true, status: true, user_read: true, changed: true },
    }),
    prisma.tickets.count({ where }),
    prisma.tickets.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { uid },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const countByStatus: Record<string, number> = {};
  for (const row of statusCounts) {
    if (row.status) countByStatus[row.status] = row._count.id;
  }

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-title-2 text-label-primary">Tickets</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["pending", "answered", "closed"] as const).map((status) => (
          <Link
            key={status}
            href={filterStatus === status ? "/tickets" : `/tickets?status=${status}`}
            className={`card-hover p-5 ${filterStatus === status ? "ring-1 ring-[var(--accent)]" : ""}`}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-label-tertiary">
              {statusLabels[status] || status}
            </p>
            <p className="stat-number mt-2">{countByStatus[status] || 0}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h3 className="mb-4 text-subhead font-medium text-label-primary">New ticket</h3>
            <TicketsAddForm />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="border-b border-separator-light px-5 py-3">
              <h3 className="text-subhead font-medium text-label-primary">Tickets</h3>
            </div>
            {tickets.length === 0 ? (
              <div className="px-5 py-12 text-center text-callout text-label-tertiary">
                No tickets found.
              </div>
            ) : (
              <ul className="divide-y divide-separator-light">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-secondary/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-label-primary">
                          #{t.id} — {t.subject}
                        </p>
                        <p className="mt-0.5 text-[11px] text-label-tertiary">
                          {formatDate(t.changed)}
                        </p>
                      </div>
                      <span
                        className={`status-badge flex-shrink-0 ${
                          t.status === "closed"
                            ? "bg-label-tertiary/20 text-label-tertiary"
                            : t.status === "answered"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-0"
                              : "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/20 dark:text-amber-400 dark:border-0"
                        }`}
                      >
                        {statusLabels[t.status] || t.status}
                      </span>
                      {t.user_read === 0 && t.status !== "closed" && (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={filterStatus ? `/tickets?status=${filterStatus}` : "/tickets"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
