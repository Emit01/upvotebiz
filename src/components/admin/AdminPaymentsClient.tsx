"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { currencyFormat } from "@/lib/utils";

interface Payment {
  id: number; name: string; min: number; max: number; new_users: number;
  params: string; status: number;
}

const defaultForm = { name: "", min: "0", max: "0", new_users: "0", params: "", status: "1" };

export default function AdminPaymentsClient({ payments }: { payments: Payment[] }) {
  const router = useRouter();
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const openEdit = (p: Payment) => {
    setIsNew(false); setEditPayment(p);
    setForm({ name: p.name, min: String(p.min), max: String(p.max), new_users: String(p.new_users), params: p.params, status: String(p.status) });
  };

  const openNew = () => { setIsNew(true); setEditPayment(null); setForm(defaultForm); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isNew ? "create" : "update", id: editPayment?.id, ...form }),
      });
      setEditPayment(null); setIsNew(false); router.refresh();
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: number) => {
    await fetch("/api/admin/payments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-status", id }),
    });
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this payment method?")) return;
    await fetch("/api/admin/payments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={openNew} className="btn-primary text-[13px] flex items-center gap-1.5 px-4 py-2">
          <Plus className="h-4 w-4" /> Add Payment Method
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "Name", "Min", "Max", "New Users", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{p.id}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{p.name}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">${currencyFormat(p.min)}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">${currencyFormat(p.max)}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{p.new_users ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(p.id)}>
                      {p.status === 1 ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-label-tertiary" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No payment methods found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editPayment || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setEditPayment(null); setIsNew(false); }}>
          <div className="w-full max-w-md rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">{isNew ? "Add Payment Method" : `Edit: ${editPayment?.name}`}</h3>
              <button onClick={() => { setEditPayment(null); setIsNew(false); }} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label-text">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-[13px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Min Amount</label><input type="number" step="0.01" value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} className="input-field text-[13px]" /></div>
                <div><label className="label-text">Max Amount</label><input type="number" step="0.01" value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} className="input-field text-[13px]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">New Users Only</label><select value={form.new_users} onChange={(e) => setForm({ ...form, new_users: e.target.value })} className="select-field text-[13px]"><option value="0">No</option><option value="1">Yes</option></select></div>
                <div><label className="label-text">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field text-[13px]"><option value="1">Active</option><option value="0">Inactive</option></select></div>
              </div>
              <div><label className="label-text">Params (JSON)</label><textarea value={form.params} onChange={(e) => setForm({ ...form, params: e.target.value })} rows={4} className="input-field text-[13px] font-mono" /></div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px] mt-2">
                <Save className="h-4 w-4" />{saving ? "Saving..." : isNew ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
