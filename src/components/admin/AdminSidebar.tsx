"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  BarChart3, ShoppingCart, Repeat2, RefreshCw, Layers, Receipt, FolderOpen,
  MessageSquare, Users, Bell, Settings, Plug, CreditCard, Gift, Share2,
  Newspaper, Globe, HelpCircle, UserCircle, Inbox
} from "lucide-react";

const navSections = [
  {
    label: "General",
    items: [
      { name: "Statistics", href: "/admin/statistics", icon: BarChart3 },
    ],
  },
  {
    label: "Service",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Dripfeed", href: "/admin/dripfeed", icon: Repeat2 },
      { name: "Subscriptions", href: "/admin/subscriptions", icon: RefreshCw },
      { name: "Refill", href: "/admin/refill", icon: RefreshCw },
      { name: "Services", href: "/admin/services", icon: Layers },
      { name: "Transaction logs", href: "/admin/transactions", icon: Receipt },
      { name: "Category", href: "/admin/categories", icon: FolderOpen },
    ],
  },
  {
    label: "Support Area",
    items: [
      { name: "Tickets", href: "/admin/tickets", icon: MessageSquare },
    ],
  },
  {
    label: "Manage Users",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Subscribers", href: "/admin/subscribers", icon: Inbox },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Providers", href: "/admin/providers", icon: Plug },
      { name: "Payments", href: "/admin/payments", icon: CreditCard },
      { name: "Payment bonuses", href: "/admin/payment-bonuses", icon: Gift },
      { name: "Affiliates", href: "/admin/affiliates", icon: Share2 },
      { name: "Modules", href: "/admin/plugins", icon: Plug },
      { name: "News", href: "/admin/news", icon: Newspaper },
      { name: "Languages", href: "/admin/languages", icon: Globe },
      { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-[256px] border-r border-separator flex flex-col transition-colors duration-200" style={{ backgroundColor: "var(--sidebar-bg)" }}>
      <div className="flex h-11 items-center justify-between px-5 border-b border-separator shrink-0">
        <div className="flex items-center gap-2.5">
          <Link href="/admin/statistics" className="flex items-center gap-2">
            <Image src="/images/landing/snoo-logo.png" alt="" width={24} height={24} className="object-contain" />
            <span className="text-[17px] font-semibold tracking-[-0.022em] text-[var(--label-primary)]">
              Upvote<span className="text-[var(--accent)]">Biz</span>
            </span>
          </Link>
          <span className="rounded-md bg-[var(--accent)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">
            Admin
          </span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--label-tertiary)]">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                          : "text-[var(--label-secondary)] hover:bg-[var(--ghost-hover)] hover:text-[var(--label-primary)]"
                      }`}
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        strokeWidth={isActive ? 2 : 1.7}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
