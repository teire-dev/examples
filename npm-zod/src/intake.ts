import { Ticket } from "./schema.js";

export type IntakeResult = { ok: true; ticket: Ticket } | { ok: false; problems: string[] };

/** Validates an incoming ticket and lists every problem by field path. */
export function intake(input: unknown): IntakeResult {
  const parsed = Ticket.safeParse(input);
  if (parsed.success) return { ok: true, ticket: parsed.data };
  return { ok: false, problems: parsed.error.issues.map((issue) => issue.path.join(".") || "(root)") };
}

/** The first problem's field, for a one-line error banner. */
export function firstProblem(input: unknown): string | null {
  const parsed = Ticket.safeParse(input);
  return parsed.success ? null : (parsed.error.issues[0]?.path.join(".") ?? null);
}
