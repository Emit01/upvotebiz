"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, RefreshCw, Layers } from "lucide-react";
import { currencyFormat, formatDate } from "@/lib/utils";

interface Provider {
  id: number; name: string; url: string; api_key: string; type: string;
  balance: number; status: number; description: string;
  serviceCount: number; created: string;
}

const defaultForm = { name: "", url: "", api_key: "", type: "standard", status: "1", description: "" };

export default function AdminProvidersClient({ providers }: { providers: Provider[] }) {
  const router = useRouter();
  const [editProvider, setEditProvider] = useState<Provider | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState<number | null>(null);

  const openEdit = (p: Provider) => {
    setIsNew(false); setEditProvider(p);
    setForm({ name: p.name, url: p.url, api_key: p.api_key, type: p.type, status: String(p.status), description: p.description });
  };

  const openNew = () => { setIsNew(true); setEditProvider(null); setForm(defaultForm); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/providers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isNew ? "create" : "update", id: editProvider?.id, ...form }),
      });
      setEditProvider(null); setIsNew(false); router.refresh();
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: number) => {
    await fetch("/api/admin/providers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-status", id }),
    });
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this provider?")) return;
    await fetch("/api/admin/providers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  };

  const handleCheckBalance = async (id: number) => {
    setCheckingBalance(id);
    await fetch("/api/admin/providers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check-balance", id }),
    });
    setCheckingBalance(null);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={openNew} className="btn-primary text-[13px] flex items-center gap-1.5 px-4 py-2">
          <Plus className="h-4 w-4" /> Add Provider
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "Name", "URL", "Balance", "Services", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{p.id}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{p.name}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary max-w-[200px] truncate">{p.url}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">${currencyFormat(p.balance)}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{p.serviceCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(p.id)}>
                      {p.status === 1 ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-label-tertiary" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleCheckBalance(p.id)} disabled={checkingBalance === p.id}
                        className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-emerald-500 transition-colors" title="Check Balance">
                        <RefreshCw className={`h-3.5 w-3.5 ${checkingBalance === p.id ? "animate-spin" : ""}`} />
                      </button>
                      <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors" title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No providers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editProvider || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setEditProvider(null); setIsNew(false); }}>
          <div className="w-full max-w-lg rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">{isNew ? "Add Provider" : `Edit: ${editProvider?.name}`}</h3>
              <button onClick={() => { setEditProvider(null); setIsNew(false); }} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label-text">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-[13px]" /></div>
              <div><label className="label-text">API URL</label><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input-field text-[13px]" placeholder="https://..." /></div>
              <div><label className="label-text">API Key</label><input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} className="input-field text-[13px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Type</label><input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field text-[13px]" /></div>
                <div><label className="label-text">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field text-[13px]"><option value="1">Active</option><option value="0">Inactive</option></select></div>
              </div>
              <div><label className="label-text">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field text-[13px]" /></div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px] mt-2">
                <Save className="h-4 w-4" />{saving ? "Saving..." : isNew ? "Create Provider" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
