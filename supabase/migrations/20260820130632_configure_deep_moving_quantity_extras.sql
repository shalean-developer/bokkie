-- Keep Deep/Moving optional extras aligned with the customer-facing booking prices.
update public.pricing_extras
set
  price = case slug
    when 'carpet-cleaning' then 350
    when 'ceiling-cleaning' then 100
    when 'garage-cleaning' then 100
    when 'balcony-cleaning' then 50
    when 'mattress-cleaning' then 250
    else price
  end,
  service_slugs = case
    when slug in ('carpet-cleaning','mattress-cleaning') then array['carpet-cleaning','deep-cleaning','moving-cleaning']::text[]
    else array['deep-cleaning','moving-cleaning']::text[]
  end,
  updated_at = now()
where slug in ('carpet-cleaning','ceiling-cleaning','garage-cleaning','balcony-cleaning','mattress-cleaning');
