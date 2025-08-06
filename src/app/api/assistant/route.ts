import { NextResponse, NextRequest } from "next/server";
import { HttpResponse, ErrorResponse } from "@/utils/response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { vapiClient } from "@/lib/vapi";
import { VapiError } from "@vapi-ai/server-sdk";
import redisClient from "@/lib/redis";

// Redis cache keys
const ASSISTANT_CACHE_KEY = "vapi:assistant:cached_id";
const CACHE_TTL = 3600; // 1 hour in seconds

// Helper function to ensure Redis connection
async function ensureRedisConnection() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return redisClient;
  } catch (error) {
    console.error("Redis connection failed:", error);
    throw new ErrorResponse("Cache service unavailable");
  }
}

// Helper function to get cached assistant ID
async function getCachedAssistantId(): Promise<string | null> {
  try {
    const client = await ensureRedisConnection();
    return await client.get(ASSISTANT_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to get cached assistant ID:", error);
    return null; // Graceful fallback
  }
}

// Helper function to set cached assistant ID
async function setCachedAssistantId(assistantId: string): Promise<void> {
  try {
    const client = await ensureRedisConnection();
    await client.setEx(ASSISTANT_CACHE_KEY, CACHE_TTL, assistantId);
  } catch (error) {
    console.warn("Failed to cache assistant ID:", error);
    // Don't throw error, caching failure shouldn't break the flow
  }
}

// Helper function to clear cached assistant ID
async function clearCachedAssistantId(): Promise<void> {
  try {
    const client = await ensureRedisConnection();
    await client.del(ASSISTANT_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear cached assistant ID:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Assistant API called");

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("No session found");
      return NextResponse.json(
        new ErrorResponse(
          "Authentication required. Please log in to continue.",
        ),
        { status: 401 },
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body:", requestBody);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
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
    } = requestBody;

    // Input validation
    const validationErrors = [];
    if (!topic?.trim()) validationErrors.push("Topic is required");
    if (!description?.trim()) validationErrors.push("Description is required");
    if (!estimated_time) validationErrors.push("Estimated time is required");
    if (!difficulty?.trim())
      validationErrors.push("Difficulty level is required");
    if (!candidateName?.trim())
      validationErrors.push("Candidate name is required");
    if (!Array.isArray(focus) || focus.length === 0) {
      validationErrors.push("Focus areas must be a non-empty array");
    }

    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors);
      return NextResponse.json(
        new ErrorResponse(`Validation failed: ${validationErrors.join(", ")}`),
        { status: 400 },
      );
    }

    const systemPrompt = `
# Technical Interview AI Assistant - Nora

## Core Identity & Purpose
You are Nora, a highly experienced and professional AI technical interviewer with deep expertise across multiple domains. Your primary mission is to conduct focused, structured technical interviews that accurately assess candidates' knowledge and problem-solving abilities within specific subject areas.

## Interview Configuration & Context

### Session Parameters
- **Primary Topic**: ${topic}
- **Topic Description**: ${description}
- **Focus Areas**: ${focus?.join(", ")}
- **Interview Duration**: ${estimated_time}
- **Difficulty Level**: ${difficulty}
- **Candidate Name**: ${candidateName}

## Strict Interview Protocol

### ABSOLUTE REQUIREMENTS
1. **Topic Adherence**: ONLY ask questions directly related to "${topic}"
2. **Description Alignment**: Base ALL questions on the provided description: "${description}"
3. **Focus Area Restriction**: Limit discussions exclusively to: ${focus?.join(", ")}
4. **Difficulty Matching**: Maintain consistent ${difficulty} level throughout
5. **Candidate Addressing**: Always address the candidate as ${candidateName}

### PROHIBITED AREAS
❌ **DO NOT ask about:**
- Personal background, experience, or career history
- Unrelated technical topics outside the scope
- General software development concepts not specified
- Career aspirations, motivations, or goals
- Company preferences or salary expectations
- Previous projects unless directly relevant to ${topic}
- Educational background or certifications
- Soft skills or behavioral questions
- Management or leadership experience (unless specified in focus areas)

## Professional Conversation Guidelines

### Communication Style
- Maintain professional, encouraging tone
- Provide clear acknowledgment of responses
- Use ${candidateName} naturally in conversation 
- Keep responses concise and focused
- Ask ONE clear question at a time
- Wait for complete answers before proceeding

### Interview Flow
1. **Opening**: Brief greeting and topic introduction
2. **Foundation**: Start with fundamental concepts
3. **Application**: Move to practical scenarios
4. **Depth**: Explore advanced understanding
5. **Wrap-up**: Summarize and conclude

## Question Design Framework

### Question Structure Guidelines
- **Singular Focus**: Ask ONE question at a time about ${topic}
- **Response Time**: Allow complete answers before proceeding
- **Clarity**: Keep questions concise and specific to ${topic}
- **Depth**: Avoid yes/no questions; encourage elaboration
- **Progression**: Follow-up questions should dive deeper into ${topic}

### Question Types
1. **Conceptual**: Test fundamental understanding
2. **Applied**: Assess practical implementation knowledge
3. **Problem-Solving**: Present scenarios requiring ${topic} expertise
4. **Comparative**: Compare approaches within ${topic} domain
5. **Troubleshooting**: Identify and resolve ${topic}-related issues

## Session Initialization

Begin the interview with:
"Hello ${candidateName}, I'm Nora, your AI technical interviewer. Today we'll focus on ${topic}, specifically covering ${description}. I'll ask questions about ${focus?.join(", ")} at a ${difficulty} level. 

Let's start with a fundamental question: Can you explain what ${topic} means to you and how you've encountered it in your work?"

---

**Remember**: Every interaction must assess ${candidateName}'s expertise in ${topic}. Stay focused on this objective throughout the session.
`;

    console.log("Creating/updating assistant...");

    // Try to get existing assistant from Redis cache
    const cachedAssistantId = await getCachedAssistantId();

    if (cachedAssistantId) {
      try {
        console.log("Checking cached assistant:", cachedAssistantId);
        const existingAssistant =
          await vapiClient.assistants.get(cachedAssistantId);

        if (existingAssistant && existingAssistant.id) {
          console.log("Updating existing assistant");
          // Update existing assistant
          const updatedAssistant = await vapiClient.assistants.update(
            cachedAssistantId,
            {
              name: "Nora - Technical Interviewer",
              firstMessage: `Hello ${candidateName}, I'm Nora, your AI technical interviewer. Today we'll focus on ${topic}. Are you ready to begin?`,
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
              voice: {
                provider: "vapi",
                voiceId: "Paige",
              },
              transcriber: {
                provider: "azure",
                language: "en-US",
              },
            },
          );

          // Refresh the cache
          await setCachedAssistantId(updatedAssistant.id);

          console.log("Assistant updated successfully:", updatedAssistant.id);
          return NextResponse.json(
            new HttpResponse(
              "success",
              `Interview assistant successfully updated for ${candidateName}`,
              {
                id: updatedAssistant.id,
                action: "updated",
                candidateName,
                topic,
                cached: true,
              },
            ),
            { status: 200 },
          );
        }
      } catch (getError) {
        console.warn(
          "Cached assistant no longer valid, clearing cache:",
          getError,
        );
        await clearCachedAssistantId();
      }
    }

    console.log("Creating new assistant...");
    // Create new assistant
    const newAssistant = await vapiClient.assistants.create({
      name: "Nora - Technical Interviewer",
      firstMessage: `Hello ${candidateName}, I'm Nora, your AI technical interviewer. Today we'll focus on ${topic}. Are you ready to begin?`,
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
      voice: {
        provider: "vapi",
        voiceId: "Paige",
      },
      transcriber: {
        provider: "assembly-ai",
        language: "en",
      },
      observabilityPlan: {
        provider: "langfuse",
        tags: ["interview", "technical", "assessment"],
        metadata: {
          candidateName: candidateName,
          topic: topic,
          description: description,
          focus: focus?.join(", "),
          difficulty: difficulty,
          estimated_time: estimated_time,
        },
      },
    });

    if (!newAssistant || !newAssistant.id) {
      console.error("Failed to create assistant - no ID returned");
      return NextResponse.json(
        new ErrorResponse(
          "Failed to create interview assistant. Please try again.",
        ),
        { status: 500 },
      );
    }

    console.log("Assistant created successfully:", newAssistant.id);

    // Cache the new assistant ID
    await setCachedAssistantId(newAssistant.id);

    return NextResponse.json(
      new HttpResponse(
        "success",
        `Interview assistant successfully created for ${candidateName}`,
        {
          id: newAssistant.id,
          action: "created",
          candidateName,
          topic,
          difficulty,
          estimatedTime: estimated_time,
          cached: false,
        },
      ),
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in interview assistant API:", error);

    if (error instanceof VapiError) {
      console.error("VAPI Error details:", error.message, error.statusCode);
      return NextResponse.json(
        new ErrorResponse(`VAPI service error: ${error.message}`),
        { status: 502 },
      );
    }

    // Generic server error
    return NextResponse.json(
      new ErrorResponse("Internal server error. Please try again later."),
      { status: 500 },
    );
  }
}
