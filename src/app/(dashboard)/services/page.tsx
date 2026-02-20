import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import ServicesTable from "@/components/dashboard/ServicesTable";

async function getServicesData(uid: number) {
  const [categories, services, customPrices] = await Promise.all([
    prisma.categories.findMany({ where: { status: 1 }, orderBy: { sort: "asc" } }),
    prisma.services.findMany({ where: { status: 1 }, orderBy: { id: "asc" } }),
    prisma.general_users_price.findMany({ where: { uid } }),
  ]);

  return {
    categories: categories.map((c) => ({ id: c.id, name: c.name || "" })),
    services: services.map((s) => ({
      id: s.id, cate_id: s.cate_id || 0, name: s.name || "",
      price: Number(s.price || 0), min: s.min || 0, max: s.max || 0, desc: s.desc || "",
    })),
    customPrices: customPrices.map((p) => ({
      service_id: p.service_id, price: Number(p.service_price || 0),
    })),
  };
}

export default async function ServicesPage() {
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;
  const currencySymbol = await getOption("currency_symbol", "$");
  const data = await getServicesData(uid);

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-title-2 text-label-primary">Services</h1>
      <ServicesTable
        categories={data.categories}
        services={data.services}
        customPrices={data.customPrices}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
