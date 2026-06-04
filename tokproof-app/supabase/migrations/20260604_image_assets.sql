-- ─────────────────────────────────────────────────────────────────
--  Tokproof — Image Assets
--  Run in: Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- ── 1. Storage bucket ─────────────────────────────────────────────
-- Public bucket so landing pages can render images without auth
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'page-assets',
  'page-assets',
  true,
  5242880,   -- 5 MB hard cap at bucket level
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Storage RLS policies ────────────────────────────────────────
-- Users can only upload/delete inside their own userId/ folder
-- (storage.foldername returns path segments as text[])

DO $$
BEGIN
  -- INSERT: authenticated user, path must start with their uid
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'page_assets_upload'
  ) THEN
    CREATE POLICY "page_assets_upload" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'page-assets' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- UPDATE: same ownership check
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'page_assets_update'
  ) THEN
    CREATE POLICY "page_assets_update" ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'page-assets' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- DELETE: same ownership check
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'page_assets_delete'
  ) THEN
    CREATE POLICY "page_assets_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'page-assets' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- SELECT: public read (needed for landing page rendering)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'page_assets_public_read'
  ) THEN
    CREATE POLICY "page_assets_public_read" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'page-assets');
  END IF;
END $$;

-- ── 3. image_assets table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS image_assets (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_id       uuid REFERENCES pages(id) ON DELETE SET NULL,
  block_id      text,
  url           text NOT NULL,
  storage_path  text NOT NULL,
  file_size     integer,
  mime_type     text NOT NULL DEFAULT 'image/webp',
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS image_assets_user_id_idx ON image_assets(user_id);
CREATE INDEX IF NOT EXISTS image_assets_page_id_idx ON image_assets(page_id);

ALTER TABLE image_assets ENABLE ROW LEVEL SECURITY;

-- Owner can read their own assets
CREATE POLICY "image_assets_owner_read" ON image_assets
  FOR SELECT USING (auth.uid() = user_id);

-- Owner can insert their own assets
CREATE POLICY "image_assets_owner_insert" ON image_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner can delete their own assets
CREATE POLICY "image_assets_owner_delete" ON image_assets
  FOR DELETE USING (auth.uid() = user_id);
