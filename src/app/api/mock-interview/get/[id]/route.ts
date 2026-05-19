import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { HttpResponse, ErrorResponse } from "@/utils/response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json(new ErrorResponse("Unauthorized"), { status: 401 });

    const {id} = await params;
    if (!id)
      return NextResponse.json(new ErrorResponse("Missing id"), { status: 400 });

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user)
      return NextResponse.json(new ErrorResponse("User not found"), { status: 404 });

    const mockInterview = await db.mockInterviews.findUnique({
      where: { id },
    });

    if (!mockInterview)
      return NextResponse.json(new ErrorResponse("Mock interview not found"), { status: 404 });

    if (mockInterview.candidateId !== user.id)
      return NextResponse.json(new ErrorResponse("Access denied"), { status: 403 });

    return NextResponse.json(
      new HttpResponse("success", "Mock interview fetched successfully", mockInterview),
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to get mock interviews:", error);
    return NextResponse.json(
      new ErrorResponse("Internal server error occurred while fetching mock interviews"),
      { status: 500 },
    );
  }
}