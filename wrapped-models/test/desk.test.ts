import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { draftReply, route } from "../src/desk.ts";
import { groqClient } from "../src/llm.ts";
import { startGroqStandIn } from "./groq-stand-in.ts";

let groq: Awaited<ReturnType<typeof startGroqStandIn>>;
beforeAll(async () => {
  groq = await startGroqStandIn();
});
afterAll(() => groq.close());

describe("routing", () => {
  it("sends a double charge to billing", async () => {
    expect(await route(groqClient(groq.baseURL), "I was charged twice for my invoice this month.")).toBe("billing");
  });

  it("sends a crash to bug", async () => {
    expect(await route(groqClient(groq.baseURL), "The app crashes with an error when I upload a file.")).toBe("bug");
  });

  it("sends anything else to other", async () => {
    expect(await route(groqClient(groq.baseURL), "Hello there!")).toBe("other");
  });
});

describe("drafts", () => {
  it("drafts a complete reply about the refund", async () => {
    const reply = await draftReply(groqClient(groq.baseURL), "I was charged twice, please refund one payment.");
    expect(reply).toMatch(/refund/i);
    expect(reply.endsWith(".")).toBe(true);
  });
});
