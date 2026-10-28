package dev.teire.demo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A local stand-in for OpenAI's Chat Completions API, so the tests never leave 127.0.0.1. It answers
 * the way OpenAI does: a model OpenAI shut down gets HTTP 404 {@code model_not_found} (OpenAI's
 * deprecations page lists gpt-4.1-nano as shut down on October 23, 2026, replaced by gpt-5.6-luna,
 * https://developers.openai.com/api/docs/deprecations); a model it serves returns a completion.
 */
class TicketSummaryTest {
  private static final Set<String> SERVED = Set.of("gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol");
  private static final Pattern MODEL = Pattern.compile("\"model\"\\s*:\\s*\"([^\"]*)\"");

  private HttpServer server;
  private TicketSummary summary;

  @BeforeEach
  void startStandIn() throws IOException {
    server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    server.createContext("/v1/chat/completions", exchange -> {
      String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
      Matcher m = MODEL.matcher(body);
      String model = m.find() ? m.group(1) : "";
      String reply;
      int status;
      if (!SERVED.contains(model)) {
        status = 404;
        reply = "{\"error\":{\"message\":\"The model `" + model + "` does not exist or you do not have access to it.\","
            + "\"type\":\"invalid_request_error\",\"param\":null,\"code\":\"model_not_found\"}}";
      } else {
        status = 200;
        String content = body.toLowerCase().contains("charged twice")
            ? "Customer was charged twice and wants a refund."
            : "Customer has a general question.";
        reply = "{\"id\":\"chatcmpl-standin\",\"object\":\"chat.completion\",\"created\":1793000000,\"model\":\"" + model
            + "\",\"choices\":[{\"index\":0,\"finish_reason\":\"stop\",\"logprobs\":null,"
            + "\"message\":{\"role\":\"assistant\",\"content\":\"" + content + "\",\"refusal\":null}}]}";
      }
      byte[] bytes = reply.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().add("content-type", "application/json");
      exchange.sendResponseHeaders(status, bytes.length);
      exchange.getResponseBody().write(bytes);
      exchange.close();
    });
    server.start();
    summary = new TicketSummary("test", "http://127.0.0.1:" + server.getAddress().getPort() + "/v1");
  }

  @AfterEach
  void stopStandIn() {
    server.stop(0);
  }

  @Test
  void summarizesARefundTicket() {
    assertEquals("Customer was charged twice and wants a refund.",
        summary.summarize("I was charged twice for my order, please refund one."));
  }

  @Test
  void summarizesAGeneralTicket() {
    assertFalse(summary.summarize("What are your opening hours?").isEmpty());
  }
}
