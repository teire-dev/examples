# frozen_string_literal: true

require "faraday"

# Pulls a vendor's Statuspage incidents into our own Incident table.
class StatusPage
  def initialize(base_url:, user:, password:, adapter: Faraday.default_adapter, stubs: nil)
    @conn = Faraday.new(url: base_url) do |f|
      f.adapter(*[adapter, stubs].compact)
    end
    @conn.basic_auth(user, password)
  end

  # Creates or updates one Incident per vendor incident; returns how many changed.
  def sync!
    payload = JSON.parse(@conn.get("/api/v2/incidents.json").body)
    payload.fetch("incidents").count do |i|
      incident = Incident.find_or_initialize_by(vendor_id: i.fetch("id"))
      incident.assign_attributes(
        title: i.fetch("name"),
        severity: i.fetch("impact"),
        resolved_at: i["resolved_at"]
      )
      changed = incident.changed?
      incident.save!
      changed
    end
  end
end
