import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import AdminServicesClient from "@/components/admin/AdminServicesClient";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currencySymbol = await getOption("currency_symbol", "$");
  const categoryFilter = resolvedSearchParams.category || "all";
  const search = resolvedSearchParams.search || "";

  const categories = await prisma.categories.findMany({
    orderBy: { sort: "asc" },
    select: { id: true, name: true, status: true },
  });

  const where: any = {};
  if (categoryFilter !== "all") where.cate_id = Number(categoryFilter);
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { api_service_id: { contains: search } },
      ...(!isNaN(Number(search)) ? [{ id: Number(search) }] : []),
    ];
  }

  const services = await prisma.services.findMany({
    where,
    orderBy: [{ cate_id: "asc" }, { id: "asc" }],
    select: {
      id: true, ids: true, name: true, cate_id: true, price: true, original_price: true,
      min: true, max: true, type: true, add_type: true, api_service_id: true,
      api_provider_id: true, status: true, desc: true, refill: true, dripfeed: true,
    },
  });

  const providerIds = Array.from(new Set(services.map((s) => s.api_provider_id).filter(Boolean))) as number[];
  const providers = providerIds.length
    ? await prisma.api_providers.findMany({ where: { id: { in: providerIds } }, select: { id: true, name: true } })
    : [];
  const providerMap = Object.fromEntries(providers.map((p) => [p.id, p.name]));
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name ?? `Category #${c.id}`]));

  const grouped: Record<string, any[]> = {};
  for (const s of services) {
    const catName = categoryMap[s.cate_id ?? 0] ?? "Uncategorized";
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push({
      id: s.id,
      ids: s.ids,
      name: s.name ?? "",
      cate_id: s.cate_id,
      price: Number(s.price ?? 0),
      original_price: Number(s.original_price ?? 0),
      min: s.min ?? "0",
      max: s.max ?? "0",
      type: s.type ?? "default",
      add_type: s.add_type ?? "manual",
      api_service_id: s.api_service_id ?? "",
      api_provider_id: s.api_provider_id,
      providerName: providerMap[s.api_provider_id ?? 0] ?? "",
      status: s.status ?? 0,
      desc: s.desc ?? "",
      refill: s.refill ?? 0,
      dripfeed: s.dripfeed ?? 0,
    });
  }

  const allProviders = await prisma.api_providers.findMany({
    where: { status: 1 },
    select: { id: true, name: true },
  });

  return (
    <AdminServicesClient
      grouped={grouped}
      categories={categories.map((c) => ({ id: c.id, name: c.name ?? "" }))}
      providers={allProviders.map((p) => ({ id: p.id, name: p.name ?? "" }))}
      currentCategory={categoryFilter}
      search={search}
      currencySymbol={currencySymbol}
    />
  );
}
