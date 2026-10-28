"""A local stand-in for the Anthropic API: the tests never leave 127.0.0.1."""

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest


class FakeAnthropic(BaseHTTPRequestHandler):
    def do_POST(self):  # noqa: N802
        body = json.loads(self.rfile.read(int(self.headers.get("content-length", 0))) or b"{}")
        if self.path.endswith("/v1/complete"):
            reply = {"type": "completion", "id": "c1", "completion": " billing", "stop_reason": "stop_sequence", "model": body.get("model", "")}
        elif self.path.endswith("/v1/messages"):
            text = json.dumps(body.get("messages", ""))
            answer = "billing" if "Tag:" in text else "Customer was charged twice."
            reply = {
                "id": "m1",
                "type": "message",
                "role": "assistant",
                "model": body.get("model", ""),
                "content": [{"type": "text", "text": answer}],
                "stop_reason": "end_turn",
                "stop_sequence": None,
                "usage": {"input_tokens": 10, "output_tokens": 5},
            }
        else:
            self.send_response(404)
            self.end_headers()
            return
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
    server = HTTPServer(("127.0.0.1", 0), FakeAnthropic)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()
