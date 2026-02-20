import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import TicketViewClient from "@/components/dashboard/TicketViewClient";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  answered: "Answered",
  closed: "Closed",
  new: "New",
};

export default async function TicketPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const uid = session!.user.uid;
  const id = parseInt(params.id, 10);
  if (!id) notFound();

  const ticket = await prisma.tickets.findFirst({
    where: { id, uid },
    select: {
      id: true,
      ids: true,
      subject: true,
      description: true,
      status: true,
      created: true,
    },
  });
  if (!ticket) notFound();

  await prisma.tickets.update({
    where: { id },
    data: { user_read: 0 },
  });

  const messages = await prisma.ticket_messages.findMany({
    where: { ticket_id: id },
    orderBy: { id: "asc" },
    select: { id: true, author: true, support: true, message: true, created: true },
  });

  const allMessages = [
    {
      id: 0,
      author: null,
      support: null,
      message: ticket.description,
      created: ticket.created,
      isInitial: true,
    },
    ...messages.map((m) => ({
      id: m.id,
      author: m.author,
      support: m.support,
      message: m.message,
      created: m.created,
      isInitial: false,
    })),
  ].filter((m) => m.message);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/tickets"
          className="text-[12px] font-normal text-[var(--accent)] hover:underline"
        >
          ← Tickets
        </Link>
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-separator-light px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-headline font-medium text-label-primary">
              #{ticket.id} — {ticket.subject}
            </h1>
            <span
              className={`status-badge ${
                ticket.status === "closed"
                  ? "bg-label-tertiary/20 text-label-tertiary"
                  : ticket.status === "answered"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-0"
                    : "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/20 dark:text-amber-400 dark:border-0"
              }`}
            >
              {statusLabels[ticket.status] || ticket.status}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-label-tertiary">
            Created {formatDate(ticket.created)}
          </p>
        </div>
        <div className="divide-y divide-separator-light">
          {allMessages.map((m) => (
            <div
              key={m.id}
              className={`px-5 py-4 ${m.support ? "bg-surface-secondary/50" : ""}`}
            >
              <div className="flex items-center gap-2 text-[11px] text-label-tertiary">
                {m.isInitial ? (
                  <span>You</span>
                ) : m.support ? (
                  <span>Support</span>
                ) : (
                  <span>{m.author || "You"}</span>
                )}
                <span>·</span>
                <span>{formatDate(m.created)}</span>
              </div>
              <div className="mt-1.5 whitespace-pre-wrap text-[13px] text-label-primary">
                {m.message}
              </div>
            </div>
          ))}
        </div>
        {ticket.status !== "closed" && (
          <TicketViewClient ticketId={id} ticketIds={ticket.ids || ""} />
        )}
      </div>
    </div>
  );
}
