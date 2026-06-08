-- ============================================================
-- Analytics Events — Complete Setup
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  page_id     UUID        REFERENCES pages(id)       ON DELETE CASCADE,
  event_type  TEXT        NOT NULL,
  slug        TEXT,
  metadata    JSONB       DEFAULT '{}'
);

-- 2. Add session_id column if not present
ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- 3. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ae_user_created
  ON analytics_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ae_page_created
  ON analytics_events (page_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ae_event_type
  ON analytics_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ae_session
  ON analytics_events (session_id)
  WHERE session_id IS NOT NULL;

-- 4. Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- 5. Policy: owners can read their own events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'analytics_events'
      AND policyname = 'Users can read own analytics'
  ) THEN
    CREATE POLICY "Users can read own analytics"
      ON analytics_events FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================
-- Verify: run this SELECT to confirm the table is ready
-- ============================================================
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'analytics_events'
-- ORDER BY ordinal_position;
