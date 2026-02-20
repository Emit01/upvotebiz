import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { status: "error", message: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { status: "error", message: "Invalid email format" },
        { status: 400 }
      );
    }

    const user = await prisma.general_users.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "The account does not exist" },
        { status: 404 }
      );
    }

    // In a production setup, send an actual email with the reset link.
    // The reset link format: /reset-password/{reset_key}
    // For now we just confirm the request was received.
    return NextResponse.json({
      status: "success",
      message:
        "We have sent you a link to reset your password. Please check your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { status: "error", message: "There was an error processing your request" },
      { status: 500 }
    );
  }
}
