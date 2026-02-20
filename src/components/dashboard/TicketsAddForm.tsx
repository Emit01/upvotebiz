"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SUBJECT_OPTIONS = [
  { value: "subject_order", label: "Order" },
  { value: "subject_payment", label: "Payment" },
  { value: "subject_service", label: "Service" },
  { value: "subject_other", label: "Other" },
];

const REQUEST_OPTIONS = [
  { value: "refill", label: "Refill" },
  { value: "cancellation", label: "Cancellation" },
  { value: "speed_up", label: "Speed Up" },
  { value: "other", label: "Other" },
];

const PAYMENT_OPTIONS = [
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
];

export default function TicketsAddForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("subject_other");
  const [request, setRequest] = useState("other");
  const [orderId, setOrderId] = useState("");
  const [payment, setPayment] = useState("other");
  const [transactionId, setTransactionId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const showOrder = subject === "subject_order";
  const showPayment = subject === "subject_payment";

  const buildSubject = (): string => {
    switch (subject) {
      case "subject_order": {
        const reqLabel = REQUEST_OPTIONS.find((r) => r.value === request)?.label ?? request;
        return `Order - ${reqLabel} - ${orderId}`;
      }
      case "subject_payment": {
        const payLabel = PAYMENT_OPTIONS.find((p) => p.value === payment)?.label ?? payment;
        return `Payment - ${payLabel} - ${transactionId}`;
      }
      case "subject_service":
        return "Service";
      default:
        return "Other";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!description.trim()) {
      setMessage({ type: "error", text: "Description is required." });
      return;
    }
    if (showOrder && !orderId.trim()) {
      setMessage({ type: "error", text: "Order ID is required." });
      return;
    }
    if (showPayment && !transactionId.trim()) {
      setMessage({ type: "error", text: "Transaction ID is required." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: buildSubject(),
          description: description.trim().replace(/<[^>]*>/g, ""),
        }),
      });
      const data = await res.json();
      if (data.status === "error") {
        setMessage({ type: "error", text: data.message || "Failed to create ticket." });
        return;
      }
      setMessage({ type: "success", text: "Ticket created." });
      setDescription("");
      setOrderId("");
      setTransactionId("");
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={
            message.type === "error" ? "alert-error" : "alert-success"
          }
        >
          {message.text}
        </div>
      )}
      <div>
        <label className="label-text">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="select-field"
        >
          {SUBJECT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {showOrder && (
        <>
          <div>
            <label className="label-text">Request</label>
            <select
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="select-field"
            >
              {REQUEST_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="input-field"
              placeholder="e.g. 12345 or 12345,12346"
            />
          </div>
        </>
      )}
      {showPayment && (
        <>
          <div>
            <label className="label-text">Payment</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="select-field"
            >
              {PAYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="input-field"
              placeholder="Enter the transaction ID"
            />
          </div>
        </>
      )}
      <div>
        <label className="label-text">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-[100px] resize-y"
          placeholder="Describe your issue..."
          required
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
