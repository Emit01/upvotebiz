"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { formatDate, currencyFormat, getStatusColor, getStatusLabel } from "@/lib/utils";

interface Order {
  id: number; email: string; service_id: string; link: string; quantity: string;
  runs: number; interval: number; charge: number; status: string; created: string;
}

interface Props {
  orders: Order[]; total: number; page: number; pageSize: number;
  currentStatus: string; search: string; currencySymbol: string;
}

const STATUSES = ["all", "pending", "processing", "inprogress", "completed", "partial", "canceled"];

export default function AdminDripfeedClient({ orders, total, page, pageSize, currentStatus, search, currencySymbol }: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search);
  const totalPages = Math.ceil(total / pageSize);

  const navigate = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { status: currentStatus, search, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all" && v !== "1") sp.set(k, v); });
    if (merged.status !== "all") sp.set("status", merged.status);
    router.push(`/admin/dripfeed?${sp.toString()}`);
  }, [currentStatus, search, page, router]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => navigate({ status: s, page: "1" })}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${currentStatus === s ? "bg-reddit text-white shadow-btn" : "bg-surface-primary text-label-secondary hover:bg-surface-secondary border border-separator"}`}>
              {s === "all" ? "All" : getStatusLabel(s)}
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-tertiary" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate({ search: searchInput, page: "1" })}
            placeholder="Search by ID..." className="input-field pl-9 text-[13px] w-48" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "User", "Service", "Link", "Qty", "Runs", "Interval", "Charge", "Status", "Created"].map((h) => (
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
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{o.runs}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{o.interval}min</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{currencySymbol}{currencyFormat(o.charge)}</td>
                  <td className="px-4 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span></td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary whitespace-nowrap">{formatDate(o.created)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={10} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No dripfeed orders found</td></tr>}
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
