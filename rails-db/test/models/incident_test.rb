# frozen_string_literal: true

require "test_helper"

class IncidentTest < ActiveSupport::TestCase
  test "open incidents have no resolved_at" do
    Incident.create!(vendor_id: "a", title: "Down", severity: "critical")
    Incident.create!(vendor_id: "b", title: "Fixed", severity: "minor", resolved_at: 1.hour.ago)
    assert_equal ["Down"], Incident.open.pluck(:title)
  end

  test "vendor_id is unique" do
    Incident.create!(vendor_id: "a", title: "Down", severity: "critical")
    assert_raises(ActiveRecord::RecordInvalid) { Incident.create!(vendor_id: "a", title: "Again", severity: "minor") }
  end
end
