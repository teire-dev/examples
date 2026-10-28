import type Groq from "groq-sdk";
import { complete } from "./llm.ts";

export const QUEUES = ["billing", "bug", "account", "other"] as const;
export type Queue = (typeof QUEUES)[number];

/** The queue a ticket goes to. */
export async function route(groq: Groq, ticket: string): Promise<Queue> {
  const answer = (await complete(groq, "quick", `Answer with one word from: ${QUEUES.join(", ")}.`, ticket)).toLowerCase();
  return (QUEUES as readonly string[]).includes(answer) ? (answer as Queue) : "other";
}

/** A first reply for the agent to edit before sending. */
export async function draftReply(groq: Groq, ticket: string): Promise<string> {
  return complete(groq, "careful", "Write a short, polite first reply to this support ticket. Plain text only.", ticket);
}
