import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const options = await prisma.general_options.findMany();
  const map: Record<string, string> = {};
  for (const opt of options) {
    if (opt.name) map[opt.name] = opt.value ?? "";
  }
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { settings } = body as { settings: Record<string, string> };

    for (const [name, value] of Object.entries(settings)) {
      const existing = await prisma.general_options.findFirst({ where: { name } });
      if (existing) {
        await prisma.general_options.update({ where: { id: existing.id }, data: { value } });
      } else {
        await prisma.general_options.create({ data: { name, value } });
      }
    }

    return NextResponse.json({ status: "success", message: "Settings saved" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
