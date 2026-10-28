import Groq from "groq-sdk";
import { TIERS, type Tier } from "./models.ts";

export function groqClient(baseURL?: string) {
  return new Groq({ apiKey: process.env.GROQ_API_KEY ?? "test", maxRetries: 0, ...(baseURL ? { baseURL } : {}) });
}

/** One completion from the model the tier names, with the tier's settings. */
export async function complete(groq: Groq, tier: Tier, instructions: string, input: string): Promise<string> {
  const t = TIERS[tier];
  const response = await groq.chat.completions.create({
    model: t.id,
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: input },
    ],
    max_tokens: t.maxTokens,
    temperature: t.temperature,
  });
  return response.choices[0]?.message.content?.trim() ?? "";
}
