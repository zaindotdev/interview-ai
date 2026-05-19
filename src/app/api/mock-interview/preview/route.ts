import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { HttpResponse, ErrorResponse } from "@/utils/response";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json(new ErrorResponse("Missing id"), { status: 400 });

  const mockInterview = await db.mockInterviews.findUnique({
    where: { id },
    select: {
      topic: true,
      difficulty: true,
      focus: true,
      description: true,
      estimated_time: true,
    },
  });

  if (!mockInterview)
    return NextResponse.json(new ErrorResponse("Not found"), { status: 404 });

  return NextResponse.json(
    new HttpResponse("success", "ok", mockInterview),
    { status: 200 },
  );
}