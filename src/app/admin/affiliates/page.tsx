import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import { currencyFormat, formatDate } from "@/lib/utils";

export default async function AdminAffiliatesPage() {
  const currencySymbol = await getOption("currency_symbol", "$");
  const affiliates = await prisma.affiliate.findMany({ orderBy: { id: "desc" }, take: 100 });

  const userIds = Array.from(new Set(affiliates.map((a) => a.uid).filter(Boolean))) as number[];
  const users = userIds.length
    ? await prisma.general_users.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } })
    : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.email ?? ""]));

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "User", "Visits", "Referrals", "Registrations", "Total Earned", "Available", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{a.id}</td>
                  <td className="px-4 py-3 text-[13px] text-label-primary">{userMap[a.uid ?? 0] ?? `UID: ${a.uid}`}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{a.visit ?? 0}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{a.referral ?? 0}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{a.registration ?? 0}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{currencySymbol}{currencyFormat(Number(a.total_earning ?? 0))}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{currencySymbol}{currencyFormat(Number(a.available_earning ?? 0))}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${a.status === 1 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-50 text-gray-500 border border-gray-100"}`}>
                      {a.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {affiliates.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No affiliates</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
