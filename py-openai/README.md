# py-openai

Reply drafts on the OpenAI Python SDK 0.28.1: module-level `openai.api_key`/`openai.api_base` and `openai.ChatCompletion.create`. The 1.x line removed that interface for clients (`OpenAI(...).chat.completions.create`), so the upgrade breaks this code.

Teire demo repository: Teire should find the affected sites, upgrade the SDK to the newest release, migrate the calls, prove it with the repo's own tests before and after in a sandbox, and open a verified pull request.

```bash
uv sync
uv run python -m pytest -q
```
