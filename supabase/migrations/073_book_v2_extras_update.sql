-- Book v2 add-ons: remove extra room extras, align laundry label, ensure cabinets/walls are active

UPDATE additional_services
SET name = 'Laundry and Ironing'
WHERE service_id = 'laundry';

UPDATE additional_services
SET is_active = false
WHERE service_id IN ('extra-bathroom', 'extra-bedroom');

UPDATE additional_services
SET is_active = true
WHERE service_id IN ('inside-cabinets', 'interior-walls');
