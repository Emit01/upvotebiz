"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TicketViewClient({
  ticketId,
  ticketIds,
}: {
  ticketId: number;
  ticketIds: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, ids: ticketIds }),
      });
      const data = await res.json();
      if (data.status === "error") {
        setError(data.message || "Failed to send message.");
        return;
      }
      setMessage("");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-separator-light p-5">
      {error && (
        <div className="alert-error mb-4">
          {error}
        </div>
      )}
      <label className="label-text">Reply</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="input-field mt-1.5 min-h-[80px] resize-y"
        placeholder="Type your message..."
        required
      />
      <button type="submit" disabled={loading} className="btn-primary mt-3">
        {loading ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
