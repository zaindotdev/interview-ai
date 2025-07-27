import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!user || !user.role || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await db.interviewSession.findMany({
      where: {
        candidateId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Interview sessions fetched", data: interviews,status:200 },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

