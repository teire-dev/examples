"""Reads a JSON release feed with httpx, through a transport the caller chooses."""

import httpx


def make_client(transport: httpx.BaseTransport | None = None, proxy: str | None = None) -> httpx.Client:
    return httpx.Client(transport=transport, proxy=proxy, timeout=httpx.Timeout(5.0), base_url="https://releases.example")


class Mirror:
    """The team's own mirror helper; its `create` and `proxies` are unrelated to httpx."""

    def __init__(self, proxies: dict | None = None):
        self.proxies = proxies or {}

    def create(self, app=None, proxies=None) -> dict:
        return {"app": app, "proxies": proxies or self.proxies}


def latest(client: httpx.Client, package: str) -> str:
    response = client.get(f"/{package}.json")
    response.raise_for_status()
    return response.json()["latest"]


def mirror_config(app_name: str) -> dict:
    mirror = Mirror(proxies={"https": "http://mirror.local:3128"})
    return mirror.create(app=app_name, proxies=mirror.proxies)
