import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { HttpResponse, ErrorResponse } from "@/utils/response";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(new ErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    // Get search parameters
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    // Verify user exists
    const user = await db.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!user) {
      return NextResponse.json(new ErrorResponse("User not found"), {
        status: 404,
      });
    }

    // Handle different cases based on whether ID is provided
    if (id) {
      // Fetch specific mock interview
      const mockInterview = await db.mockInterviews.findUnique({
        where: {
          id,
        },
      });

      if (!mockInterview) {
        return NextResponse.json(
          new ErrorResponse("Mock interview not found"),
          {
            status: 404,
          },
        );
      }

    //   Optional: Check if user owns this interview or has access to it
      if (mockInterview.candidateId !== user.id) {
        return NextResponse.json(new ErrorResponse("Access denied"), {
          status: 403,
        });
      }

      return NextResponse.json(
        new HttpResponse(
          "success",
          "Mock interview fetched successfully",
          mockInterview,
        ),
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("❌ Failed to get mock interviews:", error);
    return NextResponse.json(
      new ErrorResponse(
        "Internal server error occurred while fetching mock interviews",
      ),
      { status: 500 },
    );
  }
}
