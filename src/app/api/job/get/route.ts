import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await req.url;
    const { searchParams } = new URL(url);
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const skill = searchParams.get("skill");

    const jobs = await db.jobListing.findMany({
      take: limit ? parseInt(limit) : 10,
      skip: page ? parseInt(page) : 0,
      where: {
        skills: {
          has: skill,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!jobs) {
      return NextResponse.json({ message: "Jobs not found" }, { status: 404 });
    }
    return NextResponse.json(
      {
        status: 200,
        message: "Jobs fetched",
        data: jobs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
