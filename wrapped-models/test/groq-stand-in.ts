import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

/**
 * A local stand-in for Groq's OpenAI-compatible chat completions API, so the tests never leave
 * 127.0.0.1. It follows what Groq publishes:
 * - https://console.groq.com/docs/deprecations — models past their shutdown date "will no longer be
 *   accessible"; requests to them return errors (400 `model_decommissioned`, the code Groq clients match on);
 *   DECOMMISSIONED lists that page's models shut down by 2026-10-25;
 * - https://console.groq.com/docs/reasoning — GPT-OSS models reason before they answer and return the
 *   reasoning in a separate `reasoning` field; `reasoning_format` "is not supported" for them;
 *   `reasoning_effort` is low | medium | high for GPT-OSS; Qwen 3.8 27B returns no reasoning tokens at
 *   the default effort;
 * - reasoning tokens are spent from the completion budget (`max_completion_tokens`, or the older
 *   `max_tokens`): a budget the reasoning uses up returns empty content with finish_reason "length".
 * Reasoning-token counts per effort are this stand-in's own fixed numbers, chosen to be realistic.
 */
const DECOMMISSIONED = new Set([
  "groq/compound",
  "groq/compound-mini",
  "qwen/qwen3.6-27b",
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "qwen/qwen3-32b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "moonshotai/kimi-k2-instruct-0905",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-guard-4-12b",
  "gemma2-9b-it",
  "llama3-70b-8192",
  "llama3-8b-8192",
]);

/** Reasoning tokens spent per `reasoning_effort` (default first). */
const SERVED: Record<string, { gptOss: boolean; reasoning: Record<string, number> }> = {
  "openai/gpt-oss-20b": { gptOss: true, reasoning: { medium: 64, low: 24, high: 192 } },
  "openai/gpt-oss-120b": { gptOss: true, reasoning: { medium: 96, low: 32, high: 256 } },
  "qwen/qwen3.8-27b": { gptOss: false, reasoning: { default: 0, none: 0, low: 32, medium: 64, high: 128 } },
};

function answer(messages: { role: string; content: string }[]) {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const user = messages.find((m) => m.role === "user")?.content ?? "";
  if (/one word from/i.test(system)) {
    if (/charged|invoice|refund/i.test(user)) return "billing";
    if (/crash|error|broken/i.test(user)) return "bug";
    if (/password|log ?in|locked/i.test(user)) return "account";
    return "other";
  }
  if (/charged|refund/i.test(user))
    return "Thanks for reaching out, and sorry about the double charge. We have started a refund for the duplicate payment; it should reach your card within five business days.";
  return "Thanks for reaching out. We are looking into this and will get back to you shortly.";
}

const tokens = (text: string) => Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);

export async function startGroqStandIn(): Promise<{ baseURL: string; requests: Record<string, unknown>[]; close: () => Promise<void> }> {
  const requests: Record<string, unknown>[] = [];
  const server: Server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    requests.push(body);
    const reply = (status: number, payload: unknown) =>
      res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(payload));
    const error = (status: number, message: string, code?: string) =>
      reply(status, { error: { message, type: "invalid_request_error", ...(code ? { code } : {}) } });

    if (req.url !== "/openai/v1/chat/completions") return error(404, "Unknown request URL");
    const model = String(body.model ?? "");
    if (DECOMMISSIONED.has(model))
      return error(
        400,
        `The model \`${model}\` has been decommissioned and is no longer supported. Please refer to https://console.groq.com/docs/deprecations for a recommendation on which model to use instead.`,
        "model_decommissioned",
      );
    const served = SERVED[model];
    if (!served) return error(404, `The model \`${model}\` does not exist or you do not have access to it.`, "model_not_found");
    if (served.gptOss && body.reasoning_format !== undefined)
      return error(400, "`reasoning_format` is not supported with this model", undefined);
    const effort = String(body.reasoning_effort ?? Object.keys(served.reasoning)[0]);
    const reasoning = served.reasoning[effort];
    if (reasoning === undefined) return error(400, `\`reasoning_effort\` "${effort}" is not supported with this model`);
    const budget = Number(body.max_completion_tokens ?? body.max_tokens ?? 1024);
    const full = answer(body.messages ?? []);
    const room = Math.max(0, budget - reasoning);
    const words = full.split(" ");
    // What fits after the reasoning: the whole answer, part of it, or nothing.
    let content = full;
    while (content && tokens(content) > room) content = words.slice(0, content.split(" ").length - 1).join(" ");
    const truncated = content !== full;
    const used = Math.min(budget, reasoning + tokens(content));
    return reply(200, {
      id: "chatcmpl-standin",
      object: "chat.completion",
      created: 1793000000,
      model,
      choices: [
        {
          index: 0,
          finish_reason: truncated ? "length" : "stop",
          message: {
            role: "assistant",
            content,
            ...(served.gptOss && reasoning && body.include_reasoning !== false
              ? { reasoning: "The user wants a reply. Keep it short.".slice(0, reasoning * 4) }
              : {}),
          },
        },
      ],
      usage: { prompt_tokens: 60, completion_tokens: used, total_tokens: 60 + used },
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    baseURL: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
