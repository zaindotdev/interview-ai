import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ErrorResponse, HttpResponse } from "@/utils/response";
import { db } from "@/lib/prisma";
import { generateAIResponse, parseAIResponse } from "@/utils/ai";
import { z } from "zod";
// Response type definitions
interface ReportData {
  summary: string;
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: {
    communication: { score: number; feedback: string };
    technicalKnowledge: { score: number; feedback: string };
    problemSolving: { score: number; feedback: string };
    culturalFit: { score: number; feedback: string };
  };
  recommendations: string[];
  nextSteps: string[];
  redFlags: string[];
}

interface ChartConfig {
  chartType: "radar" | "bar" | "line" | "pie";
  chartData: Array<{
    category: string;
    score: number;
    benchmark?: number;
  }>;
  chartOptions: {
    title: string;
    scales?: Record<string, any>;
    plugins?: Record<string, any>;
  };
}

interface Transcripts {
  role: string;
  content: string;
}

interface AIResponse {
  report: ReportData;
  chartConfig: ChartConfig;
  confidence: number;
  processingNotes: string[];
}

// Rate limiting check
async function checkRateLimit(userId: string): Promise<boolean> {
  const recentReports = await db.mockInterviewsReport.count({
    where: {
      candidateId: userId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  return recentReports < 10; // Adjust limit as needed
}

// Generate optimized prompt
function generatePrompt(
  transcripts: Transcripts[],
  focusedSkills?: string[],
  topic?: string,
  duration?: number,
): string {
  return `You are an expert interview analyst with 15+ years of experience in talent assessment across various industries. Your task is to analyze the following interview transcript and generate a comprehensive, actionable report.

**INTERVIEW CONTEXT:**
- Type: ${JSON.stringify(focusedSkills) || "Not specified"}
- Position: ${JSON.stringify(topic) || "Not specified"}
- Duration: ${duration ? `${duration} seconds` : "Not specified"}

**TRANSCRIPT TO ANALYZE:**
"""
${JSON.stringify(transcripts)}
"""

**ANALYSIS REQUIREMENTS:**

1. **SCORING METHODOLOGY:** Use a 1-10 scale where:
   - 1-3: Below expectations, significant concerns
   - 4-6: Meets some expectations, areas for improvement
   - 7-8: Meets expectations, good performance
   - 9-10: Exceeds expectations, exceptional performance

2. **EVALUATION CRITERIA:**
   - Communication: Clarity, articulation, listening skills, engagement
   - Technical Knowledge: Domain expertise, problem-solving approach, depth of understanding
   - Problem Solving: Analytical thinking, creativity, structured approach, adaptability
   - Cultural Fit: Team collaboration indicators, values alignment, attitude, professionalism

3. **RED FLAGS TO IDENTIFY:**
   - Inconsistencies in responses
   - Lack of preparation or research
   - Poor attitude or unprofessional behavior
   - Unrealistic salary expectations or demands
   - Gaps in critical knowledge areas
   - Communication barriers

**OUTPUT FORMAT:**
Return a valid JSON object with this exact structure:

{
  "report": {
    "summary": "2-3 sentence executive summary highlighting key performance indicators and overall impression",
    "overallScore": <number between 1-10>,
    "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
    "areasForImprovement": ["improvement area 1", "improvement area 2", "improvement area 3"],
    "detailedFeedback": {
      "communication": {
        "score": <1-10>,
        "feedback": "Specific feedback on communication skills with examples from transcript"
      },
      "technicalKnowledge": {
        "score": <1-10>,
        "feedback": "Assessment of technical competency with specific examples"
      },
      "problemSolving": {
        "score": <1-10>,
        "feedback": "Analysis of problem-solving approach and critical thinking"
      },
      "culturalFit": {
        "score": <1-10>,
        "feedback": "Evaluation of cultural alignment and soft skills"
      }
    },
    "recommendations": [
      "Actionable recommendation 1 with specific steps",
      "Actionable recommendation 2 with timeline",
      "Actionable recommendation 3 with resources"
    ],
    "nextSteps": [
      "Immediate action item 1 (within 1 week)",
      "Short-term goal 1 (within 1 month)",
      "Long-term development goal (3-6 months)"
    ],
    "redFlags": ["Any concerning behaviors or responses identified", "Leave empty array if none"]
  },
  "chartConfig": {
    "chartType": "radar",
    "chartData": [
      {"category": "Communication", "score": <score>, "benchmark": 7},
      {"category": "Technical Knowledge", "score": <score>, "benchmark": 7},
      {"category": "Problem Solving", "score": <score>, "benchmark": 7},
      {"category": "Cultural Fit", "score": <score>, "benchmark": 7}
    ],
    "chartOptions": {
      "title": "Interview Performance Analysis",
      "scales": {
        "r": {
          "beginAtZero": true,
          "max": 10,
          "ticks": {"stepSize": 2}
        }
      },
      "plugins": {
        "legend": {"display": true, "position": "top"}
      }
    }
  },
  "confidence": <number 0-100 representing your confidence in this analysis>,
  "processingNotes": ["Any important context or limitations in the analysis"]
}

**CRITICAL INSTRUCTIONS:**
- Base all feedback on specific examples from the transcript
- Be constructive and professional in all feedback
- Ensure recommendations are actionable and specific
- Consider the interview type when weighting different skills
- If transcript quality is poor, note this in processingNotes
- Maintain objectivity and avoid bias
- Focus on observable behaviors and responses
- DO NOT include any text outside the JSON structure
- Ensure all JSON is valid and properly formatted`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    if (!session?.user?.email) {
      return NextResponse.json(new ErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

    // Input validation
    const { transcripts, conversationId, duration, focusedSkills, topic } =
      await req.json();
    console.log({
      transcripts,
      conversationId,
      duration,
      focusedSkills,
      topic,
    });

    if (!transcripts || !conversationId || !focusedSkills || !topic) {
      return NextResponse.json(new ErrorResponse("Missing required fields"), {
        status: 400,
      });
    }
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(new ErrorResponse("User not found"), {
        status: 404,
      });
    }

    // Rate limiting check
    const withinRateLimit = await checkRateLimit(user.id);
    if (!withinRateLimit) {
      return NextResponse.json(
        new ErrorResponse("Rate limit exceeded. Please try again later."),
        { status: 429 },
      );
    }

    // Check for duplicate reports
    const existingReport = await db.mockInterviewsReport.findFirst({
      where: {
        candidateId: user.id,
        callId: conversationId,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        new HttpResponse("success", "Report already exists", {
          report: existingReport,
        }),
        { status: 200 },
      );
    }

    const prompt = generatePrompt(transcripts, focusedSkills, topic, duration);

    const aiRawResponse = await generateAIResponse(prompt, {
      temperature: 0.3,
      maxTokens: 4000,
      userId: user.id,
    });

    console.log("AI RAW RESPONSE:", aiRawResponse);

    const parsedResponse = parseAIResponse<AIResponse>(
      aiRawResponse,
      "mock interview report",
    );

    // Save report to database using transaction
    const report = await db.$transaction(async (prisma) => {
      return await prisma.mockInterviewsReport.create({
        data: {
          candidateId: user.id,
          report: JSON.stringify(parsedResponse.report),
          callId: conversationId,
          metaData: JSON.stringify({
            focusedSkills,
            topic,
            duration,
            confidence: parsedResponse.confidence,
            chartConfig: parsedResponse.chartConfig,
            processingNotes: parsedResponse.processingNotes,
            generatedAt: new Date().toISOString(),
          }),
        },
      });
    });

    console.log(`Report created successfully for user ${user.email}`);

    return NextResponse.json(
      new HttpResponse("success", "Report generated successfully", {
        reportId: report.id,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Report generation error:", error);

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(new ErrorResponse("Invalid input data"), {
        status: 400,
      });
    }

    if (error instanceof Error && error.message.includes("quota")) {
      return NextResponse.json(
        new ErrorResponse(
          "Service temporarily unavailable. Please try again later.",
        ),
        { status: 503 },
      );
    }

    return NextResponse.json(
      new ErrorResponse(
        "Internal server error occurred while generating report",
      ),
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(new ErrorResponse("Unauthorized"), {
      status: 401,
    });
  }
  try {
    const searchParams = req.nextUrl.searchParams;
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json(new ErrorResponse("Report not found"), {
        status: 404,
      });
    }
    const user = await db.user.findUnique({
      where: {
        email: session.user.email!,
      },
    });

    if (!user) {
      return NextResponse.json(new ErrorResponse("User not found"), {
        status: 400,
      });
    }

    const reports = await db.mockInterviewsReport.findFirst({
      where: {
        id: reportId,
      },
    });

    const sanitizeReport = {
      ...reports,
      report: JSON.parse(reports?.report || "{}"),
      metaData: JSON.parse(reports?.metaData || "{}"),
    };

    return NextResponse.json(
      new HttpResponse("success", "Report fetched successfully", {
        report: sanitizeReport,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to get the report of mock interview:", error);
    return NextResponse.json(
      new ErrorResponse("Failed to get the report of mock interview"),
      {
        status: 500,
      },
    );
  }
}
