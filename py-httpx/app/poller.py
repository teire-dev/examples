"""Polls service health endpoints, optionally through an outbound proxy."""

import httpx


def make_client(proxy_url: str | None = None, timeout: float = 5.0) -> httpx.Client:
    """A client for health checks; corporate networks route it through `proxy_url`."""
    proxies = {"all://": proxy_url} if proxy_url else None
    return httpx.Client(proxies=proxies, timeout=timeout)


def local_client(app) -> httpx.Client:
    """A client that calls a WSGI app in-process, for previews and tests."""
    return httpx.Client(app=app, base_url="http://status.local")


def check(client: httpx.Client, url: str) -> dict:
    """One health check: status code, whether it is healthy, and the reported version."""
    response = client.get(url)
    body = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
    return {"url": url, "status": response.status_code, "healthy": response.status_code == 200 and body.get("ok") is True, "version": body.get("version")}


def check_all(client: httpx.Client, urls: list[str]) -> list[dict]:
    return [check(client, url) for url in urls]
