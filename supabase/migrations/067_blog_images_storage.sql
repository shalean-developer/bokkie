-- Blog images Supabase Storage bucket and RLS policies
-- Bucket: blog-images (public read, admin-only write)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read for blog images
DROP POLICY IF EXISTS "Blog images public read" ON storage.objects;
CREATE POLICY "Blog images public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Admin upload
DROP POLICY IF EXISTS "Blog images admin insert" ON storage.objects;
CREATE POLICY "Blog images admin insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin update (replace)
DROP POLICY IF EXISTS "Blog images admin update" ON storage.objects;
CREATE POLICY "Blog images admin update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admin delete
DROP POLICY IF EXISTS "Blog images admin delete" ON storage.objects;
CREATE POLICY "Blog images admin delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
