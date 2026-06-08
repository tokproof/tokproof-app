import { createAdminClient } from '@/lib/supabase/server'

export interface DashboardAnalytics {
  views:             number  // unique sessions with page_view (landing page visits only)
  clicks:            number  // unique sessions with cta_click | link_click | shopify_click | button_click
  ctr:               number  // clicks / views %
  exits:             number  // unique sessions that visited /@username/go (direct_exit_view)
  exitSuccess:       number  // unique sessions successfully redirected to external browser
  exitRate:          number  // exitSuccess / exits %
  openBrowserClicks: number  // sessions that arrived at /go already in a normal browser
}

export interface PageStats {
  views:  number
  clicks: number
  ctr:    number
}

// ── Event classification ──────────────────────────────────────────────────────

// Landing page visits (pages with blocks/CTAs)
const VIEW_EVENTS = ['page_view']

// Clicks on landing page CTAs and links
const CLICK_EVENTS = ['cta_click', 'link_click', 'shopify_click', 'button_click']

// Rescue page visits: anyone who opened /@username/go
const EXIT_SHOWN_EVENTS = ['direct_exit_view']

// Successful rescue: user was auto-redirected to external browser
const EXIT_SUCCESS_EVENTS = ['direct_exit_redirected']

// Separate informational signal: arrived at /go already in normal browser
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

// ── Full Analytics (for analytics dashboard) ──────────────────────────────────

export interface PageMeta {
  id:           string
  title:        string | null
  product_name: string | null
  brand_name:   string | null
  username:     string | null
}

export interface TimePoint {
  date:              string
  views:             number
  clicks:            number
  openBrowserClicks: number
}

export interface DeviceStat  { name: string; pct: number; color: string }
export interface SourceStat  { name: string; pct: number; barWidth: number; iconBg: string; iconSvg: string }

export interface PageStat {
  pageId:            string
  name:              string
  url:               string
  landingViews:      number
  uniqueVisitors:    number
  clicks:            number
  ctr:               number
  rescueRate:        number
  exitGuideViews:    number
  openBrowserClicks: number
}

export interface FullAnalytics {
  // KPIs
  views:             number
  uniqueVisitors:    number
  clicks:            number
  ctr:               number
  rescueRate:        number
  exitGuideViews:    number
  openBrowserClicks: number
  // Funnel
  funnelExitViews:       number
  funnelGuideViews:      number
  funnelBrowserDetected: number
  funnelLandingViews:    number
  // Breakdown
  timeSeries: TimePoint[]
  devices:    DeviceStat[]
  sources:    SourceStat[]
  pages:      PageStat[]
}

type RawFull = RawEvent & { metadata: Record<string, unknown> | null }

function parseDevice(ua: string): string {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iPhone'
  if (/Android/i.test(ua))          return 'Android'
  return 'Desktop'
}

function parseSource(ref: string): string {
  if (!ref)                              return 'Directo'
  if (/tiktok/i.test(ref))              return 'TikTok'
  if (/instagram/i.test(ref))           return 'Instagram'
  if (/youtube|youtu\.be/i.test(ref))   return 'YouTube'
  return 'Otros'
}

function buildTimeSeries(events: RawFull[], days: number): TimePoint[] {
  const pts: TimePoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const ev = events.filter(e => e.created_at.startsWith(key))
    pts.push({
      date:              d.toLocaleDateString('es', { day: 'numeric', month: 'short' }),
      views:             uniqueSessionCount(ev.filter(e => VIEW_EVENTS.includes(e.event_type))),
      clicks:            uniqueSessionCount(ev.filter(e => CLICK_EVENTS.includes(e.event_type))),
      openBrowserClicks: uniqueSessionCount(ev.filter(e => OPEN_BROWSER_EVENTS.includes(e.event_type))),
    })
  }
  return pts
}

function buildDeviceStats(events: RawFull[]): DeviceStat[] {
  const counts: Record<string, number> = { iPhone: 0, Android: 0, Desktop: 0 }
  const seen = new Set<string>()
  for (const e of events) {
    const sid = e.session_id ?? `${e.page_id}|${Math.floor(new Date(e.created_at).getTime() / 300_000)}`
    if (seen.has(sid)) continue
    seen.add(sid)
    const ua = (e.metadata?.userAgent as string) ?? ''
    counts[parseDevice(ua)]++
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (!total) return []
  return [
    { name: 'iPhone',  pct: Math.round((counts.iPhone  / total) * 100), color: '#FB2C7D' },
    { name: 'Android', pct: Math.round((counts.Android / total) * 100), color: '#7C3AED' },
    { name: 'Desktop', pct: Math.round((counts.Desktop / total) * 100), color: '#3B82F6' },
  ].filter(d => d.pct > 0)
}

const SOURCE_META: Record<string, { iconBg: string; iconSvg: string }> = {
  TikTok:    { iconBg: '#111',
    iconSvg: '<path d="M16.5 5.5c1 1.2 2.3 2 3.9 2.1v3c-1.6 0-3.1-.5-4.4-1.4v6.3a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 1 0 1.7 2.4V2.5h3.1c.1 1.1.5 2.1 1.3 3z" fill="#fff"/>' },
  Instagram: { iconBg: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)',
    iconSvg: '<rect x="3" y="3" width="18" height="18" rx="5" stroke="#fff" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="#fff" fill="none" stroke-width="2"/><circle cx="17" cy="7" r="1" fill="#fff"/>' },
  YouTube:   { iconBg: '#FF0000',
    iconSvg: '<path d="M3 8.5c.2-1.6 1-2.4 2.6-2.6C7.5 5.6 12 5.6 12 5.6s4.5 0 6.4.3c1.6.2 2.4 1 2.6 2.6.2 1.4.2 3.5.2 3.5s0 2.1-.2 3.5c-.2 1.6-1 2.4-2.6 2.6-1.9.3-6.4.3-6.4.3s-4.5 0-6.4-.3c-1.6-.2-2.4-1-2.6-2.6C2.8 14.1 2.8 12 2.8 12s0-2.1.2-3.5z" fill="#fff"/><polygon points="10,9 16,12 10,15" fill="#FF0000"/>' },
  Directo:   { iconBg: '#EEF0F4',
    iconSvg: '<circle cx="12" cy="12" r="9" stroke="#8B90A0" fill="none" stroke-width="2"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="#8B90A0" fill="none" stroke-width="2"/>' },
  Otros:     { iconBg: '#EEF0F4',
    iconSvg: '<circle cx="6" cy="12" r="1" fill="#8B90A0"/><circle cx="12" cy="12" r="1" fill="#8B90A0"/><circle cx="18" cy="12" r="1" fill="#8B90A0"/>' },
}

function buildSourceStats(events: RawFull[]): SourceStat[] {
  const counts: Record<string, number> = {}
  const seen = new Set<string>()
  for (const e of events) {
    const sid = e.session_id ?? `${e.page_id}|${Math.floor(new Date(e.created_at).getTime() / 300_000)}`
    if (seen.has(sid)) continue
    seen.add(sid)
    const ref = (e.metadata?.referer as string) ?? ''
    const src = parseSource(ref)
    counts[src] = (counts[src] ?? 0) + 1
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (!total) return []
  const maxCount = Math.max(...Object.values(counts))
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      pct:      Math.round((count / total) * 100),
      barWidth: Math.round((count / maxCount) * 100),
      iconBg:   SOURCE_META[name]?.iconBg  ?? '#EEF0F4',
      iconSvg:  SOURCE_META[name]?.iconSvg ?? '',
    }))
}

function buildPageStats(events: RawFull[], pages: PageMeta[]): PageStat[] {
  return pages.map(p => {
    const ev          = events.filter(e => e.page_id === p.id)
    const views       = uniqueSessionCount(ev.filter(e => VIEW_EVENTS.includes(e.event_type)))
    const clicks      = uniqueSessionCount(ev.filter(e => CLICK_EVENTS.includes(e.event_type)))
    const exits       = uniqueSessionCount(ev.filter(e => EXIT_SHOWN_EVENTS.includes(e.event_type)))
    const rescued     = uniqueSessionCount(ev.filter(e => EXIT_SUCCESS_EVENTS.includes(e.event_type)))
    const openBrowser = uniqueSessionCount(ev.filter(e => OPEN_BROWSER_EVENTS.includes(e.event_type)))
    const allSessions = uniqueSessionCount(ev)
    const name        = p.title ?? p.product_name ?? p.brand_name ?? 'Sin título'
    const url         = p.username ? `/${p.username}` : `/${p.id.slice(0, 8)}`
    return {
      pageId:            p.id,
      name,
      url,
      landingViews:      views,
      uniqueVisitors:    allSessions,
      clicks,
      ctr:               pct(clicks, views),
      rescueRate:        pct(rescued, exits),
      exitGuideViews:    exits,
      openBrowserClicks: openBrowser,
    }
  })
}

export async function getFullAnalytics(
  userId: string,
  days: number,
  pageIdFilter: string | null,
  pages: PageMeta[]
): Promise<FullAnalytics> {
  const supabase = createAdminClient()
  const since    = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const buildQ = (sb: ReturnType<typeof createAdminClient>, cols: string) => {
    let q = sb.from('analytics_events').select(cols)
      .eq('user_id', userId).gte('created_at', since)
    if (pageIdFilter) q = q.eq('page_id', pageIdFilter) as typeof q
    return q
  }

  const { data, error } = await buildQ(supabase, 'event_type, session_id, page_id, created_at, metadata')

  // Fallback if session_id or metadata columns missing
  let rows: RawFull[]
  if (error) {
    const { data: fb } = await buildQ(supabase, 'event_type, page_id, created_at')
    rows = (fb ?? []).map((e: unknown) => ({
      ...(e as object), session_id: null, metadata: null,
    })) as RawFull[]
  } else {
    rows = (data ?? []) as unknown as RawFull[]
  }

  const views             = uniqueSessionCount(rows.filter(e => VIEW_EVENTS.includes(e.event_type)))
  const clicks            = uniqueSessionCount(rows.filter(e => CLICK_EVENTS.includes(e.event_type)))
  const exits             = uniqueSessionCount(rows.filter(e => EXIT_SHOWN_EVENTS.includes(e.event_type)))
  const rescued           = uniqueSessionCount(rows.filter(e => EXIT_SUCCESS_EVENTS.includes(e.event_type)))
  const openBrowserClicks = uniqueSessionCount(rows.filter(e => OPEN_BROWSER_EVENTS.includes(e.event_type)))
  const uniqueVisitors    = uniqueSessionCount(rows)

  return {
    views,
    uniqueVisitors,
    clicks,
    ctr:               pct(clicks, views),
    rescueRate:        pct(rescued, exits),
    exitGuideViews:    exits,
    openBrowserClicks,
    // Funnel: raw counts (not deduplicated) for TikTok Rescue flow visualization
    funnelExitViews:       rows.filter(e => e.event_type === 'direct_exit_view').length,
    funnelGuideViews:      rows.filter(e => e.event_type === 'direct_exit_webview_detected').length,
    funnelBrowserDetected: rows.filter(e => e.event_type === 'direct_exit_browser_detected').length,
    funnelLandingViews:    rows.filter(e => e.event_type === 'page_view').length,
    timeSeries: buildTimeSeries(rows, days),
    devices:    buildDeviceStats(rows),
    sources:    buildSourceStats(rows),
    pages:      buildPageStats(rows, pages),
  }
}
