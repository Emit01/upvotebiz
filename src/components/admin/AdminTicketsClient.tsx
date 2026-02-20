"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Trash2, Eye, Circle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Ticket {
  id: number; subject: string; email: string; status: string; admin_read: number; created: string;
}

interface Props {
  tickets: Ticket[]; total: number; page: number; pageSize: number;
  statuses: string[]; statusCounts: Record<string, number>; currentStatus: string; search: string;
}

const ticketStatusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border border-amber-100",
  answered: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  closed: "bg-gray-50 text-gray-500 border border-gray-100",
};

export default function AdminTicketsClient({ tickets, total, page, pageSize, statuses, statusCounts, currentStatus, search }: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search);
  const totalPages = Math.ceil(total / pageSize);

  const navigate = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { status: currentStatus, search, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all" && v !== "1") sp.set(k, v); });
    if (merged.status !== "all") sp.set("status", merged.status);
    router.push(`/admin/tickets?${sp.toString()}`);
  }, [currentStatus, search, page, router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this ticket and all messages?")) return;
    await fetch("/api/admin/tickets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {statuses.map((s) => (
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
            placeholder="Search by subject or ID..." className="input-field pl-9 text-[13px] w-56" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "User", "Subject", "Status", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className={`border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors ${t.admin_read === 0 ? "bg-reddit/[0.02]" : ""}`}>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">
                    <div className="flex items-center gap-1.5">
                      {t.admin_read === 0 && <Circle className="h-2 w-2 fill-reddit text-reddit" />}
                      {t.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-label-primary">{t.email}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{t.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ticketStatusColors[t.status] || ticketStatusColors.pending}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary whitespace-nowrap">{formatDate(t.created)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/tickets/${t.id}`} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button onClick={() => handleDelete(t.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No tickets found</td></tr>
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
    </div>
  );
}
