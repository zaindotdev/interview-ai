import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { generateText } from "ai";
import { ErrorResponse } from "./response";

const MODEL = "gpt-4";
const model = openai(MODEL);

export async function generateAIResponse(prompt: string, params?: any) {
  try {
    const response = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: params?.temperature || 0.7,
      maxOutputTokens: params?.maxTokens || 1500,
      topP: params?.topP || 1,
        frequencyPenalty: params?.frequencyPenalty || 0,
        presencePenalty: params?.presencePenalty || 0,
        stopWhen: params?.stopWhen || undefined,
        maxRetries: params?.maxRetries || 2,
      providerOptions: {
        openai: {
          parallelToolCalls: false,
          store: false,
          user: params.userId || undefined,
        } satisfies OpenAIResponsesProviderOptions,
      },
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
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '').trim();
    }

    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error(`Failed to parse AI response for ${context}:`, {
      response: response.substring(0, 500), // Log first 500 chars
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new ErrorResponse(`Failed to parse ${context} response from AI`);
  }
};