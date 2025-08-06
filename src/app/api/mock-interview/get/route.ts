import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { HttpResponse, ErrorResponse } from "@/utils/response";

export async function GET() {
  const session = await getServerSession(authOptions);
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

    const mockInterviews = await db.mockInterviews.findMany({
      where: {
        candidateId: user.id,
      },
    });

    return NextResponse.json(
      new HttpResponse(
        "success",
        "Mock interviews fetched successfully",
        mockInterviews,
      ),
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to get mock interviews:", error);
  }
}
