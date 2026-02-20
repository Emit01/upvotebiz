"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SnooAvatar } from "@/components/ui/RedditLogo";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", email: "", password: "", re_password: "", terms: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status === "error") { setError(data.message); }
      else { setSuccess(data.message || "Account created!"); setTimeout(() => router.push("/login"), 2000); }
    } catch { setError("An error occurred."); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <SnooAvatar size={48} className="mb-4" />
          <h1 className="text-title-1 text-label-primary">
            reddit<span className="text-reddit">panel</span>
          </h1>
          <p className="mt-1.5 text-callout text-label-secondary">Create your account</p>
        </div>

        <div className="card border border-separator p-7">
          {error && <div className="alert-error mb-4">{error}</div>}
          {success && <div className="alert-success mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="input-field" placeholder="John" />
              </div>
              <div>
                <label className="label-text">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="input-field" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="label-text">Confirm Password</label>
              <input type="password" name="re_password" value={formData.re_password} onChange={handleChange} className="input-field" placeholder="Re-enter password" />
            </div>
            <label className="flex items-start gap-2.5 pt-0.5">
              <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} className="mt-0.5 rounded border-separator text-reddit focus:ring-reddit/20" />
              <span className="text-[12px] text-label-secondary leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-reddit hover:text-reddit-hover">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="font-semibold text-reddit hover:text-reddit-hover">Privacy Policy</Link>
              </span>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-callout text-label-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-reddit hover:text-reddit-hover transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
