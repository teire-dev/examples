class CreateIncidents < ActiveRecord::Migration[8.1]
  def change
    create_table :incidents do |t|
      t.string :vendor_id
      t.string :title
      t.string :severity
      t.datetime :resolved_at

      t.timestamps
    end
    add_index :incidents, :vendor_id, unique: true
  end
end
