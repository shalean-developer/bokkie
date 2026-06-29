-- Limit booking time slots to 08:00–15:00 (30-minute intervals)

UPDATE time_slots
SET is_active = false
WHERE time_value IN ('07:00', '07:30', '15:30', '16:00', '16:30');

UPDATE time_slots AS ts
SET
  is_active = true,
  display_order = ordered.ord
FROM (
  VALUES
    ('08:00', 1),
    ('08:30', 2),
    ('09:00', 3),
    ('09:30', 4),
    ('10:00', 5),
    ('10:30', 6),
    ('11:00', 7),
    ('11:30', 8),
    ('12:00', 9),
    ('12:30', 10),
    ('13:00', 11),
    ('13:30', 12),
    ('14:00', 13),
    ('14:30', 14),
    ('15:00', 15)
) AS ordered(time_value, ord)
WHERE ts.time_value = ordered.time_value;
