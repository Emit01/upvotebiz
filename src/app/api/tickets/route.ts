import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOption } from "@/lib/options";
import { ids } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }
    const uid = (session.user as any).uid;
    if (!uid) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const limit = parseInt(await getOption("default_pending_ticket_per_user", "2"), 10);
    if (limit > 0) {
      const pendingCount = await prisma.tickets.count({
        where: {
          uid,
          status: { in: ["pending", "answered"] },
        },
      });
      if (pendingCount >= limit) {
        return NextResponse.json(
          { status: "error", message: "The number of pending tickets has been limited." },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const subject = (body.subject || "").trim();
    const description = (body.description || "").trim().replace(/<[^>]*>/g, "");

    if (!subject) {
      return NextResponse.json(
        { status: "error", message: "Subject is required." },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json(
        { status: "error", message: "Description is required." },
        { status: 400 }
      );
    }

    const ticket = await prisma.tickets.create({
      data: {
        ids: ids(),
        uid,
        subject,
        description,
        status: "pending",
        user_read: 0,
        admin_read: 1,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Ticket created.",
      ticket_id: ticket.id,
    });
  } catch (e) {
    console.error("Tickets POST error:", e);
    return NextResponse.json(
      { status: "error", message: "There was an error creating the ticket." },
      { status: 500 }
    );
  }
}
