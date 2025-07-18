import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { jobId } = await req.json();
    const user = await db.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!user || !user.role || user.role !== "CANDIDATE") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const job = await db.jobListing.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const dbSession = await db.interviewSession.findFirst({
      where: {
        jobId: jobId,
        candidateId: user.id,
      },
    });

    if (dbSession) {
      return NextResponse.json(
        { message: "Session already exists", data: dbSession },
        { status: 200 }
      );
    }

    const timestamp = new Date().getTime() + 15 * 60 * 1000;  // 15 mins
    const time = new Date(timestamp).toISOString();
    const newSession = await db.interviewSession.create({
      data: {
        jobId: jobId,
        candidateId: user.id,
        time,
      },
    });

    return NextResponse.json({
      status: 200,
      message: "Session created",
      data: newSession,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
