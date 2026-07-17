-- Run this script in your Supabase SQL Editor to add the MINIMAL required columns for Property Settings

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS rent_due_date integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS rent_reminders text[] DEFAULT ARRAY['5 days before', '2 days before', 'On due date']::text[],
ADD COLUMN IF NOT EXISTS property_code text UNIQUE,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Create a function to generate a random 6-character property code if it doesn't exist
CREATE OR REPLACE FUNCTION generate_property_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.property_code IS NULL THEN
    LOOP
      -- Generate a random 6 character alphanumeric string
      new_code := upper(substring(md5(random()::text) from 1 for 6));
      
      -- Check if it already exists
      SELECT EXISTS(SELECT 1 FROM public.properties WHERE property_code = new_code) INTO code_exists;
      
      IF NOT code_exists THEN
        NEW.property_code := new_code;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to automatically generate a code for new properties
DROP TRIGGER IF EXISTS ensure_property_code ON public.properties;
CREATE TRIGGER ensure_property_code
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION generate_property_code();

-- Generate codes for any existing properties that don't have one
DO $$
DECLARE
  prop RECORD;
BEGIN
  FOR prop IN SELECT id FROM public.properties WHERE property_code IS NULL LOOP
    UPDATE public.properties SET property_code = upper(substring(md5(random()::text) from 1 for 6)) WHERE id = prop.id;
  END LOOP;
END;
$$;
