"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";

interface Faq { id: number; question: string; answer: string; sort: number; status: number; }

export default function AdminFaqsClient({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [editFaq, setEditFaq] = useState<Faq | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", sort: "0", status: "1" });
  const [saving, setSaving] = useState(false);

  const apiCall = async (body: any) => {
    setSaving(true);
    try {
      await fetch("/api/admin/faqs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setEditFaq(null); setIsNew(false); router.refresh();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <button onClick={() => { setIsNew(true); setEditFaq(null); setForm({ question: "", answer: "", sort: "0", status: "1" }); }}
        className="btn-primary text-[13px] flex items-center gap-1.5 px-4 py-2"><Plus className="h-4 w-4" /> Add FAQ</button>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["Sort", "Question", "Answer", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary"><div className="flex items-center gap-1"><GripVertical className="h-3.5 w-3.5 text-label-tertiary" />{f.sort}</div></td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary max-w-[300px] truncate">{f.question}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary max-w-[300px] truncate">{f.answer}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => apiCall({ action: "toggle-status", id: f.id })}>
                      {f.status === 1 ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-label-tertiary" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditFaq(f); setIsNew(false); setForm({ question: f.question, answer: f.answer, sort: String(f.sort), status: String(f.status) }); }}
                        className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { if (confirm("Delete?")) apiCall({ action: "delete", id: f.id }); }}
                        className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No FAQs</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {(editFaq || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setEditFaq(null); setIsNew(false); }}>
          <div className="w-full max-w-lg rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">{isNew ? "Add FAQ" : "Edit FAQ"}</h3>
              <button onClick={() => { setEditFaq(null); setIsNew(false); }} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label-text">Question</label><input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="input-field text-[13px]" /></div>
              <div><label className="label-text">Answer</label><textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={5} className="input-field text-[13px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Sort</label><input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} className="input-field text-[13px]" /></div>
                <div><label className="label-text">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field text-[13px]"><option value="1">Active</option><option value="0">Inactive</option></select></div>
              </div>
              <button onClick={() => apiCall({ action: isNew ? "create" : "update", id: editFaq?.id, ...form })} disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 text-[13px] mt-2"><Save className="h-4 w-4" />{saving ? "Saving..." : isNew ? "Create" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
