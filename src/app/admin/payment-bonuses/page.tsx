import prisma from "@/lib/prisma";
import AdminPaymentBonusesClient from "@/components/admin/AdminPaymentBonusesClient";

export default async function AdminPaymentBonusesPage() {
  const bonuses = await prisma.payments_bonus.findMany({ orderBy: { id: "desc" } });
  const payments = await prisma.payments.findMany({ select: { id: true, name: true } });

  const paymentMap = Object.fromEntries(payments.map((p) => [p.id, p.name ?? `#${p.id}`]));

  const serialized = bonuses.map((b) => ({
    id: b.id,
    payment_id: b.payment_id,
    paymentName: paymentMap[b.payment_id] ?? `#${b.payment_id}`,
    bonus_from: b.bonus_from,
    percentage: b.percentage,
    status: b.status,
  }));

  return (
    <AdminPaymentBonusesClient
      bonuses={serialized}
      payments={payments.map((p) => ({ id: p.id, name: p.name ?? "" }))}
    />
  );
}
