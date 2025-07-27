import {  NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await db.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!user || !user.role || user.role !== "CANDIDATE") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const interviews = await db.mockInterviews.findMany({
      where: {
        candidateId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Interview sessions fetched",
        data: interviews,
        status: 200,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}
