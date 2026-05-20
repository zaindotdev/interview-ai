import { NextResponse, NextRequest } from "next/server";
import { HttpResponse, ErrorResponse } from "@/utils/response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { vapiClient } from "@/lib/vapi";
import { VapiError } from "@vapi-ai/server-sdk";
import { db } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { getRedis } from "@/lib/redis";

type CreateAssistantDto = Parameters<typeof vapiClient.assistants.create>[0];

type UpdateAssistantDto = Parameters<typeof vapiClient.assistants.update>[1];

// ─── Language configuration ────────────────────────────────────────────────

type SupportedLanguage = "english" | "urdu" | "hindi";

const LANGUAGE_CONFIG: Record<
  SupportedLanguage,
  {
    label: string;
    transcriber: NonNullable<CreateAssistantDto["transcriber"]>;
    voice: NonNullable<CreateAssistantDto["voice"]>;
    systemInstruction: string;
    greeting: (
      name: string,
      topic: string,
      focus: string[],
      difficulty: string,
    ) => string;
    openingQuestion: (topic: string) => string;
  }
> = {
  english: {
    label: "English",
    transcriber: {
      provider: "azure",
      language: "en-US",
    },
    voice: {
      provider: "vapi",
      voiceId: "Savannah",
    },
    systemInstruction:
      "Conduct this entire interview in English only. All your responses must be in English.",
    greeting: (name, topic, focus, difficulty) =>
      `Hello ${name}, I'm Nora, your interviewer for today. We'll be covering theoretical concepts in ${topic} — specifically around ${focus.join(
        ", ",
      )} — at a ${difficulty} level. I'll ask you a series of questions; please explain your understanding as clearly as you can.\n\nLet's begin: Can you explain what ${topic} is and what core problem it solves?`,
    openingQuestion: (topic) =>
      `Can you explain what ${topic} is and what core problem it solves?`,
  },

  urdu: {
    label: "اردو",
    transcriber: {
      provider: "azure", // ✅ Azure supports ur-PK
      language: "ur-IN",
    },
    voice: {
      provider: "azure",
      voiceId: "ur-PK-UzmaNeural",
    },
    systemInstruction: `Conduct this entire interview in Urdu (اردو). 
- All your questions, responses, and acknowledgements MUST be written in Urdu script (not Roman Urdu).
- Technical terms (e.g. "API", "database", "component") may remain in English where no natural Urdu equivalent exists.
- Maintain a professional but approachable tone appropriate for a technical interview in Urdu.`,
    greeting: (name, topic, focus, difficulty) =>
      `السلام علیکم ${name}، میں نورا ہوں، آج کے انٹرویو کے لیے آپ کی انٹرویوار۔ ہم ${topic} کے نظریاتی تصورات پر بات کریں گے — خاص طور پر ${focus.join(
        "، ",
      )} کے حوالے سے — ${difficulty} درجے پر۔ براہ کرم اپنی سمجھ کو واضح طور پر بیان کریں۔\n\nآئیے شروع کریں: کیا آپ بتا سکتے ہیں کہ ${topic} کیا ہے اور یہ کس بنیادی مسئلے کو حل کرتا ہے؟`,
    openingQuestion: (topic) =>
      `کیا آپ بتا سکتے ہیں کہ ${topic} کیا ہے اور یہ کس بنیادی مسئلے کو حل کرتا ہے؟`,
  },

  hindi: {
    label: "हिंदी",
    transcriber: {
      provider: "azure",
      language: "hi-IN",
    },
    voice: {
      provider: "azure",
      voiceId: "hi-IN-SwaraNeural",
    },
    systemInstruction: `Conduct this entire interview in Hindi (हिंदी).
- All your questions, responses, and acknowledgements MUST be written in Devanagari script (not Romanized Hindi).
- Technical terms (e.g. "API", "database", "component") may remain in English where no natural Hindi equivalent exists.
- Maintain a professional but approachable tone appropriate for a technical interview in Hindi.`,
    greeting: (name, topic, focus, difficulty) =>
      `नमस्ते ${name}, मैं नोरा हूँ, आज के इंटरव्यू के लिए आपकी इंटरव्यूअर। हम ${topic} के सैद्धांतिक विषयों पर बात करेंगे — विशेष रूप से ${focus.join(
        ", ",
      )} के बारे में — ${difficulty} स्तर पर। कृपया अपनी समझ को स्पष्ट रूप से बताएं।\n\nचलिए शुरू करते हैं: क्या आप बता सकते हैं कि ${topic} क्या है और यह किस मूल समस्या को हल करता है?`,
    openingQuestion: (topic) =>
      `क्या आप बता सकते हैं कि ${topic} क्या है और यह किस मूल समस्या को हल करता है?`,
  },
};

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        new ErrorResponse(
          "Authentication required. Please log in to continue.",
        ),
        { status: 401 },
      );
    }

    let requestBody;

    try {
      requestBody = await req.json();
    } catch {
      return NextResponse.json(
        new ErrorResponse("Invalid JSON format in request body."),
        { status: 400 },
      );
    }

    const {
      topic,
      description,
      estimated_time,
      difficulty,
      focus,
      candidateName,
      language = "english",
    } = requestBody;

    // ── Validation ──────────────────────────────────────────────────────────

    const validationErrors: string[] = [];

    if (!topic?.trim()) {
      validationErrors.push("Topic is required");
    }

    if (!description?.trim()) {
      validationErrors.push("Description is required");
    }

    if (!estimated_time) {
      validationErrors.push("Estimated time is required");
    }

    if (!difficulty?.trim()) {
      validationErrors.push("Difficulty level is required");
    }

    if (!candidateName?.trim()) {
      validationErrors.push("Candidate name is required");
    }

    if (!Array.isArray(focus) || focus.length === 0) {
      validationErrors.push("Focus areas must be a non-empty array");
    }

    if (!["english", "urdu", "hindi"].includes(language)) {
      validationErrors.push("Language must be one of: english, urdu, hindi");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        new ErrorResponse(`Validation failed: ${validationErrors.join(", ")}`),
        { status: 400 },
      );
    }

    const userEmail = session.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        new ErrorResponse("User email not found in session."),
        { status: 401 },
      );
    }

    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json(
        new ErrorResponse("User not found in database."),
        { status: 404 },
      );
    }

    // ── Redis ───────────────────────────────────────────────────────────────

    const redis = await getRedis();
    const cacheKey = `assistant:${user.id}`;

    // ── Language config ─────────────────────────────────────────────────────

    const langConfig = LANGUAGE_CONFIG[language as SupportedLanguage];

    // ── System prompt ───────────────────────────────────────────────────────

    const systemPrompt = `
# Interview AI Assistant - Nora

## Core Identity & Purpose
You are Nora, a professional AI interviewer conducting a structured theoretical interview. Your job is to ask questions, evaluate whether they were answered, and manage the interview flow accordingly. You are NOT a tutor, assistant, or advisor.

## LANGUAGE REQUIREMENT — CRITICAL
${langConfig.systemInstruction}

## Interview Configuration

- **Primary Topic**: ${topic}
- **Topic Description**: ${description}
- **Focus Areas**: ${focus?.join(", ")}
- **Interview Duration**: ${estimated_time}
- **Difficulty Level**: ${difficulty}
- **Candidate Name**: ${candidateName}
- **Interview Language**: ${langConfig.label}

## CRITICAL: Per-Turn Decision Logic

After every candidate response, you MUST silently classify it into one of three categories and act accordingly:

### Category 1 — NO ANSWER
→ Do NOT move to the next question.
→ Do NOT forget the current question.
→ Respond with a brief redirect in ${langConfig.label}, then restate the EXACT same question again.

### Category 2 — WRONG OR INCOMPLETE ANSWER
→ Acknowledge briefly and neutrally.
→ Move to the next question.

### Category 3 — ADEQUATE ANSWER
→ Acknowledge briefly and positively but neutrally.
→ Move to the next question.

## ABSOLUTE BEHAVIORAL RULES

### You ONLY do these things:
1. Ask one theoretical question at a time about ${topic}
2. Classify the response using the decision logic above
3. Either restate the same question or advance to the next one
4. Speak ONLY in ${langConfig.label}

### You NEVER do these things:
❌ Tell the candidate their answer is correct or incorrect
❌ Explain concepts, definitions, or give hints
❌ Answer any question the candidate asks you
❌ Ask practical, coding, or implementation-based questions
❌ Switch to a different language mid-interview

## Interview Flow

1. Opening
2. Fundamentals
3. Depth
4. Wrap-up

## Session Opening

Begin with exactly this:
"${langConfig.greeting(candidateName, topic, focus, difficulty)}"
`;

    // ── Assistant configuration ─────────────────────────────────────────────

    const assistantConfiguration: CreateAssistantDto = {
      name: "Nora - Technical Interviewer",

      firstMessage: langConfig.greeting(
        candidateName,
        topic,
        focus,
        difficulty,
      ),

      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      },

      voice: langConfig.voice,

      transcriber: langConfig.transcriber,

      observabilityPlan: {
        provider: "langfuse",
        tags: ["interview", "technical", "assessment", language],
        metadata: {
          candidateName,
          topic,
          description,
          focus: focus?.join(", "),
          difficulty,
          estimated_time,
          language,
        },
      },

      maxDurationSeconds: estimated_time,
    };

    const assistantUpdate: UpdateAssistantDto = assistantConfiguration;

    const assistantConfigForDb =
      assistantConfiguration as Prisma.InputJsonValue;

    // ── Reuse or create assistant ───────────────────────────────────────────

    // 1. Try Redis cache first
    const cachedAssistantId = await redis.get(cacheKey);

    if (cachedAssistantId) {
      try {
        const updatedVapiAssistant = await vapiClient.assistants.update(
          cachedAssistantId,
          assistantUpdate,
        );

        return NextResponse.json(
          new HttpResponse(
            "success",
            `Interview assistant successfully updated for ${candidateName}`,
            {
              id: updatedVapiAssistant.id,
              action: "updated",
              source: "redis-cache",
            },
          ),
          { status: 200 },
        );
      } catch {
        console.warn("[assistant] Cached VAPI assistant is stale");

        await redis.del(cacheKey);
      }
    }

    // 2. Try database
    const existingAssistant = await db.assistant.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (existingAssistant?.vapiAssistantId) {
      try {
        await vapiClient.assistants.get(existingAssistant.vapiAssistantId);

        const updatedVapiAssistant = await vapiClient.assistants.update(
          existingAssistant.vapiAssistantId,
          assistantUpdate,
        );

        await db.assistant.update({
          where: { id: existingAssistant.id },
          data: {
            topic,
            description,
            focus,
            difficulty,
            estimatedTime: estimated_time,
            configuration: assistantConfigForDb,
          },
        });

        // Cache for 12 hours
        await redis.set(cacheKey, updatedVapiAssistant.id, {
          EX: 60 * 60 * 12,
        });

        return NextResponse.json(
          new HttpResponse(
            "success",
            `Interview assistant successfully updated for ${candidateName}`,
            {
              id: updatedVapiAssistant.id,
              assistantId: existingAssistant.id,
              action: "updated",
              source: "database",
            },
          ),
          { status: 200 },
        );
      } catch {
        console.warn(
          "[assistant] Stale VAPI assistant — deleting and recreating",
        );

        await db.assistant.delete({
          where: { id: existingAssistant.id },
        });

        await redis.del(cacheKey);
      }
    }

    // 3. Create fresh assistant
    const newVapiAssistant = await vapiClient.assistants.create(
      assistantConfiguration,
    );

    if (!newVapiAssistant?.id) {
      return NextResponse.json(
        new ErrorResponse(
          "Failed to create interview assistant. Please try again.",
        ),
        { status: 500 },
      );
    }

    const newAssistant = await db.assistant.create({
      data: {
        userId: user.id,
        vapiAssistantId: newVapiAssistant.id,
        name: "Nora - Technical Interviewer",
        topic,
        description,
        focus,
        difficulty,
        estimatedTime: estimated_time,
        configuration: assistantConfigForDb,
      },
    });

    // Cache for 12 hours
    await redis.set(cacheKey, newVapiAssistant.id, {
      EX: 60 * 60 * 12,
    });

    return NextResponse.json(
      new HttpResponse(
        "success",
        `Interview assistant successfully created for ${candidateName}`,
        {
          id: newVapiAssistant.id,
          assistantId: newAssistant.id,
          action: "created",
          source: "new",
        },
      ),
      { status: 201 },
    );
  } catch (error) {
    console.error("[assistant] Error:", error);

    if (error instanceof VapiError) {
      return NextResponse.json(
        new ErrorResponse(`VAPI service error: ${error.message}`),
        { status: 502 },
      );
    }

    return NextResponse.json(
      new ErrorResponse("Internal server error. Please try again later."),
      { status: 500 },
    );
  }
}
