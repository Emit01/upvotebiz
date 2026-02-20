"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "signin" | "signup";

export function AuthModal({
  isOpen,
  onClose,
  initialTab = "signin",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: Tab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [re_password, setRePassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const resetForm = () => {
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setRePassword("");
    setTerms(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError(result.error);
      else {
        handleClose();
        router.push("/statistics");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
          re_password,
          terms,
        }),
      });
      const data = await res.json();
      if (data.status === "error") setError(data.message);
      else {
        setSuccess(data.message || "Account created! Sign in below.");
        setTab("signin");
        setPassword("");
        setRePassword("");
        setFirstName("");
        setLastName("");
      }
    } catch {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-2xl bg-white shadow-xl font-apple text-[#1d1d1f]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[#d2d2d7]/60 px-6 pt-6 pb-4">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-[22px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">
            Upvote<span className="text-[#0071e3]">Biz</span>
          </h2>
          <p className="mt-0.5 text-[12px] text-[#6e6e73]">Social media growth</p>
          {/* Tabs */}
          <div className="mt-4 flex gap-0 rounded-lg bg-[#f5f5f7] p-0.5">
            <button
              type="button"
              onClick={() => { setTab("signin"); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-md py-2 text-[12px] font-medium transition-colors ${tab === "signin" ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("signup"); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-md py-2 text-[12px] font-medium transition-colors ${tab === "signup" ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-[12px] text-red-600">{error}</div>}
          {success && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-[12px] text-emerald-700">{success}</div>}

          {tab === "signin" ? (
            <>
              <h3 className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">Welcome back</h3>
              <p className="mt-0.5 text-[12px] text-[#6e6e73] mb-4">Sign in to your account</p>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 pr-9 text-[14px] text-[#1d1d1f] placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      placeholder="Enter your password"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6e6e73] hover:text-[#1d1d1f] p-1">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link href="/forgot-password" onClick={handleClose} className="text-[12px] font-medium text-[#0071e3] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-full bg-[#0071e3] py-2.5 text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3 className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f]">Create account</h3>
              <p className="mt-0.5 text-[12px] text-[#6e6e73] mb-4">Join thousands of satisfied customers</p>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">First name</label>
                    <input type="text" value={first_name} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-[14px] placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20" placeholder="First name" required />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Last name</label>
                    <input type="text" value={last_name} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-[14px] placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20" placeholder="Last name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-[14px] placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20" placeholder="Enter your email" required />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 pr-9 text-[14px] placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20" placeholder="Create a password" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6e6e73] hover:text-[#1d1d1f] p-1">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1d1d1f] mb-1">Confirm password</label>
                  <div className="relative">
                    <input type={showRePassword ? "text" : "password"} value={re_password} onChange={(e) => setRePassword(e.target.value)} className="w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 pr-9 text-[14px] placeholder:text-[#6e6e73] focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20" placeholder="Confirm your password" required minLength={6} />
                    <button type="button" onClick={() => setShowRePassword(!showRePassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6e6e73] hover:text-[#1d1d1f] p-1">
                      {showRePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20" required />
                  <span className="text-[11px] text-[#6e6e73]">
                    I agree to the <Link href="/terms" onClick={handleClose} className="text-[#0071e3] hover:underline">Terms</Link> and <Link href="/privacy" onClick={handleClose} className="text-[#0071e3] hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                <button type="submit" disabled={loading} className="w-full rounded-full bg-[#0071e3] py-2.5 text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Eye({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}
