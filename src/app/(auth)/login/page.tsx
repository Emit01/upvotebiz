"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SnooAvatar } from "@/components/ui/RedditLogo";

export default function LoginPage() {
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
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError(result.error); }
      else { router.push("/statistics"); router.refresh(); }
    } catch { setError("An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <SnooAvatar size={48} className="mb-4" />
          <h1 className="text-title-1 text-label-primary">
            reddit<span className="text-reddit">panel</span>
          </h1>
          <p className="mt-1.5 text-callout text-label-secondary">Sign in to your account</p>
        </div>

        <div className="card border border-separator p-7">
          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Enter your password" />
            </div>
            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-[12px] font-semibold text-reddit hover:text-reddit-hover transition-colors">
                Forgot password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-callout text-label-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-reddit hover:text-reddit-hover transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
