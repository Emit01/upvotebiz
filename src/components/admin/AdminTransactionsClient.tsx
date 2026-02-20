"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit2, Trash2, X, Save } from "lucide-react";
import { formatDate, currencyFormat } from "@/lib/utils";

interface Transaction {
  id: number; email: string; type: string; amount: number; memo: string; status: number; created: string;
}

interface Props {
  transactions: Transaction[]; total: number; page: number; pageSize: number;
  statusCounts: Record<string, number>; currentStatus: string; search: string; currencySymbol: string;
}

const statusLabels: Record<number, string> = { 0: "Pending", 1: "Approved", 2: "Rejected" };
const statusColors: Record<number, string> = {
  0: "bg-amber-50 text-amber-600 border border-amber-100",
  1: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  2: "bg-red-50 text-red-500 border border-red-100",
};

export default function AdminTransactionsClient({ transactions, total, page, pageSize, statusCounts, currentStatus, search, currencySymbol }: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editStatus, setEditStatus] = useState("0");
  const [saving, setSaving] = useState(false);
  const totalPages = Math.ceil(total / pageSize);

  const navigate = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { status: currentStatus, search, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all" && v !== "1") sp.set(k, v); });
    if (merged.status !== "all") sp.set("status", merged.status);
    router.push(`/admin/transactions?${sp.toString()}`);
  }, [currentStatus, search, page, router]);

  const handleSave = async () => {
    if (!editTx) return;
    setSaving(true);
    try {
      await fetch("/api/admin/transactions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-status", id: editTx.id, status: editStatus }),
      });
      setEditTx(null); router.refresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;
    await fetch("/api/admin/transactions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {["all", "approved", "pending", "rejected"].map((s) => (
            <button key={s} onClick={() => navigate({ status: s, page: "1" })}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                currentStatus === s ? "bg-reddit text-white shadow-btn" : "bg-surface-primary text-label-secondary hover:bg-surface-secondary border border-separator"
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s] ?? 0})
            </button>
          ))}
        </div>
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-tertiary" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate({ search: searchInput, page: "1" })}
            placeholder="Search..." className="input-field pl-9 text-[13px] w-56" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "User", "Type", "Amount", "Memo", "Status", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{t.id}</td>
                  <td className="px-4 py-3 text-[13px] text-label-primary">{t.email}</td>
                  <td className="px-4 py-3 text-[12px] text-label-secondary capitalize">{t.type}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{currencySymbol}{currencyFormat(t.amount)}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary max-w-[200px] truncate">{t.memo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[t.status] || statusColors[0]}`}>
                      {statusLabels[t.status] || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary whitespace-nowrap">{formatDate(t.created)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditTx(t); setEditStatus(String(t.status)); }} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors" title="Edit Status"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(t.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No transactions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-medium ${p === page ? "bg-reddit text-white shadow-btn" : "text-label-secondary hover:bg-surface-secondary border border-separator"}`}>{p}</button>
              );
            })}
            {page < totalPages && <button onClick={() => navigate({ page: String(page + 1) })} className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-label-secondary hover:bg-surface-secondary border border-separator">Next</button>}
          </div>
        </div>
      )}

      {editTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setEditTx(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">Edit Transaction #{editTx.id}</h3>
              <button onClick={() => setEditTx(null)} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label-text">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="select-field text-[13px]">
                  <option value="0">Pending</option>
                  <option value="1">Approved</option>
                  <option value="2">Rejected</option>
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px]">
                <Save className="h-4 w-4" />{saving ? "Saving..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
