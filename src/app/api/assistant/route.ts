import { NextResponse, NextRequest } from "next/server";
import { HttpResponse, ErrorResponse } from "@/utils/response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { vapiClient } from "@/lib/vapi";
import { VapiError } from "@vapi-ai/server-sdk";
import {db} from "@/lib/prisma";

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

    const assistantConfiguration = {
      name: "Nora - Technical Interviewer",
      firstMessage: `Hello ${candidateName}, I'm Nora, your AI technical interviewer. Today we'll focus on ${topic}. Are you ready to begin?`,
      model: {
        provider: "openai" as const,
        model: "gpt-4o" as const,
        temperature: 0.7,
        messages: [
          {
            role: "system" as const,
            content: systemPrompt,
          },
        ],
      },
      voice: {
        provider: "vapi" as const,
        voiceId: "Paige" as const,
      },
      transcriber: {
        provider: "azure" as const,
        language: "en-US" as "en-US",
      },
      observabilityPlan: {
        provider: "langfuse" as const,
        tags: ["interview", "technical", "assessment"],
        metadata: {
          candidateName,
          topic,
          description,
          focus: focus?.join(", "),
          difficulty,
          estimated_time,
        },
      },
    };

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

    const existingAssistant = await db.assistant.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (existingAssistant?.vapiAssistantId) {
      try {
        const vapiAssistant = await vapiClient.assistants.get(
          existingAssistant.vapiAssistantId,
        );

        if (vapiAssistant?.id) {
          const updatedVapiAssistant = await vapiClient.assistants.update(
            existingAssistant.vapiAssistantId,
            assistantConfiguration,
          );

          const updatedAssistant = await db.assistant.update({
            where: { id: existingAssistant.id },
            data: {
              topic,
              description,
              focus,
              difficulty,
              estimatedTime: estimated_time,
              configuration: assistantConfiguration as any,
            },
          });

          return NextResponse.json(
            new HttpResponse(
              "success",
              `Interview assistant successfully updated for ${candidateName}`,
              {
                id: updatedVapiAssistant.id,
                assistantId: updatedAssistant.id,
                action: "updated",
                candidateName,
                topic,
              },
            ),
            { status: 200 },
          );
        }
      } catch (getError) {
        console.warn(
          "Existing VAPI assistant no longer valid, will create new one:",
          getError,
        );
        await db.assistant.delete({ where: { id: existingAssistant.id } });
      }
    } else {
      const newVapiAssistant = await vapiClient.assistants.create(
        assistantConfiguration,
      );

      if (!newVapiAssistant || !newVapiAssistant.id) {
        console.error("Failed to create VAPI assistant - no ID returned");
        return NextResponse.json(
          new ErrorResponse(
            "Failed to create interview assistant. Please try again.",
          ),
          { status: 500 },
        );
      }

      // Save assistant to database
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
          configuration: assistantConfiguration as any,
        },
      });

      return NextResponse.json(
        new HttpResponse(
          "success",
          `Interview assistant successfully created for ${candidateName}`,
          {
            id: newVapiAssistant.id,
            assistantId: newAssistant.id,
            action: "created",
            candidateName,
            topic,
            difficulty,
            estimatedTime: estimated_time,
          },
        ),
        { status: 201 },
      );
    }
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
