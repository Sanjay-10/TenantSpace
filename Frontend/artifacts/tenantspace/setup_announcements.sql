-- 1. Add image_url to announcements table
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Create the Storage Bucket for announcements (Private & Highly Secure)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'announcements-media', 
  'announcements-media', 
  false, -- Changed to FALSE! URLs are no longer public.
  5242880, 
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Clear existing policies
DROP POLICY IF EXISTS "announcements_media_public_view" ON storage.objects;
DROP POLICY IF EXISTS "announcements_media_landlord_insert" ON storage.objects;
DROP POLICY IF EXISTS "announcements_media_landlord_update" ON storage.objects;
DROP POLICY IF EXISTS "announcements_media_landlord_delete" ON storage.objects;

-- 4. Set up Ultra-Strict Storage Policies

-- To make this work, the app must upload files into a folder named after the property ID.
-- Example path: "property_uuid/filename.jpg"
-- The policy checks if the user is a member of the property folder they are trying to access.

-- Policy 1: ONLY Tenants of this specific property and the Landlord can VIEW the image
CREATE POLICY "announcements_media_view" 
ON storage.objects FOR SELECT 
USING ( 
  bucket_id = 'announcements-media' AND (
    -- User is the landlord of the property
    auth.uid() IN (SELECT landlord_id FROM public.properties WHERE id::text = (string_to_array(name, '/'))[1])
    OR
    -- User is an active tenant in the property
    auth.uid() IN (
      SELECT tm.tenant_id 
      FROM public.tenant_memberships tm
      JOIN public.rooms r ON tm.room_id = r.id
      WHERE r.property_id::text = (string_to_array(name, '/'))[1] 
      AND tm.status = 'active'
    )
  )
);

-- Policy 2: ONLY the Landlord of this specific property can UPLOAD images to it
CREATE POLICY "announcements_media_insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'announcements-media' AND 
  auth.uid() IN (SELECT landlord_id FROM public.properties WHERE id::text = (string_to_array(name, '/'))[1])
);

-- Policy 3: ONLY the Landlord can UPDATE their own images
CREATE POLICY "announcements_media_update"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'announcements-media' AND 
  auth.uid() IN (SELECT landlord_id FROM public.properties WHERE id::text = (string_to_array(name, '/'))[1])
);

-- Policy 4: ONLY the Landlord can DELETE their own images
CREATE POLICY "announcements_media_delete"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'announcements-media' AND 
  auth.uid() IN (SELECT landlord_id FROM public.properties WHERE id::text = (string_to_array(name, '/'))[1])
);
