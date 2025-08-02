import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendMail } from "@/utils/send-mail";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, username } = await req.json();

    if (!email || !password || !name || !username) {
      return NextResponse.json({
        status: 400,
        message: "Missing required fields",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (
      !usernameRegex.test(username) ||
      username.length < 3 ||
      username.length > 20
    ) {
      return NextResponse.json(
        {
          message:
            "Username must be 3-20 characters and contain only letters, numbers, and underscores",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({
        status: 400,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const user = await db.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: "CANDIDATE",
        otp: otp.toString(),
        otpExpiry: otpExpiry.toISOString(),
        emailVerified: null,
      },
    });

    if (!user) {
      return NextResponse.json({
        status: 400,
        message: "User not created",
      });
    }

    try {
      await sendMail({
        email: user.email,
        name: user.name || "User",
        otp,
        otpExpiry: otpExpiry.toISOString(),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Delete the created user if email fails
      await db.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: 200,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      message: "Something went wrong",
      error,
    });
  }
}
