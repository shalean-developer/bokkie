-- V2 Booking Form: extended bookings fields + customer_profiles table
-- Supports multi-step /book/* booking flow with JSONB service details

-- ============================================================================
-- CUSTOMER PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  cell_number TEXT,
  whatsapp_number TEXT,
  default_address_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);

-- ============================================================================
-- EXTEND BOOKINGS TABLE FOR V2 FORM
-- ============================================================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'once-off';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS access_instructions TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parking_instructions TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS alternative_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS alternative_time TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_frequency TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_days JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_start_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_end_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_visit_count INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cleaner_mode TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cleaner_count INTEGER DEFAULT 1;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_cleaner_ids JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS team_booking_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS selected_extras JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pricing_summary JSONB DEFAULT '{}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_duration TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_total NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_provider TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source_page TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS form_version TEXT DEFAULT 'v1';

-- Ensure teams table has team_type column for V2 spec
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_type TEXT DEFAULT 'deep_moving';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS max_jobs_per_day INTEGER DEFAULT 1;

-- Update team names to Team 1/2/3 per spec
UPDATE teams SET name = 'Team 1' WHERE team_id = 'team-a';
UPDATE teams SET name = 'Team 2' WHERE team_id = 'team-b';
UPDATE teams SET name = 'Team 3' WHERE team_id = 'team-c';

COMMENT ON TABLE customer_profiles IS 'Customer profile linked to Supabase Auth for booking auto-fill';
COMMENT ON COLUMN bookings.service_details IS 'V2 service-specific answers as JSONB';
COMMENT ON COLUMN bookings.cleaner_mode IS 'team or individual_cleaners';
