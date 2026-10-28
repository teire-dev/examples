# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/status_client"

class StatusClientTest < Minitest::Test
  COMPONENTS = { "components" => [
    { "id" => "a1", "name" => "API", "status" => "operational" },
    { "id" => "b2", "name" => "Dashboard", "status" => "degraded_performance" }
  ] }.freeze

  def client(stubs, **auth)
    StatusClient::Client.new(base_url: "https://status.example.com", adapter: :test, stubs: stubs, **auth)
  end

  def test_components_keep_name_and_status
    stubs = Faraday::Adapter::Test::Stubs.new { |s| s.get("/api/v2/components.json") { [200, {}, JSON.dump(COMPONENTS)] } }
    assert_equal [{ "name" => "API", "status" => "operational" }, { "name" => "Dashboard", "status" => "degraded_performance" }],
                 client(stubs).components
  end

  def test_all_operational_is_false_when_one_component_degrades
    stubs = Faraday::Adapter::Test::Stubs.new { |s| s.get("/api/v2/components.json") { [200, {}, JSON.dump(COMPONENTS)] } }
    refute client(stubs).all_operational?
  end

  def test_open_incidents_newest_first
    body = { "incidents" => [
      { "id" => "i1", "name" => "Login errors", "impact" => "major", "created_at" => "2026-10-20T10:00:00Z" },
      { "id" => "i2", "name" => "Slow search", "impact" => "minor", "created_at" => "2026-10-22T08:30:00Z" }
    ] }
    stubs = Faraday::Adapter::Test::Stubs.new { |s| s.get("/api/v2/incidents/unresolved.json") { [200, {}, JSON.dump(body)] } }
    assert_equal %w[i2 i1], client(stubs).open_incidents.map { |i| i["id"] }
  end

  def test_basic_auth_header
    stubs = Faraday::Adapter::Test::Stubs.new do |s|
      s.get("/api/v2/components.json") do |env|
        assert_equal "Basic #{['ops:s3cret'].pack('m0')}", env.request_headers["Authorization"]
        [200, {}, JSON.dump(COMPONENTS)]
      end
    end
    client(stubs, user: "ops", password: "s3cret").components
    stubs.verify_stubbed_calls
  end

  def test_bearer_token_header
    stubs = Faraday::Adapter::Test::Stubs.new do |s|
      s.get("/api/v2/components.json") do |env|
        assert_equal "Bearer tok_123", env.request_headers["Authorization"]
        [200, {}, JSON.dump(COMPONENTS)]
      end
    end
    client(stubs, token: "tok_123").components
    stubs.verify_stubbed_calls
  end

  def test_server_errors_raise
    stubs = Faraday::Adapter::Test::Stubs.new { |s| s.get("/api/v2/components.json") { [503, {}, "unavailable"] } }
    error = assert_raises(StatusClient::Error) { client(stubs).components }
    assert_match(/503/, error.message)
  end
end
