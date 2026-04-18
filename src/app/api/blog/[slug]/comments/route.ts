import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1200, "Comment is too long"),
});

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const [user, blog] = await Promise.all([
      db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, image: true },
      }),
      db.blog.findUnique({
        where: { slug },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    const payload = await req.json();
    const parsed = CreateCommentSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Invalid comment" },
        { status: 400 },
      );
    }

    const comment = await db.comment.create({
      data: {
        blogId: blog.id,
        authorId: user.id,
        content: parsed.data.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Comment posted",
        data: {
          ...comment,
          createdAt: comment.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[blog/comments] Failed to create comment:", error);
    return NextResponse.json(
      { message: "Failed to post comment" },
      { status: 500 },
    );
  }
}
