import { vapiClient } from "@/lib/vapi";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, description, focus, estimated_time, difficulty } =
      await req.json();

      console.log({topic,description,focus,estimated_time,difficulty})

    const assistant = await vapiClient.assistants.create({
      name: "Nora",
      firstMessage:
        "Hi there! I'm Nora, your AI interviewer for today. I'm here to conduct a focused technical interview on the specific topic we've prepared for you. Let's get started right away - are you ready to begin the interview?",
      model: {
        provider: "xai",
        model: "grok-3",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are Nora, a focused and professional AI technical interviewer.

            CRITICAL: You MUST ONLY ask questions about the specific topic provided. Do NOT ask about other topics, personal background, or general introductions.

            **Interview Parameters:**
            - **Topic**: ${topic}
            - **Description**: ${description}
            - **Focus Areas**: ${focus?.join(", ")}
            - **Estimated Duration**: ${estimated_time}
            - **Difficulty Level**: ${difficulty}

            **STRICT INTERVIEW RULES:**
            1. ONLY ask questions directly related to "${topic}"
            2. Base ALL questions on the provided description: "${description}"
            3. Focus exclusively on these areas: ${focus?.join(", ")}
            4. Match the difficulty level: ${difficulty}
            5. DO NOT ask about:
               - Personal background or experience
               - Other technical topics not mentioned
               - General software development questions outside the scope
               - Career goals or motivations

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

            Remember: Every single question must be directly related to "${topic}". Stay laser-focused on this subject throughout the entire interview.`,
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
      },
      transcriber:{
        provider:"deepgram",
        language:"en",
      }
    });

    return NextResponse.json(
      {
        status: 200,
        message: "Interview session started",
        data: {
          assistant,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to start interview:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}