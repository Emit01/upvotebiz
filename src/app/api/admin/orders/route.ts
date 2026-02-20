import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, link, start_counter, remains, status } = body;
    if (!id) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

    const order = await prisma.orders.findUnique({ where: { id: Number(id) } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const data: any = {
      link: link ?? order.link,
      start_counter: start_counter ?? order.start_counter,
      remains: remains ?? order.remains,
      changed: new Date(),
    };

    if (status) {
      data.status = status;
      if (["refunded", "partial", "canceled"].includes(status)) {
        if (!["canceled", "refunded"].includes(order.status ?? "")) {
          const orderCharge = Number(order.charge ?? 0);
          const orderQuantity = Number(order.quantity ?? 0);
          const remainsNum = Number(remains ?? order.quantity ?? 0);
          let refundAmount = orderCharge;
          let realCharge = 0;
          let formalCharge = 0;
          let profit = 0;

          if (status === "partial" && orderQuantity > 0) {
            const delivered = orderQuantity - remainsNum;
            realCharge = (delivered / orderQuantity) * orderCharge;
            const originalFormalCharge = Number(order.formal_charge ?? 0);
            formalCharge = (delivered / orderQuantity) * originalFormalCharge;
            profit = realCharge - formalCharge;
            refundAmount = orderCharge - realCharge;
          } else {
            realCharge = 0;
            formalCharge = 0;
            profit = 0;
          }

          await prisma.general_users.update({
            where: { id: Number(order.uid) },
            data: { balance: { increment: refundAmount } },
          });

          data.charge = realCharge;
          data.formal_charge = formalCharge;
          data.profit = profit;
        }
      }
    }

    await prisma.orders.update({ where: { id: Number(id) }, data });
    return NextResponse.json({ status: "success", message: "Updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, id, ids } = body;

    if (action === "resend") {
      const order = await prisma.orders.findUnique({ where: { id: Number(id) } });
      if (!order || !["error", "fail"].includes(order.status ?? "")) {
        return NextResponse.json({ error: "Cannot resend this order" }, { status: 400 });
      }
      const service = await prisma.services.findFirst({ where: { id: Number(order.service_id) } });
      const data: any = {
        status: "pending",
        note: "Resent",
        changed: new Date(),
        api_order_id: -1,
      };
      if (service) {
        data.cate_id = String(service.cate_id);
        data.service_id = String(service.id);
        data.api_provider_id = service.api_provider_id;
        data.api_service_id = String(service.api_service_id);
        const originalPrice = Number(service.original_price ?? 0);
        data.formal_charge = (Number(order.quantity ?? 0) * originalPrice) / 1000;
        data.profit = Number(order.charge ?? 0) - data.formal_charge;
      }
      await prisma.orders.update({ where: { id: Number(id) }, data });
      return NextResponse.json({ status: "success", message: "Order resent" });
    }

    if (action === "bulk") {
      const { type } = body;
      const idArr = (ids as string).split(",").map(Number).filter(Boolean);
      if (!idArr.length) return NextResponse.json({ error: "No items selected" }, { status: 400 });

      if (type === "delete") {
        await prisma.orders.deleteMany({ where: { id: { in: idArr } } });
      } else if (["pending", "inprogress", "completed"].includes(type)) {
        await prisma.orders.updateMany({ where: { id: { in: idArr } }, data: { status: type, changed: new Date() } });
      } else if (type === "cancel") {
        const orders = await prisma.orders.findMany({ where: { id: { in: idArr } } });
        for (const order of orders) {
          if (!["canceled", "refunded"].includes(order.status ?? "")) {
            await prisma.general_users.update({
              where: { id: Number(order.uid) },
              data: { balance: { increment: Number(order.charge ?? 0) } },
            });
          }
          await prisma.orders.update({
            where: { id: order.id },
            data: { status: "canceled", charge: 0, formal_charge: 0, profit: 0, remains: "", changed: new Date() },
          });
        }
      } else if (type === "resend") {
        const orders = await prisma.orders.findMany({ where: { id: { in: idArr } } });
        for (const order of orders) {
          if (["error", "fail"].includes(order.status ?? "")) {
            const service = await prisma.services.findFirst({ where: { id: Number(order.service_id) } });
            const d: any = { status: "pending", note: "Resent", changed: new Date(), api_order_id: -1 };
            if (service) {
              d.formal_charge = (Number(order.quantity ?? 0) * Number(service.original_price ?? 0)) / 1000;
              d.profit = Number(order.charge ?? 0) - d.formal_charge;
            }
            await prisma.orders.update({ where: { id: order.id }, data: d });
          }
        }
      }
      return NextResponse.json({ status: "success", message: "Bulk action completed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
