"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface NewsItem {
  id: number; type: string; description: string; status: number; expiry: string; created: string;
}

export default function AdminNewsClient({ news }: { news: NewsItem[] }) {
  const router = useRouter();
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ type: "info", description: "", status: "1" });
  const [saving, setSaving] = useState(false);

  const apiCall = async (body: any) => {
    setSaving(true);
    try {
      await fetch("/api/admin/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setEditItem(null); setIsNew(false); router.refresh();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <button onClick={() => { setIsNew(true); setEditItem(null); setForm({ type: "info", description: "", status: "1" }); }}
        className="btn-primary text-[13px] flex items-center gap-1.5 px-4 py-2"><Plus className="h-4 w-4" /> Add News</button>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "Type", "Description", "Status", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {news.map((n) => (
                <tr key={n.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{n.id}</td>
                  <td className="px-4 py-3 text-[13px] text-label-primary capitalize">{n.type}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary max-w-[300px] truncate">{n.description}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => apiCall({ action: "toggle-status", id: n.id })}>
                      {n.status === 1 ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-label-tertiary" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary">{formatDate(n.created)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditItem(n); setIsNew(false); setForm({ type: n.type, description: n.description, status: String(n.status) }); }}
                        className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { if (confirm("Delete?")) apiCall({ action: "delete", id: n.id }); }}
                        className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {news.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No news items</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {(editItem || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setEditItem(null); setIsNew(false); }}>
          <div className="w-full max-w-md rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">{isNew ? "Add News" : "Edit News"}</h3>
              <button onClick={() => { setEditItem(null); setIsNew(false); }} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label-text">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-field text-[13px]">
                  <option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="danger">Danger</option>
                </select>
              </div>
              <div><label className="label-text">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input-field text-[13px]" /></div>
              <div><label className="label-text">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field text-[13px]"><option value="1">Active</option><option value="0">Inactive</option></select></div>
              <button onClick={() => apiCall({ action: isNew ? "create" : "update", id: editItem?.id, ...form })} disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 text-[13px] mt-2">
                <Save className="h-4 w-4" />{saving ? "Saving..." : isNew ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
