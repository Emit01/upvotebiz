"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Check, User } from "lucide-react";

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const staffId = (session?.user as any)?.staffId;
  const [form, setForm] = useState({
    first_name: (session?.user as any)?.firstName || "",
    last_name: (session?.user as any)?.lastName || "",
    email: session?.user?.email || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (form.new_password && form.new_password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, ...form }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setForm((f) => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
      } else {
        setError(data.error || "Failed to update");
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-reddit/10">
            <User className="h-6 w-6 text-reddit" />
          </div>
          <div>
            <h3 className="text-headline text-label-primary">Admin Profile</h3>
            <p className="text-[12px] text-label-tertiary">Manage your account details</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-callout text-red-500">{error}</div>}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">First Name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input-field text-[13px]" />
            </div>
            <div>
              <label className="label-text">Last Name</label>
              <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input-field text-[13px]" />
            </div>
          </div>
          <div>
            <label className="label-text">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-[13px]" />
          </div>

          <hr className="border-separator" />

          <p className="text-[13px] font-medium text-label-primary">Change Password</p>
          <div>
            <label className="label-text">Current Password</label>
            <input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} className="input-field text-[13px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">New Password</label>
              <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} className="input-field text-[13px]" />
            </div>
            <div>
              <label className="label-text">Confirm Password</label>
              <input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} className="input-field text-[13px]" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 text-[13px] mt-2">
            {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" />{saving ? "Saving..." : "Update Profile"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
