"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SnooAvatar } from "@/components/ui/RedditLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) { setError("Email is required"); setLoading(false); return; }
    if (!password) { setError("Password is required"); setLoading(false); return; }

    try {
      const result = await signIn("admin-credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin/statistics",
      });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin/statistics");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dark px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <SnooAvatar size={48} className="mb-4" />
          <h1 className="text-title-1 text-white">
            Admin Panel
          </h1>
          <p className="mt-1.5 text-callout text-white/50">Sign in to manage your panel</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-7 backdrop-blur-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-callout text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-white/50 mb-1.5 uppercase tracking-[0.04em]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-[14px] text-white placeholder:text-white/30 transition-all focus:border-reddit focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,69,0,0.15)]"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-white/50 mb-1.5 uppercase tracking-[0.04em]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-[14px] text-white placeholder:text-white/30 transition-all focus:border-reddit focus:outline-none focus:ring-[3px] focus:ring-[rgba(255,69,0,0.15)]"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-reddit px-6 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-reddit-hover active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none shadow-btn mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
