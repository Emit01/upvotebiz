"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, DollarSign, Key, Eye } from "lucide-react";
import { formatDate, currencyFormat } from "@/lib/utils";

interface User {
  id: number; ids: string; email: string; first_name: string; last_name: string;
  balance: number; status: number; created: string;
}

interface Props {
  users: User[]; total: number; page: number; pageSize: number;
  statusCounts: Record<string, number>; currentStatus: string; search: string; currencySymbol: string;
}

type ModalType = null | "edit" | "add-funds" | "set-password" | "create";

export default function AdminUsersClient({ users, total, page, pageSize, statusCounts, currentStatus, search, currencySymbol }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "", status: "1" });
  const [fundsAmount, setFundsAmount] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createForm, setCreateForm] = useState({ email: "", password: "", first_name: "", last_name: "" });
  const totalPages = Math.ceil(total / pageSize);

  const navigate = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { status: currentStatus, search, page: String(page), ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== "all" && v !== "1") sp.set(k, v); });
    if (merged.status !== "all") sp.set("status", merged.status);
    router.push(`/admin/users?${sp.toString()}`);
  }, [currentStatus, search, page, router]);

  const openEdit = (u: User) => {
    setSelectedUser(u); setModal("edit");
    setEditForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, status: String(u.status) });
  };

  const openAddFunds = (u: User) => { setSelectedUser(u); setModal("add-funds"); setFundsAmount(""); };
  const openSetPassword = (u: User) => { setSelectedUser(u); setModal("set-password"); setNewPassword(""); };

  const apiCall = async (body: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.ok) { setModal(null); setSelectedUser(null); router.refresh(); }
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: number) => {
    await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-status", id }),
    });
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Status Tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {["all", "active", "inactive"].map((s) => (
            <button key={s} onClick={() => navigate({ status: s, page: "1" })}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                currentStatus === s ? "bg-reddit text-white shadow-btn" : "bg-surface-primary text-label-secondary hover:bg-surface-secondary border border-separator"
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s] ?? 0})
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => { setModal("create"); setCreateForm({ email: "", password: "", first_name: "", last_name: "" }); }}
            className="btn-primary text-[13px] flex items-center gap-1.5 px-4 py-2"><Plus className="h-4 w-4" /> Add User</button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-label-tertiary" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate({ search: searchInput, page: "1" })}
              placeholder="Search..." className="input-field pl-9 text-[13px] w-56" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["#", "User", "Balance", "Created", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{(page - 1) * pageSize + i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-label-primary">{u.first_name} {u.last_name}</p>
                    <p className="text-[12px] text-label-tertiary">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{currencySymbol}{currencyFormat(u.balance)}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary whitespace-nowrap">{formatDate(u.created)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(u.id)}>
                      {u.status === 1 ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-label-tertiary" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors" title="Edit"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => openAddFunds(u)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-emerald-500 transition-colors" title="Add Funds"><DollarSign className="h-3.5 w-3.5" /></button>
                      <button onClick={() => openSetPassword(u)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-blue-500 transition-colors" title="Set Password"><Key className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(u.id)} className="rounded-lg p-1.5 text-label-tertiary hover:bg-surface-secondary hover:text-red-500 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No users found</td></tr>
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

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-surface-primary border border-separator shadow-float p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-headline text-label-primary">
                {modal === "edit" && `Edit User: ${selectedUser?.email}`}
                {modal === "add-funds" && `Add Funds: ${selectedUser?.email}`}
                {modal === "set-password" && `Set Password: ${selectedUser?.email}`}
                {modal === "create" && "Create New User"}
              </h3>
              <button onClick={() => setModal(null)} className="text-label-tertiary hover:text-label-primary"><X className="h-5 w-5" /></button>
            </div>

            {modal === "edit" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-text">First Name</label><input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} className="input-field text-[13px]" /></div>
                  <div><label className="label-text">Last Name</label><input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} className="input-field text-[13px]" /></div>
                </div>
                <div><label className="label-text">Email</label><input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field text-[13px]" /></div>
                <div><label className="label-text">Status</label><select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="select-field text-[13px]"><option value="1">Active</option><option value="0">Inactive</option></select></div>
                <button onClick={() => apiCall({ action: "update", id: selectedUser?.id, ...editForm })} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px]"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save"}</button>
              </div>
            )}

            {modal === "add-funds" && (
              <div className="space-y-3">
                <div><label className="label-text">Amount</label><input type="number" step="0.01" value={fundsAmount} onChange={(e) => setFundsAmount(e.target.value)} className="input-field text-[13px]" placeholder="0.00" /></div>
                <button onClick={() => apiCall({ action: "add-funds", id: selectedUser?.id, amount: fundsAmount })} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px]"><DollarSign className="h-4 w-4" />{saving ? "Adding..." : "Add Funds"}</button>
              </div>
            )}

            {modal === "set-password" && (
              <div className="space-y-3">
                <div><label className="label-text">New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field text-[13px]" /></div>
                <button onClick={() => apiCall({ action: "set-password", id: selectedUser?.id, password: newPassword })} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px]"><Key className="h-4 w-4" />{saving ? "Updating..." : "Set Password"}</button>
              </div>
            )}

            {modal === "create" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-text">First Name</label><input value={createForm.first_name} onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })} className="input-field text-[13px]" /></div>
                  <div><label className="label-text">Last Name</label><input value={createForm.last_name} onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })} className="input-field text-[13px]" /></div>
                </div>
                <div><label className="label-text">Email</label><input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="input-field text-[13px]" /></div>
                <div><label className="label-text">Password</label><input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="input-field text-[13px]" /></div>
                <button onClick={() => apiCall({ action: "create", ...createForm })} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px]"><Plus className="h-4 w-4" />{saving ? "Creating..." : "Create User"}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
