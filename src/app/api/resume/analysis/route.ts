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
      where: {
        email: session.user.email!,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ⬇ Convert File to Buffer
    const buffer = Buffer.from(await resume.arrayBuffer());

    // ⬇ Extract text using pdf-parse (safe import version)
    const parsed = await pdfParse(buffer);
    const resumeText = parsed.text?.slice(0, 8000) || ""; // Truncate for Gemini

    // ⬇ Prepare prompt
    const prompt = `You are a senior technical recruiter with 10+ years of experience in software engineering hiring across Fortune 500 companies and high-growth startups. Your expertise spans full-stack development, DevOps, cloud architecture, mobile development, and emerging technologies.

TASK: Conduct a comprehensive analysis of the provided candidate résumé against the specified job description. Your analysis should be thorough, objective, and actionable for hiring decisions.

ANALYSIS FRAMEWORK:
1. **Technical Skills Assessment**: Evaluate programming languages, frameworks, tools, and technologies
2. **Experience Relevance**: Analyze work history, project complexity, and industry experience
3. **Educational Background**: Consider formal education, certifications, and continuous learning
4. **Soft Skills Indicators**: Leadership, collaboration, problem-solving, and communication abilities
5. **Career Progression**: Growth trajectory, role transitions, and increasing responsibilities
6. **Cultural Fit Potential**: Values alignment, work style, and team dynamics compatibility

SCORING METHODOLOGY:
- **90-100**: Exceptional match - All key requirements met with additional valuable skills
- **80-89**: Strong match - Most requirements met with minor gaps easily addressable
- **70-79**: Good match - Core requirements met but missing some important skills
- **60-69**: Moderate match - Basic requirements met but significant skill gaps exist
- **50-59**: Weak match - Some relevant experience but major gaps in key areas
- **Below 50**: Poor match - Insufficient relevant experience for the role

MATCH LEVEL CRITERIA:
- **High**: Score 80+, minimal training needed, can contribute immediately
- **Medium**: Score 60-79, some training required, can contribute with ramp-up time
- **Low**: Score below 60, extensive training needed, high risk for role success

ANALYSIS REQUIREMENTS:
- Be specific and detailed in your assessment
- Provide concrete examples from the résumé
- Consider both hard and soft skills
- Evaluate potential for growth and learning
- Account for transferable skills from adjacent domains
- Consider the seniority level of the position
- Factor in industry-specific requirements

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact schema (no additional text, explanations, or markdown formatting):

{
  "score": number,
  "matchLevel": "High" | "Medium" | "Low",
  "missingSkills": string[],
  "strengths": string[],
  "summary": string,
  "technicalSkillsMatch": {
    "programmingLanguages": string[],
    "frameworks": string[],
    "tools": string[],
    "databases": string[],
    "cloudPlatforms": string[],
    "matchPercentage": number
  },
  "experienceAnalysis": {
    "relevantYears": number,
    "industryMatch": boolean,
    "seniorityLevel": "Junior" | "Mid" | "Senior" | "Lead" | "Principal",
    "projectComplexity": "Low" | "Medium" | "High"
  },
  "educationAndCertifications": {
    "degreeRelevance": "High" | "Medium" | "Low" | "None",
    "certifications": string[],
    "continuousLearning": boolean
  },
  "softSkillsIndicators": {
    "leadership": boolean,
    "teamwork": boolean,
    "problemSolving": boolean,
    "communication": boolean
  },
  "recommendations": {
    "interviewFocus": string[],
    "trainingNeeds": string[],
    "potentialConcerns": string[]
  }
}

FIELD DESCRIPTIONS:
- **score**: Overall compatibility score (0-100)
- **matchLevel**: High/Medium/Low based on score and requirements
- **missingSkills**: Critical skills absent from résumé but required for role
- **strengths**: Key qualifications that make candidate attractive
- **summary**: 2-3 sentence overview of candidate fit and recommendation
- **technicalSkillsMatch**: Detailed breakdown of technical competencies
- **experienceAnalysis**: Work history relevance and seniority assessment
- **educationAndCertifications**: Academic background and professional development
- **softSkillsIndicators**: Non-technical competencies derived from résumé
- **recommendations**: Actionable insights for interview process and onboarding

IMPORTANT GUIDELINES:
- Base analysis solely on information provided in résumé and job description
- Avoid assumptions about unstated qualifications or experience
- Consider the specific requirements and preferences in the job description
- Account for different ways skills might be expressed or demonstrated
- Evaluate the candidate fairly regardless of educational background or career path
- Focus on job-relevant skills and experience
- Be objective and eliminate unconscious bias

---
RESUME:
"""${resumeText}"""

---
JOB DESCRIPTION:
"""${jobDescription}"""

Analyze the above résumé against the job description and return the JSON response following the specified schema exactly.`;
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

    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(filePath, buffer, {
        contentType: resume.type || "application/pdf",
        upsert: true,
      });

    // console.log("ERRRR_______________",error)
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    await db.resume.create({
      data: {
        userId: user.id,
        fileUrl: data.fullPath,
        parsedJson: analysis,
      },
    });

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
