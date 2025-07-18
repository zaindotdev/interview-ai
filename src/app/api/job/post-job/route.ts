import { NextResponse,NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req:NextRequest){
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    try {
        const {title, description, skills} = await req.json();
        
        const user = await db.user.findUnique({
            where:{
                email:session.user.email!
            }
        })

        if(!user){
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if(!user.role || user.role !== "RECRUITER"){
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const job = await db.jobListing.create({
            data:{
                title,
                description,
                skills,
                recruiterId:user.id,
            }
        })

        if(!job){
            return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
        }

        return NextResponse.json({ message: "Job created successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}