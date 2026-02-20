"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check } from "lucide-react";

const TABS = [
  { key: "website", label: "Website" },
  { key: "currency", label: "Currency" },
  { key: "email", label: "Email" },
  { key: "email_template", label: "Email Templates" },
  { key: "template", label: "Template" },
  { key: "terms", label: "Terms & Policy" },
  { key: "cookie", label: "Cookie Policy" },
  { key: "affiliates", label: "Affiliates" },
  { key: "other", label: "Other" },
];

const TAB_FIELDS: Record<string, { key: string; label: string; type: "text" | "textarea" | "select"; options?: string[] }[]> = {
  website: [
    { key: "website_name", label: "Website Name", type: "text" },
    { key: "website_description", label: "Description", type: "textarea" },
    { key: "website_keywords", label: "Keywords", type: "text" },
    { key: "website_url", label: "Website URL", type: "text" },
    { key: "website_logo", label: "Logo URL", type: "text" },
    { key: "website_favicon", label: "Favicon URL", type: "text" },
    { key: "signup_enabled", label: "Signup Enabled", type: "select", options: ["1", "0"] },
    { key: "captcha_type", label: "Captcha Type", type: "text" },
    { key: "recaptcha_site_key", label: "reCAPTCHA Site Key", type: "text" },
    { key: "recaptcha_secret_key", label: "reCAPTCHA Secret Key", type: "text" },
  ],
  currency: [
    { key: "currency_code", label: "Currency Code", type: "text" },
    { key: "currency_symbol", label: "Currency Symbol", type: "text" },
    { key: "currency_position", label: "Symbol Position", type: "select", options: ["left", "right"] },
  ],
  email: [
    { key: "email_type", label: "Email Type", type: "select", options: ["smtp", "php"] },
    { key: "smtp_host", label: "SMTP Host", type: "text" },
    { key: "smtp_port", label: "SMTP Port", type: "text" },
    { key: "smtp_username", label: "SMTP Username", type: "text" },
    { key: "smtp_password", label: "SMTP Password", type: "text" },
    { key: "smtp_encryption", label: "SMTP Encryption", type: "select", options: ["tls", "ssl", "none"] },
    { key: "email_from", label: "From Email", type: "text" },
    { key: "email_from_name", label: "From Name", type: "text" },
  ],
  email_template: [
    { key: "email_template_welcome", label: "Welcome Email", type: "textarea" },
    { key: "email_template_password_reset", label: "Password Reset", type: "textarea" },
    { key: "email_template_ticket_reply", label: "Ticket Reply", type: "textarea" },
    { key: "email_template_payment_confirmation", label: "Payment Confirmation", type: "textarea" },
  ],
  template: [
    { key: "template_theme", label: "Theme", type: "text" },
    { key: "template_primary_color", label: "Primary Color", type: "text" },
    { key: "homepage_enabled", label: "Homepage Enabled", type: "select", options: ["1", "0"] },
  ],
  terms: [
    { key: "terms_of_service", label: "Terms of Service", type: "textarea" },
    { key: "privacy_policy", label: "Privacy Policy", type: "textarea" },
  ],
  cookie: [
    { key: "cookie_policy_enabled", label: "Cookie Policy Enabled", type: "select", options: ["1", "0"] },
    { key: "cookie_policy_content", label: "Cookie Policy Content", type: "textarea" },
  ],
  affiliates: [
    { key: "affiliate_enabled", label: "Affiliates Enabled", type: "select", options: ["1", "0"] },
    { key: "affiliate_percentage", label: "Affiliate Percentage (%)", type: "text" },
    { key: "affiliate_min_payout", label: "Minimum Payout", type: "text" },
  ],
  other: [
    { key: "auto_order_processing", label: "Auto Order Processing", type: "select", options: ["1", "0"] },
    { key: "order_min_interval", label: "Order Min Interval (seconds)", type: "text" },
    { key: "api_enabled", label: "API Enabled", type: "select", options: ["1", "0"] },
    { key: "ip_blocking", label: "IP Blocking", type: "textarea" },
  ],
};

export default function AdminSettingsClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("website");
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields = TAB_FIELDS[activeTab];
      const toSave: Record<string, string> = {};
      for (const f of fields) toSave[f.key] = settings[f.key] ?? "";
      await fetch("/api/admin/settings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: toSave }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const fields = TAB_FIELDS[activeTab] || [];

  return (
    <div className="flex gap-6">
      {/* Tab Navigation */}
      <div className="w-48 shrink-0">
        <nav className="card p-2 space-y-0.5 sticky top-20">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                activeTab === tab.key ? "bg-reddit/[0.06] text-reddit" : "text-label-secondary hover:bg-surface-secondary hover:text-label-primary"
              }`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-headline text-label-primary">{TABS.find((t) => t.key === activeTab)?.label} Settings</h3>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-[13px] px-5 py-2">
              {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" />{saving ? "Saving..." : "Save Changes"}</>}
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="label-text">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    value={settings[field.key] ?? ""}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    rows={field.key.includes("policy") || field.key.includes("terms") ? 8 : 3}
                    className="input-field text-[13px]"
                  />
                ) : field.type === "select" ? (
                  <select
                    value={settings[field.key] ?? ""}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    className="select-field text-[13px]"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt === "1" ? "Enabled" : opt === "0" ? "Disabled" : opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={settings[field.key] ?? ""}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    className="input-field text-[13px]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
