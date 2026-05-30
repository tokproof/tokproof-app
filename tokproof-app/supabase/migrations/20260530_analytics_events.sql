-- ============================================================
-- Analytics Events Table
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  page_id     UUID        REFERENCES pages(id) ON DELETE CASCADE,
  event_type  TEXT        NOT NULL,
  slug        TEXT,
  metadata    JSONB       DEFAULT '{}'
);

-- Efficient queries by owner (dashboard aggregates)
CREATE INDEX IF NOT EXISTS idx_ae_user_created
  ON analytics_events (user_id, created_at DESC);

-- Efficient queries by page (per-page stats)
CREATE INDEX IF NOT EXISTS idx_ae_page_created
  ON analytics_events (page_id, created_at DESC);

-- Efficient queries by event type (funnel analysis)
CREATE INDEX IF NOT EXISTS idx_ae_event_type
  ON analytics_events (event_type, created_at DESC);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public (unauthenticated) visitors can insert via service role only
-- → enforced by using the service role key in /api/track

-- Authenticated users can read their own events
CREATE POLICY "Users can read own analytics"
  ON analytics_events FOR SELECT
  USING (user_id = auth.uid());

-- Service role bypasses RLS for inserts (handled in API route)
-- No additional policy needed; supabase service key bypasses RLS
