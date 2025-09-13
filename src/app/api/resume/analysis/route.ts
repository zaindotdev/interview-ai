import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/prisma";
import { MockInterviews } from "@/lib/types";
import { ErrorResponse, HttpResponse } from "@/utils/response";

// Constants
const MAX_RESUME_TEXT_LENGTH = 8000;
const ANALYSIS_TEMPERATURE = 0.3;
const MOCK_INTERVIEW_TEMPERATURE = 0.4;
const MODEL_NAME = "gemini-2.5-flash";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Error response helper
const errorResponse = (message: string, status: number, error?: Error) => {
  if (error) console.error("API Error:", error);
  return NextResponse.json(new ErrorResponse(message), { status });
};

// Validation helpers
const validateInput = (resume: File | null, jobDescription: string | null) => {
  if (!resume || !jobDescription) {
    throw new Error("Missing resume or job description");
  }

  if (!resume.type?.includes("pdf")) {
    throw new Error("Only PDF files are supported");
  }

  if (resume.size > 10 * 1024 * 1024) {
    // 10MB limit
    throw new Error("File size too large. Maximum 10MB allowed");
  }

  if (jobDescription.length < 50) {
    throw new Error("Job description too short. Please provide more details");
  }
};

// Extract and validate user
const getValidatedUser = async (session: Session|any) => {
  if (!session?.user?.email) {
    throw new Error("Invalid session");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, hasOnboarded: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Process PDF with better error handling
const processPDF = async (resume: File): Promise<string> => {
  try {
    const buffer = Buffer.from(await resume.arrayBuffer());
    const parsed = await pdfParse(buffer);

    if (!parsed.text || parsed.text.trim().length === 0) {
      throw new Error("No text could be extracted from the PDF");
    }

    return parsed.text.slice(0, MAX_RESUME_TEXT_LENGTH);
  } catch (error) {
    throw new Error(
      `Failed to process PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// Generate prompts (extracted for better maintainability)
const createAnalysisPrompt = (resumeText: string, jobDescription: string) => `
You are a senior technical recruiter with 10+ years of experience in software engineering hiring across Fortune 500 companies and high-growth startups. Your expertise spans full-stack development, DevOps, cloud architecture, mobile development, and emerging technologies.

TASK: Conduct a comprehensive analysis of the provided candidate résumé against the specified job description. Your analysis should be thorough, objective, actionable for hiring decisions and also create the mock interview sessions for the candidate.

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

OUTPUT FORMAT: Return ONLY valid JSON matching this exact schema:

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

RESUME: """${resumeText}"""
JOB DESCRIPTION: """${jobDescription}"""

Analyze the above résumé against the job description and return the JSON response following the specified schema exactly.
`;

const createMockInterviewPrompt = (
  resumeText: string,
  jobDescription: string,
  userId: string,
) => `
You are an experienced technical interview coach. Create 4-6 structured mock interview sessions based on the candidate's resume and job requirements.

Each session must follow this interface:
{
  "topic": string,
  "description": string,
  "focus": string[],
  "estimated_time": number, // TIME IN SECONDS (600=10min, 900=15min, 1200=20min, 1800=30min)
  "difficulty": "easy" | "medium" | "hard",
  "candidateId": "${userId}"
}

TIME RECOMMENDATIONS:
- Easy: 600-900 seconds (10-15 minutes)
- Medium: 900-1200 seconds (15-20 minutes)  
- Hard: 1200-1800 seconds (20-30 minutes)

Return ONLY valid JSON array format.

RESUME: """${resumeText}"""
JOB DESCRIPTION: """${jobDescription}"""
`;

// Generate AI content with better error handling
const generateAIContent = async (
  model: GenerativeModel,
  prompt: string,
  temperature: number,
) => {
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
      },
    });

    const content = result.response.candidates?.[0]?.content.parts?.[0]?.text;
    if (!content) {
      throw new Error("No content generated");
    }

    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// Handle file upload with better error handling
const uploadResumeToStorage = async (
  buffer: Buffer,
  filePath: string,
  contentType: string,
) => {
  try {
    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw new Error(
      `Storage upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

// Database operations with transaction support
const saveAnalysisData = async (
  userId: string,
  fileUrl: string,
  analysis: string,
  mockInterviews: MockInterviews[],
) => {
  try {
    await db.$transaction(async (tx) => {
      // Save resume analysis
      await tx.resume.create({
        data: {
          userId,
          fileUrl,
          parsedJson: analysis,
        },
      });

      // Clean up existing mock interviews with same topics
      const existingTopics = mockInterviews.map((interview) => interview.topic);
      if (existingTopics.length > 0) {
        await tx.mockInterviews.deleteMany({
          where: {
            candidateId: userId,
            topic: { in: existingTopics },
          },
        });
      }

      // Save new mock interviews
      await tx.mockInterviews.createMany({
        data: mockInterviews,
      });

      // Update user onboarding status
      await tx.user.update({
        where: { id: userId },
        data: { hasOnboarded: true },
      });
    });
  } catch (error) {
    throw new Error(
      `Database operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse form data
    const formData = await req.formData();
    const resume = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;

    // Validation
    validateInput(resume, jobDescription);
    const user = await getValidatedUser(session);

    // Process PDF
    const resumeText = await processPDF(resume);
    const buffer = Buffer.from(await resume.arrayBuffer());

    // Prepare AI model and prompts
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const analysisPrompt = createAnalysisPrompt(resumeText, jobDescription);
    const mockInterviewPrompt = createMockInterviewPrompt(
      resumeText,
      jobDescription,
      user.id,
    );

    // Run AI analysis concurrently
    const [analysis, mockInterviews] = await Promise.all([
      generateAIContent(model, analysisPrompt, ANALYSIS_TEMPERATURE),
      generateAIContent(model, mockInterviewPrompt, MOCK_INTERVIEW_TEMPERATURE),
    ]);

    // Ensure mock interviews have candidateId
    const mockInterviewsWithCandidateId = mockInterviews.map(
      (interview: MockInterviews) => ({
        ...interview,
        candidateId: user.id,
      }),
    );

    // Upload resume and save data
    const filePath = `${user.id}/${Date.now()}-${resume.name}`;
    const uploadData = await uploadResumeToStorage(
      buffer,
      filePath,
      resume.type || "application/pdf",
    );

    await saveAnalysisData(
      user.id,
      uploadData.fullPath,
      analysis,
      mockInterviewsWithCandidateId,
    );

    // Return success response with a flag to indicate session should be refreshed
    return NextResponse.json(
      new HttpResponse("success", "Resume Analyzed Successfully", {
        shouldRefreshSession: true, // Flag for client to refresh session
        analysis,
        mockInterviews: mockInterviewsWithCandidateId,
      }),
    );
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message, 500, error);
  }
}
