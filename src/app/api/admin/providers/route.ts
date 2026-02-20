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
      await prisma.api_providers.create({
        data: {
          ids, name: body.name, url: body.url ?? "", key: body.api_key ?? "",
          type: body.type ?? "standard", balance: 0,
          status: body.status !== undefined ? Number(body.status) : 1,
          description: body.description ?? "", created: new Date(),
        },
      });
      return NextResponse.json({ status: "success", message: "Provider created" });
    }

    if (action === "update") {
      if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });
      await prisma.api_providers.update({
        where: { id: Number(body.id) },
        data: {
          name: body.name, url: body.url, key: body.api_key,
          type: body.type,
          status: body.status !== undefined ? Number(body.status) : undefined,
          description: body.description, changed: new Date(),
        },
      });
      return NextResponse.json({ status: "success", message: "Updated" });
    }

    if (action === "toggle-status") {
      const p = await prisma.api_providers.findUnique({ where: { id: Number(body.id) } });
      if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await prisma.api_providers.update({ where: { id: p.id }, data: { status: p.status === 1 ? 0 : 1 } });
      return NextResponse.json({ status: "success" });
    }

    if (action === "check-balance") {
      const provider = await prisma.api_providers.findUnique({ where: { id: Number(body.id) } });
      if (!provider || !provider.url || !provider.key) {
        return NextResponse.json({ error: "Provider not configured" }, { status: 400 });
      }
      try {
        const url = new URL(provider.url);
        url.searchParams.set("key", provider.key);
        url.searchParams.set("action", "balance");
        const res = await fetch(url.toString(), { method: "POST" });
        const data = await res.json();
        const balance = Number(data.balance ?? 0);
        await prisma.api_providers.update({ where: { id: provider.id }, data: { balance } });
        return NextResponse.json({ status: "success", balance });
      } catch {
        return NextResponse.json({ error: "Failed to check balance" }, { status: 500 });
      }
    }

    if (action === "delete") {
      await prisma.api_providers.delete({ where: { id: Number(body.id) } });
      return NextResponse.json({ status: "success", message: "Deleted" });
    }

    if (action === "fetch-services") {
      const provider = await prisma.api_providers.findUnique({ where: { id: Number(body.id) } });
      if (!provider || !provider.url || !provider.key) {
        return NextResponse.json({ error: "Provider not configured" }, { status: 400 });
      }
      try {
        const url = new URL(provider.url);
        url.searchParams.set("key", provider.key);
        url.searchParams.set("action", "services");
        const res = await fetch(url.toString(), { method: "POST" });
        const services = await res.json();
        return NextResponse.json({ status: "success", services: Array.isArray(services) ? services : [] });
      } catch {
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
