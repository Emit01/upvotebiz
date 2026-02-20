import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create" || action === "update") {
      const data: any = {
        name: body.name,
        cate_id: body.cate_id ? Number(body.cate_id) : null,
        min: body.min ?? "0",
        max: body.max ?? "0",
        price: body.price ? Number(body.price) : 0,
        original_price: body.original_price ? Number(body.original_price) : 0,
        desc: body.desc ?? "",
        type: body.type ?? "default",
        add_type: body.add_type ?? "manual",
        status: body.status !== undefined ? Number(body.status) : 1,
        api_provider_id: body.api_provider_id ? Number(body.api_provider_id) : null,
        api_service_id: body.api_service_id ?? null,
        refill: body.refill !== undefined ? Number(body.refill) : 0,
        dripfeed: body.dripfeed !== undefined ? Number(body.dripfeed) : 0,
        changed: new Date(),
      };

      if (action === "create") {
        const ids = require("crypto").randomBytes(16).toString("hex");
        await prisma.services.create({ data: { ...data, ids, created: new Date() } });
        return NextResponse.json({ status: "success", message: "Service created" });
      } else {
        if (!body.id) return NextResponse.json({ error: "Service ID required" }, { status: 400 });
        await prisma.services.update({ where: { id: Number(body.id) }, data });
        return NextResponse.json({ status: "success", message: "Service updated" });
      }
    }

    if (action === "toggle-status") {
      const service = await prisma.services.findUnique({ where: { id: Number(body.id) } });
      if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.services.update({ where: { id: service.id }, data: { status: service.status === 1 ? 0 : 1 } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "delete") {
      await prisma.services.delete({ where: { id: Number(body.id) } });
      return NextResponse.json({ status: "success", message: "Deleted" });
    }

    if (action === "bulk") {
      const idArr = (body.ids as string).split(",").map(Number).filter(Boolean);
      if (!idArr.length) return NextResponse.json({ error: "No items" }, { status: 400 });
      if (body.type === "delete") await prisma.services.deleteMany({ where: { id: { in: idArr } } });
      else if (body.type === "active") await prisma.services.updateMany({ where: { id: { in: idArr } }, data: { status: 1 } });
      else if (body.type === "deactive") await prisma.services.updateMany({ where: { id: { in: idArr } }, data: { status: 0 } });
      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
