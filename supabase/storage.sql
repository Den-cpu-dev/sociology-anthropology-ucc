-- ============================================
-- SOASA Election - Storage Configuration
-- ============================================
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- Creates a public storage bucket for candidate photos

-- Create the storage bucket for election photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'election-photos',
  'election-photos',
  true,
  5242880, -- 5 MB limit per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies
-- ============================================

-- Policy 1: Public read access for all photos
-- Allows anyone to view candidate photos
CREATE POLICY "Public read access for election photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'election-photos');

-- Policy 2: Admin upload access (via service role only)
-- Photos are uploaded through the API using service_role key
-- No direct client uploads allowed for security
CREATE POLICY "Admin upload access for election photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'election-photos'
  AND (auth.jwt() ->> 'role') = 'service_role'
);

-- Policy 3: Admin delete access (via service role only)
-- Allows electoral committee to remove/replace photos
CREATE POLICY "Admin delete access for election photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'election-photos'
  AND (auth.jwt() ->> 'role') = 'service_role'
);

-- Policy 4: Admin update access (via service role only)
-- Allows updating photo metadata if needed
CREATE POLICY "Admin update access for election photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'election-photos'
  AND (auth.jwt() ->> 'role') = 'service_role'
);

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the bucket was created successfully:
-- SELECT * FROM storage.buckets WHERE id = 'election-photos';

-- ============================================
-- USAGE NOTES
-- ============================================
-- 1. Photos are uploaded via the API endpoint: /api/admin/candidate
-- 2. The API uses SUPABASE_SERVICE_ROLE_KEY for authentication
-- 3. Public URLs are automatically generated and stored in candidates.photo_url
-- 4. Supported formats: JPEG, PNG, WebP
-- 5. Max file size: 5 MB per photo
-- 6. Photos are served from: https://[project-id].supabase.co/storage/v1/object/public/election-photos/[filename]
--
-- To manually upload a test photo via Supabase Dashboard:
-- 1. Go to Storage → election-photos bucket
-- 2. Click "Upload file"
-- 3. Choose an image (JPEG/PNG/WebP, max 5MB)
-- 4. Copy the public URL
-- 5. Use it in the admin dashboard when adding a candidate
