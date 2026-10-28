import { createServer, type IncomingMessage } from "node:http";
import { openaiProvider } from "./openai.ts";
import { summarizeTicket, type Ticket } from "./summarize.ts";

async function body(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as Partial<Ticket>;
}

/** POST /api/summarize {id, subject, body} → {summary}. */
export function createApp(openai = openaiProvider()) {
  return createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/api/summarize") {
      res.writeHead(404).end();
      return;
    }
    try {
      const t = await body(req);
      if (!t.subject || !t.body) {
        res.writeHead(400, { "content-type": "application/json" }).end(JSON.stringify({ error: "subject and body are required" }));
        return;
      }
      const summary = await summarizeTicket(openai, { id: t.id ?? "", subject: t.subject, body: t.body });
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ summary }));
    } catch (error) {
      res.writeHead(502, { "content-type": "application/json" }).end(
        JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      );
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) createApp().listen(Number(process.env.PORT ?? 3000));
