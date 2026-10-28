# wrapped-models

A support desk on Groq (`groq-sdk`) that routes tickets to queues and drafts first replies. Jobs never name a model: they ask for a tier, and `src/models.ts` maps each tier to a Groq model and the settings it was tuned with.

Both models it uses are gone. Groq shut down `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` on August 16, 2026 ([deprecations](https://console.groq.com/docs/deprecations)):
- for `llama-3.1-8b-instant` Groq names `openai/gpt-oss-20b`;
- for `llama-3.3-70b-versatile` it names `openai/gpt-oss-120b` or `qwen/qwen3.6-27b`, and `qwen/qwen3.6-27b` was itself shut down on September 14, 2026.

The replacements are reasoning models: they think before they answer, inside the same token budget, so a tier tuned for one-word answers (`maxTokens: 8`) gets nothing back.

The tests run against a local stand-in for Groq's API that follows Groq's published behaviour: `model_decommissioned` for shut-down models, reasoning that spends the completion budget first, and `reasoning_format` refused on GPT-OSS models.

Teire demo repository: Teire has no reader for Groq, so it must find Groq from the installed SDK, find Groq's deprecations page, read it, trace the model IDs through the tier registry, swap what it can, and let the agent plan, edit, test and iterate until the tests pass in a sandbox.

```bash
npm ci
npm run typecheck
npm test
```
