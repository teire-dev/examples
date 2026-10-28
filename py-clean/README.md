# py-clean

A release-feed reader on httpx 0.27.2 that only uses APIs httpx 0.28 keeps (`transport=`, `proxy=`, `MockTransport`). Its own `Mirror.create(app=..., proxies=...)` looks like the removed httpx keywords but is the repo's code.

Teire demo repository: Teire should report "not affected" with full coverage, ignore the look-alike, and open a plain verified upgrade.

```bash
uv sync
uv run python -m pytest -q
```
