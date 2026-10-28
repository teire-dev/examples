# py-httpx

A status-page poller on httpx 0.27.2. It builds clients with `proxies=` and calls a WSGI app in-process with `app=`; httpx 0.28 removed both keyword arguments, so the upgrade breaks this code.

Teire demo repository: Teire should find the two affected calls, upgrade httpx, move the code to `proxy=` and `transport=httpx.WSGITransport(...)`, prove it with the repo's own tests before and after in a sandbox, and open a verified pull request.

```bash
uv sync
uv run python -m pytest -q
```
