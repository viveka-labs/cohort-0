-- =============================================================================
-- Storage: build-screenshots bucket and RLS policies
-- =============================================================================

-- Create the build-screenshots bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('build-screenshots', 'build-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read access for build screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'build-screenshots');

-- Authenticated users can upload to their own folder only ({user_id}/{uuid}.{ext})
CREATE POLICY "Authenticated users can upload build screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'build-screenshots'
    AND (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Users can update their own files
-- Note: owner_id is stored as text, so we cast auth.uid() to text for comparison
CREATE POLICY "Users can update own build screenshots"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'build-screenshots'
    AND owner_id = (select auth.uid()::text)
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own build screenshots"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'build-screenshots'
    AND owner_id = (select auth.uid()::text)
  );
