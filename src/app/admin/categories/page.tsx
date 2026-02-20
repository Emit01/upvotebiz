import prisma from "@/lib/prisma";
import AdminCategoriesClient from "@/components/admin/AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await prisma.categories.findMany({
    orderBy: { sort: "asc" },
    select: { id: true, ids: true, name: true, sort: true, status: true, created: true },
  });

  const serviceCounts: any[] = await prisma.$queryRawUnsafe(
    `SELECT cate_id, COUNT(*) as cnt FROM services GROUP BY cate_id`
  );
  const countMap = Object.fromEntries(serviceCounts.map((r: any) => [Number(r.cate_id), Number(r.cnt)]));

  const serialized = categories.map((c) => ({
    id: c.id,
    ids: c.ids ?? "",
    name: c.name ?? "",
    sort: c.sort ?? 0,
    status: c.status ?? 0,
    serviceCount: countMap[c.id] ?? 0,
    created: c.created?.toISOString() ?? "",
  }));

  return <AdminCategoriesClient categories={serialized} />;
}
