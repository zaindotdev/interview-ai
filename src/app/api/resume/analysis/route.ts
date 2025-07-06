import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/prisma";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const resume = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { message: "Missing resume or job description" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
        where:{
            email:session.user.email!
        }
    })

    if(!user){
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ⬇ Convert File to Buffer
    const buffer = Buffer.from(await resume.arrayBuffer());

    // ⬇ Extract text using pdf-parse (safe import version)
    const parsed = await pdfParse(buffer);
    const resumeText = parsed.text?.slice(0, 8000) || ""; // Truncate for Gemini

    // ⬇ Prepare prompt
    const prompt = `You are a senior recruiter with experience in software-engineering hiring.

Analyze the following candidate résumé against the provided job description.
Return ONLY valid JSON matching this schema:

{
  "score": number,
  "matchLevel": "High" | "Medium" | "Low",
  "missingSkills": string[],
  "strengths": string[],
  "summary": string
}

---
RESUME:
"""${resumeText}"""

---
JOB DESCRIPTION:
"""${jobDescription}"""`;

    // ⬇ Get Gemini Model
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const content = result.response.candidates?.[0]?.content.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { message: "No content returned from Gemini" },
        { status: 500 }
      );
    }
    const filePath = `${user.id}/${Date.now()}-${resume.name}`;
    const analysis = JSON.parse(content);

    const {data,error} = await supabase.storage
      .from("resumes").upload(filePath, buffer, {
    contentType: resume.type || "application/pdf",
    upsert: true,
});

    // console.log("ERRRR_______________",error)
    if(error){
      return NextResponse.json(
        { message: error },
        { status: 400 }
      );
    }

    await db.resume.create({
        data:{
            userId: user.id,
            fileUrl: data.fullPath,
            parsedJson: analysis
        }
    })

    return NextResponse.json(
      {
        status: 200,
        message: "Resume analyzed successfully",
        data: analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}
