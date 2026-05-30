-- ============================================================
-- Add session_id to analytics_events
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Deduplicate queries by session
CREATE INDEX IF NOT EXISTS idx_ae_session
  ON analytics_events (session_id)
  WHERE session_id IS NOT NULL;
