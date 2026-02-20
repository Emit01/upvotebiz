import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import AddFundsForm from "@/components/dashboard/AddFundsForm";

async function getPaymentMethods(uid: number) {
  const payments = await prisma.payments.findMany({
    where: { status: 1 },
    orderBy: { sort: "asc" },
    select: { id: true, type: true, name: true, min: true, max: true, new_users: true, params: true },
  });

  const user = await prisma.general_users.findUnique({
    where: { id: uid },
    select: { settings: true },
  });

  let userSettings: any = {};
  try { userSettings = user?.settings ? JSON.parse(user.settings) : {}; } catch {}

  const limitPayments = userSettings?.limit_payments || {};
  const filteredPayments = payments.filter((p) => {
    if (limitPayments[p.type || ""] === false || limitPayments[p.type || ""] === 0) return false;
    return true;
  });

  return filteredPayments.map((p) => ({
    id: p.id, type: p.type || "", name: p.name || "", min: p.min || 0, max: p.max || 0,
  }));
}

export default async function AddFundsPage() {
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;
  const [paymentMethods, currencyCode, currencySymbol] = await Promise.all([
    getPaymentMethods(uid),
    getOption("currency_code", "USD"),
    getOption("currency_symbol", "$"),
  ]);

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <h1 className="text-headline text-label-primary">Add Funds</h1>
      <AddFundsForm paymentMethods={paymentMethods} currencyCode={currencyCode} currencySymbol={currencySymbol} />
    </div>
  );
}
