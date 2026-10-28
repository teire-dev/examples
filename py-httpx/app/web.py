"""A tiny WSGI status service the poller can call in-process."""

import json


def application(environ, start_response):
    if environ.get("PATH_INFO") == "/health":
        body = json.dumps({"ok": True, "version": "2026.10"}).encode()
        start_response("200 OK", [("content-type", "application/json"), ("content-length", str(len(body)))])
        return [body]
    start_response("404 Not Found", [("content-type", "text/plain")])
    return [b"not found"]
