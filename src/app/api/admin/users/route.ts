import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const existing = await prisma.general_users.findFirst({ where: { email: body.email } });
      if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      const ids = require("crypto").randomBytes(16).toString("hex");
      const password = await bcrypt.hash(body.password, 10);
      await prisma.general_users.create({
        data: {
          ids, email: body.email, password, first_name: body.first_name ?? "",
          last_name: body.last_name ?? "", status: 1, balance: 0, spent: "0",
          created: new Date(), changed: new Date(),
        },
      });
      return NextResponse.json({ status: "success", message: "User created" });
    }

    if (action === "update") {
      const data: any = {
        first_name: body.first_name, last_name: body.last_name,
        email: body.email, changed: new Date(),
      };
      if (body.status !== undefined) data.status = Number(body.status);
      await prisma.general_users.update({ where: { id: Number(body.id) }, data });
      return NextResponse.json({ status: "success", message: "Updated" });
    }

    if (action === "toggle-status") {
      const user = await prisma.general_users.findUnique({ where: { id: Number(body.id) } });
      if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.general_users.update({ where: { id: user.id }, data: { status: user.status === 1 ? 0 : 1 } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "add-funds") {
      const amount = parseFloat(body.amount);
      if (isNaN(amount) || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      await prisma.general_users.update({
        where: { id: Number(body.id) },
        data: { balance: { increment: amount } },
      });
      const ids = require("crypto").randomBytes(16).toString("hex");
      await prisma.general_transaction_logs.create({
        data: {
          ids, uid: Number(body.id), type: "add", amount,
          note: `Admin added funds`, status: 1, created: new Date(),
        },
      });
      return NextResponse.json({ status: "success", message: `Added ${amount}` });
    }

    if (action === "set-password") {
      const password = await bcrypt.hash(body.password, 10);
      await prisma.general_users.update({ where: { id: Number(body.id) }, data: { password } });
      return NextResponse.json({ status: "success", message: "Password updated" });
    }

    if (action === "delete") {
      await prisma.general_users.delete({ where: { id: Number(body.id) } });
      return NextResponse.json({ status: "success", message: "Deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
