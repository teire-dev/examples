// Package summarize drafts a one-line summary of a support ticket with OpenAI's Go SDK.
package summarize

import (
	"context"
	"errors"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
)

// Model is the chat model the summaries use.
const Model = "gpt-4.1-nano"

// Summarizer calls OpenAI's Chat Completions API.
type Summarizer struct {
	client openai.Client
}

// New returns a Summarizer; opts set the API key and, in tests, the base URL.
func New(opts ...option.RequestOption) *Summarizer {
	return &Summarizer{client: openai.NewClient(opts...)}
}

// Summarize answers with one line describing the ticket.
func (s *Summarizer) Summarize(ctx context.Context, ticket string) (string, error) {
	completion, err := s.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model: Model,
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage("Summarize the support ticket in one sentence."),
			openai.UserMessage(ticket),
		},
	})
	if err != nil {
		return "", err
	}
	if len(completion.Choices) == 0 {
		return "", errors.New("no summary returned")
	}
	return completion.Choices[0].Message.Content, nil
}
