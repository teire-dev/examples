import { createOpenAI } from "@ai-sdk/openai";

/** The OpenAI provider for the AI SDK; tests point `baseURL` at a local stand-in. */
export function openaiProvider(baseURL?: string) {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "test",
    ...(baseURL ? { baseURL } : {}),
  });
}

export type OpenAIProvider = ReturnType<typeof openaiProvider>;
