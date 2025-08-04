import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HttpResponse, ErrorResponse } from "@/utils/response";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session || !session.user) {
    return NextResponse.json(new ErrorResponse("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const user = await db.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!user) {
      return NextResponse.json(new ErrorResponse("User not found"), {
        status: 400,
      });
    }

    return NextResponse.json(
      new HttpResponse("success", "Current user fetched successfully", user),
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to get current user:", error);
    return NextResponse.json(new ErrorResponse("Failed to get current user"), {
      status: 500,
    });
  }
}
