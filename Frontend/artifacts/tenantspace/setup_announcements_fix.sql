-- Clear any old policies
DROP POLICY IF EXISTS "announcements_media_view" ON storage.objects;
DROP POLICY IF EXISTS "announcements_media_insert" ON storage.objects;
DROP POLICY IF EXISTS "announcements_media_update" ON storage.objects;
DROP POLICY IF EXISTS "announcements_media_delete" ON storage.objects;

-- 1. VIEW: Anyone authenticated can view (Standard for private buckets)
CREATE POLICY "announcements_media_view" 
ON storage.objects FOR SELECT 
USING ( 
  bucket_id = 'announcements-media' AND auth.role() = 'authenticated'
);

-- 2. UPLOAD: Any authenticated user can upload
-- We rely on the App UI to only show the "Upload" button to landlords
CREATE POLICY "announcements_media_insert" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'announcements-media' AND auth.role() = 'authenticated'
);

-- 3. UPDATE: Users can only update their own files
CREATE POLICY "announcements_media_update"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'announcements-media' AND auth.uid() = owner
);

-- 4. DELETE: Users can only delete their own files
CREATE POLICY "announcements_media_delete"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'announcements-media' AND auth.uid() = owner
);
