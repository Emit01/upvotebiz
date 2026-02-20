import { unstable_cache } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import type { orders_status } from "@prisma/client";
import Link from "next/link";
import { formatDate, getStatusColor, getStatusLabel, currencyFormat } from "@/lib/utils";
import NewOrderForm from "@/components/dashboard/NewOrderForm";

async function getCachedCatalog() {
  return unstable_cache(
    async () => {
      const [categories, services] = await Promise.all([
        prisma.categories.findMany({
          where: { status: 1 },
          orderBy: { id: "asc" },
          select: { id: true, name: true },
        }),
        prisma.services.findMany({
          where: { status: 1 },
          orderBy: { id: "asc" },
          select: {
            id: true,
            cate_id: true,
            name: true,
            price: true,
            min: true,
            max: true,
            type: true,
            dripfeed: true,
            refill: true,
            desc: true,
            api_provider_id: true,
            api_service_id: true,
            original_price: true,
          },
        }),
      ]);
      return { categories, services };
    },
    ["new-order-catalog"],
    { revalidate: 60 }
  )();
}

async function getOrderFormData(uid: number) {
  const [{ categories, services }, customPrices] = await Promise.all([
    getCachedCatalog(),
    prisma.general_users_price.findMany({
      where: { uid },
      select: { service_id: true, service_price: true },
    }),
  ]);

  return {
    categories: categories.map((c) => ({ id: c.id, name: c.name || "" })),
    services: services.map((s) => ({
      id: s.id,
      cate_id: s.cate_id || 0,
      name: s.name || "",
      price: Number(s.price || 0),
      min: s.min || 0,
      max: s.max || 0,
      type: s.type || "default",
      dripfeed: s.dripfeed || 0,
      refill: s.refill || 0,
      desc: s.desc || "",
      api_provider_id: s.api_provider_id || 0,
      api_service_id: s.api_service_id || "",
      original_price: Number(s.original_price || 0),
    })),
    customPrices: customPrices.map((p) => ({
      service_id: p.service_id,
      price: Number(p.service_price || 0),
    })),
  };
}

const LOG_PAGE_SIZE = 10;
const LOG_STATUSES = ["all", "completed", "inprogress", "pending", "partial"] as const;
const LOG_STATUS_VALUES: orders_status[] = ["completed", "inprogress", "pending", "partial"];

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ log_status?: string; p?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;
  const uidStr = String(uid);
  const [data, currencySymbol] = await Promise.all([
    getOrderFormData(uid),
    getOption("currency_symbol", "$"),
  ]);

  const logStatus = (LOG_STATUSES as readonly string[]).includes(resolvedSearchParams.log_status || "")
    ? resolvedSearchParams.log_status
    : "all";
  const logPage = Math.max(1, parseInt(resolvedSearchParams.p || "1"));
  const logSkip = (logPage - 1) * LOG_PAGE_SIZE;

  const logWhere: { uid: string; status?: orders_status } = { uid: uidStr };
  if (logStatus !== "all" && LOG_STATUS_VALUES.includes(logStatus as orders_status)) {
    logWhere.status = logStatus as orders_status;
  }

  const [logOrders, logTotal] = await Promise.all([
    prisma.orders.findMany({
      where: logWhere,
      orderBy: { id: "desc" },
      skip: logSkip,
      take: LOG_PAGE_SIZE,
      select: { id: true, service_id: true, link: true, quantity: true, charge: true, status: true, created: true },
    }),
    prisma.orders.count({ where: logWhere }),
  ]);

  const logServiceIds = Array.from(new Set(logOrders.map((o) => o.service_id).filter(Boolean).map((id) => parseInt(id as string)))).filter((id) => !isNaN(id));
  const logServicesMap = new Map<number, string>();
  if (logServiceIds.length > 0) {
    const svcs = await prisma.services.findMany({ where: { id: { in: logServiceIds } }, select: { id: true, name: true } });
    for (const s of svcs) logServicesMap.set(s.id, s.name || "—");
  }

  const logTotalPages = Math.ceil(logTotal / LOG_PAGE_SIZE);
  const logBaseUrl = logStatus !== "all" ? `/new-order?log_status=${logStatus}` : "/new-order";

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full gap-6">
      <h1 className="text-title-2 text-label-primary flex-shrink-0">New order</h1>

      <div className="flex-shrink-0">
        <NewOrderForm
          categories={data.categories}
          services={data.services}
          customPrices={data.customPrices}
        />
      </div>

      <div className="card overflow-hidden flex flex-col flex-1 min-h-0 recent-orders-log">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--separator-light)] px-4 py-2.5 flex-shrink-0">
          <h2 className="text-[13px] font-medium tracking-[-0.01em] text-[var(--label-primary)]">Recent orders</h2>
          <div className="flex flex-wrap gap-1">
            {LOG_STATUSES.map((s) => (
              <Link
                key={s}
                href={s === "all" ? "/new-order" : `/new-order?log_status=${s}`}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  logStatus === s
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--label-secondary)] hover:bg-[var(--ghost-hover)] hover:text-[var(--label-primary)]"
                }`}
              >
                {s === "all" ? "All" : getStatusLabel(s)}
              </Link>
            ))}
          </div>
        </div>
        <div className="recent-orders-log-body flex-1 min-h-0 overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 bg-[var(--surface-primary)] z-[1]">
              <tr className="border-b border-[var(--separator)]">
                <th className="px-3 py-2 text-left text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-24 shrink-0">ID</th>
                <th className="px-3 py-2 text-left text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-[28%]">Service</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-20">Charge</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-12">Qty</th>
                <th className="px-3 py-2 text-center text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-20">Status</th>
                <th className="px-3 py-2 text-right text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--label-tertiary)] w-24">Date</th>
              </tr>
            </thead>
            <tbody>
              {logOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[14px] text-[var(--label-tertiary)]">No orders found</td>
                </tr>
              ) : (
                logOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`transition-colors hover:bg-[var(--surface-secondary)]/50 ${i < logOrders.length - 1 ? "border-b border-[var(--separator-light)]" : ""}`}
                  >
                    <td className="px-3 py-2 text-[14px] font-medium text-[var(--label-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">#{order.id}</td>
                    <td className="px-3 py-2 min-w-0 overflow-hidden">
                      <p className="truncate text-[14px] font-medium text-[var(--label-primary)]">
                        {logServicesMap.get(parseInt(order.service_id || "0")) || `#${order.service_id}`}
                      </p>
                      {order.link && (
                        <p className="truncate text-[13px] text-[var(--label-tertiary)]">{order.link}</p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-[14px] font-medium">{currencySymbol}{currencyFormat(order.charge)}</td>
                    <td className="px-3 py-2 text-center text-[14px] text-[var(--label-secondary)]">{order.quantity}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[12px] font-semibold ${getStatusColor(order.status || "")}`}>
                        {getStatusLabel(order.status || "")}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-[13px] text-[var(--label-tertiary)]">{formatDate(order.created)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {logTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--separator)] px-4 py-2.5 flex-shrink-0">
            <p className="text-[12px] font-medium text-[var(--label-tertiary)]">
              Page {logPage} of {logTotalPages}
            </p>
            <div className="flex items-center gap-1">
              {logPage > 1 && (
                <Link href={`${logBaseUrl}${logBaseUrl.includes("?") ? "&" : "?"}p=${logPage - 1}`} className="rounded px-2.5 py-1 text-[12px] font-medium text-[var(--label-secondary)] hover:bg-[var(--surface-secondary)]">
                  Prev
                </Link>
              )}
              {(() => {
                const maxShow = 5;
                const start = logTotalPages <= maxShow ? 1 : Math.max(1, Math.min(logPage - 1, logTotalPages - maxShow + 1));
                const end = Math.min(logTotalPages, start + maxShow - 1);
                const pages: number[] = [];
                for (let i = start; i <= end; i++) pages.push(i);
                return pages.map((p) => (
                  <Link
                    key={p}
                    href={`${logBaseUrl}${logBaseUrl.includes("?") ? "&" : "?"}p=${p}`}
                    className={`rounded px-2.5 py-1 text-[12px] font-medium min-w-[1.5rem] text-center ${
                      p === logPage ? "bg-[var(--accent)] text-white" : "text-[var(--label-secondary)] hover:bg-[var(--surface-secondary)]"
                    }`}
                  >
                    {p}
                  </Link>
                ));
              })()}
              {logPage < logTotalPages && (
                <Link href={`${logBaseUrl}${logBaseUrl.includes("?") ? "&" : "?"}p=${logPage + 1}`} className="rounded px-2.5 py-1 text-[12px] font-medium text-[var(--label-secondary)] hover:bg-[var(--surface-secondary)]">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
