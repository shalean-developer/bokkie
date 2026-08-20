update public.pricing_extras
set service_slugs = array_remove(array_remove(service_slugs, 'deep-cleaning'), 'moving-cleaning'),
    updated_at = now()
where slug = 'inside-oven';
