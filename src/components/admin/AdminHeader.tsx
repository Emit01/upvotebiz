"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin/statistics": "Statistics",
  "/admin/orders": "Orders",
  "/admin/dripfeed": "Dripfeed Orders",
  "/admin/subscriptions": "Subscriptions",
  "/admin/refill": "Refill Orders",
  "/admin/services": "Services",
  "/admin/transactions": "Transaction Logs",
  "/admin/categories": "Category",
  "/admin/tickets": "Tickets",
  "/admin/users": "Users",
  "/admin/subscribers": "Subscribers",
  "/admin/settings": "Settings",
  "/admin/providers": "Providers",
  "/admin/payments": "Payments",
  "/admin/payment-bonuses": "Payment Bonuses",
  "/admin/affiliates": "Affiliates",
  "/admin/plugins": "Modules",
  "/admin/news": "News",
  "/admin/languages": "Languages",
  "/admin/faqs": "FAQs",
  "/admin/profile": "Profile",
};

export default function AdminHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const title = pageTitles[pathname] ||
    Object.entries(pageTitles).find(([k]) => pathname.startsWith(k))?.[1] ||
    "Admin";

  const staffName =
    (session?.user as any)?.firstName || session?.user?.name || "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-separator bg-[#fbfbfd]/80 dark:bg-surface-primary/80 backdrop-blur-xl px-8 transition-colors duration-200">
      <h1 className="text-[17px] font-semibold tracking-[-0.022em] text-[var(--label-primary)]">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 rounded-full bg-surface-secondary px-3 py-1.5 border border-separator">
          <Image src="/images/landing/snoo-logo.png" alt="" width={22} height={22} className="object-contain" />
          <span className="text-[13px] font-medium text-[var(--label-primary)]">
            {staffName}
          </span>
        </div>

        <button
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/admin/login";
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-[var(--label-secondary)] transition-colors hover:bg-surface-secondary hover:text-[var(--label-primary)]"
          title="Logout"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.7} />
          Logout
        </button>
      </div>
    </header>
  );
}
