import prisma from "@/lib/prisma";
import AdminNewsClient from "@/components/admin/AdminNewsClient";

export default async function AdminNewsPage() {
  const news = await prisma.general_news.findMany({ orderBy: { id: "desc" } });
  const serialized = news.map((n) => ({
    id: n.id,
    type: n.type ?? "",
    description: n.description ?? "",
    status: n.status ?? 0,
    expiry: n.expiry?.toISOString() ?? "",
    created: n.created?.toISOString() ?? "",
  }));
  return <AdminNewsClient news={serialized} />;
}
