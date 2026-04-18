import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(_: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const [user, blog] = await Promise.all([
      db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
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

    const existingLike = await db.like.findUnique({
      where: {
        blogId_userId: {
          blogId: blog.id,
          userId: user.id,
        },
      },
      select: { id: true },
    });

    if (existingLike) {
      await db.like.delete({
        where: {
          blogId_userId: {
            blogId: blog.id,
            userId: user.id,
          },
        },
      });
    } else {
      await db.like.create({
        data: {
          blogId: blog.id,
          userId: user.id,
        },
      });
    }

    const likesCount = await db.like.count({
      where: { blogId: blog.id },
    });

    return NextResponse.json(
      {
        data: {
          liked: !existingLike,
          likesCount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[blog/likes] Failed to toggle like:", error);
    return NextResponse.json(
      { message: "Failed to update like" },
      { status: 500 },
    );
  }
}
