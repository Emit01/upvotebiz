import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function ApiDocsPage() {
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;

  const user = await prisma.general_users.findUnique({
    where: { id: uid },
    select: { api_key: true },
  });

  const apiKey = user?.api_key || "YOUR_API_KEY";
  const baseUrl = process.env.NEXTAUTH_URL || "https://yourpanel.com";
  const apiUrl = `${baseUrl}/api/v1`;

  const endpoints = [
    {
      title: "Services List", method: "GET",
      params: { key: apiKey, action: "services" },
      description: "Get a list of all available services.",
      response: `[\n  {\n    "service": 1,\n    "name": "Service Name",\n    "type": "Default",\n    "rate": "0.50",\n    "min": 100,\n    "max": 10000,\n    "dripfeed": true,\n    "refill": false,\n    "category": "Category Name"\n  }\n]`,
    },
    {
      title: "Add Order", method: "POST",
      params: { key: apiKey, action: "add", service: "SERVICE_ID", link: "https://reddit.com/...", quantity: "1000" },
      description: "Place a new order. Optional: hashtag, usernames, comments, runs, interval.",
      response: `{\n  "status": "success",\n  "order": 12345\n}`,
    },
    {
      title: "Order Status", method: "GET",
      params: { key: apiKey, action: "status", order: "ORDER_ID" },
      description: "Get the status of a single order.",
      response: `{\n  "order": 12345,\n  "status": "Completed",\n  "charge": "0.50",\n  "start_count": "0",\n  "remains": 0,\n  "currency": "USD"\n}`,
    },
    {
      title: "Multi Status", method: "GET",
      params: { key: apiKey, action: "status", orders: "1,2,3" },
      description: "Get status of multiple orders at once.",
      response: `{\n  "1": { "order": 1, "status": "Completed", ... },\n  "2": { "order": 2, "status": "Pending", ... }\n}`,
    },
    {
      title: "Balance", method: "GET",
      params: { key: apiKey, action: "balance" },
      description: "Check your account balance.",
      response: `{\n  "status": "success",\n  "balance": "100.50",\n  "currency": "USD"\n}`,
    },
    {
      title: "Create Refill", method: "POST",
      params: { key: apiKey, action: "refill", order_id: "ORDER_ID" },
      description: "Create a refill request for an order.",
      response: `{ "refill": 1 }`,
    },
    {
      title: "Refill Status", method: "GET",
      params: { key: apiKey, action: "refill_status", refill: "REFILL_ID" },
      description: "Check the status of a refill request.",
      response: `{ "status": "Pending" }`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-label-tertiary mb-2">Endpoint</p>
          <div className="rounded-xl bg-surface-dark px-5 py-3.5">
            <code className="text-[13px] text-emerald-400 font-mono">{apiUrl}</code>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-label-tertiary mb-2">Your API Key</p>
          <div className="rounded-xl bg-surface-secondary border border-separator px-5 py-3.5">
            <code className="text-[12px] text-label-primary break-all font-mono">{apiKey}</code>
          </div>
        </div>
        <div className="flex gap-5 text-callout text-label-secondary">
          <p><span className="font-semibold text-label-primary">Method</span> POST or GET</p>
          <p><span className="font-semibold text-label-primary">Response</span> JSON</p>
        </div>
      </div>

      {endpoints.map((endpoint, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-separator bg-surface-secondary px-5 py-3">
            <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] ${
              endpoint.method === "POST" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}>
              {endpoint.method}
            </span>
            <h3 className="text-[13px] font-semibold text-label-primary">{endpoint.title}</h3>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-callout text-label-secondary">{endpoint.description}</p>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-label-tertiary mb-2">Parameters</p>
              <div className="overflow-x-auto rounded-xl border border-separator">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-separator">
                      <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-label-tertiary">Key</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-label-tertiary">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(endpoint.params).map(([key, value], j) => (
                      <tr key={key} className={j < Object.keys(endpoint.params).length - 1 ? "border-b border-separator-light" : ""}>
                        <td className="px-4 py-2 font-mono text-[11px] font-medium text-label-primary">{key}</td>
                        <td className="px-4 py-2 font-mono text-[11px] text-label-tertiary">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-label-tertiary mb-2">Response</p>
              <pre className="overflow-x-auto rounded-xl bg-surface-dark p-4 text-[11px] text-emerald-400 font-mono leading-relaxed">
                {endpoint.response}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
