package dev.teire.demo;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

/** Drafts a one-line summary of a support ticket with OpenAI's Chat Completions API. */
public final class TicketSummary {
  /** The chat model the summaries use. */
  public static final String MODEL = "gpt-4.1-nano";

  private final OpenAIClient client;

  /** A summarizer against {@code baseUrl}: OpenAI's, or a stand-in in tests. */
  public TicketSummary(String apiKey, String baseUrl) {
    this.client = OpenAIOkHttpClient.builder().apiKey(apiKey).baseUrl(baseUrl).maxRetries(0).build();
  }

  /** One line describing the ticket. */
  public String summarize(String ticket) {
    ChatCompletion completion =
        client.chat().completions().create(
            ChatCompletionCreateParams.builder()
                .model(MODEL)
                .addSystemMessage("Summarize the support ticket in one sentence.")
                .addUserMessage(ticket)
                .build());
    return completion.choices().isEmpty() ? "" : completion.choices().get(0).message().content().orElse("");
  }
}
