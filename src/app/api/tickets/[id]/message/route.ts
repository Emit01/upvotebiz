import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ids } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }
    const uid = (session.user as any).uid;
    if (!uid) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const ticketId = parseInt(resolvedParams.id, 10);
    if (!ticketId) {
      return NextResponse.json({ status: "error", message: "Invalid ticket." }, { status: 400 });
    }

    const ticket = await prisma.tickets.findFirst({
      where: { id: ticketId, uid },
    });
    if (!ticket) {
      return NextResponse.json({ status: "error", message: "Ticket not found." }, { status: 404 });
    }
    if (ticket.status === "closed") {
      return NextResponse.json(
        { status: "error", message: "This ticket is closed." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const message = (body.message || "").trim().replace(/<[^>]*>/g, "");
    if (!message) {
      return NextResponse.json(
        { status: "error", message: "Message is required." },
        { status: 400 }
      );
    }

    const user = session.user as any;
    const author = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "User";

    await prisma.ticket_messages.create({
      data: {
        ids: ids(),
        uid,
        ticket_id: ticketId,
        author,
        support: 0,
        message,
      },
    });

    await prisma.tickets.update({
      where: { id: ticketId },
      data: { changed: new Date(), admin_read: 1 },
    });

    return NextResponse.json({ status: "success", message: "Message sent." });
  } catch (e) {
    console.error("Ticket message POST error:", e);
    return NextResponse.json(
      { status: "error", message: "There was an error sending your message." },
      { status: 500 }
    );
  }
}
