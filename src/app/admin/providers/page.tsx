import prisma from "@/lib/prisma";
import AdminProvidersClient from "@/components/admin/AdminProvidersClient";

export default async function AdminProvidersPage() {
  const providers = await prisma.api_providers.findMany({
    orderBy: { id: "desc" },
    select: {
      id: true, ids: true, name: true, url: true, key: true,
      type: true, balance: true, status: true, description: true,
      created: true,
    },
  });

  const serviceCounts: any[] = await prisma.$queryRawUnsafe(
    `SELECT api_provider_id, COUNT(*) as cnt FROM services WHERE api_provider_id IS NOT NULL GROUP BY api_provider_id`
  );
  const countMap = Object.fromEntries(serviceCounts.map((r: any) => [Number(r.api_provider_id), Number(r.cnt)]));

  const serialized = providers.map((p) => ({
    id: p.id,
    name: p.name ?? "",
    url: p.url ?? "",
    api_key: p.key ?? "",
    type: p.type ?? "",
    balance: Number(p.balance ?? 0),
    status: p.status ?? 0,
    description: p.description ?? "",
    serviceCount: countMap[p.id] ?? 0,
    created: p.created?.toISOString() ?? "",
  }));

  return <AdminProvidersClient providers={serialized} />;
}
