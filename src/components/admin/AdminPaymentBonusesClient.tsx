"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";

interface Bonus {
  id: number; payment_id: number; paymentName: string; bonus_from: number; percentage: number; status: number;
}

export default function AdminPaymentBonusesClient({ bonuses, payments }: { bonuses: Bonus[]; payments: { id: number; name: string }[] }) {
  const router = useRouter();
  const [editBonus, setEditBonus] = useState<Bonus | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ payment_id: "", bonus_from: "0", percentage: "0", status: "1" });
  const [saving, setSaving] = useState(false);

  const openEdit = (b: Bonus) => {
    setIsNew(false); setEditBonus(b);
    setForm({ payment_id: String(b.payment_id), bonus_from: String(b.bonus_from), percentage: String(b.percentage), status: String(b.status) });
  };

  const openNew = () => { setIsNew(true); setEditBonus(null); setForm({ payment_id: "", bonus_from: "0", percentage: "0", status: "1" }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/payment-bonuses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isNew ? "create" : "update", id: editBonus?.id, ...form }),
      });
      setEditBonus(null); setIsNew(false); router.refresh();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this bonus?")) return;
    await fetch("/api/admin/payment-bonuses", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={openNew} className="btn-primary text-[13px] flex items-center gap-1.5 px-4 py-2">
          <Plus className="h-4 w-4" /> Add Bonus
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "Payment Method", "Bonus From", "Percentage", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bonuses.map((b) => (
                <tr key={b.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{b.id}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{b.paymentName}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">${b.bonus_from}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{b.percentage}%</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${b.status === 1 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-50 text-gray-500 border border-gray-100"}`}>
                      {b.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(b.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {bonuses.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No bonuses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editBonus || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setEditBonus(null); setIsNew(false); }}>
          <div className="w-full max-w-sm rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">{isNew ? "Add Bonus" : `Edit Bonus #${editBonus?.id}`}</h3>
              <button onClick={() => { setEditBonus(null); setIsNew(false); }} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label-text">Payment Method</label>
                <select value={form.payment_id} onChange={(e) => setForm({ ...form, payment_id: e.target.value })} className="select-field text-[13px]">
                  <option value="">Select...</option>
                  {payments.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label className="label-text">Bonus From ($)</label><input type="number" step="0.01" value={form.bonus_from} onChange={(e) => setForm({ ...form, bonus_from: e.target.value })} className="input-field text-[13px]" /></div>
              <div><label className="label-text">Percentage (%)</label><input type="number" step="0.01" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: e.target.value })} className="input-field text-[13px]" /></div>
              <div><label className="label-text">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field text-[13px]"><option value="1">Active</option><option value="0">Inactive</option></select></div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px] mt-2">
                <Save className="h-4 w-4" />{saving ? "Saving..." : isNew ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
