# frozen_string_literal: true

require "minitest/autorun"
require "json"
require "socket"
require_relative "../lib/ticket_summary"

# A local stand-in for OpenAI's Chat Completions API, so the tests never leave 127.0.0.1. It answers
# the way OpenAI does: a model OpenAI shut down gets HTTP 404 `model_not_found` (OpenAI's
# deprecations page lists gpt-4.1-nano as shut down on October 23, 2026, replaced by gpt-5.6-luna,
# https://developers.openai.com/api/docs/deprecations); a model it serves returns a completion.
class OpenAIStandIn
  SERVED = %w[gpt-5.6-luna gpt-5.6-terra gpt-5.6-sol].freeze

  attr_reader :url

  def initialize
    @server = TCPServer.new("127.0.0.1", 0)
    @url = "http://127.0.0.1:#{@server.addr[1]}/v1"
    @thread = Thread.new { loop { handle(@server.accept) } }
  end

  def close
    @thread.kill
    @server.close
  end

  private

  def handle(socket)
    path = socket.gets.to_s.split[1]
    length = 0
    while (line = socket.gets) && line != "\r\n"
      length = line.split(":", 2)[1].to_i if line.downcase.start_with?("content-length:")
    end
    body = JSON.parse(socket.read(length)) rescue {}
    status, payload = answer(path, body)
    json = JSON.generate(payload)
    socket.write("HTTP/1.1 #{status} OK\r\ncontent-type: application/json\r\ncontent-length: #{json.bytesize}\r\nconnection: close\r\n\r\n#{json}")
  ensure
    socket.close
  end

  def answer(path, body)
    model = body["model"].to_s
    unless path == "/v1/chat/completions" && SERVED.include?(model)
      return [404, { error: { message: "The model `#{model}` does not exist or you do not have access to it.",
                              type: "invalid_request_error", param: nil, code: "model_not_found" } }]
    end
    text = body["messages"].to_s.downcase
    summary = text.include?("charged twice") ? "Customer was charged twice and wants a refund." : "Customer has a general question."
    [200, { id: "chatcmpl-standin", object: "chat.completion", created: 1_793_000_000, model: model,
            choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: summary } }] }]
  end
end

class TicketSummaryTest < Minitest::Test
  def setup
    @stand_in = OpenAIStandIn.new
    @summary = TicketSummary.new(api_key: "test", base_url: @stand_in.url)
  end

  def teardown
    @stand_in.close
  end

  def test_summarizes_a_refund_ticket
    assert_equal "Customer was charged twice and wants a refund.",
                 @summary.summarize("I was charged twice for my order, please refund one.")
  end

  def test_summarizes_a_general_ticket
    refute_empty @summary.summarize("What are your opening hours?")
  end
end
