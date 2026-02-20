import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "reply") {
      const ticket = await prisma.tickets.findUnique({ where: { id: Number(body.ticket_id) } });
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      const ids = require("crypto").randomBytes(16).toString("hex");
      await prisma.ticket_messages.create({
        data: {
          ids, ticket_id: Number(body.ticket_id), uid: Number(ticket.uid),
          author: "admin", support: 1, message: body.message,
          created: new Date(), changed: new Date(),
        },
      });
      await prisma.tickets.update({
        where: { id: Number(body.ticket_id) },
        data: { status: "answered", admin_read: 1, user_read: 0, changed: new Date() },
      });
      return NextResponse.json({ status: "success", message: "Reply sent" });
    }

    if (action === "update-status") {
      await prisma.tickets.update({
        where: { id: Number(body.id) },
        data: { status: body.status, changed: new Date() },
      });
      return NextResponse.json({ status: "success" });
    }

    if (action === "delete") {
      await prisma.ticket_messages.deleteMany({ where: { ticket_id: Number(body.id) } });
      await prisma.tickets.delete({ where: { id: Number(body.id) } });
      return NextResponse.json({ status: "success", message: "Deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
