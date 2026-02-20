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
      await prisma.payments.create({
        data: {
          name: body.name ?? "", min: body.min ? Number(body.min) : 0,
          max: body.max ? Number(body.max) : 0, new_users: body.new_users ? Number(body.new_users) : 0,
          params: body.params ?? "", status: body.status !== undefined ? Number(body.status) : 1,
        },
      });
      return NextResponse.json({ status: "success", message: "Payment method created" });
    }

    if (action === "update") {
      await prisma.payments.update({
        where: { id: Number(body.id) },
        data: {
          name: body.name, min: body.min ? Number(body.min) : undefined,
          max: body.max ? Number(body.max) : undefined, new_users: body.new_users !== undefined ? Number(body.new_users) : undefined,
          params: body.params, status: body.status !== undefined ? Number(body.status) : undefined,
        },
      });
      return NextResponse.json({ status: "success", message: "Updated" });
    }

    if (action === "toggle-status") {
      const p = await prisma.payments.findUnique({ where: { id: Number(body.id) } });
      if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.payments.update({ where: { id: p.id }, data: { status: p.status === 1 ? 0 : 1 } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "delete") {
      await prisma.payments.delete({ where: { id: Number(body.id) } });
      return NextResponse.json({ status: "success", message: "Deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
