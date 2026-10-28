# An incident mirrored from a vendor's status page.
class Incident < ApplicationRecord
  validates :vendor_id, presence: true, uniqueness: true
  validates :title, :severity, presence: true

  scope :open, -> { where(resolved_at: nil) }
end
