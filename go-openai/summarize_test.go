package summarize

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/openai/openai-go/v3/option"
)

// A local stand-in for OpenAI's Chat Completions API, so the tests never leave 127.0.0.1. It answers
// the way OpenAI does: a model OpenAI shut down gets HTTP 404 `model_not_found` (OpenAI's
// deprecations page lists gpt-4.1-nano as shut down on October 23, 2026, replaced by gpt-5.6-luna,
// https://developers.openai.com/api/docs/deprecations); a model it serves returns a completion.
var served = map[string]bool{"gpt-5.6-luna": true, "gpt-5.6-terra": true, "gpt-5.6-sol": true}

func standIn(t *testing.T) *httptest.Server {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Model    string `json:"model"`
			Messages []struct {
				Content string `json:"content"`
			} `json:"messages"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		w.Header().Set("content-type", "application/json")
		if r.URL.Path != "/v1/chat/completions" || !served[body.Model] {
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(`{"error":{"message":"The model ` + "`" + body.Model + "`" + ` does not exist or you do not have access to it.","type":"invalid_request_error","param":null,"code":"model_not_found"}}`))
			return
		}
		summary := "Customer has a general question."
		for _, m := range body.Messages {
			if strings.Contains(strings.ToLower(m.Content), "charged twice") {
				summary = "Customer was charged twice and wants a refund."
			}
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"id": "chatcmpl-standin", "object": "chat.completion", "created": 1793000000, "model": body.Model,
			"choices": []any{map[string]any{"index": 0, "finish_reason": "stop",
				"message": map[string]any{"role": "assistant", "content": summary}}},
		})
	}))
	t.Cleanup(server.Close)
	return server
}

func TestSummarizesARefundTicket(t *testing.T) {
	server := standIn(t)
	s := New(option.WithBaseURL(server.URL+"/v1/"), option.WithAPIKey("test"), option.WithMaxRetries(0))
	got, err := s.Summarize(context.Background(), "I was charged twice for my order, please refund one.")
	if err != nil {
		t.Fatalf("summarize: %v", err)
	}
	if got != "Customer was charged twice and wants a refund." {
		t.Fatalf("summary = %q", got)
	}
}

func TestSummarizesAGeneralTicket(t *testing.T) {
	server := standIn(t)
	s := New(option.WithBaseURL(server.URL+"/v1/"), option.WithAPIKey("test"), option.WithMaxRetries(0))
	got, err := s.Summarize(context.Background(), "What are your opening hours?")
	if err != nil {
		t.Fatalf("summarize: %v", err)
	}
	if got == "" {
		t.Fatal("empty summary")
	}
}
