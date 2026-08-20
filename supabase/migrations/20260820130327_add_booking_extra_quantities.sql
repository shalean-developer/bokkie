-- Preserve per-extra quantities while keeping selected_extras backwards compatible.
alter table public.bookings
  add column if not exists extra_quantities jsonb not null default '{}'::jsonb;

comment on column public.bookings.extra_quantities is
  'Quantity per selected extra service ID, e.g. {"carpet-cleaning": 2}. selected_extras remains the backwards-compatible ID array.';

alter table public.bookings
  drop constraint if exists bookings_extra_quantities_object_check;

alter table public.bookings
  add constraint bookings_extra_quantities_object_check
  check (jsonb_typeof(extra_quantities) = 'object');
