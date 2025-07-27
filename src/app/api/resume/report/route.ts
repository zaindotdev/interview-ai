import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

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
    })

    if(!user){
        return NextResponse.json({
            status: 400,
            message: "User not found",
        },{status:400})
    }

    const reports = await db.resume.findFirst({
        where:{
            userId:user.id
        }
    });

    return NextResponse.json({
        status: 200,
        message: "Resume reports fetched",
        data: reports,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
