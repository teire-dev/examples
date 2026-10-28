# frozen_string_literal: true

require "faraday"
require "json"
require_relative "status_client/raise_on_server_error"

# A small client for a Statuspage-style API: component health and open incidents.
module StatusClient
  class Error < StandardError; end

  class Client
    # Pass `user`/`password` for HTTP Basic auth, or `token` for a bearer token.
    def initialize(base_url:, user: nil, password: nil, token: nil, adapter: Faraday.default_adapter, stubs: nil)
      @conn = Faraday.new(url: base_url) do |f|
        f.use RaiseOnServerError
        f.adapter(*[adapter, stubs].compact)
      end
      @conn.basic_auth(user, password) if user
      @conn.authorization(:Bearer, token) if token
    end

    # [{ "name" => "API", "status" => "operational" }, …]
    def components
      fetch("/api/v2/components.json").fetch("components").map { |c| c.slice("name", "status") }
    end

    # Incidents that are not resolved yet, newest first.
    def open_incidents
      fetch("/api/v2/incidents/unresolved.json").fetch("incidents")
        .sort_by { |i| i.fetch("created_at") }.reverse
        .map { |i| i.slice("id", "name", "impact") }
    end

    # True when every component reports "operational".
    def all_operational?
      components.all? { |c| c["status"] == "operational" }
    end

    private

    def fetch(path)
      JSON.parse(@conn.get(path).body)
    end
  end
end
