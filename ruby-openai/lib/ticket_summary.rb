# frozen_string_literal: true

require "openai"

# Drafts a one-line summary of a support ticket with OpenAI's Chat Completions API.
class TicketSummary
  MODEL = "gpt-5.6-luna"

  def initialize(api_key:, base_url: nil)
    options = { api_key: api_key, max_retries: 0 }
    options[:base_url] = base_url if base_url
    @client = OpenAI::Client.new(**options)
  end

  def summarize(ticket)
    completion = @client.chat.completions.create(
      model: MODEL,
      messages: [
        { role: "system", content: "Summarize the support ticket in one sentence." },
        { role: "user", content: ticket }
      ]
    )
    completion.choices.first&.message&.content.to_s
  end
end
