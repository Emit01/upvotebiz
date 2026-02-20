import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (body.action === "create") {
      const ids = require("crypto").randomBytes(16).toString("hex");
      await prisma.general_news.create({ data: { ids, type: body.type, description: body.description, status: Number(body.status ?? 1), created: new Date() } });
    } else if (body.action === "update") {
      await prisma.general_news.update({ where: { id: Number(body.id) }, data: { type: body.type, description: body.description, status: Number(body.status), changed: new Date() } });
    } else if (body.action === "toggle-status") {
      const n = await prisma.general_news.findUnique({ where: { id: Number(body.id) } });
      if (n) await prisma.general_news.update({ where: { id: n.id }, data: { status: n.status === 1 ? 0 : 1 } });
    } else if (body.action === "delete") {
      await prisma.general_news.delete({ where: { id: Number(body.id) } });
    }
    return NextResponse.json({ status: "success" });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
