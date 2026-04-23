"use client";

import Link from "next/link";

type Props =
  | {
      tone: "new-order";
      page: number;
      totalPages: number;
      logStatus: string;
    }
  | {
      tone: "orders";
      page: number;
      totalPages: number;
      status: string;
      query: string;
    };

function hrefNewOrderLog(logStatus: string, p: number): string {
  const sp = new URLSearchParams();
  if (logStatus !== "all") sp.set("log_status", logStatus);
  if (p > 1) sp.set("p", String(p));
  const qs = sp.toString();
  return qs ? `/new-order?${qs}` : "/new-order";
}

function hrefOrders(status: string, query: string, p: number): string {
  const sp = new URLSearchParams();
  sp.set("status", status);
  if (query) sp.set("query", query);
  if (p > 1) sp.set("p", String(p));
  return `/orders?${sp.toString()}`;
}

export default function DashboardTablePagination(props: Props) {
  const { page, totalPages, tone } = props;

  const labelTertiary =
    tone === "new-order" ? "text-[var(--label-tertiary)]" : "text-label-tertiary";
  const labelSecondaryHover =
    tone === "new-order"
      ? "text-[var(--label-secondary)] hover:bg-[var(--surface-secondary)]"
      : "text-label-secondary hover:bg-surface-secondary";
  const borderTop =
    tone === "new-order" ? "border-[var(--separator)]" : "border-separator";

  const buildHref = (p: number) =>
    tone === "new-order"
      ? hrefNewOrderLog(props.logStatus, p)
      : hrefOrders(props.status, props.query, p);

  if (totalPages <= 1) return null;

  const maxShow = 5;
  const start =
    totalPages <= maxShow ? 1 : Math.max(1, Math.min(page - 1, totalPages - maxShow + 1));
  const end = Math.min(totalPages, start + maxShow - 1);
  const pageNums: number[] = [];
  for (let i = start; i <= end; i++) pageNums.push(i);

  const btnBase = `inline-flex cursor-pointer items-center justify-center rounded px-2.5 py-1 text-[12px] font-medium no-underline ${labelSecondaryHover}`;
  const activeBtn = "bg-[var(--accent)] text-white";

  return (
    <div className={`flex items-center justify-between border-t ${borderTop} px-4 py-2.5 flex-shrink-0`}>
      <p className={`text-[12px] font-medium ${labelTertiary}`}>
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link href={buildHref(page - 1)} scroll prefetch={false} className={btnBase}>
            Prev
          </Link>
        )}
        {pageNums.map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            scroll
            prefetch={false}
            className={`${btnBase} min-w-[1.5rem] text-center ${p === page ? activeBtn : ""}`}
          >
            {p}
          </Link>
        ))}
        {page < totalPages && (
          <Link href={buildHref(page + 1)} scroll prefetch={false} className={btnBase}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
