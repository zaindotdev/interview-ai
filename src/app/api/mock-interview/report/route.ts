import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ErrorResponse, HttpResponse } from "@/utils/response";
import { db } from "@/lib/prisma";
import { generateAIResponse, parseAIResponse } from "@/utils/ai";
import { z } from "zod";
<<<<<<< HEAD
=======

// Constants
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
const AI_TEMPERATURE = 0.3;

// Tier-based limits
const REPORT_LIMITS = {
  FREE: {
    maxTokens: 2000,
    rateLimit: 3, // 3 reports per 24 hours
    reportDepth: "basic",
    strengthsCount: 2,
    improvementsCount: 2,
    recommendationsCount: 2,
    nextStepsCount: 2,
    includeCharts: false,
    includeRedFlags: false,
    includeProcessingNotes: false,
  },
  PREMIUM: {
    maxTokens: 4000,
    rateLimit: 20, // 20 reports per 24 hours
    reportDepth: "comprehensive",
    strengthsCount: 5,
    improvementsCount: 5,
    recommendationsCount: 5,
    nextStepsCount: 4,
    includeCharts: true,
    includeRedFlags: true,
    includeProcessingNotes: true,
  },
} as const;

// Interfaces
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
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
<<<<<<< HEAD
  redFlags: string[];
=======
  redFlags?: string[]; // Optional for free users
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
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
<<<<<<< HEAD
  chartConfig: ChartConfig;
  confidence: number;
  processingNotes: string[];
}

async function checkRateLimit(userId: string): Promise<boolean> {
=======
  chartConfig?: ChartConfig; // Optional for free users
  confidence: number;
  processingNotes?: string[]; // Optional for free users
}

// Rate limit check based on tier
async function checkRateLimit(
  userId: string,
  isSubscribed: boolean
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = isSubscribed
    ? REPORT_LIMITS.PREMIUM.rateLimit
    : REPORT_LIMITS.FREE.rateLimit;

>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
  const recentReports = await db.mockInterviewsReport.count({
    where: {
      candidateId: userId,
      createdAt: {
<<<<<<< HEAD
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
=======
        gte: new Date(Date.now() - RATE_LIMIT_WINDOW),
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
      },
    },
  });

<<<<<<< HEAD
  return recentReports < 10; // Adjust limit as needed
}

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

=======
  return {
    allowed: recentReports < limit,
    remaining: Math.max(0, limit - recentReports),
  };
}

// Generate tier-appropriate prompt
function generatePrompt(
  transcripts: Transcripts[],
  focusedSkills: string[],
  topic: string,
  duration: number,
  isSubscribed: boolean
): string {
  const limits = isSubscribed ? REPORT_LIMITS.PREMIUM : REPORT_LIMITS.FREE;

  const depthInstructions = isSubscribed
    ? `You are an expert interview analyst with 15+ years of experience in talent assessment. Provide a COMPREHENSIVE, IN-DEPTH analysis with detailed feedback and actionable insights.`
    : `You are an interview analyst. Provide a CONCISE, HIGH-LEVEL analysis focused on key findings only. Keep feedback brief and to the point.`;

  const analysisRequirements = isSubscribed
    ? `
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
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
<<<<<<< HEAD

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
=======
`
    : `
**ANALYSIS REQUIREMENTS:**

1. **SCORING:** Use a 1-10 scale (1-3: Below expectations, 4-6: Meets some, 7-8: Good, 9-10: Excellent)

2. **EVALUATION AREAS:**
   - Communication: Clarity and articulation
   - Technical Knowledge: Domain understanding
   - Problem Solving: Analytical thinking
   - Cultural Fit: Team collaboration potential
`;

  const outputSchema = isSubscribed
    ? `
{
  "report": {
    "summary": "2-3 sentence executive summary highlighting key performance indicators",
    "overallScore": <number between 1-10>,
    "strengths": [${Array(limits.strengthsCount).fill('"specific strength"').join(", ")}],
    "areasForImprovement": [${Array(limits.improvementsCount).fill('"improvement area"').join(", ")}],
    "detailedFeedback": {
      "communication": {
        "score": <1-10>,
        "feedback": "Detailed feedback with specific examples from transcript"
      },
      "technicalKnowledge": {
        "score": <1-10>,
        "feedback": "Detailed assessment with examples"
      },
      "problemSolving": {
        "score": <1-10>,
        "feedback": "Detailed analysis with examples"
      },
      "culturalFit": {
        "score": <1-10>,
        "feedback": "Detailed evaluation with examples"
      }
    },
    "recommendations": [
      ${Array(limits.recommendationsCount).fill('"Actionable recommendation with specific steps"').join(",\n      ")}
    ],
    "nextSteps": [
      ${Array(limits.nextStepsCount).fill('"Action item with timeline"').join(",\n      ")}
    ],
    "redFlags": ["Any concerning behaviors identified", "Leave empty if none"]
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
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
<<<<<<< HEAD
        "r": {
          "beginAtZero": true,
          "max": 10,
          "ticks": {"stepSize": 2}
        }
=======
        "r": {"beginAtZero": true, "max": 10, "ticks": {"stepSize": 2}}
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
      },
      "plugins": {
        "legend": {"display": true, "position": "top"}
      }
    }
  },
<<<<<<< HEAD
  "confidence": <number 0-100 representing your confidence in this analysis>,
  "processingNotes": ["Any important context or limitations in the analysis"]
}

=======
  "confidence": <number 0-100>,
  "processingNotes": ["Any important context or limitations"]
}
`
    : `
{
  "report": {
    "summary": "1-2 sentence brief summary of key findings only",
    "overallScore": <number between 1-10>,
    "strengths": [${Array(limits.strengthsCount).fill('"brief strength"').join(", ")}],
    "areasForImprovement": [${Array(limits.improvementsCount).fill('"brief improvement area"').join(", ")}],
    "detailedFeedback": {
      "communication": {
        "score": <1-10>,
        "feedback": "1-2 sentences only"
      },
      "technicalKnowledge": {
        "score": <1-10>,
        "feedback": "1-2 sentences only"
      },
      "problemSolving": {
        "score": <1-10>,
        "feedback": "1-2 sentences only"
      },
      "culturalFit": {
        "score": <1-10>,
        "feedback": "1-2 sentences only"
      }
    },
    "recommendations": [${Array(limits.recommendationsCount).fill('"Brief recommendation"').join(", ")}],
    "nextSteps": [${Array(limits.nextStepsCount).fill('"Brief action item"').join(", ")}]
  },
  "confidence": <number 0-100>
}
`;

  const criticalInstructions = isSubscribed
    ? `
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
**CRITICAL INSTRUCTIONS:**
- Base all feedback on specific examples from the transcript
- Be constructive and professional in all feedback
- Ensure recommendations are actionable and specific
- Consider the interview type when weighting different skills
<<<<<<< HEAD
- If transcript quality is poor, note this in processingNotes
- Maintain objectivity and avoid bias
- Focus on observable behaviors and responses
- DO NOT include any text outside the JSON structure
- Ensure all JSON is valid and properly formatted`;
=======
- Maintain objectivity and avoid bias
- DO NOT include any text outside the JSON structure
- Ensure all JSON is valid and properly formatted
`
    : `
**CRITICAL INSTRUCTIONS FOR FREE TIER:**
- Keep ALL feedback BRIEF (1-2 sentences maximum per section)
- Provide exactly ${limits.strengthsCount} strengths, ${limits.improvementsCount} improvements, ${limits.recommendationsCount} recommendations
- Summary must be 1-2 sentences ONLY
- Focus on HIGH-LEVEL observations only
- DO NOT include chartConfig or processingNotes or redFlags in response
- DO NOT include any text outside the JSON structure
- Ensure all JSON is valid and properly formatted
`;

  return `${depthInstructions}

**INTERVIEW CONTEXT:**
- Skills Focus: ${JSON.stringify(focusedSkills)}
- Topic: ${topic}
- Duration: ${duration} seconds

**TRANSCRIPT TO ANALYZE:**
"""
${JSON.stringify(transcripts)}
"""

${analysisRequirements}

**OUTPUT FORMAT:**
Return a valid JSON object with this exact structure:
${outputSchema}

${criticalInstructions}`;
}

// Validate and sanitize report based on tier
function sanitizeReportForTier(
  report: AIResponse,
  isSubscribed: boolean
): AIResponse {
  const limits = isSubscribed ? REPORT_LIMITS.PREMIUM : REPORT_LIMITS.FREE;

  // Trim arrays to tier limits
  const sanitizedReport: AIResponse = {
    report: {
      ...report.report,
      strengths: report.report.strengths.slice(0, limits.strengthsCount),
      areasForImprovement: report.report.areasForImprovement.slice(
        0,
        limits.improvementsCount
      ),
      recommendations: report.report.recommendations.slice(
        0,
        limits.recommendationsCount
      ),
      nextSteps: report.report.nextSteps.slice(0, limits.nextStepsCount),
    },
    confidence: report.confidence,
  };

  // Include optional fields only for premium users
  if (isSubscribed) {
    sanitizedReport.chartConfig = report.chartConfig;
    sanitizedReport.processingNotes = report.processingNotes;
    sanitizedReport.report.redFlags = report.report.redFlags || [];
  } else {
    // Remove premium-only fields for free users
    delete sanitizedReport.chartConfig;
    delete sanitizedReport.processingNotes;
    delete sanitizedReport.report.redFlags;
  }

  return sanitizedReport;
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    if (!session?.user?.email) {
      return NextResponse.json(new ErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

<<<<<<< HEAD
    // Input validation
=======
    // Parse and validate input
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
    const { transcripts, conversationId, duration, focusedSkills, topic } =
      await req.json();

    if (!transcripts || !conversationId || !focusedSkills || !topic) {
      return NextResponse.json(new ErrorResponse("Missing required fields"), {
        status: 400,
      });
    }
<<<<<<< HEAD
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
=======

    // Fetch user with subscription status
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, isSubscribed: true },
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
    });

    if (!user) {
      return NextResponse.json(new ErrorResponse("User not found"), {
        status: 404,
      });
    }

<<<<<<< HEAD
    // Rate limiting check
    const withinRateLimit = await checkRateLimit(user.id);
    if (!withinRateLimit) {
      return NextResponse.json(
        new ErrorResponse("Rate limit exceeded. Please try again later."),
        { status: 429 },
=======
    // Get tier-specific limits
    const limits = user.isSubscribed
      ? REPORT_LIMITS.PREMIUM
      : REPORT_LIMITS.FREE;

    // Check rate limit with tier-specific limits
    const rateLimitStatus = await checkRateLimit(user.id, user.isSubscribed);
    if (!rateLimitStatus.allowed) {
      return NextResponse.json(
        new ErrorResponse(
          `Rate limit exceeded. ${user.isSubscribed ? "Premium users" : "Free users"} can generate ${limits.rateLimit} reports per 24 hours. Please try again later.`
        ),
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limits.rateLimit.toString(),
            "X-RateLimit-Remaining": rateLimitStatus.remaining.toString(),
          },
        }
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
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
<<<<<<< HEAD
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


    const parsedResponse = parseAIResponse<AIResponse>(
      aiRawResponse,
      "mock interview report",
    );

    // Save report to database using transaction
=======
          tier: user.isSubscribed ? "premium" : "free",
        }),
        { status: 200 }
      );
    }

    // Generate tier-appropriate prompt
    const prompt = generatePrompt(
      transcripts,
      focusedSkills,
      topic,
      duration,
      user.isSubscribed
    );

    // Call AI with tier-specific token limits
    const aiRawResponse = await generateAIResponse(prompt, {
      temperature: AI_TEMPERATURE,
      maxTokens: limits.maxTokens,
      userId: user.id,
    });

    // Parse and validate response
    const parsedResponse = parseAIResponse<AIResponse>(
      aiRawResponse,
      "mock interview report"
    );

    // Sanitize report based on tier (extra safety layer)
    const sanitizedResponse = sanitizeReportForTier(
      parsedResponse,
      user.isSubscribed
    );

    // Save report to database
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
    const report = await db.$transaction(async (prisma) => {
      return await prisma.mockInterviewsReport.create({
        data: {
          candidateId: user.id,
<<<<<<< HEAD
          report: JSON.stringify(parsedResponse.report),
=======
          report: JSON.stringify(sanitizedResponse.report),
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
          callId: conversationId,
          metaData: JSON.stringify({
            focusedSkills,
            topic,
            duration,
<<<<<<< HEAD
            confidence: parsedResponse.confidence,
            chartConfig: parsedResponse.chartConfig,
            processingNotes: parsedResponse.processingNotes,
=======
            confidence: sanitizedResponse.confidence,
            tier: user.isSubscribed ? "premium" : "free",
            ...(user.isSubscribed && {
              chartConfig: sanitizedResponse.chartConfig,
              processingNotes: sanitizedResponse.processingNotes,
            }),
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
            generatedAt: new Date().toISOString(),
          }),
        },
      });
    });

    return NextResponse.json(
      new HttpResponse("success", "Report generated successfully", {
        reportId: report.id,
<<<<<<< HEAD
      }),
      { status: 200 },
=======
        tier: user.isSubscribed ? "premium" : "free",
        rateLimit: {
          limit: limits.rateLimit,
          remaining: rateLimitStatus.remaining - 1,
        },
      }),
      { status: 200 }
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
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
<<<<<<< HEAD
          "Service temporarily unavailable. Please try again later.",
        ),
        { status: 503 },
=======
          "Service temporarily unavailable. Please try again later."
        ),
        { status: 503 }
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
      );
    }

    return NextResponse.json(
      new ErrorResponse(
<<<<<<< HEAD
        "Internal server error occurred while generating report",
      ),
      { status: 500 },
=======
        "Internal server error occurred while generating report"
      ),
      { status: 500 }
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
    );
  }
}

export async function GET(req: NextRequest) {
<<<<<<< HEAD
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(new ErrorResponse("Unauthorized"), {
      status: 401,
    });
  }
  try {
=======
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(new ErrorResponse("Unauthorized"), {
        status: 401,
      });
    }

>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
    const searchParams = req.nextUrl.searchParams;
    const reportId = searchParams.get("id");

    if (!reportId) {
<<<<<<< HEAD
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
=======
      return NextResponse.json(new ErrorResponse("Report ID is required"), {
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
        status: 400,
      });
    }

<<<<<<< HEAD
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
=======
    // Fetch user with subscription status
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isSubscribed: true },
    });

    if (!user) {
      return NextResponse.json(new ErrorResponse("User not found"), {
        status: 404,
      });
    }

    // Fetch report and verify ownership
    const report = await db.mockInterviewsReport.findFirst({
      where: {
        id: reportId,
        candidateId: user.id, // Ensure user can only access their own reports
      },
    });

    if (!report) {
      return NextResponse.json(new ErrorResponse("Report not found"), {
        status: 404,
      });
    }

    // Parse and sanitize report data
    const parsedReport = JSON.parse(report.report || "{}");
    const parsedMetaData = JSON.parse(report.metaData || "{}");

    // Apply tier restrictions when returning data
    const sanitizedReport = {
      ...report,
      report: parsedReport,
      metaData: {
        ...parsedMetaData,
        tier: user.isSubscribed ? "premium" : "free",
        // Remove premium features if user is no longer subscribed
        ...(user.isSubscribed
          ? {}
          : {
              chartConfig: undefined,
              processingNotes: undefined,
            }),
      },
    };

    // Remove redFlags from report if not subscribed
    if (!user.isSubscribed && sanitizedReport.report.redFlags) {
      delete sanitizedReport.report.redFlags;
    }

    return NextResponse.json(
      new HttpResponse("success", "Report fetched successfully", {
        report: sanitizedReport,
        tier: user.isSubscribed ? "premium" : "free",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return NextResponse.json(
      new ErrorResponse("Failed to retrieve report"),
      { status: 500 }
    );
  }
}
>>>>>>> d062816 (Fix: the interview time and resume analysis for free and premium users.)
