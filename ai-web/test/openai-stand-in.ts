import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

/**
 * A local stand-in for OpenAI's Chat Completions API, so the tests never leave 127.0.0.1.
 *
 * It answers the way OpenAI does for what this app sends:
 * - a model OpenAI shut down gets HTTP 404 with OpenAI's error object (`model_not_found`). OpenAI's
 *   deprecations page lists `gpt-4.1-nano` as shut down on October 23, 2026, replaced by `gpt-5.6-luna`
 *   (https://developers.openai.com/api/docs/deprecations);
 * - a model it serves returns a normal chat completion.
 * SHUT_DOWN and SERVED are taken from that page.
 */
const SHUT_DOWN = new Set(["gpt-4.1-nano", "gpt-4.1-nano-2025-04-14", "o4-mini", "o3-mini", "gpt-4-turbo"]);
const SERVED = new Set(["gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"]);

function summaryFor(text: string) {
  if (/charged twice|refund|invoice/i.test(text)) return "Customer was charged twice and wants a refund.";
  if (/password|log ?in|locked/i.test(text)) return "Customer is locked out and cannot reset the password.";
  return "Customer has a general question.";
}

export async function startOpenAIStandIn(): Promise<{ baseURL: string; requests: unknown[]; close: () => Promise<void> }> {
  const requests: unknown[] = [];
  const server: Server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    requests.push(body);
    const reply = (status: number, payload: unknown) => {
      res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(payload));
    };
    if (req.url !== "/v1/chat/completions") return reply(404, { error: { message: "Not found", type: "invalid_request_error" } });
    const model = String(body.model ?? "");
    if (SHUT_DOWN.has(model) || !SERVED.has(model))
      return reply(404, {
        error: {
          message: `The model \`${model}\` does not exist or you do not have access to it.`,
          type: "invalid_request_error",
          param: null,
          code: "model_not_found",
        },
      });
    const text = JSON.stringify(body.messages ?? []);
    return reply(200, {
      id: "chatcmpl-standin",
      object: "chat.completion",
      created: 1793000000,
      model,
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: summaryFor(text) } }],
      usage: { prompt_tokens: 40, completion_tokens: 12, total_tokens: 52 },
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    baseURL: `http://127.0.0.1:${port}/v1`,
    requests,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
