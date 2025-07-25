import { vapiClient } from "@/lib/vapi";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, description, focus, estimated_time, difficulty } =
      await req.json();

    const assistant = await vapiClient.assistants.create({
      name: "Nora",
      firstMessage:
        "Greetings! I'm Nora, your AI interviewer for today. Could you please start by introducing yourself?",
      model: {
        provider: "xai",
        model: "grok-3",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are Nora, a friendly yet professional AI interviewer specialized in technical domains.

            Your role is to conduct a mock interview session based on the following criteria:
            - **Topic**: ${topic}
            - **Description**: ${description}
            - **Focus Areas**: ${focus?.join(",")}
            - **Estimated Duration**: ${estimated_time}
            - **Difficulty Level**: ${difficulty}

            Instructions:
            - Ask one interview question at a time.
            - Tailor your questions to the candidate's level of difficulty.
            - Keep your questions short and to the point (max 30 words).
            - Do **not** answer your own questions.
            - Maintain a calm and engaging tone, like a real human interviewer.
            - Wait for the candidate’s response before asking the next question.

            Start the interview once the candidate is ready.`,
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
      },
      transcriber:{
        provider:"assembly-ai",
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
