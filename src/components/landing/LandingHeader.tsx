"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/api", label: "API" },
  { href: "/explore", label: "Services" },
];

export function LandingHeader({
  onSignInClick,
  onGetStartedClick,
}: {
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
} = {}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-11 bg-[#fbfbfd]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#fbfbfd]/70 border-b border-[#d2d2d7]/70 dark:border-[var(--separator)]">
      <div className="flex h-full w-full items-center justify-between pl-6 pr-6">
        {/* Left corner: Logo + UpvoteBiz */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 ml-0">
          <Image src="/images/landing/snoo-logo.png" alt="" width={28} height={28} className="object-contain" />
          <span className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-[var(--label-primary)]">
            Upvote<span className="text-[#0071e3] dark:text-[var(--accent)]">Biz</span>
          </span>
        </Link>

        {/* Nav - center */}
        <nav className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[12px] font-normal text-[#1d1d1f] dark:text-[var(--label-primary)] transition-colors hover:text-[#0071e3] dark:hover:text-[var(--accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right corner: Sign In, Get Started, Theme */}
        <div className="flex items-center gap-5 flex-shrink-0 mr-0">
          {onSignInClick ? (
            <button type="button" onClick={onSignInClick} className="text-[12px] font-normal text-[#1d1d1f] transition-colors hover:text-[#0071e3]">
              Sign In
            </button>
          ) : (
            <Link href="/login" className="text-[12px] font-normal text-[#1d1d1f] transition-colors hover:text-[#0071e3]">
              Sign In
            </Link>
          )}
          {onGetStartedClick ? (
            <button type="button" onClick={onGetStartedClick} className="rounded-full bg-[#0071e3] px-4 py-1.5 text-[12px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]">
              Get Started
            </button>
          ) : (
            <Link href="/signup" className="rounded-full bg-[#0071e3] px-4 py-1.5 text-[12px] font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]">
              Get Started
            </Link>
          )}
          <ThemeToggle className="!h-7 !w-7 !rounded-full border-[#d2d2d7] bg-transparent text-[#6e6e73] hover:text-[#1d1d1f]" />
        </div>
      </div>
    </header>
  );
}
