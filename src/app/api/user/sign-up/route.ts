import { db } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendMail } from "@/utils/send-mail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    console.log("ERRRRR", name, email, password);

    if (!email || !password || !name) {
      return NextResponse.json({
        status: 400,
        message: "Missing required fields",
      });
    }

    const sanitizedUsername = name.replace(/\s/g, "").toLowerCase();
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    console.log("ERRRR", existingUser);

    if (existingUser) {
      return NextResponse.json({
        status: 400,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("ERRRR", hashedPassword);

    const user = await db.user.create({
      data: {
        name,
        username: sanitizedUsername,
        email,
        password: hashedPassword,
        role: "CANDIDATE",
      },
    });
    console.log("User", user);

    if (!user) {
      return NextResponse.json({
        status: 400,
        message: "User not created",
      });
    }

    console.log("User", user);

    const mailSent = await sendMail({
      email,
      name,
      verificationLink: `${process.env.NEXTAUTH_URL}/verify?email=${email}`,
    });

    console.log("User", mailSent);

    if (!mailSent) {
      return NextResponse.json({
        status: 400,
        message: "Email not sent",
      });
    }

    console.log("ERRRR", mailSent);

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
