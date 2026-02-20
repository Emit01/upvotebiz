import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel, currencyFormat } from "@/lib/utils";
import { getOption } from "@/lib/options";

const ITEMS_PER_PAGE = 15;
const ORDER_STATUSES = ["all", "pending", "inprogress", "processing", "completed", "partial", "canceled", "refunded"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; p?: string; query?: string };
}) {
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;
  const uidStr = String(uid);
  const currencySymbol = await getOption("currency_symbol", "$");

  const status = searchParams.status || "all";
  const page = Math.max(1, parseInt(searchParams.p || "1"));
  const query = searchParams.query || "";
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: any = { uid: uidStr };
  if (status !== "all") where.status = status;
  if (query) {
    where.OR = [
      { id: isNaN(parseInt(query)) ? undefined : parseInt(query) },
      { link: { contains: query } },
    ].filter(Boolean);
  }

  const [orders, totalCount] = await Promise.all([
    prisma.orders.findMany({
      where, orderBy: { id: "desc" }, skip, take: ITEMS_PER_PAGE,
      select: { id: true, service_id: true, link: true, quantity: true, charge: true, start_counter2: true, remains: true, status: true, created: true },
    }),
    prisma.orders.count({ where }),
  ]);

  const serviceIds = Array.from(new Set(
    orders.map((o) => o.service_id).filter(Boolean).map((id) => parseInt(id as string))
  )).filter((id) => !isNaN(id));
  const servicesMap = new Map<number, string>();
  if (serviceIds.length > 0) {
    const svcs = await prisma.services.findMany({ where: { id: { in: serviceIds } }, select: { id: true, name: true } });
    for (const s of svcs) servicesMap.set(s.id, s.name || "Unknown");
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const baseUrl = `/orders?status=${status}${query ? `&query=${encodeURIComponent(query)}` : ""}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
      <h1 className="text-title-2 text-label-primary flex-shrink-0">Orders</h1>
      <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-label-secondary">{totalCount.toLocaleString()} orders</span>
        </div>
        <Link href="/new-order" className="btn-primary">New Order</Link>
      </div>

      <div className="flex flex-wrap gap-1 flex-shrink-0">
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/orders?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
              status === s
                ? "bg-[var(--accent)] text-white"
                : "text-label-secondary hover:bg-surface-primary hover:text-label-primary"
            }`}
          >
            {s === "all" ? "All" : getStatusLabel(s)}
          </Link>
        ))}
      </div>

      <div className="card p-3 flex-shrink-0">
        <form method="get" className="flex gap-2.5">
          <input type="hidden" name="status" value={status} />
          <input type="text" name="query" defaultValue={query} placeholder="Search by Order ID or link..." className="input-field max-w-md text-[13px]" />
          <button type="submit" className="btn-primary text-[13px] py-2">Search</button>
        </form>
      </div>

      <div className="card overflow-hidden flex flex-col flex-1 min-h-0 orders-page-table">
        <div className="orders-table-body flex-1 min-h-0 overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 bg-[var(--surface-primary)] z-[1]">
              <tr className="border-b border-separator">
                <th className="px-3 py-2 text-left text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-24 shrink-0">ID</th>
                <th className="px-3 py-2 text-left text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-[28%]">Service</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-20">Charge</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-12">Qty</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-14">Remains</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-20">Status</th>
                <th className="px-3 py-2 text-right text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-24">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-[14px] text-label-tertiary">No orders found</td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr key={order.id} className={`transition-colors hover:bg-surface-secondary/50 ${i < orders.length - 1 ? "border-b border-separator-light" : ""}`}>
                    <td className="px-3 py-2 text-[14px] font-medium text-label-secondary whitespace-nowrap overflow-hidden text-ellipsis">#{order.id}</td>
                    <td className="px-3 py-2 min-w-0 overflow-hidden">
                      <p className="truncate text-[14px] font-medium text-label-primary">
                        {servicesMap.get(parseInt(order.service_id || "0")) || `#${order.service_id}`}
                      </p>
                      {order.link && <p className="truncate text-[13px] text-label-tertiary">{order.link}</p>}
                    </td>
                    <td className="px-3 py-2 text-center text-[14px] font-medium">{currencySymbol}{currencyFormat(order.charge)}</td>
                    <td className="px-3 py-2 text-center text-[14px] text-label-secondary">{order.quantity}</td>
                    <td className="px-3 py-2 text-center text-[14px] text-label-secondary">{order.remains ?? 0}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[12px] font-semibold ${getStatusColor(order.status || "")}`}>
                        {getStatusLabel(order.status || "")}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-[13px] text-label-tertiary">{formatDate(order.created)}</td>
                  </tr>
                ))
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
