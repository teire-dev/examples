# py-major

Support-desk helpers on the Anthropic Python SDK 0.125.0: a text-completions call with `HUMAN_PROMPT`/`AI_PROMPT`, and a messages call that sets `temperature`. Both are gone in the SDK's 1.x line, so the upgrade breaks this code.

Teire demo repository: Teire should find the three affected sites, upgrade the SDK, fix the code, prove it with the repo's own tests before and after in a sandbox, and open a verified pull request.

```bash
uv sync
uv run python -m pytest -q
```
