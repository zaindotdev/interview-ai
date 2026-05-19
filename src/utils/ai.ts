import { createGroq } from "@ai-sdk/groq";
import { generateText, StopCondition, ToolSet } from "ai";
import { ErrorResponse } from "./response";

const MODEL = "llama-3.3-70b-versatile";
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = groq(MODEL);

interface Params {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopWhen?: StopCondition<NoInfer<ToolSet>> | StopCondition<NoInfer<ToolSet>>[] | undefined;
  maxRetries?: number;
  userId?: string; // Optional user ID for personalized responses or tracking
}

export async function generateAIResponse(prompt: string, params?: Params): Promise<string> {
  try {
    const response = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: params?.temperature ?? 0.7,
      maxOutputTokens: params?.maxTokens ?? 1500,
      topP: params?.topP ?? 1,
      stopWhen: params?.stopWhen,
      maxRetries: params?.maxRetries ?? 2,
    });

    if (response.text) {
      return response.text;
    } else {
      throw new ErrorResponse("No response from AI");
    }
  } catch (error) {
    console.error("ERROR IN AI RESPONSE: ", error);
    throw new ErrorResponse("Failed to generate AI response");
  }
}

export const parseAIResponse = <T>(response: string, context: string): T => {
  try {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();
    }
    if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/```\s*/, "")
        .replace(/```\s*$/, "")
        .trim();
    }

    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error(`Failed to parse AI response for ${context}:`, {
      response: response.substring(0, 500),
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new ErrorResponse(`Failed to parse ${context} response from AI`);
  }
};