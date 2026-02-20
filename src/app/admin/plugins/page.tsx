import prisma from "@/lib/prisma";

export default async function AdminPluginsPage() {
  const modules = await prisma.general_purchase.findMany();

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-separator">
          <h3 className="text-headline text-label-primary">Installed Modules</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-separator bg-surface-secondary/50">
                {["ID", "PID", "Purchase Code", "Version"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-label-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id} className="border-b border-separator/50 hover:bg-surface-secondary/20 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{m.id}</td>
                  <td className="px-4 py-3 text-[13px] text-label-primary">{m.pid}</td>
                  <td className="px-4 py-3 text-[12px] text-label-tertiary font-mono">{m.purchase_code}</td>
                  <td className="px-4 py-3 text-[13px] text-label-secondary">{m.version}</td>
                </tr>
              ))}
              {modules.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-[13px] text-label-tertiary">No modules installed</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
