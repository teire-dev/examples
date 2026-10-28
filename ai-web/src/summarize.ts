import { generateText } from "ai";
import type { OpenAIProvider } from "./openai.ts";

export interface Ticket {
  id: string;
  subject: string;
  body: string;
}

/** A one-line summary an agent reads before opening the ticket. */
export async function summarizeTicket(openai: OpenAIProvider, ticket: Ticket): Promise<string> {
  const { text } = await generateText({
    model: openai.chat("gpt-4.1-nano"),
    system: "Summarise the support ticket in one short sentence for the support agent. No greeting.",
    prompt: `Subject: ${ticket.subject}\n\n${ticket.body}`,
    maxOutputTokens: 80,
    maxRetries: 0,
  });
  return text.trim();
}
