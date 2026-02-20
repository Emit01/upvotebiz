import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }
    const uid = session.user.uid;
    const body = await request.json();

    const { first_name, last_name, email, timezone, password, re_password } = body;

    if (!first_name || !last_name) {
      return NextResponse.json({
        status: "error",
        message: "Please fill in the required fields",
      });
    }

    if (!email) {
      return NextResponse.json({ status: "error", message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ status: "error", message: "Invalid email format" });
    }

    // Check if email already taken by another user
    const existingUser = await prisma.general_users.findFirst({
      where: { email, NOT: { id: uid } },
    });
    if (existingUser) {
      return NextResponse.json({
        status: "error",
        message: "An account for the specified email address already exists",
      });
    }

    const updateData: any = {
      first_name,
      last_name,
      email,
      timezone,
      changed: new Date(),
    };

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({
          status: "error",
          message: "Password must be at least 6 characters long",
        });
      }
      if (re_password !== password) {
        return NextResponse.json({
          status: "error",
          message: "Password does not match the confirm password",
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.general_users.update({
      where: { id: uid },
      data: updateData,
    });

    return NextResponse.json({ status: "success", message: "Updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { status: "error", message: "There was an error processing your request" },
      { status: 500 }
    );
  }
}
