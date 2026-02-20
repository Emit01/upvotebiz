"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, Clock, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SnooMark } from "@/components/ui/RedditLogo";

interface Props {
  ticket: {
    id: number; subject: string; status: string; description: string;
    created: string; userEmail: string; userName: string;
  };
  messages: { id: number; message: string; author: string; support: number; created: string }[];
}

const statusActions = [
  { label: "Mark Answered", value: "answered", icon: CheckCircle, color: "text-emerald-500" },
  { label: "Mark Pending", value: "pending", icon: Clock, color: "text-amber-500" },
  { label: "Close", value: "closed", icon: XCircle, color: "text-red-500" },
];

export default function AdminTicketThreadClient({ ticket, messages }: Props) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await fetch("/api/admin/tickets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", ticket_id: ticket.id, message: reply }),
      });
      setReply("");
      router.refresh();
    } finally { setSending(false); }
  };

  const handleStatus = async (status: string) => {
    await fetch("/api/admin/tickets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-status", id: ticket.id, status }),
    });
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/tickets" className="rounded-lg p-2 text-label-tertiary hover:bg-surface-secondary hover:text-label-primary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-headline text-label-primary truncate">#{ticket.id} — {ticket.subject}</h2>
          <p className="text-[12px] text-label-tertiary">{ticket.userEmail} · {formatDate(ticket.created)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {statusActions.map((a) => (
            <button key={a.value} onClick={() => handleStatus(a.value)}
              disabled={ticket.status === a.value}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium border border-separator transition-colors hover:bg-surface-secondary disabled:opacity-30 ${a.color}`}
            >
              <a.icon className="h-3.5 w-3.5" />{a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {/* Original description */}
        {ticket.description && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center text-[12px] font-bold text-blue-600">
                {ticket.userName?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-[13px] font-medium text-label-primary">{ticket.userName || ticket.userEmail}</p>
                <p className="text-[11px] text-label-tertiary">{formatDate(ticket.created)}</p>
              </div>
            </div>
            <div className="text-[13px] text-label-secondary whitespace-pre-wrap pl-9">{ticket.description}</div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`card p-5 ${m.support === 1 ? "border-l-2 border-l-reddit" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              {m.support === 1 ? (
                <div className="h-7 w-7 rounded-full bg-reddit/10 flex items-center justify-center"><SnooMark size={14} /></div>
              ) : (
                <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center text-[12px] font-bold text-blue-600">
                  {ticket.userName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-[13px] font-medium text-label-primary">{m.support === 1 ? "Admin" : ticket.userName || ticket.userEmail}</p>
                <p className="text-[11px] text-label-tertiary">{formatDate(m.created)}</p>
              </div>
            </div>
            <div className="text-[13px] text-label-secondary whitespace-pre-wrap pl-9">{m.message}</div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      {ticket.status !== "closed" && (
        <div className="card p-5">
          <textarea
            value={reply} onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply..."
            rows={4} className="input-field text-[13px] mb-3"
          />
          <button onClick={handleReply} disabled={sending || !reply.trim()}
            className="btn-primary flex items-center gap-2 text-[13px] px-5 py-2">
            <Send className="h-4 w-4" />{sending ? "Sending..." : "Send Reply"}
          </button>
        </div>
      )}
    </div>
  );
}
