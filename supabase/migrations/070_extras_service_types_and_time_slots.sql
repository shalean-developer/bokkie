-- Link additional services to applicable main service types (e.g. deep, move-in-out)
-- Enables booking form to pull service-specific extras from the database.

ALTER TABLE additional_services
ADD COLUMN IF NOT EXISTS applicable_service_types TEXT[] DEFAULT NULL;

COMMENT ON COLUMN additional_services.applicable_service_types IS
  'Main service types this extra applies to (e.g. deep, move-in-out, standard, airbnb)';

-- Deep / Move In-Out extras: Ceiling, Garage, Carpet, Balcony, Mattress
UPDATE additional_services
SET applicable_service_types = ARRAY['deep', 'move-in-out']
WHERE service_id IN (
  'ceiling-cleaning',
  'garage-cleaning',
  'carpet-cleaning',
  'balcony-cleaning'
);

INSERT INTO additional_services (
  service_id,
  name,
  description,
  icon_name,
  price_modifier,
  display_order,
  applicable_service_types
) VALUES (
  'mattress-cleaning',
  'Mattress Cleaning',
  'Deep cleaning of mattresses',
  'Bed',
  150.00,
  14,
  ARRAY['deep', 'move-in-out']
)
ON CONFLICT (service_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  applicable_service_types = EXCLUDED.applicable_service_types,
  is_active = true;

-- Deactivate legacy couch-cleaning extra in favour of mattress-cleaning
UPDATE additional_services SET is_active = false WHERE service_id = 'couch-cleaning';
