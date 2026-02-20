"use client";

import { useState } from "react";

interface UserProfile {
  first_name: string; last_name: string; email: string; timezone: string;
  api_key: string; website: string; phone: string; skype_id: string;
}

export default function ProfileForm({ user }: { user: UserProfile }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name, last_name: user.last_name, email: user.email,
    timezone: user.timezone, password: "", re_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [apiKey, setApiKey] = useState(user.api_key);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status === "error") { setMessage({ type: "error", text: data.message }); }
      else {
        setMessage({ type: "success", text: data.message || "Updated successfully" });
        setFormData((prev) => ({ ...prev, password: "", re_password: "" }));
      }
    } catch { setMessage({ type: "error", text: "An error occurred" }); }
    finally { setLoading(false); }
  };

  const regenerateApiKey = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/profile/api-key", { method: "POST" });
      const data = await res.json();
      if (data.status === "success") setApiKey(data.api_key);
    } catch {}
    setRegenerating(false);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-6">
        <h3 className="mb-5 text-headline text-label-primary">Account Information</h3>

        {message && (
          <div className={`mb-5 ${message.type === "error" ? "alert-error" : "alert-success"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label-text">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label-text">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-text">Timezone</label>
            <input type="text" name="timezone" value={formData.timezone} onChange={handleChange} className="input-field" placeholder="e.g. UTC, America/New_York" />
          </div>

          <div className="border-t border-separator pt-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-label-tertiary">Change Password</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">New Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="label-text">Confirm</label>
                <input type="password" name="re_password" value={formData.re_password} onChange={handleChange} className="input-field" placeholder="Re-enter" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="mb-4 text-headline text-label-primary">API Key</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-surface-secondary border border-separator px-4 py-3">
              <code className="flex-1 break-all text-[12px] text-label-primary font-mono leading-relaxed">{apiKey}</code>
            </div>
            <div className="flex gap-2">
              <button onClick={copyApiKey} className="btn-ghost text-[12px]">
                {copied ? "Copied!" : "Copy Key"}
              </button>
              <button onClick={regenerateApiKey} disabled={regenerating} className="btn-ghost text-[12px] text-reddit">
                {regenerating ? "Regenerating..." : "Regenerate"}
              </button>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-headline text-label-primary">Additional Info</h3>
          <div className="space-y-1.5">
            {[
              { label: "Website", value: user.website },
              { label: "Phone", value: user.phone },
              { label: "Skype ID", value: user.skype_id },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors hover:bg-surface-secondary">
                <span className="text-callout text-label-secondary">{item.label}</span>
                <span className="text-callout font-semibold text-label-primary">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
