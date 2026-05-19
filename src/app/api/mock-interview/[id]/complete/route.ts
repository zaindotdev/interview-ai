import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.mockInterviews.update({
      where: { id },
      data:  { markAsCompleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[complete] Failed to mark interview complete:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}