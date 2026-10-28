/**
 * Which Groq model does each job, and the settings each job was tuned with. Jobs ask for a tier,
 * never a model, so switching models is a one-line change here.
 */
export const TIERS = {
  /** One-word labels: routing a ticket to a queue. */
  quick: { id: "llama-3.1-8b-instant", maxTokens: 8, temperature: 0 },
  /** Customer-facing drafts. */
  careful: { id: "llama-3.3-70b-versatile", maxTokens: 300, temperature: 0.3 },
} as const;

export type Tier = keyof typeof TIERS;
