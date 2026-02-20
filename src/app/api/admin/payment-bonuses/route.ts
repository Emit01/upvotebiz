import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const ids = require("crypto").randomBytes(16).toString("hex");
      await prisma.payments_bonus.create({
        data: {
          ids, payment_id: Number(body.payment_id), bonus_from: Number(body.bonus_from),
          percentage: Number(body.percentage), status: body.status !== undefined ? Number(body.status) : 1,
        },
      });
      return NextResponse.json({ status: "success", message: "Bonus created" });
    }

    if (action === "update") {
      await prisma.payments_bonus.update({
        where: { id: Number(body.id) },
        data: {
          payment_id: Number(body.payment_id), bonus_from: Number(body.bonus_from),
          percentage: Number(body.percentage), status: body.status !== undefined ? Number(body.status) : undefined,
        },
      });
      return NextResponse.json({ status: "success", message: "Updated" });
    }

    if (action === "delete") {
      await prisma.payments_bonus.delete({ where: { id: Number(body.id) } });
      return NextResponse.json({ status: "success", message: "Deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
