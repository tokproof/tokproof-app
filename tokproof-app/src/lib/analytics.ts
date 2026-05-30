import { createAdminClient } from '@/lib/supabase/server'

export interface DashboardAnalytics {
  views:             number  // unique sessions with page_view | direct_exit_view
  clicks:            number  // unique sessions with direct_exit_redirected
  ctr:               number  // clicks / views %
  exits:             number  // unique sessions where TikTok WebView was detected
  exitSuccess:       number  // unique sessions that successfully redirected (direct_exit_redirected)
  exitRate:          number  // exitSuccess / exits %
  openBrowserClicks: number  // unique sessions where user was already in normal browser
}

export interface PageStats {
  views:  number
  clicks: number
  ctr:    number
}

// ── Event classification ──────────────────────────────────────────────────────

// A visit = one of these events
const VIEW_EVENTS = ['page_view', 'direct_exit_view']

// A click = user successfully redirected (TikTok Rescue)
// or tapped a CTA/link on other page types
const CLICK_EVENTS = [
  'cta_click', 'link_click', 'shopify_click', 'button_click',
  'direct_exit_redirected',
  // direct_exit_browser_detected is intentionally NOT here
]

// Exit guide shown = user was trapped inside TikTok WebView
const EXIT_SHOWN_EVENTS = ['exit_guide_shown', 'direct_exit_webview_detected']

// Successful rescue = user reached an external browser
// Only direct_exit_redirected — direct_exit_browser_detected is a separate informational signal
const EXIT_SUCCESS_EVENTS = ['exit_success', 'direct_exit_redirected']

// Separate counter: user arrived at /go already in a normal browser (not TikTok)
const OPEN_BROWSER_EVENTS = ['direct_exit_browser_detected']

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(num: number, den: number) {
  return den > 0 ? Math.round((num / den) * 100) : 0
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

type RawEvent = {
  event_type: string
  session_id: string | null
  page_id:    string | null
  created_at: string
}

/**
 * Count unique sessions in a set of events.
 * - With session_id: deduplicate by session_id.
 * - Without session_id (legacy events): bucket by page_id + 5-minute window.
 */
function uniqueSessionCount(events: RawEvent[]): number {
  const seen = new Set<string>()
  for (const e of events) {
    const key = e.session_id
      ?? `${e.page_id ?? ''}|${Math.floor(new Date(e.created_at).getTime() / 300_000)}`
    seen.add(key)
  }
  return seen.size
}

function calcMetrics(rows: RawEvent[]): DashboardAnalytics {
  const views             = uniqueSessionCount(rows.filter(e => VIEW_EVENTS.includes(e.event_type)))
  const clicks            = uniqueSessionCount(rows.filter(e => CLICK_EVENTS.includes(e.event_type)))
  const exits             = uniqueSessionCount(rows.filter(e => EXIT_SHOWN_EVENTS.includes(e.event_type)))
  const exitSuccess       = uniqueSessionCount(rows.filter(e => EXIT_SUCCESS_EVENTS.includes(e.event_type)))
  const openBrowserClicks = uniqueSessionCount(rows.filter(e => OPEN_BROWSER_EVENTS.includes(e.event_type)))
  return {
    views,
    clicks,
    ctr:               pct(clicks, views),
    exits,
    exitSuccess,
    exitRate:          pct(exitSuccess, exits),
    openBrowserClicks,
  }
}

const EMPTY: DashboardAnalytics = {
  views: 0, clicks: 0, ctr: 0,
  exits: 0, exitSuccess: 0, exitRate: 0,
  openBrowserClicks: 0,
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Aggregate metrics for the whole user account (last 30 days) */
export async function getDashboardAnalytics(userId: string): Promise<DashboardAnalytics> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_type, session_id, page_id, created_at')
    .eq('user_id', userId)
    .gte('created_at', since)

  if (error) {
    // session_id column not yet added — retry without it
    const { data: fallback } = await supabase
      .from('analytics_events')
      .select('event_type, page_id, created_at')
      .eq('user_id', userId)
      .gte('created_at', since)
    if (!fallback?.length) return EMPTY
    return calcMetrics(fallback.map(e => ({ ...e, session_id: null })) as RawEvent[])
  }

  if (!data?.length) return EMPTY
  return calcMetrics(data as RawEvent[])
}

/** Per-page stats for a list of page IDs (last 30 days) */
export async function getPageStats(
  pageIds: string[]
): Promise<Record<string, PageStats>> {
  if (!pageIds.length) return {}

  const supabase = createAdminClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('analytics_events')
    .select('page_id, event_type, session_id, created_at')
    .in('page_id', pageIds)
    .gte('created_at', since)

  const rows: RawEvent[] = error
    ? await supabase
        .from('analytics_events')
        .select('page_id, event_type, created_at')
        .in('page_id', pageIds)
        .gte('created_at', since)
        .then(r => (r.data ?? []).map(
          (e: { page_id: string | null; event_type: string; created_at: string }) =>
            ({ ...e, session_id: null as null })
        ))
    : (data ?? []).map((e: RawEvent) => ({ ...e, session_id: e.session_id ?? null }))

  const result: Record<string, PageStats> = {}
  for (const id of pageIds) {
    const ev     = rows.filter(e => e.page_id === id)
    const views  = uniqueSessionCount(ev.filter(e => VIEW_EVENTS.includes(e.event_type)))
    const clicks = uniqueSessionCount(ev.filter(e => CLICK_EVENTS.includes(e.event_type)))
    result[id]   = { views, clicks, ctr: pct(clicks, views) }
  }
  return result
}

// ── Formatters ────────────────────────────────────────────────────────────────

/** Format DashboardAnalytics into the string map DashboardClient expects */
export function formatAnalytics(a: DashboardAnalytics) {
  return {
    views:            fmt(a.views),
    clicks:           fmt(a.clicks),
    ctr:              `${a.ctr}%`,
    rescues:          fmt(a.exitSuccess),
    viewsTrend:       '',
    clicksTrend:      '',
    ctrTrend:         '',
    rescuesTrend:     '',
    rescueGuides:     fmt(a.exits),
    rescueOpens:      fmt(a.exitSuccess),
    rescueRate:       `${a.exitRate}%`,
    openBrowserClicks: fmt(a.openBrowserClicks),
  }
}

/** Format per-page stats into the string map PageCard expects */
export function formatPageStats(
  stats: Record<string, PageStats>
): Record<string, { views: string; clicks: string; ctr: string }> {
  const result: Record<string, { views: string; clicks: string; ctr: string }> = {}
  for (const [id, s] of Object.entries(stats)) {
    result[id] = { views: fmt(s.views), clicks: fmt(s.clicks), ctr: `${s.ctr}%` }
  }
  return result
}
