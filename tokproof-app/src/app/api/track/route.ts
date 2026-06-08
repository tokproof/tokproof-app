import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Verbose logs — always on until analytics are confirmed working
const DEBUG = true

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
      console.warn('[track] REJECTED — invalid eventType:', eventType)
      return NextResponse.json({ error: 'invalid eventType' }, { status: 400 })
    }

    console.log('[track] ▶ RECEIVED', { eventType, pageId, slug, sessionId: sessionId?.slice(0, 8) })

    const supabase = createAdminClient()

    // Resolve user_id from page — needed so dashboard queries work
    let userId: string | null = null
    if (pageId) {
      const { data: page, error: pageErr } = await supabase
        .from('pages')
        .select('user_id')
        .eq('id', pageId)
        .single()

      if (pageErr) {
        console.warn('[track] page lookup FAILED — pageId may not exist:', pageId, pageErr.message)
      } else {
        console.log('[track] page resolved — user_id:', page?.user_id)
      }
      userId = page?.user_id ?? null
    } else {
      console.warn('[track] no pageId sent — userId will be null')
    }

    const ua  = req.headers.get('user-agent') ?? ''
    const ref = req.headers.get('referer') ?? ''
    // Client-provided metadata merged with server-detected values
    const enriched = { userAgent: ua, referer: ref, ...metadata }

    // ── Deduplication for view-type events ────────────────────────────────
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
        console.log('[track] ⏭ DEDUP SKIP', { eventType, existingId: existing[0].id })
        return NextResponse.json({ ok: true, skipped: 'duplicate', existingId: existing[0].id })
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

    console.log('[track] ✍ INSERTING into analytics_events', {
      table: 'analytics_events',
      payload: { ...baseRow, session_id: sessionId ?? null },
    })

    // ── Attempt 1: insert WITH session_id ──────────────────────────────────
    let { data: inserted, error: insertError } = await supabase
      .from('analytics_events')
      .insert({ ...baseRow, session_id: sessionId ?? null })
      .select('id, event_type, page_id, created_at')

    // ── Attempt 2: session_id column missing (42703) ───────────────────────
    if (insertError?.code === '42703') {
      console.warn('[track] session_id column missing — retrying without it')
      ;({ data: inserted, error: insertError } = await supabase
        .from('analytics_events')
        .insert(baseRow)
        .select('id, event_type, page_id, created_at'))
    }

    // ── Hard failure ───────────────────────────────────────────────────────
    if (insertError) {
      const isTableMissing = insertError.code === '42P01'
      console.error('[track] ❌ INSERT FAILED — full error:', {
        code:    insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint:    isTableMissing
          ? 'Table analytics_events does not exist. Run migration in Supabase SQL Editor.'
          : insertError.hint,
      })
      return NextResponse.json(
        { ok: false, error: insertError.message, code: insertError.code, details: insertError.details, hint: insertError.hint },
        { status: 500 },
      )
    }

    const row = (inserted as Array<{ id: string; event_type: string; page_id: string; created_at: string }>)?.[0]
    console.log('[track] ✅ INSERT OK', row)

    return NextResponse.json({ ok: true, inserted: row })
  } catch (err) {
    console.error('[track] exception:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
