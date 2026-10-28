# ai-web

A support inbox web service: `POST /api/summarize` drafts a one-line summary of a ticket with the Vercel AI SDK (`ai` 7, `@ai-sdk/openai` 4), still calling `gpt-4.1-nano`.

OpenAI shut `gpt-4.1-nano` down on October 23, 2026 and names `gpt-5.6-luna` as its replacement ([deprecations](https://developers.openai.com/api/docs/deprecations)). Requests to it now fail, so the service answers 502 for every ticket.

The tests run against a local stand-in for OpenAI's Chat Completions API that answers like the live API: 404 `model_not_found` for shut-down models, a normal completion for served ones.

Teire demo repository: Teire should find the retired model where it is passed to the AI SDK, swap it for the replacement OpenAI names, prove it with these tests before and after in a sandbox, and open a verified pull request.

```bash
npm ci
npm run typecheck
npm test
```
