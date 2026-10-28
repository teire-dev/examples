# frozen_string_literal: true

module StatusClient
  # Turns 5xx responses into StatusClient::Error so callers can retry or alert.
  class RaiseOnServerError < Faraday::Response::Middleware
    def on_complete(env)
      return unless env.status >= 500

      raise StatusClient::Error, "status page returned #{env.status}"
    end
  end
end
