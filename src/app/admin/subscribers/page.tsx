import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.general_subscribers.findMany({ orderBy: { id: "desc" }, take: 100 });
  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "Name", "Email", "IP", "Country", "Created"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{s.id}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-label-primary">{s.first_name} {s.last_name}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{s.email}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary">{s.ip}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary">{s.country}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary">{formatDate(s.created)}</td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No subscribers</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
