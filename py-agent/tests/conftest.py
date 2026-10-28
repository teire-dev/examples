"""A local stand-in for Nebius Token Factory's chat completions API: the tests never leave 127.0.0.1.

It answers the way the live API did on 2026-10-25:
- a model Token Factory no longer serves gets HTTP 404 with `model_not_found` (body captured live);
- a reasoning model spends its first tokens on `reasoning_content`; when `max_tokens` runs out
  before the answer, `content` is null and `finish_reason` is "length" (seen live with
  nvidia/nemotron-3-super-120b-a12b and max_tokens=16).
SERVED lists models from https://tokenfactory.nebius.com/api/public/models_info on that day.
"""

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

SERVED = {
    "nvidia/nemotron-3-super-120b-a12b": {"reasoning_tokens": 48},
    "nvidia/Nemotron-3_5-Lightning": {"reasoning_tokens": 0},
    "deepseek-ai/DeepSeek-V4-Flash-0731": {"reasoning_tokens": 0},
}


def answer_for(messages: list) -> str:
    text = json.dumps(messages).lower()
    return "billing" if "charged" in text or "invoice" in text else "other"


class FakeTokenFactory(BaseHTTPRequestHandler):
    def do_POST(self):  # noqa: N802
        body = json.loads(self.rfile.read(int(self.headers.get("content-length", 0))) or b"{}")
        model = body.get("model", "")
        if not self.path.endswith("/chat/completions"):
            return self.reply(404, {"detail": "Not Found"})
        if model not in SERVED:
            message = f"The model `{model}` does not exist."
            return self.reply(
                404,
                {
                    "error": {"type": "invalid_request_error", "message": message, "param": "model", "code": "model_not_found"},
                    "detail": f"Invalid request. Please check the parameters and try again. Details: {message}",
                },
            )
        reasoning = SERVED[model]["reasoning_tokens"]
        budget = body.get("max_tokens") or 4096
        truncated = reasoning >= budget
        message = {
            "role": "assistant",
            "content": None if truncated else answer_for(body.get("messages", [])),
            "reasoning_content": "The user wants one category for the ticket. " if reasoning else None,
        }
        self.reply(
            200,
            {
                "id": "chatcmpl-1",
                "object": "chat.completion",
                "created": 1,
                "model": model,
                "choices": [{"index": 0, "finish_reason": "length" if truncated else "stop", "message": message}],
                "usage": {"prompt_tokens": 20, "completion_tokens": min(budget, reasoning + 1), "total_tokens": 20 + min(budget, reasoning + 1)},
            },
        )

    def reply(self, status: int, payload: dict):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


@pytest.fixture(scope="session")
def token_factory():
    server = HTTPServer(("127.0.0.1", 0), FakeTokenFactory)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}/v1/"
    server.shutdown()
