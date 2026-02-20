"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronUp, ChevronDown, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { currencyFormat } from "@/lib/utils";

interface Service {
  id: number; ids: string | null; name: string; cate_id: number | null;
  price: number; original_price: number; min: string; max: string;
  type: string; add_type: string; api_service_id: string;
  api_provider_id: number | null; providerName: string; status: number;
  desc: string; refill: number; dripfeed: number;
}

interface Props {
  grouped: Record<string, Service[]>;
  categories: { id: number; name: string }[];
  providers: { id: number; name: string }[];
  currentCategory: string;
  search: string;
  currencySymbol: string;
}

const defaultForm = {
  name: "", cate_id: "", min: "0", max: "0", price: "0", original_price: "0",
  desc: "", type: "default", add_type: "manual", api_provider_id: "", api_service_id: "",
  status: "1", refill: "0", dripfeed: "0",
};

export default function AdminServicesClient({ grouped, categories, providers, currentCategory, search, currencySymbol }: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editService, setEditService] = useState<Service | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { category: currentCategory, search, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all") sp.set(k, v); });
    router.push(`/admin/services?${sp.toString()}`);
  };

  const openEdit = (s: Service) => {
    setIsNew(false);
    setEditService(s);
    setForm({
      name: s.name, cate_id: String(s.cate_id ?? ""), min: s.min, max: s.max,
      price: String(s.price), original_price: String(s.original_price), desc: s.desc,
      type: s.type, add_type: s.add_type, api_provider_id: String(s.api_provider_id ?? ""),
      api_service_id: s.api_service_id, status: String(s.status), refill: String(s.refill), dripfeed: String(s.dripfeed),
    });
  };

  const openNew = () => {
    setIsNew(true);
    setEditService(null);
    setForm(defaultForm);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isNew ? "create" : "update", id: editService?.id, ...form }),
      });
      setEditService(null);
      setIsNew(false);
      router.refresh();
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: number) => {
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-status", id }),
    });
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={openNew} className="btn-primary text-[13px] flex items-center gap-1.5 px-4 py-2">
            <Plus className="h-4 w-4" /> Add New
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select value={currentCategory} onChange={(e) => navigate({ category: e.target.value })} className="select-field text-[13px] w-48">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-tertiary" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate({ search: searchInput })}
              placeholder="Search..." className="input-field pl-9 text-[13px] w-56" />
          </div>
        </div>
      </div>

      {/* Grouped Services */}
      {Object.entries(grouped).map(([catName, services]) => (
        <div key={catName} className="card overflow-hidden">
          <button
            onClick={() => setCollapsed((p) => ({ ...p, [catName]: !p[catName] }))}
            className="flex w-full items-center justify-between px-5 py-3 bg-surface-secondary/50 border-b border-separator hover:bg-surface-secondary transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-reddit" />
              <h4 className="text-[14px] font-semibold text-label-primary">{catName}</h4>
              <span className="text-[12px] text-label-tertiary">({services.length})</span>
            </div>
            {collapsed[catName] ? <ChevronDown className="h-4 w-4 text-label-tertiary" /> : <ChevronUp className="h-4 w-4 text-label-tertiary" />}
          </button>
          {!collapsed[catName] && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-separator bg-surface-secondary/30">
                    {["ID", "Name", "Provider", "Type", "Rate/1K", "Min/Max", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                      <td className="px-4 py-2.5 text-[13px] text-label-secondary">{s.id}</td>
                      <td className="px-4 py-2.5 text-[13px] font-medium text-label-primary max-w-[300px] truncate">{s.name}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-[12px] text-label-secondary">{s.add_type === "api" ? s.providerName || "API" : "Manual"}</p>
                        {s.api_service_id && <p className="text-[11px] text-label-tertiary">{s.api_service_id}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-label-secondary">{s.type}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-[13px] font-medium text-label-primary">{currencySymbol}{currencyFormat(s.price)}</p>
                        {s.original_price > 0 && (
                          <p className={`text-[11px] ${s.original_price > s.price ? "text-red-500" : "text-label-tertiary"}`}>
                            {currencySymbol}{currencyFormat(s.original_price)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-label-secondary">{s.min} / {s.max}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => handleToggle(s.id)} title="Toggle status">
                          {s.status === 1 ? (
                            <ToggleRight className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-label-tertiary" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="card p-12 text-center text-[13px] text-label-tertiary">No services found</div>
      )}

      {/* Add/Edit Modal */}
      {(editService || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setEditService(null); setIsNew(false); }}>
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">{isNew ? "Add Service" : `Edit Service #${editService?.id}`}</h3>
              <button onClick={() => { setEditService(null); setIsNew(false); }} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label-text">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-[13px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Category</label>
                  <select value={form.cate_id} onChange={(e) => setForm({ ...form, cate_id: e.target.value })} className="select-field text-[13px]">
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Type</label>
                  <select value={form.add_type} onChange={(e) => setForm({ ...form, add_type: e.target.value })} className="select-field text-[13px]">
                    <option value="manual">Manual</option>
                    <option value="api">API</option>
                  </select>
                </div>
              </div>
              {form.add_type === "api" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-text">Provider</label>
                    <select value={form.api_provider_id} onChange={(e) => setForm({ ...form, api_provider_id: e.target.value })} className="select-field text-[13px]">
                      <option value="">Select...</option>
                      {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">API Service ID</label>
                    <input value={form.api_service_id} onChange={(e) => setForm({ ...form, api_service_id: e.target.value })} className="input-field text-[13px]" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Price per 1K</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field text-[13px]" />
                </div>
                <div>
                  <label className="label-text">Original Price per 1K</label>
                  <input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="input-field text-[13px]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Min</label>
                  <input value={form.min} onChange={(e) => setForm({ ...form, min: e.target.value })} className="input-field text-[13px]" />
                </div>
                <div>
                  <label className="label-text">Max</label>
                  <input value={form.max} onChange={(e) => setForm({ ...form, max: e.target.value })} className="input-field text-[13px]" />
                </div>
              </div>
              <div>
                <label className="label-text">Service Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-field text-[13px]">
                  <option value="default">Default</option>
                  <option value="custom_comments">Custom Comments</option>
                  <option value="custom_comments_package">Custom Comments Package</option>
                  <option value="package">Package</option>
                  <option value="subscriptions">Subscriptions</option>
                </select>
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={3} className="input-field text-[13px]" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label-text">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field text-[13px]">
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Refill</label>
                  <select value={form.refill} onChange={(e) => setForm({ ...form, refill: e.target.value })} className="select-field text-[13px]">
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Dripfeed</label>
                  <select value={form.dripfeed} onChange={(e) => setForm({ ...form, dripfeed: e.target.value })} className="select-field text-[13px]">
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px] mt-2">
                <Save className="h-4 w-4" />{saving ? "Saving..." : isNew ? "Create Service" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
