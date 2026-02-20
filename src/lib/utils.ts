import crypto from "crypto";

export function ids(): string {
  const raw = crypto.randomBytes(16).toString("hex") + Date.now().toString();
  return crypto.createHash("md5").update(raw).digest("hex");
}

export function createRandomStringKey(length: number): string {
  return crypto.randomBytes(length).toString("hex").substring(0, length);
}

export function currencyFormat(amount: any): string {
  const num = Number(amount ?? 0);
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    processing: "bg-blue-50 text-blue-600 border border-blue-100",
    inprogress: "bg-amber-50 text-amber-600 border border-amber-100",
    pending: "bg-gray-50 text-gray-500 border border-gray-100",
    partial: "bg-orange-50 text-orange-600 border border-orange-100",
    canceled: "bg-red-50 text-red-500 border border-red-100",
    refunded: "bg-purple-50 text-purple-600 border border-purple-100",
    active: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  };
  return colors[status] || "bg-gray-50 text-gray-500 border border-gray-100";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: "Completed",
    processing: "Processing",
    inprogress: "In Progress",
    pending: "Pending",
    partial: "Partial",
    canceled: "Canceled",
    refunded: "Refunded",
    active: "Active",
  };
  return labels[status] || status;
}

export function getUserPrice(
  customPrices: { service_id: number | null; price: any }[],
  service: { id: number; price: any },
): number {
  const custom = customPrices.find((p) => p.service_id === service.id);
  if (custom && custom.price) return parseFloat(String(custom.price));
  return parseFloat(String(service.price));
}
