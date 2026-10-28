//! A local stand-in for OpenAI's Chat Completions API, so the tests never leave 127.0.0.1. It answers
//! the way OpenAI does: a model OpenAI shut down gets HTTP 404 `model_not_found` (OpenAI's
//! deprecations page lists gpt-4.1-nano as shut down on October 23, 2026, replaced by gpt-5.6-luna,
//! https://developers.openai.com/api/docs/deprecations); a model it serves returns a completion.

use serde_json::{json, Value};
use ticket_summary::Summarizer;
use wiremock::{Mock, MockServer, Request, Respond, ResponseTemplate};

const SERVED: [&str; 3] = ["gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"];

struct StandIn;

impl Respond for StandIn {
    fn respond(&self, request: &Request) -> ResponseTemplate {
        let body: Value = serde_json::from_slice(&request.body).unwrap_or(Value::Null);
        let model = body["model"].as_str().unwrap_or_default().to_string();
        if !SERVED.contains(&model.as_str()) {
            return ResponseTemplate::new(404).set_body_json(json!({ "error": {
                "message": format!("The model `{model}` does not exist or you do not have access to it."),
                "type": "invalid_request_error", "param": null, "code": "model_not_found"
            }}));
        }
        let text = body["messages"].to_string().to_lowercase();
        let summary = if text.contains("charged twice") {
            "Customer was charged twice and wants a refund."
        } else {
            "Customer has a general question."
        };
        ResponseTemplate::new(200).set_body_json(json!({
            "id": "chatcmpl-standin", "object": "chat.completion", "created": 1793000000, "model": model,
            "choices": [{ "index": 0, "finish_reason": "stop", "logprobs": null,
                "message": { "role": "assistant", "content": summary } }]
        }))
    }
}

async fn stand_in() -> MockServer {
    let server = MockServer::start().await;
    Mock::given(wiremock::matchers::path("/v1/chat/completions")).respond_with(StandIn).mount(&server).await;
    server
}

#[tokio::test]
async fn summarizes_a_refund_ticket() {
    let server = stand_in().await;
    let s = Summarizer::new(&format!("{}/v1", server.uri()), "test");
    let got = s.summarize("I was charged twice for my order, please refund one.").await.expect("summary");
    assert_eq!(got, "Customer was charged twice and wants a refund.");
}

#[tokio::test]
async fn summarizes_a_general_ticket() {
    let server = stand_in().await;
    let s = Summarizer::new(&format!("{}/v1", server.uri()), "test");
    let got = s.summarize("What are your opening hours?").await.expect("summary");
    assert!(!got.is_empty());
}
