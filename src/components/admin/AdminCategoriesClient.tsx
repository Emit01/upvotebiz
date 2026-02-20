"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Category {
  id: number; ids: string; name: string; sort: number; status: number; serviceCount: number; created: string;
}

export default function AdminCategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ name: "", sort: "0", status: "1" });
  const [saving, setSaving] = useState(false);

  const openEdit = (c: Category) => {
    setIsNew(false);
    setEditCat(c);
    setForm({ name: c.name, sort: String(c.sort), status: String(c.status) });
  };

  const openNew = () => { setIsNew(true); setEditCat(null); setForm({ name: "", sort: "0", status: "1" }); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isNew ? "create" : "update", id: editCat?.id, ...form }),
      });
      setEditCat(null); setIsNew(false); router.refresh();
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: number) => {
    await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-status", id }),
    });
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={openNew} className="btn-primary text-[13px] flex items-center gap-1.5 px-4 py-2">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["#", "Name", "Sort", "Services", "Status", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{i + 1}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{c.name}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">
                    <div className="flex items-center gap-1"><GripVertical className="h-3.5 w-3.5 text-label-tertiary" />{c.sort}</div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{c.serviceCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(c.id)}>
                      {c.status === 1 ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-label-tertiary" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary">{formatDate(c.created)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editCat || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setEditCat(null); setIsNew(false); }}>
          <div className="w-full max-w-sm rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">{isNew ? "Add Category" : `Edit: ${editCat?.name}`}</h3>
              <button onClick={() => { setEditCat(null); setIsNew(false); }} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="label-text">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-[13px]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-text">Sort Order</label><input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })} className="input-field text-[13px]" /></div>
                <div><label className="label-text">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field text-[13px]"><option value="1">Active</option><option value="0">Inactive</option></select></div>
              </div>
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
