import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openaiProvider } from "../src/openai.ts";
import { createApp } from "../src/server.ts";
import { summarizeTicket } from "../src/summarize.ts";
import { startOpenAIStandIn } from "./openai-stand-in.ts";

let openai: Awaited<ReturnType<typeof startOpenAIStandIn>>;
beforeAll(async () => {
  openai = await startOpenAIStandIn();
});
afterAll(() => openai.close());

describe("ticket summaries", () => {
  it("summarises a billing ticket", async () => {
    const summary = await summarizeTicket(openaiProvider(openai.baseURL), {
      id: "T-1",
      subject: "Double charge",
      body: "I was charged twice this month, please refund one invoice.",
    });
    expect(summary).toBe("Customer was charged twice and wants a refund.");
  });

  it("serves summaries over HTTP", async () => {
    const server = createApp(openaiProvider(openai.baseURL)).listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/api/summarize`, {
      method: "POST",
      body: JSON.stringify({ id: "T-2", subject: "Locked out", body: "I can't log in and the password reset never arrives." }),
    });
    server.close();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ summary: "Customer is locked out and cannot reset the password." });
  });

  it("rejects a ticket without a body", async () => {
    const server = createApp(openaiProvider(openai.baseURL)).listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/api/summarize`, { method: "POST", body: "{}" });
    server.close();
    expect(res.status).toBe(400);
  });
});
