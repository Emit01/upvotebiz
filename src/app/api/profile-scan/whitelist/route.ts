import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.uid) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }
  const uid = session.user.uid as number;

  const body = await request.json();
  const id = parseInt(body.id ?? "0");
  if (!id) {
    return NextResponse.json({ status: "error", message: "Invalid id" }, { status: 400 });
  }

  const row = await prisma.profile_scan.findFirst({
    where: { id, uid },
    select: { whitelist: true },
  });

  if (!row) {
    return NextResponse.json({ status: "error", message: "Not found" }, { status: 404 });
  }

  let data: any[] = [];
  try {
    const parsed = JSON.parse(row.whitelist || "[]");
    data = Array.isArray(parsed) ? parsed : [];
  } catch {
    data = [];
  }

  return NextResponse.json({ status: "success", data });
}
