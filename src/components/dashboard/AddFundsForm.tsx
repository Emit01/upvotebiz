"use client";

import { useState } from "react";

interface PaymentMethod { id: number; type: string; name: string; min: number; max: number; }

export default function AddFundsForm({
  paymentMethods, currencyCode, currencySymbol,
}: {
  paymentMethods: PaymentMethod[]; currencyCode: string; currencySymbol: string;
}) {
  const [paymentId, setPaymentId] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const selectedPayment = paymentMethods.find((p) => p.id === paymentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/add-funds", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId, amount: parseFloat(amount), agree }),
      });
      const data = await res.json();
      if (data.status === "error") { setMessage({ type: "error", text: data.message }); }
      else if (data.redirect_url) { window.location.href = data.redirect_url; }
      else { setMessage({ type: "success", text: data.message || "Payment initiated" }); }
    } catch { setMessage({ type: "error", text: "An error occurred" }); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="card p-6">
        {message && (
          <div className={`mb-5 ${message.type === "error" ? "alert-error" : "alert-success"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Payment Method</label>
            <select value={paymentId} onChange={(e) => setPaymentId(parseInt(e.target.value))} className="select-field">
              <option value={0}>Select payment method</option>
              {paymentMethods.map((pm) => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label-text">
              Amount ({currencyCode})
              {selectedPayment && (
                <span className="ml-1.5 font-normal normal-case tracking-normal text-label-tertiary">
                  {selectedPayment.min > 0 && `Min ${currencySymbol}${selectedPayment.min}`}
                  {selectedPayment.max > 0 && ` — Max ${currencySymbol}${selectedPayment.max}`}
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-label-tertiary">{currencySymbol}</span>
              <input
                type="number" step="0.01" min={selectedPayment?.min || 0} max={selectedPayment?.max || undefined}
                value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field pl-8" placeholder="0.00"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 rounded border-separator text-reddit focus:ring-reddit/20" />
            <span className="text-callout text-label-secondary">I confirm the payment details and agree to the terms.</span>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Processing..." : `Pay ${amount ? `${currencySymbol}${amount}` : ""}`}
          </button>
        </form>
      </div>
    </div>
  );
}
