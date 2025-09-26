import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ErrorResponse, HttpResponse } from "@/utils/response";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(new ErrorResponse("Unauthorized"), {
      status: 401,
    });
  }

  try {
    const body = await req.json();
    const { interviewId, status, startTime } = body;

    if (!interviewId || !status) {
      return NextResponse.json(
        new ErrorResponse("Missing required fields: interviewId, status"),
        {
          status: 400,
        },
      );
    }

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

    const mockInterview = await db.mockInterviews.findFirst({
      where: {
        id: interviewId,
        candidateId: user.id,
      },
    });

    if (!mockInterview) {
      return NextResponse.json(
        new ErrorResponse("Mock interview not found or access denied"),
        {
          status: 404,
        },
      );
    }

    let duration: number | null = null;

    if (status === "completed" && startTime) {
      const startTimeMs = new Date(startTime).getTime();
      const endTimeMs = Date.now();
      duration = Math.floor((endTimeMs - startTimeMs) / 1000);
    } else if (status === "completed" && !startTime) {
      duration = mockInterview.estimated_time * 60;
    }

    const existedHistory = await db.mockInterviewsHistory.findFirst({
      where: {
        candidateId: user.id,
        mockInterviewId: interviewId,
      },
    });

    let history;
    if (existedHistory) {
      history = await db.mockInterviewsHistory.update({
        where: {
          id: existedHistory.id,
        },
        data: {
          duration,
          status,
        },
      });

      return NextResponse.json(
        new HttpResponse("Success", "Mock interview history updated", {
          history,
        }),
        {
          status: 200,
        },
      );
    }

    history = await db.mockInterviewsHistory.create({
      data: {
        candidateId: user.id,
        mockInterviewId: interviewId,
        status,
        duration,
      },
    });

    return NextResponse.json(
      new HttpResponse("Success", "Mock interview history created", {
        history,
      }),
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("❌ Failed to create mock interview history:", error);
    return NextResponse.json(new ErrorResponse("Something went wrong"), {
      status: 500,
    });
  }
}

export async function GET(req: NextRequest) {
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
        status: 404,
      });
    }

    const history = await db.mockInterviewsHistory.findMany({
      where: {
        candidateId: user.id,
      },
      include: {
        mockInterview: {
          select: {
            topic: true,
            description: true,
            difficulty: true,
            estimated_time: true,
          },
        },
        mockInterviewReport: {
          select: {
            id: true,
            report: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      new HttpResponse(
        "success",
        "Mock interviews history fetched successfully",
        history,
      ),
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to get mock interviews history:", error);
    return NextResponse.json(
      new ErrorResponse("Failed to get mock interviews history"),
      {
        status: 500,
      },
    );
  }
}
