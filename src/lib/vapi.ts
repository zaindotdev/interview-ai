import { VapiClient } from "@vapi-ai/server-sdk";

export const vapiClient = new VapiClient({
  token: process.env.VAPI_AI_PRIVATE_API_KEY!,
});
