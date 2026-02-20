"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { currencyFormat, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Search, Edit2, RotateCcw, X, Save } from "lucide-react";

interface Order {
  id: number;
  email: string;
  serviceName: string;
  providerName: string;
  link: string;
  quantity: string;
  charge: number;
  status: string;
  note: string;
  start_counter: string;
  remains: string;
  created: string;
  apiServiceId: string;
  apiOrderId: number;
}

interface Props {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  statuses: string[];
  statusCounts: Record<string, number>;
  currentStatus: string;
  search: string;
  field: string;
  currencySymbol: string;
}

export default function AdminOrdersClient({
  orders, total, page, pageSize, statuses, statusCounts,
  currentStatus, search, field, currencySymbol,
}: Props) {
  const router = useRouter();
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({ link: "", start_counter: "", remains: "", status: "" });
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState(search);
  const totalPages = Math.ceil(total / pageSize);

  const navigate = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { status: currentStatus, search, field, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all" && v !== "1") sp.set(k, v); });
    if (merged.status !== "all") sp.set("status", merged.status);
    router.push(`/admin/orders?${sp.toString()}`);
  }, [currentStatus, search, field, page, router]);

  const handleEdit = (o: Order) => {
    setEditOrder(o);
    setEditForm({ link: o.link, start_counter: o.start_counter, remains: o.remains, status: o.status });
  };

  const handleSave = async () => {
    if (!editOrder) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editOrder.id, ...editForm }),
      });
      if (res.ok) { setEditOrder(null); router.refresh(); }
    } finally { setSaving(false); }
  };

  const handleResend = async (id: number) => {
    if (!confirm("Resend this order?")) return;
    await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend", id }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {statuses.map((s) => (
          <button key={s} onClick={() => navigate({ status: s, page: "1" })}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
              currentStatus === s ? "bg-reddit text-white shadow-btn" : "bg-surface-primary text-label-secondary hover:bg-surface-secondary border border-separator"
            }`}>
            {getStatusLabel(s) || "All"} {statusCounts[s] !== undefined ? `(${statusCounts[s].toLocaleString()})` : ""}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-tertiary" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate({ search: searchInput, page: "1" })}
            placeholder="Search by order ID, email, link..." className="input-field pl-9 text-[13px]" />
        </div>
        <button onClick={() => navigate({ search: searchInput, page: "1" })} className="btn-primary text-[13px] px-4 py-2">Search</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["Order ID", "User", "Order Details", "Created", "Note", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-separator/50 hover:bg-surface-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{o.id}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{o.email}</td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-label-primary truncate max-w-[300px]">{o.serviceName}</p>
                    <p className="text-[11px] text-label-tertiary mt-0.5">
                      Link: <span className="text-blue-500 truncate inline-block max-w-[200px] align-bottom">{o.link}</span>
                    </p>
                    <p className="text-[11px] text-label-tertiary">
                      Qty: {o.quantity} · Charge: {currencySymbol}{currencyFormat(o.charge)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary whitespace-nowrap">{formatDate(o.created)}</td>
                  <td className="px-4 py-3 text-[12px] text-red-500">{o.note}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusColor(o.status)}`}>
                      {getStatusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(o)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors" title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {["error", "fail"].includes(o.status) && (
                        <button onClick={() => handleResend(o.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-orange-500 transition-colors" title="Resend">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-label-tertiary">Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}</p>
          <div className="flex items-center gap-1">
            {page > 1 && <button onClick={() => navigate({ page: String(page - 1) })} className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-label-secondary hover:bg-surface-secondary border border-separator">Prev</button>}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number;
              if (totalPages <= 7) p = i + 1;
              else if (page <= 4) p = i + 1;
              else if (page >= totalPages - 3) p = totalPages - 6 + i;
              else p = page - 3 + i;
              return (
                <button key={p} onClick={() => navigate({ page: String(p) })}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-medium ${p === page ? "bg-reddit text-white shadow-btn" : "text-label-secondary hover:bg-surface-secondary border border-separator"}`}>
                  {p}
                </button>
              );
            })}
            {page < totalPages && <button onClick={() => navigate({ page: String(page + 1) })} className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-label-secondary hover:bg-surface-secondary border border-separator">Next</button>}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditOrder(null)}>
          <div className="w-full max-w-md rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">Edit Order #{editOrder.id}</h3>
              <button onClick={() => setEditOrder(null)} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-text">Link</label>
                <input value={editForm.link} onChange={(e) => setEditForm({ ...editForm, link: e.target.value })} className="input-field text-[13px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Start Counter</label>
                  <input type="number" value={editForm.start_counter} onChange={(e) => setEditForm({ ...editForm, start_counter: e.target.value })} className="input-field text-[13px]" />
                </div>
                <div>
                  <label className="label-text">Remains</label>
                  <input type="number" value={editForm.remains} onChange={(e) => setEditForm({ ...editForm, remains: e.target.value })} className="input-field text-[13px]" />
                </div>
              </div>
              <div>
                <label className="label-text">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="select-field text-[13px]">
                  {["pending", "processing", "inprogress", "completed", "partial", "canceled", "refunded", "error", "fail"].map((s) => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px]">
                <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
