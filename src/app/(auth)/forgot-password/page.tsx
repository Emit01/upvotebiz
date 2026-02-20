"use client";

import { useState } from "react";
import Link from "next/link";
import { SnooAvatar } from "@/components/ui/RedditLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.status === "error") {
        setError(data.message);
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <SnooAvatar size={48} className="mb-4" />
          <h1 className="text-title-1 text-label-primary">
            reddit<span className="text-reddit">panel</span>
          </h1>
          <p className="mt-1.5 text-callout text-label-secondary">Reset your password</p>
        </div>

        <div className="card border border-separator p-7">
          {error && <div className="alert-error mb-4">{error}</div>}
          {success && <div className="alert-success mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-callout text-label-secondary">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-reddit hover:text-reddit-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
