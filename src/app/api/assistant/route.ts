import { db } from "@/lib/prisma";
import { GenerateSystemPrompt } from "@/lib/types";
import { vapiClient } from "@/lib/vapi";
import { ErrorResponse, HttpResponse } from "@/utils/response";
import { NextResponse } from "next/server";
import { CallObject } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface EndOfCallReport {
  transcript: string;
  summary: string;
  messages: Array<{ role: string; message: string }>;
  recordingUrl: string;
}

// In-memory cache or use Redis/database for production
let cachedAssistantId: string = "";

export async function POST(req: Request) {
  try {
    const { topic, description, focus, estimated_time, difficulty } =
      await req.json();

    // Validate required fields
    if (!topic || !description) {
      return NextResponse.json(
        new ErrorResponse("Topic and description are required"),
        { status: 400 },
      );
    }

    // Get or create the main assistant
    const assistantId = await getOrCreateMainAssistant();

    // Update assistant with new interview parameters
    const updatedAssistant = await vapiClient.assistants.update(assistantId, {
      name: "Nora",
      firstMessage:
        "Hi there! I'm Nora, your AI interviewer for today. I'm here to conduct a focused technical interview on the specific topic we've prepared for you. Let's get started right away - are you ready to begin the interview?",
      model: {
        provider: "openai", // Changed from xai to openai
        model: "gpt-4o", // Changed from grok-3 to gpt-4o
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: generateSystemPrompt({
              topic,
              description,
              focus,
              estimated_time,
              difficulty,
            }),
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Corrected from voiceId to voiceId
      },
      transcriber: {
        provider: "deepgram",
        language: "en",
      },
      server: {
        url: process.env.SERVER_URL,
      },
    });

    return NextResponse.json(
      new HttpResponse("success", "Interview parameters updated successfully", {
        assistantId: updatedAssistant.id,
        assistantName: updatedAssistant.name,
        interviewConfig: {
          topic,
          description,
          focus: focus || [],
          estimated_time: estimated_time || "30 minutes",
          difficulty: difficulty || "Medium",
        },
        reportingEnabled: true,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to prepare interview:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      new ErrorResponse(`Failed to prepare interview: ${errorMessage}`),
      { status: 500 },
    );
  }
}

async function getOrCreateMainAssistant(): Promise<string> {
  if (cachedAssistantId) {
    try {
      const existingAssistant =
        await vapiClient.assistants.get(cachedAssistantId);
      console.log(`✅ Using existing assistant: ${existingAssistant.id}`);
      return cachedAssistantId;
    } catch (error) {
      console.log("❌ Cached assistant not found, creating new one...");
      cachedAssistantId = "";
    }
  }

  try {
    const assistant = await vapiClient.assistants.create({
      name: "Nora - Interview Assistant",
      firstMessage: "Initializing interview parameters...",
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are Nora, an AI technical interviewer. Waiting for interview parameters...",
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
      },
      transcriber: {
        provider: "deepgram",
        language: "en",
      },
    });

    cachedAssistantId = assistant.id;
    console.log(`✅ Created new assistant: ${assistant.id}`);
    return assistant.id;
  } catch (error) {
    console.error("❌ Failed to create assistant:", error);
    throw new Error("Failed to create or retrieve assistant");
  }
}

function generateSystemPrompt({
  topic,
  description,
  focus,
  estimated_time,
  difficulty,
}: GenerateSystemPrompt): string {
  const focusAreas = focus?.length ? focus.join(", ") : "General concepts";
  const duration = estimated_time || "30 minutes";
  const level = difficulty || "Medium";

  return `You are Nora, a focused and professional AI technical interviewer.

CRITICAL: You MUST ONLY ask questions about the specific topic provided. Do NOT ask about other topics, personal background, or general introductions.

**Current Interview Parameters:**
- **Topic**: ${topic}
- **Description**: ${description}
- **Focus Areas**: ${focusAreas}
- **Estimated Duration**: ${duration}
- **Difficulty Level**: ${level}

**STRICT INTERVIEW RULES:**
1. ONLY ask questions directly related to "${topic}"
2. Base ALL questions on the provided description: "${description}"
3. Focus exclusively on these areas: ${focusAreas}
4. Match the difficulty level: ${level.toLowerCase()}
5. DO NOT ask about personal background, experience, or other topics

**Question Guidelines:**
- Ask ONE question at a time about ${topic}
- Wait for complete answers before proceeding
- Keep questions concise and specific to ${topic}
- Avoid yes/no questions
- Ask follow-up questions that dive deeper into ${topic}
- Encourage detailed explanations about ${topic} concepts
- If the candidate goes off-topic, gently redirect them back to ${topic}

**Interview Flow:**
1. Start with fundamental concepts of ${topic}
2. Progress to more complex aspects based on their responses
3. Ask practical application questions about ${topic}
4. Conclude with advanced scenarios related to ${topic}

Remember: Every single question must be directly related to "${topic}". Stay laser-focused on this subject throughout the entire interview.`;
}

export async function handleEndOfCallReport(
  message: {
    type: string;
    endedReason: string;
    call: CallObject;
    recordingUrl: string;
    summary: string;
    transcript: string;
    messages: Array<{ role: string; message: string }>;
  },
  candidateId: string,
) {
  if (message.type !== "end-of-call-report") {
    return NextResponse.json(new ErrorResponse("Invalid message type"), {
      status: 400,
    });
  }
  try {
    const report: EndOfCallReport = {
      transcript: message.transcript,
      summary: message.summary,
      messages: message.messages,
      recordingUrl: message.recordingUrl,
    };

    const generateReport = await db.mockInterviewsReport.create({
      data: {
        callId: message.call.id,
        report: JSON.stringify(report),
        candidateId,
      },
    });

    if (!generateReport) {
      return NextResponse.json(
        new ErrorResponse("Failed to store interview report"),
        { status: 500 },
      );
    }

    return NextResponse.json(
      new HttpResponse("success", "Interview report processed successfully", {
        callId: message.call.id,
        endedReason: message.endedReason,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Failed to process interview report:", error);
    return NextResponse.json(
      new ErrorResponse("Failed to process interview report"),
      { status: 500 },
    );
  }
}
