"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDate, currencyFormat } from "@/lib/utils";

interface Order {
  id: number; email: string; service_id: string; link: string; quantity: string;
  charge: number; refill_status: number; refill_status_label: string; refill_date: string; created: string;
}

interface Props {
  orders: Order[]; total: number; page: number; pageSize: number; currentStatus: string; currencySymbol: string;
}

const STATUSES = ["all", "pending", "awaiting", "inprocess", "rejected", "fail", "complete"];
const statusLabels: Record<string, string> = { all: "All", pending: "Pending", awaiting: "Awaiting", inprocess: "In Process", rejected: "Rejected", fail: "Fail", complete: "Complete" };

export default function AdminRefillClient({ orders, total, page, pageSize, currentStatus, currencySymbol }: Props) {
  const router = useRouter();
  const totalPages = Math.ceil(total / pageSize);

  const navigate = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { status: currentStatus, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all" && v !== "1") sp.set(k, v); });
    if (merged.status !== "all") sp.set("status", merged.status);
    router.push(`/admin/refill?${sp.toString()}`);
  }, [currentStatus, page, router]);

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 flex-wrap">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => navigate({ status: s, page: "1" })}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${currentStatus === s ? "bg-reddit text-white shadow-btn" : "bg-surface-primary text-label-secondary hover:bg-surface-secondary border border-separator"}`}>
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["Order ID", "User", "Service", "Link", "Qty", "Charge", "Refill Status", "Refill Date", "Created"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{o.id}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{o.email}</td>
                  <td className="px-4 py-3 text-[12px] text-label-secondary">{o.service_id}</td>
                  <td className="px-4 py-3 text-[12px] text-blue-500 max-w-[150px] truncate">{o.link}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{o.quantity}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{currencySymbol}{currencyFormat(o.charge)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                      {o.refill_status_label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary">{formatDate(o.refill_date)}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary whitespace-nowrap">{formatDate(o.created)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No refill orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-label-tertiary">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            {page > 1 && <button onClick={() => navigate({ page: String(page - 1) })} className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-label-secondary hover:bg-surface-secondary border border-separator">Prev</button>}
            {page < totalPages && <button onClick={() => navigate({ page: String(page + 1) })} className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-label-secondary hover:bg-surface-secondary border border-separator">Next</button>}
          </div>
        </div>
      )}
    </div>
  );
}
