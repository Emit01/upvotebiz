import prisma from "@/lib/prisma";
import AdminPaymentsClient from "@/components/admin/AdminPaymentsClient";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payments.findMany({
    orderBy: { id: "desc" },
  });

  const serialized = payments.map((p) => ({
    id: p.id,
    name: p.name ?? "",
    min: Number(p.min ?? 0),
    max: Number(p.max ?? 0),
    new_users: p.new_users ?? 0,
    params: p.params ?? "",
    status: p.status ?? 0,
  }));

  return <AdminPaymentsClient payments={serialized} />;
}
