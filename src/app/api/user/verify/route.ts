import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req:NextRequest) {
  try {
    const {email} = await req.json();

    if(!email){
        return NextResponse.json({
            status: 400,
            message: "Missing required fields",
        })
    }

    const user = await db.user.findUnique({
        where:{
            email
        }
    });

    if(!user){
        return NextResponse.json({
            status: 400,
            message: "User not found",
        })
    }

    if(user.emailVerified){
        return NextResponse.json({
            status: 400,
            message: "User already verified",
        })
    }

    await db.user.update({
        where:{
            email
        },
        data:{
            emailVerified:new Date().toISOString(),
        }
    })

    return NextResponse.json({
        status: 200,
        message: "User verified",
    })
    
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { message: "Error verifying user", data: error },
      { status: 500 }
    );
  }
}
