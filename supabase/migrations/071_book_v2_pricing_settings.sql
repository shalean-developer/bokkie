-- Book v2 pricing settings (editable from admin dashboard)

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  ('extra_cleaner_price', '150', 'number', 'Price per additional cleaner in book flow', true),
  ('team_booking_fee', '150', 'number', 'Team booking fee for deep/move cleans', true),
  ('book_carpet_price_per_room', '90', 'number', 'Carpet cleaning price per room in book flow', true),
  ('book_carpet_area_small', '0', 'number', 'Carpet area size adjustment (small)', true),
  ('book_carpet_area_medium', '100', 'number', 'Carpet area size adjustment (medium)', true),
  ('book_carpet_area_large', '200', 'number', 'Carpet area size adjustment (large)', true),
  ('book_office_size_small', '0', 'number', 'Office size adjustment (small)', true),
  ('book_office_size_medium', '100', 'number', 'Office size adjustment (medium)', true),
  ('book_office_size_large', '200', 'number', 'Office size adjustment (large)', true),
  ('book_workstation_price', '15', 'number', 'Price per workstation in office cleaning', true)
ON CONFLICT (setting_key) DO NOTHING;
