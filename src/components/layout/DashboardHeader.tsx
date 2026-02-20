"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

const pageTitles: Record<string, string> = {
  "/statistics": "Statistics",
  "/new-order": "New Order",
  "/orders": "Orders",
  "/profile-scanner": "Profile Scanner",
  "/add-funds": "Add Funds",
  "/transactions": "Transactions",
  "/tickets": "Tickets",
  "/services": "Services",
  "/api-docs": "API",
  "/profile": "Profile",
  "/marketplace": "Account Marketplace",
  "/marketplace/my-listings": "My Listings",
  "/marketplace/purchases": "Purchases",
  "/marketplace/sales": "Sales",
};

export default function DashboardHeader({
  balance = 0,
  currencySymbol = "$",
}: {
  balance?: number;
  currencySymbol?: string;
} = {}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const pageTitle = pathname.startsWith("/tickets/") && pathname !== "/tickets" ? "Ticket" : (pageTitles[pathname] || "Dashboard");
  const userName = session?.user?.name || session?.user?.email || "";
  const formattedBalance = `${currencySymbol}${Number(balance).toFixed(2)}`;

  return (
    <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-[#e8e8ed] bg-[#f5f5f7] dark:border-separator dark:bg-[var(--surface-secondary)] backdrop-blur-sm px-6 transition-colors duration-200">
      <h2 className="text-[13px] font-medium tracking-[-0.016em] text-[#1d1d1f] dark:text-[var(--label-primary)]">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-5">
        <span className="text-[12px] font-medium tracking-[-0.01em] text-[#1d1d1f] dark:text-[var(--label-primary)]">
          Balance: <span className="text-[#0071e3] dark:text-[var(--accent)]">{formattedBalance}</span>
        </span>
        <Link
          href="/add-funds"
          className="rounded-full px-2.5 py-1.5 text-[12px] font-normal text-[#0071e3]
            transition-colors duration-150
            hover:bg-[#0071e3]/[0.08] dark:text-[var(--accent)] dark:hover:bg-[var(--accent)]/10"
        >
          Add Funds
        </Link>
        <span className="h-3.5 w-px bg-[#e8e8ed] dark:bg-separator" aria-hidden />
        <span className="text-[12px] font-normal tracking-[-0.01em] text-[#6e6e73] dark:text-[var(--label-secondary)]">
          {userName}
        </span>
        <button
          type="button"
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/";
          }}
          className="rounded-full px-2.5 py-1.5 text-[12px] font-normal tracking-[-0.01em] text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[rgba(0,0,0,0.04)] dark:text-[var(--label-secondary)] dark:hover:text-[var(--label-primary)] dark:hover:bg-[rgba(255,255,255,0.06)] transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
