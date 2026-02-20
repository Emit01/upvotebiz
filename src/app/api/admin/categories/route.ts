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
      await prisma.categories.create({
        data: { ids, name: body.name, sort: body.sort ? Number(body.sort) : 0, status: body.status !== undefined ? Number(body.status) : 1, created: new Date() },
      });
      return NextResponse.json({ status: "success", message: "Category created" });
    }

    if (action === "update") {
      if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
      await prisma.categories.update({
        where: { id: Number(body.id) },
        data: { name: body.name, sort: body.sort !== undefined ? Number(body.sort) : undefined, status: body.status !== undefined ? Number(body.status) : undefined, changed: new Date() },
      });
      return NextResponse.json({ status: "success", message: "Category updated" });
    }

    if (action === "toggle-status") {
      const cat = await prisma.categories.findUnique({ where: { id: Number(body.id) } });
      if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.categories.update({ where: { id: cat.id }, data: { status: cat.status === 1 ? 0 : 1 } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "delete") {
      await prisma.categories.delete({ where: { id: Number(body.id) } });
      return NextResponse.json({ status: "success", message: "Deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
