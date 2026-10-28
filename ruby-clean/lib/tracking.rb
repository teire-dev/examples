# frozen_string_literal: true

require "faraday"
require "json"

# Reads parcel status from a carrier's tracking API.
class Tracking
  def initialize(base_url:, adapter: Faraday.default_adapter, stubs: nil)
    @conn = Faraday.new(url: base_url) do |f|
      f.headers["Accept"] = "application/json"
      f.adapter(*[adapter, stubs].compact)
    end
  end

  # "delivered", "in_transit", … for a tracking number; nil when the carrier does not know it.
  def status(number)
    response = @conn.get("/v1/parcels/#{number}")
    return nil if response.status == 404

    JSON.parse(response.body).fetch("status")
  end
end
