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
      await prisma.faqs.create({ data: { ids, question: body.question, answer: body.answer, sort: Number(body.sort ?? 0), status: Number(body.status ?? 1), created: new Date() } });
    } else if (body.action === "update") {
      await prisma.faqs.update({ where: { id: Number(body.id) }, data: { question: body.question, answer: body.answer, sort: Number(body.sort), status: Number(body.status), changed: new Date() } });
    } else if (body.action === "toggle-status") {
      const f = await prisma.faqs.findUnique({ where: { id: Number(body.id) } });
      if (f) await prisma.faqs.update({ where: { id: f.id }, data: { status: f.status === 1 ? 0 : 1 } });
    } else if (body.action === "delete") {
      await prisma.faqs.delete({ where: { id: Number(body.id) } });
    }
    return NextResponse.json({ status: "success" });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
