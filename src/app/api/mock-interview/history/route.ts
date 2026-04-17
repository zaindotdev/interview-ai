import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ErrorResponse, HttpResponse } from "@/utils/response";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(new ErrorResponse("Unauthorized"), { status: 401 });
  }

  try {
    const body = await req.json();
    const { interviewId, status, startTime } = body;

    if (!interviewId || !status) {
      return NextResponse.json(
        new ErrorResponse("Missing required fields: interviewId, status"),
        { status: 400 },
      );
    }

    const validStatuses = ["ongoing", "completed", "incomplete"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        new ErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(", ")}`),
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(new ErrorResponse("User not found"), { status: 404 });
    }

    const mockInterview = await db.mockInterviews.findFirst({
      where: { id: interviewId, candidateId: user.id },
    });

    if (!mockInterview) {
      return NextResponse.json(
        new ErrorResponse("Mock interview not found or access denied"),
        { status: 404 },
      );
    }

    // ✅ Calculate duration for all terminal statuses
    let duration: number | null = null;
    if ((status === "completed" || status === "incomplete") && startTime) {
      duration = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    } else if (status === "completed") {
      duration = mockInterview.estimated_time; // already in seconds
    }

    const history = await db.$transaction(async (tx) => {
      const history = await tx.mockInterviewsHistory.upsert({
        where: {
          candidateId_mockInterviewId: {
            candidateId: user.id,
            mockInterviewId: interviewId,
          },
        },
        update: { duration, status },
        create: {
          candidateId: user.id,
          mockInterviewId: interviewId,
          status,
          duration,
        },
      });

      if (status === "completed") {
        await tx.mockInterviews.update({
          where: { id: interviewId },
          data: { markAsCompleted: true },
        });
      }

      return history;
    });

    return NextResponse.json(
      new HttpResponse("success", "Mock interview history saved", { history }),
      { status: 201 },
    );
  } catch (error) {
    console.error("[history] Failed to save mock interview history:", error);
    return NextResponse.json(new ErrorResponse("Something went wrong"), { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(new ErrorResponse("Unauthorized"), { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(new ErrorResponse("User not found"), { status: 404 });
    }

    const history = await db.mockInterviewsHistory.findMany({
      where: { candidateId: user.id },
      include: {
        mockInterview: {
          select: {
            topic: true,
            description: true,
            difficulty: true,
            estimated_time: true,
            markAsCompleted: true,
          },
        },
        mockInterviewReport: {
          select: { id: true, report: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      new HttpResponse("success", "Mock interviews history fetched successfully", history),
      { status: 200 },
    );
  } catch (error) {
    console.error("[history] Failed to get mock interviews history:", error);
    return NextResponse.json(
      new ErrorResponse("Failed to get mock interviews history"),
      { status: 500 },
    );
  }
}