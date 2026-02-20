import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createRandomStringKey } from "@/lib/utils";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const uid = session.user.uid;
    const newApiKey = createRandomStringKey(32);

    // Ensure uniqueness
    const existing = await prisma.general_users.findFirst({
      where: { api_key: newApiKey },
    });
    if (existing) {
      return NextResponse.json({
        status: "error",
        message: "Please try again",
      });
    }

    await prisma.general_users.update({
      where: { id: uid },
      data: { api_key: newApiKey, changed: new Date() },
    });

    return NextResponse.json({ status: "success", api_key: newApiKey });
  } catch (error) {
    console.error("API key regeneration error:", error);
    return NextResponse.json(
      { status: "error", message: "There was an error processing your request" },
      { status: 500 }
    );
  }
}
