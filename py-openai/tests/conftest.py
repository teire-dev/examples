"""A local stand-in for the OpenAI API: the tests never leave 127.0.0.1."""

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest


class FakeOpenAI(BaseHTTPRequestHandler):
    def do_POST(self):  # noqa: N802
        body = json.loads(self.rfile.read(int(self.headers.get("content-length", 0))) or b"{}")
        if not self.path.endswith("/chat/completions"):
            self.send_response(404)
            self.end_headers()
            return
        prompt = json.dumps(body.get("messages", []))
        text = " Billing " if "category" in prompt else " Sorry about the double charge; a refund is on its way. "
        reply = {
            "id": "chatcmpl-1",
            "object": "chat.completion",
            "created": 1,
            "model": body.get("model", ""),
            "choices": [{"index": 0, "finish_reason": "stop", "message": {"role": "assistant", "content": text}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15},
        }
        data = json.dumps(reply).encode()
        self.send_response(200)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


@pytest.fixture(scope="session")
def api_base():
    server = HTTPServer(("127.0.0.1", 0), FakeOpenAI)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}/v1"
    server.shutdown()
