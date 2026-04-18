import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PATCH(req: NextRequest) {
  try {
    const { verificationToken } = await req.json();

    if (!verificationToken) {
      return NextResponse.json({ message: "Verification token is required" }, { status: 400 });
    }

    const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET!) as { email: string };

    const user = await db.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 400 });
    }

    await db.user.update({
      where: { email: decoded.email },
      data: { emailVerified: true, verificationToken: null },
    });

    return NextResponse.json({
      message: "Email verified successfully",
      autoLoginToken: user.autoLoginToken,
      email: user.email,
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { message: "An error occurred while verifying your email" },
      { status: 500 },
    );
  }
}