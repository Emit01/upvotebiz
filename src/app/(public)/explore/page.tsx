import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import Link from "next/link";

export default async function PublicExplorePage() {
  const [categories, services, currencySymbol] = await Promise.all([
    prisma.categories.findMany({ where: { status: 1 }, orderBy: { sort: "asc" }, select: { id: true, name: true } }),
    prisma.services.findMany({ where: { status: 1 }, orderBy: { id: "asc" }, select: { id: true, cate_id: true, name: true, price: true, min: true, max: true } }),
    getOption("currency_symbol", "$"),
  ]);
  const byCategory = categories.map((c) => ({
    ...c,
    services: services.filter((s) => s.cate_id === c.id),
  }));

  return (
    <div className="mx-auto max-w-[980px] px-6 py-14">
      <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-[var(--label-primary)] mb-2">
        Services
      </h1>
      <p className="text-[14px] text-[#6e6e73] dark:text-[var(--label-secondary)] mb-10">
        Browse our catalog. <Link href="/login" className="text-[#0071e3] dark:text-[var(--accent)] hover:underline">Sign in</Link> to see your rates and place orders.
      </p>
      <div className="space-y-8">
        {byCategory.map((cat) => (
          <div key={cat.id}>
            <h2 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[var(--label-primary)] mb-4">{cat.name}</h2>
            <div className="rounded-2xl border border-[#e8e8ed] dark:border-[var(--separator)] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#e8e8ed] dark:border-[var(--separator)] bg-[#f5f5f7] dark:bg-[var(--surface-secondary)]">
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6e6e73] dark:text-[var(--label-tertiary)]">Service</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6e6e73] dark:text-[var(--label-tertiary)]">Min – Max</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6e6e73] dark:text-[var(--label-tertiary)]">Price/1K</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.services.map((s) => (
                    <tr key={s.id} className="border-b border-[#e8e8ed]/60 dark:border-[var(--separator)]/60 last:border-0">
                      <td className="px-4 py-3 text-[14px] font-medium text-[#1d1d1f] dark:text-[var(--label-primary)]">{s.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[#6e6e73] dark:text-[var(--label-secondary)]">{s.min} – {s.max}</td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#0071e3] dark:text-[var(--accent)]">{currencySymbol}{(Number(s.price) || 0).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
