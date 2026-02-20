"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const mainNavigation = [
  { name: "Statistics", href: "/statistics", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
  { name: "New Order", href: "/new-order", icon: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { name: "Orders", href: "/orders", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" },
  { name: "Profile Scanner", href: "/profile-scanner", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { name: "Transactions", href: "/transactions", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
  { name: "Tickets", href: "/tickets", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z", badgeCountKey: "tickets" },
  { name: "Services", href: "/services", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" },
  { name: "API", href: "/api-docs", icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" },
  { name: "Profile", href: "/profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
];

const marketplaceNavigation = [
  { name: "Browse Listings", href: "/marketplace", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
  { name: "My Listings", href: "/marketplace/my-listings", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { name: "Purchases", href: "/marketplace/purchases", icon: "M15.75 10.5V4.875c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v5.625M15.75 10.5h3.375c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-3.375M15.75 10.5h-3.375c-.621 0-1.125.504-1.125 1.125v5.25c0 .621.504 1.125 1.125 1.125h3.375" },
  { name: "Sales", href: "/marketplace/sales", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

function NavIcon({ d, active }: { d: string; active?: boolean }) {
  return (
    <svg
      className={`h-[16px] w-[16px] flex-shrink-0 transition-colors ${active ? "opacity-100" : "opacity-70"}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={active ? 2 : 1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function Sidebar({ ticketsNeedingActionCount = 0 }: { ticketsNeedingActionCount?: number }) {
  const pathname = usePathname();

  const getLabel = (item: (typeof mainNavigation)[number]) => {
    if ("badgeCountKey" in item && item.badgeCountKey === "tickets" && ticketsNeedingActionCount > 0) {
      return `${item.name} (${ticketsNeedingActionCount})`;
    }
    return item.name;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[256px] border-r border-[#e8e8ed] dark:border-separator transition-colors duration-200" style={{ backgroundColor: "var(--sidebar-bg)" }}>
      <div className="flex h-full flex-col">
        <div className="flex h-10 items-center justify-between px-4">
          <Link href="/statistics" className="flex items-center gap-2">
            <Image src="/images/landing/snoo-logo.png" alt="" width={20} height={20} className="object-contain" />
            <span className="text-[14px] font-medium tracking-[-0.01em] text-[var(--label-primary)]">
              Upvote<span className="text-[var(--accent)]">Biz</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-3 mb-1 h-px bg-separator" />

        <nav className="flex-1 space-y-0 overflow-y-auto px-2 py-1">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--label-tertiary)]">Main</p>
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={isActive ? "sidebar-link-active" : "sidebar-link"}
              >
                <NavIcon d={item.icon} active={isActive} />
                {getLabel(item)}
              </Link>
            );
          })}
          <p className="mt-4 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--label-tertiary)]">Account Marketplace</p>
          {marketplaceNavigation.map((item) => {
            const matches = pathname === item.href || pathname.startsWith(item.href + "/");
            const isLongestMatch =
              matches &&
              !marketplaceNavigation.some(
                (other) =>
                  other.href.length > item.href.length &&
                  (pathname === other.href || pathname.startsWith(other.href + "/"))
              );
            const isActive = !!isLongestMatch;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={isActive ? "sidebar-link-active" : "sidebar-link"}
              >
                <NavIcon d={item.icon} active={isActive} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 h-px bg-separator" />
        <div className="px-2 py-2">
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/";
            }}
            className="sidebar-link w-full text-label-secondary hover:text-red-400"
          >
            <svg className="h-[16px] w-[16px] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
