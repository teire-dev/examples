import { describe, expect, it } from "vitest";
import { createClient, type FetchLike } from "../src/client.js";
import { summarise } from "../src/summarise.js";

/** A fake API: answers from fixtures, never touches the network. */
function fakeApi(routes: Record<string, unknown>): FetchLike {
  return async (input, init) => {
    const key = `${init?.method ?? "GET"} ${new URL(String(input)).pathname}`;
    if (!(key in routes)) return new Response(JSON.stringify({ error: { message: `no fixture for ${key}` } }), { status: 404 });
    return new Response(JSON.stringify(routes[key]), { status: 200, headers: { "content-type": "application/json" } });
  };
}

const completion = (content: string | null) => ({
  id: "chatcmpl-1",
  object: "chat.completion",
  created: 1,
  model: "gpt-4o-mini",
  choices: [{ index: 0, finish_reason: "stop", logprobs: null, message: { role: "assistant", content, refusal: null } }],
});

describe("summarise", () => {
  it("returns the model's summary", async () => {
    const client = createClient("test-key", fakeApi({ "POST /v1/chat/completions": completion(" Faster builds. ") }));
    await expect(summarise(client, "v2: builds are faster")).resolves.toBe("Faster builds.");
  });

  it("fails loudly when the model returns nothing", async () => {
    const client = createClient("test-key", fakeApi({ "POST /v1/chat/completions": completion(null) }));
    await expect(summarise(client, "v2")).rejects.toThrow("no summary returned");
  });
});
