import { createAdminClient } from '@/lib/supabase/server'

export interface DashboardAnalytics {
  views:       number
  clicks:      number
  ctr:         number   // percentage 0-100
  exits:       number   // exit_guide_shown
  exitSuccess: number   // exit_success
  exitRate:    number   // percentage 0-100
}

export interface PageStats {
  views:  number
  clicks: number
  ctr:    number
}

// Events that count as a page view
const VIEW_EVENTS = ['page_view', 'direct_exit_view']

// Events that count as a user click / CTA engagement
const CLICK_EVENTS = [
  'cta_click', 'link_click', 'shopify_click', 'button_click',
  'direct_exit_redirected', 'direct_exit_browser_detected',
]

// Events that count as "exit guide was shown" (user was trapped in WebView)
const EXIT_SHOWN_EVENTS = ['exit_guide_shown', 'direct_exit_webview_detected']

// Events that count as a successful rescue (user reached external browser)
const EXIT_SUCCESS_EVENTS = ['exit_success', 'direct_exit_redirected', 'direct_exit_browser_detected']

function pct(num: number, den: number) {
  return den > 0 ? Math.round((num / den) * 100) : 0
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

/** Aggregate metrics for the whole user account (last 30 days) */
export async function getDashboardAnalytics(userId: string): Promise<DashboardAnalytics> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('analytics_events')
    .select('event_type')
    .eq('user_id', userId)
    .gte('created_at', since)

  if (!data?.length) {
    return { views: 0, clicks: 0, ctr: 0, exits: 0, exitSuccess: 0, exitRate: 0 }
  }

  const views       = data.filter(e => VIEW_EVENTS.includes(e.event_type)).length
  const clicks      = data.filter(e => CLICK_EVENTS.includes(e.event_type)).length
  const exits       = data.filter(e => EXIT_SHOWN_EVENTS.includes(e.event_type)).length
  const exitSuccess = data.filter(e => EXIT_SUCCESS_EVENTS.includes(e.event_type)).length

  return {
    views,
    clicks,
    ctr:         pct(clicks, views),
    exits,
    exitSuccess,
    exitRate:    pct(exitSuccess, exits),
  }
}

/** Per-page stats for a list of page IDs (last 30 days) */
export async function getPageStats(
  pageIds: string[]
): Promise<Record<string, PageStats>> {
  if (!pageIds.length) return {}

  const supabase = createAdminClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('analytics_events')
    .select('page_id, event_type')
    .in('page_id', pageIds)
    .gte('created_at', since)

  const result: Record<string, PageStats> = {}
  for (const id of pageIds) {
    const ev     = data?.filter(e => e.page_id === id) ?? []
    const views  = ev.filter(e => VIEW_EVENTS.includes(e.event_type)).length
    const clicks = ev.filter(e => CLICK_EVENTS.includes(e.event_type)).length
    result[id]   = { views, clicks, ctr: pct(clicks, views) }
  }
  return result
}

/** Format DashboardAnalytics into the string map DashboardClient expects */
export function formatAnalytics(a: DashboardAnalytics) {
  return {
    views:       fmt(a.views),
    clicks:      fmt(a.clicks),
    ctr:         `${a.ctr}%`,
    rescues:     fmt(a.exitSuccess),
    viewsTrend:  '',
    clicksTrend: '',
    ctrTrend:    '',
    rescuesTrend:'',
    rescueGuides: fmt(a.exits),
    rescueOpens:  fmt(a.exitSuccess),
    rescueRate:   `${a.exitRate}%`,
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
