import Link from "next/link";
import { getOption } from "@/lib/options";

export default async function PublicPricingPage() {
  const currencySymbol = await getOption("currency_symbol", "$");
  return (
    <div className="mx-auto max-w-[980px] px-6 py-14">
      <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-[var(--label-primary)] mb-2">
        Pricing
      </h1>
      <p className="text-[14px] text-[#6e6e73] dark:text-[var(--label-secondary)] mb-10">
        Competitive rates per 1K. Sign up to see your custom pricing and place orders.
      </p>
      <div className="rounded-2xl border border-[#e8e8ed] dark:border-[var(--separator)] bg-[#fbfbfd] dark:bg-[var(--surface-primary)] p-6">
        <ul className="space-y-3 text-[14px] text-[#1d1d1f] dark:text-[var(--label-primary)]">
          <li>• Post Upvotes & Downvotes — from {currencySymbol}0.50/1K (dynamic speed, high quality)</li>
          <li>• Comment Upvotes & Downvotes — from {currencySymbol}0.40/1K</li>
          <li>• Custom Comments — from {currencySymbol}1.00/1K (unique comments, delay options)</li>
        </ul>
        <p className="mt-6 text-[12px] text-[#6e6e73] dark:text-[var(--label-tertiary)]">
          Prices may vary by service. <Link href="/login" className="text-[#0071e3] dark:text-[var(--accent)] hover:underline">Sign in</Link> to view full catalog and your rates.
        </p>
      </div>
    </div>
  );
}
