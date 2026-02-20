import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminTicketThreadClient from "@/components/admin/AdminTicketThreadClient";

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const ticketId = parseInt(resolvedParams.id);
  if (isNaN(ticketId)) notFound();

  const ticket = await prisma.tickets.findUnique({ where: { id: ticketId } });
  if (!ticket) notFound();

  await prisma.tickets.update({ where: { id: ticketId }, data: { admin_read: 1 } });

  const messages = await prisma.ticket_messages.findMany({
    where: { ticket_id: ticketId },
    orderBy: { created: "asc" },
  });

  const user = ticket.uid
    ? await prisma.general_users.findUnique({
        where: { id: ticket.uid },
        select: { email: true, first_name: true, last_name: true },
      })
    : null;

  return (
    <AdminTicketThreadClient
      ticket={{
        id: ticket.id,
        subject: ticket.subject ?? "",
        status: ticket.status ?? "pending",
        description: ticket.description ?? "",
        created: ticket.created?.toISOString() ?? "",
        userEmail: user?.email ?? "",
        userName: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
      }}
      messages={messages.map((m) => ({
        id: m.id,
        message: m.message,
        author: m.author ?? "",
        support: m.support ?? 0,
        created: m.created?.toISOString() ?? "",
      }))}
    />
  );
}
