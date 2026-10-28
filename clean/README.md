# clean

A release-notes summariser on the OpenAI Node SDK v4. It only calls `chat.completions.create` with `model` and `messages`, which every later SDK major keeps, so an upgrade needs no code change.

Teire demo repository: Teire should report this repo as **not affected** by the openai 4 → 7 upgrade, with its coverage stated, and open a plain upgrade PR.

```bash
npm ci
npm run typecheck
npm test
```
