# frozen_string_literal: true

require "minitest/autorun"
require_relative "../lib/tracking"

class TrackingTest < Minitest::Test
  def tracking(stubs)
    Tracking.new(base_url: "https://carrier.example.com", adapter: :test, stubs: stubs)
  end

  def test_status_of_a_known_parcel
    stubs = Faraday::Adapter::Test::Stubs.new do |s|
      s.get("/v1/parcels/TR1") do |env|
        assert_equal "application/json", env.request_headers["Accept"]
        [200, {}, JSON.dump("status" => "in_transit")]
      end
    end
    assert_equal "in_transit", tracking(stubs).status("TR1")
  end

  def test_unknown_parcel_is_nil
    stubs = Faraday::Adapter::Test::Stubs.new { |s| s.get("/v1/parcels/NOPE") { [404, {}, ""] } }
    assert_nil tracking(stubs).status("NOPE")
  end
end
