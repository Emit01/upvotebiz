import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const staffId = Number(body.staffId || (session.user as any)?.staffId);
    if (!staffId) return NextResponse.json({ error: "Staff ID required" }, { status: 400 });

    const staff = await prisma.general_staffs.findUnique({ where: { id: staffId } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const data: any = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      changed: new Date(),
    };

    if (body.new_password && body.current_password) {
      const crypto = await import("crypto");
      const md5Hash = crypto.createHash("md5").update(body.current_password).digest("hex");
      let isValid = false;
      if (staff.password === md5Hash) isValid = true;
      else if (staff.password?.startsWith("$2") || staff.password?.startsWith("$P$")) {
        isValid = await bcrypt.compare(body.current_password, staff.password!);
      }
      if (!isValid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      data.password = await bcrypt.hash(body.new_password, 10);
    }

    await prisma.general_staffs.update({ where: { id: staffId }, data });
    return NextResponse.json({ status: "success", message: "Profile updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
