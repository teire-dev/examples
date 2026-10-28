# npm-major

A small support-ticket triage service built on the OpenAI Node SDK **v4** (`openai@4.104.0`).

It is a [Teire](https://github.com/teire-dev/teire) demo repository. Upgrading `openai` to a later major breaks it in four places: `httpAgent` is removed, `beta.chat.completions.parse` moves, a deep import path disappears, and `runs.retrieve` changes signature. A look-alike in-house object (`src/local-cache.ts`) must stay untouched.

```bash
npm ci
npm run typecheck
npm test
```

The tests use a fake API and never call the network.
