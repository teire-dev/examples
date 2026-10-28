import { describe, expect, it } from "vitest";
import { createClient, type FetchLike } from "../src/client.js";
import { beta } from "../src/local-cache.js";
import { runStatus } from "../src/runs.js";
import { triageTicket } from "../src/triage.js";

/** A fake API: answers from fixtures, never touches the network. */
function fakeApi(routes: Record<string, unknown>): FetchLike {
  return async (input, init) => {
    const key = `${init?.method ?? "GET"} ${new URL(String(input)).pathname}`;
    if (!(key in routes)) return new Response(JSON.stringify({ error: { message: `no fixture for ${key}` } }), { status: 404 });
    return new Response(JSON.stringify(routes[key]), { status: 200, headers: { "content-type": "application/json" } });
  };
}

describe("triage", () => {
  it("returns the parsed category", async () => {
    const client = createClient(
      "test-key",
      fakeApi({
        "POST /v1/chat/completions": {
          id: "chatcmpl-1",
          object: "chat.completion",
          created: 1,
          model: "gpt-4o-mini",
          choices: [
            {
              index: 0,
              finish_reason: "stop",
              logprobs: null,
              message: { role: "assistant", content: '{"category":"billing","urgent":true}', refusal: null },
            },
          ],
        },
      }),
    );
    await expect(triageTicket(client, "I was charged twice")).resolves.toEqual({ category: "billing", urgent: true });
  });
});

describe("runs", () => {
  it("reads a run status", async () => {
    const client = createClient(
      "test-key",
      fakeApi({ "GET /v1/threads/thread_1/runs/run_1": { id: "run_1", object: "thread.run", status: "completed" } }),
    );
    await expect(runStatus(client, "thread_1", "run_1")).resolves.toBe("completed");
  });
});

describe("local cache", () => {
  it("is not the SDK", () => {
    expect(beta.chat.completions.parse('{"a":1}')).toEqual({ a: 1 });
  });
});
