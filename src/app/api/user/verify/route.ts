import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { otp,email } = await req.json();

    if (!email || !otp || typeof otp !== "string") {
      return NextResponse.json(
        { message: "Invalid or missing OTP and email" },
        { status: 400 }
      );
    }

    
    const user = await db.user.findUnique({
      where: {
        email
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 400 }
      );
    }

    if (!user.otp) {
      return NextResponse.json(
        { message: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return NextResponse.json(
        { message: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Update user to mark as verified and clear OTP
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}