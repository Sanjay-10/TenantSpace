-- Run this script in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION generate_property_code()
RETURNS TRIGGER AS $$
DECLARE
  base_string TEXT;
  hash_val TEXT;
  letters TEXT;
  numbers TEXT;
BEGIN
  -- Only auto-generate if property_code is null
  IF NEW.property_code IS NULL THEN
    
    -- Combine Name + Address + Landlord ID + Property ID
    -- Adding NEW.id guarantees that even if a landlord creates two identical properties, the code is unique
    base_string := lower(trim(NEW.name)) || '-' || lower(trim(NEW.address)) || '-' || NEW.landlord_id::text || '-' || NEW.id::text;
    
    -- Generate an MD5 hash (returns a 32-character hex string of 0-9 and a-f)
    hash_val := md5(base_string);
    
    -- Extract all letters and all numbers from the hash
    letters := regexp_replace(hash_val, '[^a-fA-F]', '', 'g');
    numbers := regexp_replace(hash_val, '[^0-9]', '', 'g');
    
    -- Take exactly the first 4 letters and the first 4 numbers
    letters := substring(letters from 1 for 4);
    numbers := substring(numbers from 1 for 4);
    
    -- Fallback padding
    WHILE length(letters) < 4 LOOP
        letters := letters || 'A';
    END LOOP;
    WHILE length(numbers) < 4 LOOP
        numbers := numbers || '1';
    END LOOP;
    
    -- Combine them into an 8-character string (e.g., ABCD1234)
    NEW.property_code := upper(letters) || numbers;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-attach the trigger
DROP TRIGGER IF EXISTS ensure_property_code ON public.properties;
CREATE TRIGGER ensure_property_code
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION generate_property_code();
