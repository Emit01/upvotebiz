import Link from "next/link";

const baseUrl = process.env.NEXTAUTH_URL || "https://yourpanel.com";
const apiUrl = `${baseUrl}/api/v1`;

const endpoints = [
  { title: "Services List", method: "GET", params: { key: "YOUR_API_KEY", action: "services" }, description: "Get a list of all available services." },
  { title: "Add Order", method: "POST", params: { key: "YOUR_API_KEY", action: "add", service: "SERVICE_ID", link: "https://reddit.com/...", quantity: "1000" }, description: "Place a new order. Optional: hashtag, usernames, comments, runs, interval." },
  { title: "Order Status", method: "GET", params: { key: "YOUR_API_KEY", action: "status", order: "ORDER_ID" }, description: "Get the status of a single order." },
  { title: "Multi Status", method: "GET", params: { key: "YOUR_API_KEY", action: "status", orders: "1,2,3" }, description: "Get status of multiple orders at once." },
  { title: "Balance", method: "GET", params: { key: "YOUR_API_KEY", action: "balance" }, description: "Check your account balance." },
  { title: "Create Refill", method: "POST", params: { key: "YOUR_API_KEY", action: "refill", order_id: "ORDER_ID" }, description: "Create a refill request for an order." },
  { title: "Refill Status", method: "GET", params: { key: "YOUR_API_KEY", action: "refill_status", refill: "REFILL_ID" }, description: "Check the status of a refill request." },
];

export default function PublicApiPage() {
  return (
    <div className="mx-auto max-w-[980px] px-6 py-14 space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-[var(--label-primary)] mb-2">API</h1>
        <p className="text-[14px] text-[#6e6e73] dark:text-[var(--label-secondary)]">
          REST API for resellers and automation. <Link href="/login" className="text-[#0071e3] dark:text-[var(--accent)] hover:underline">Sign in</Link> to get your API key.
        </p>
      </div>
      <div className="rounded-2xl border border-[#e8e8ed] dark:border-[var(--separator)] bg-[#fbfbfd] dark:bg-[var(--surface-primary)] p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#6e6e73] dark:text-[var(--label-tertiary)] mb-2">Endpoint</p>
          <code className="text-[13px] text-[#0071e3] dark:text-[var(--accent)] font-mono">{apiUrl}</code>
        </div>
        <p className="text-[12px] text-[#6e6e73] dark:text-[var(--label-secondary)]">
          All requests require <code className="rounded bg-[#e8e8ed] dark:bg-[var(--surface-secondary)] px-1">key</code> (your API key). Method: GET or POST. Response: JSON.
        </p>
      </div>
      {endpoints.map((ep, i) => (
        <div key={i} className="rounded-2xl border border-[#e8e8ed] dark:border-[var(--separator)] bg-[#fbfbfd] dark:bg-[var(--surface-primary)] overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-[#e8e8ed] dark:border-[var(--separator)] px-5 py-3 bg-[#f5f5f7] dark:bg-[var(--surface-secondary)]">
            <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ${ep.method === "POST" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>{ep.method}</span>
            <h3 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[var(--label-primary)]">{ep.title}</h3>
          </div>
          <div className="p-5">
            <p className="text-[13px] text-[#6e6e73] dark:text-[var(--label-secondary)] mb-3">{ep.description}</p>
            <p className="text-[11px] font-mono text-[#1d1d1f] dark:text-[var(--label-primary)]">Params: {Object.entries(ep.params).map(([k, v]) => `${k}=${v}`).join(", ")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
