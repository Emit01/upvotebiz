"use client";

import { useState } from "react";

interface Category { id: number; name: string; }
interface Service { id: number; cate_id: number; name: string; price: number; min: number; max: number; desc: string; }
interface CustomPrice { service_id: number | null; price: number; }

export default function ServicesTable({
  categories, services, customPrices, currencySymbol,
}: {
  categories: Category[]; services: Service[]; customPrices: CustomPrice[]; currencySymbol: string;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter((s) => {
    const matchCategory = activeCategoryId === 0 || s.cate_id === activeCategoryId;
    const matchSearch = searchQuery === "" || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(s.id).includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const getUserPrice = (service: Service) => {
    const custom = customPrices.find((p) => p.service_id === service.id);
    return custom?.price || service.price;
  };

  const groupedServices = categories
    .filter((c) => activeCategoryId === 0 || c.id === activeCategoryId)
    .map((c) => ({ ...c, services: filteredServices.filter((s) => s.cate_id === c.id) }))
    .filter((g) => g.services.length > 0);

  return (
    <div className="space-y-4">
      <div className="card p-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <select value={activeCategoryId} onChange={(e) => setActiveCategoryId(parseInt(e.target.value))} className="select-field max-w-xs">
            <option value={0}>All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search services..." className="input-field max-w-sm" />
        </div>
      </div>

      {groupedServices.map((group) => (
        <div key={group.id} className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-separator bg-surface-secondary px-5 py-3">
            <div className="h-1.5 w-1.5 rounded-full bg-reddit" />
            <h3 className="text-[12px] font-bold text-label-primary">{group.name}</h3>
            <span className="text-[11px] text-label-tertiary">{group.services.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-separator">
                  <th className="table-header w-14">ID</th>
                  <th className="table-header">Service</th>
                  <th className="table-header text-center w-32">Rate / 1K</th>
                  <th className="table-header text-center w-28">Min / Max</th>
                  <th className="table-header w-44">Description</th>
                </tr>
              </thead>
              <tbody>
                {group.services.map((service, i) => (
                  <tr key={service.id} className={`transition-colors hover:bg-surface-secondary/50 ${i < group.services.length - 1 ? "border-b border-separator-light" : ""}`}>
                    <td className="table-cell text-label-tertiary font-medium">{service.id}</td>
                    <td className="table-cell">
                      <span className="text-[13px] font-medium text-label-primary">{service.name}</span>
                    </td>
                    <td className="table-cell text-center font-bold text-reddit">
                      {currencySymbol}{getUserPrice(service).toFixed(4)}
                    </td>
                    <td className="table-cell text-center text-[12px] text-label-secondary">
                      {service.min.toLocaleString()} / {service.max.toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <p className="max-w-[180px] truncate text-[11px] text-label-tertiary">{service.desc || "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {groupedServices.length === 0 && (
        <div className="card p-16 text-center text-callout text-label-tertiary">No services found</div>
      )}
    </div>
  );
}
