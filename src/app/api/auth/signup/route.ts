import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ids, createRandomStringKey } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, password, re_password, terms } = body;

    if (!first_name || !last_name || !password || !email) {
      return NextResponse.json(
        { status: "error", message: "Please fill in the required fields" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z ]*$/.test(first_name)) {
      return NextResponse.json(
        { status: "error", message: "Only letters and white space allowed in first name" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z ]*$/.test(last_name)) {
      return NextResponse.json(
        { status: "error", message: "Only letters and white space allowed in last name" },
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

    if (password.length < 6) {
      return NextResponse.json(
        { status: "error", message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    if (re_password !== password) {
      return NextResponse.json(
        { status: "error", message: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (!terms) {
      return NextResponse.json(
        { status: "error", message: "You must agree with the Terms of Service" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.general_users.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: "error",
          message: "An account for the specified email address already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    await prisma.general_users.create({
      data: {
        ids: ids(),
        first_name,
        last_name,
        email,
        password: hashedPassword,
        timezone: body.timezone || "UTC",
        status: 1,
        api_key: createRandomStringKey(32),
        reset_key: createRandomStringKey(32),
        ref_key: createRandomStringKey(6),
        activation_key: createRandomStringKey(32),
        login_type: "Sign_up_page",
        balance: 0,
        spent: "0",
        changed: now,
        created: now,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Welcome! You have signed up successfully.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { status: "error", message: "There was an error processing your request" },
      { status: 500 }
    );
  }
}
