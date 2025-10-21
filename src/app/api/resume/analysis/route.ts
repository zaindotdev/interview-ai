import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToStorage } from "@/utils/upload";
import { db } from "@/lib/prisma";
import { MockInterviews } from "@/lib/types";
import { ErrorResponse, HttpResponse } from "@/utils/response";
import { processPDF } from "@/utils/process-pdf";
import { generateAIResponse, parseAIResponse } from "@/utils/ai";

const ANALYSIS_TEMPERATURE = 0.3;
const MOCK_INTERVIEW_TEMPERATURE = 0.4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_JOB_DESC_LENGTH = 50;

const LIMITS = {
  FREE: {
    mockInterviews: 2,
    maxTokens: 2000,
    analysisDepth: "basic",
  },
  PREMIUM: {
    mockInterviews: 6,
    maxTokens: 4000,
    analysisDepth: "comprehensive",
  },
} as const;

const errorResponse = (message: string, status: number, error?: Error) => {
  if (error) console.error("API Error:", error);
  return NextResponse.json(new ErrorResponse(message), { status });
};

const validateInput = (resume: File | null, jobDescription: string | null) => {
  if (!resume || !jobDescription) {
    throw new Error("Missing resume or job description");
  }

  if (!resume.type?.includes("pdf")) {
    throw new Error("Only PDF files are supported");
  }

  if (resume.size > MAX_FILE_SIZE) {
    throw new Error("File size too large. Maximum 10MB allowed");
  }

  if (jobDescription.length < MIN_JOB_DESC_LENGTH) {
    throw new Error("Job description too short. Please provide more details");
  }
};

const createAnalysisPrompt = (
  resumeText: string,
  jobDescription: string,
  isSubscribed: boolean,
) => {
  const limits = isSubscribed ? LIMITS.PREMIUM : LIMITS.FREE;

  const baseInstructions = isSubscribed
    ? `You are a senior technical recruiter with 10+ years of experience. Conduct a COMPREHENSIVE and IN-DEPTH analysis.`
    : `You are a technical recruiter. Provide a BASIC, HIGH-LEVEL analysis suitable for initial screening.`;

  const analysisDepth = isSubscribed
    ? `
ANALYSIS FRAMEWORK (Comprehensive):
1. **Technical Skills Assessment**: Deep evaluation of programming languages, frameworks, tools, and technologies
2. **Experience Relevance**: Detailed analysis of work history, project complexity, and industry experience
3. **Educational Background**: Thorough review of formal education, certifications, and continuous learning
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
`
    : `
ANALYSIS FRAMEWORK (Basic):
1. **Technical Skills Match**: Core technologies mentioned in resume vs job description
2. **Experience Level**: Years of experience and general relevance
3. **Education**: Basic degree information
4. **Overall Fit**: High-level assessment only

SCORING METHODOLOGY (Simplified):
- **80-100**: Strong match
- **60-79**: Moderate match
- **Below 60**: Weak match
`;

  const outputSchema = isSubscribed
    ? `
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
`
    : `
{
  "score": number,
  "matchLevel": "High" | "Medium" | "Low",
  "missingSkills": string[], // Top 3-5 only
  "strengths": string[], // Top 3-5 only
  "summary": string, // Keep under 200 words
  "technicalSkillsMatch": {
    "programmingLanguages": string[],
    "frameworks": string[],
    "matchPercentage": number
  },
  "experienceAnalysis": {
    "relevantYears": number,
    "seniorityLevel": "Junior" | "Mid" | "Senior"
  }
}
`;

  return `${baseInstructions}

${analysisDepth}

OUTPUT FORMAT: Return ONLY valid JSON matching this exact schema:
${outputSchema}

${!isSubscribed ? "\n⚠️ CRITICAL: Keep analysis BRIEF and HIGH-LEVEL. Free tier users receive basic screening only. Limit arrays to 3-5 items maximum. Summary should be 3-4 sentences maximum.\n" : ""}

RESUME: """${resumeText}"""
JOB DESCRIPTION: """${jobDescription}"""

Analyze the résumé against the job description and return the JSON response following the specified schema exactly.`;
};

const createMockInterviewPrompt = (
  resumeText: string,
  jobDescription: string,
  userId: string,
  isSubscribed: boolean,
) => {
  const limits = isSubscribed ? LIMITS.PREMIUM : LIMITS.FREE;

  const instructions = isSubscribed
    ? `Create ${limits.mockInterviews} comprehensive mock interview sessions with diverse question types and varying difficulty levels.`
    : `Create EXACTLY ${limits.mockInterviews} basic mock interview sessions focused on core competencies only. Keep questions straightforward and difficulty levels easier.`;

  return `You are an experienced technical interview coach. ${instructions}

CRITICAL REQUIREMENTS:
${!isSubscribed ? `- Generate EXACTLY ${limits.mockInterviews} sessions (no more, no less) for free tier users\n- Focus on BASIC/FUNDAMENTAL topics only\n- Use "easy" or "medium" difficulty only\n- Keep time estimates shorter (600-900 seconds)` : `- Generate ${limits.mockInterviews} sessions\n- Include mix of easy, medium, and hard difficulty\n- Cover diverse technical and behavioral topics`}

Each mock interview session must follow this interface:
{
  "topic": string,
  "description": string,
  "focus": string[], // ${!isSubscribed ? "2-3 items only" : "3-5 items"}
  "estimated_time": number, // TIME IN SECONDS AND SHOULD ALIGN WITH DIFFICULTY LEVEL
  "difficulty": "easy" | "medium" ${isSubscribed ? '| "hard"' : ""},
  "candidateId": "${userId}"
}

TIME RECOMMENDATIONS:
- Easy: ${isSubscribed ? "600-900 seconds (10-15 minutes)" : "240-480 seconds (4-8 minutes)"}
- Medium: ${isSubscribed ? "900-1200 seconds (15-20 minutes)" : "480-720 seconds (8-12 minutes)"}
${isSubscribed ? "\n- Hard: 1200-1800 seconds (20-30 minutes)" : ""}

Return ONLY a valid JSON array with EXACTLY ${limits.mockInterviews} sessions.

RESUME: """${resumeText}"""
JOB DESCRIPTION: """${jobDescription}"""
`;
};

const saveAnalysisData = async (
  userId: string,
  fileUrl: string,
  analysis: any,
  mockInterviews: MockInterviews[],
) => {
  try {
    await db.$transaction(async (tx) => {
      await tx.resume.create({
        data: {
          userId,
          fileUrl,
          parsedJson: analysis,
        },
      });

      const existingTopics = mockInterviews.map((interview) => interview.topic);
      if (existingTopics.length > 0) {
        await tx.mockInterviews.deleteMany({
          where: {
            candidateId: userId,
            topic: { in: existingTopics },
          },
        });
      }

      await tx.mockInterviews.createMany({
        data: mockInterviews,
      });

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

const validateMockInterviews = (
  mockInterviews: MockInterviews[],
  isSubscribed: boolean,
): MockInterviews[] => {
  const limits = isSubscribed ? LIMITS.PREMIUM : LIMITS.FREE;

  if (mockInterviews.length > limits.mockInterviews) {
    console.warn(
      `AI generated ${mockInterviews.length} interviews, limiting to ${limits.mockInterviews}`,
    );
    return mockInterviews.slice(0, limits.mockInterviews);
  }

  if (mockInterviews.length < limits.mockInterviews && !isSubscribed) {
    throw new Error(
      `Expected ${limits.mockInterviews} mock interviews for free tier, got ${mockInterviews.length}`,
    );
  }

  return mockInterviews;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("Unauthorized", 401);
    }
    const formData = await req.formData();
    const resume = formData.get("resume") as File;
    const jobDescription = formData.get("jobDescription") as string;
    validateInput(resume, jobDescription);
    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        isSubscribed: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }
    const limits = user.isSubscribed ? LIMITS.PREMIUM : LIMITS.FREE;
    const resumeText = await processPDF(resume);
    const buffer = Buffer.from(await resume.arrayBuffer());
    const analysisPrompt = createAnalysisPrompt(
      resumeText,
      jobDescription,
      user.isSubscribed,
    );
    const mockInterviewPrompt = createMockInterviewPrompt(
      resumeText,
      jobDescription,
      user.id,
      user.isSubscribed,
    );
    const [analysisRaw, mockInterviewsRaw] = await Promise.all([
      generateAIResponse(analysisPrompt, {
        temperature: ANALYSIS_TEMPERATURE,
        userId: user.id,
        maxTokens: limits.maxTokens,
      }),
      generateAIResponse(mockInterviewPrompt, {
        temperature: MOCK_INTERVIEW_TEMPERATURE,
        userId: user.id,
        maxTokens: limits.maxTokens,
      }),
    ]);
    const analysis = parseAIResponse<any>(analysisRaw, "resume analysis");
    const mockInterviewsParsed = parseAIResponse<MockInterviews[]>(
      mockInterviewsRaw,
      "mock interviews",
    );
    const validatedMockInterviews = validateMockInterviews(
      mockInterviewsParsed,
      user.isSubscribed,
    );
    const mockInterviewsWithCandidateId = validatedMockInterviews.map(
      (interview) => ({
        ...interview,
        candidateId: user.id,
      }),
    );
    const uploadData = await uploadToStorage(buffer);
    await saveAnalysisData(
      user.id,
      uploadData.url,
      analysis,
      mockInterviewsWithCandidateId,
    );
    return NextResponse.json(
      new HttpResponse("success", "Resume Analyzed Successfully", {
        shouldRefreshSession: true,
        analysis,
        mockInterviews: mockInterviewsWithCandidateId,
        tier: user.isSubscribed ? "premium" : "free",
        limits: {
          mockInterviewsCount: mockInterviewsWithCandidateId.length,
          maxAllowed: limits.mockInterviews,
        },
      }),
    );
  } catch (error: Error | any) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message, 500, error);
  }
}
