import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Debug mode: set DEBUG_ANALYTICS=true in .env.local (never in production)
const DEBUG = process.env.DEBUG_ANALYTICS === 'true'

// Allowlist of valid event types
const ALLOWED_EVENTS = new Set([
  'page_view',
  'cta_click',
  'link_click',
  'direct_exit_view',
  'direct_exit_webview_detected',
  'direct_exit_browser_detected',
  'direct_exit_redirected',
  'exit_guide_shown',
  'exit_success',
  'shopify_click',
  'button_click',
])

// View-type events deduped: same session + page + event within 5 min = skip
const DEDUP_EVENTS = new Set([
  'page_view',
  'direct_exit_view',
  'direct_exit_webview_detected',
  'direct_exit_browser_detected',
])

export async function POST(req: NextRequest) {
  let pageId: string | undefined
  let eventType: string | undefined

  try {
    const body = await req.json()
    ;({ pageId, eventType } = body as {
      pageId?: string
      eventType?: string
      slug?: string
      sessionId?: string
      metadata?: Record<string, unknown>
    })
    const { slug, sessionId, metadata } = body as {
      slug?: string
      sessionId?: string
      metadata?: Record<string, unknown>
    }

    if (!eventType || !ALLOWED_EVENTS.has(eventType)) {
      return NextResponse.json({ error: 'invalid eventType' }, { status: 400 })
    }

    if (DEBUG) {
      console.log('[track] incoming:', { pageId, eventType, sessionId: sessionId?.slice(0, 8) })
    }

    const supabase = createAdminClient()

    // Resolve user_id from page — needed so dashboard queries work
    let userId: string | null = null
    if (pageId) {
      const { data: page, error: pageErr } = await supabase
        .from('pages')
        .select('user_id')
        .eq('id', pageId)
        .single()

      if (pageErr && DEBUG) {
        console.warn('[track] page lookup failed:', pageErr.message, 'pageId:', pageId)
      }
      userId = page?.user_id ?? null
    }

    const ua  = req.headers.get('user-agent') ?? ''
    const ref = req.headers.get('referer') ?? ''
    // Client-provided metadata merged with server-detected values
    const enriched = { userAgent: ua, referer: ref, ...metadata }

    // ── Deduplication for view-type events ────────────────────────────────
    // Prevents double-inserts from React Strict Mode or network retries.
    if (DEDUP_EVENTS.has(eventType) && sessionId && pageId) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString()
      const { data: existing } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('page_id', pageId)
        .eq('session_id', sessionId)
        .eq('event_type', eventType)
        .gte('created_at', fiveMinAgo)
        .limit(1)
      if (existing?.length) {
        if (DEBUG) console.log('[track] dedup skip:', eventType)
        return NextResponse.json({ ok: true, skipped: 'duplicate' })
      }
    }

    // Base row WITHOUT session_id (safe even if column doesn't exist)
    const baseRow = {
      user_id:    userId,
      page_id:    pageId   ?? null,
      event_type: eventType,
      slug:       slug     ?? null,
      metadata:   enriched,
    }

    // ── Attempt 1: insert WITH session_id ──────────────────────────────────
    let { data: inserted, error: insertError } = await supabase
      .from('analytics_events')
      .insert({ ...baseRow, session_id: sessionId ?? null })
      .select('id')

    // ── Attempt 2: session_id column missing (42703) ───────────────────────
    if (insertError?.code === '42703') {
      console.warn('[track] session_id column missing — retrying without it. Run migration 20260530_analytics_session_id.sql')
      ;({ data: inserted, error: insertError } = await supabase
        .from('analytics_events')
        .insert(baseRow)
        .select('id'))
    }

    // ── Hard failure ───────────────────────────────────────────────────────
    if (insertError) {
      const isTableMissing = insertError.code === '42P01'
      console.error('[track] INSERT FAILED', {
        code:    insertError.code,
        message: insertError.message,
        hint:    isTableMissing
          ? 'Table analytics_events does not exist. Run migration 20260608_analytics_complete.sql in Supabase SQL Editor.'
          : insertError.hint,
      })
      return NextResponse.json(
        { ok: false, error: insertError.message, code: insertError.code },
        { status: 500 },
      )
    }

    if (DEBUG) {
      console.log('[track] inserted id:', (inserted as Array<{ id: string }>)?.[0]?.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[track] exception:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
