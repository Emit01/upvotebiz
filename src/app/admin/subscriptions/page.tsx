import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import { formatDate, currencyFormat, getStatusColor, getStatusLabel } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currencySymbol = await getOption("currency_symbol", "$");
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1"));

  const where = { service_type: "subscriptions" as const };
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

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "User", "Service", "Link", "Qty", "Charge", "Status", "Created"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{o.id}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{userMap[Number(o.uid)] ?? ""}</td>
                  <td className="px-4 py-3 text-[12px] text-label-secondary">{o.service_id}</td>
                  <td className="px-4 py-3 text-[12px] text-blue-500 max-w-[150px] truncate">{o.link}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{o.quantity}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{currencySymbol}{currencyFormat(Number(o.charge ?? 0))}</td>
                  <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusColor(o.status ?? "pending")}`}>{getStatusLabel(o.status ?? "pending")}</span></td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary whitespace-nowrap">{formatDate(o.created)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No subscription orders</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[12px] text-label-tertiary">Total: {total} · Page {page} of {Math.ceil(total / PAGE_SIZE)}</p>
    </div>
  );
}
