# frozen_string_literal: true

require "test_helper"

class StatusPageTest < ActiveSupport::TestCase
  INCIDENTS = { "incidents" => [
    { "id" => "v1", "name" => "Login errors", "impact" => "major", "resolved_at" => nil },
    { "id" => "v2", "name" => "Slow search", "impact" => "minor", "resolved_at" => "2026-10-20T10:00:00Z" }
  ] }.freeze

  def page(stubs)
    StatusPage.new(base_url: "https://status.example.com", user: "ops", password: "s3cret", adapter: :test, stubs: stubs)
  end

  test "sync creates incidents and sends basic auth" do
    stubs = Faraday::Adapter::Test::Stubs.new do |s|
      s.get("/api/v2/incidents.json") do |env|
        assert_equal "Basic #{['ops:s3cret'].pack('m0')}", env.request_headers["Authorization"]
        [200, {}, JSON.dump(INCIDENTS)]
      end
    end
    assert_equal 2, page(stubs).sync!
    assert_equal %w[Login\ errors Slow\ search], Incident.order(:title).pluck(:title)
    assert_equal 1, Incident.open.count
  end

  test "a second sync changes nothing" do
    stubs = Faraday::Adapter::Test::Stubs.new { |s| s.get("/api/v2/incidents.json") { [200, {}, JSON.dump(INCIDENTS)] } }
    page(stubs).sync!
    assert_equal 0, page(stubs).sync!
  end
end
