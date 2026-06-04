import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// ─── DEBUG MODE ───────────────────────────────────────────────────────────────
// Verbose logging until analytics are confirmed working in production.
// Set to false after confirming events are being inserted.
const DEBUG_TRACK = true

export async function POST(req: NextRequest) {
  let pageId: string | undefined
  let eventType: string | undefined

  try {
    const body = await req.json()
    ;({ pageId, eventType } = body as {
      pageId?: string
      eventType: string
      slug?: string
      sessionId?: string
      metadata?: Record<string, unknown>
    })
    const { slug, sessionId, metadata } = body as {
      slug?: string
      sessionId?: string
      metadata?: Record<string, unknown>
    }

    if (DEBUG_TRACK) {
      console.log('[track] ── incoming ────────────────────────────')
      console.log('[track] pageId    :', pageId)
      console.log('[track] eventType :', eventType)
      console.log('[track] sessionId :', sessionId)
      console.log('[track] userAgent :', req.headers.get('user-agent')?.slice(0, 80))
      console.log('[track] SUPABASE  :', process.env.NEXT_PUBLIC_SUPABASE_URL)
    }

    if (!eventType) {
      return NextResponse.json({ error: 'eventType required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Resolve user_id from the page
    let userId: string | null = null
    if (pageId) {
      const { data: page, error: pageErr } = await supabase
        .from('pages')
        .select('user_id')
        .eq('id', pageId)
        .single()

      if (DEBUG_TRACK) {
        console.log('[track] page lookup → user_id:', page?.user_id ?? null, '| err:', pageErr?.message ?? 'none')
      }
      userId = page?.user_id ?? null
    }

    const ua  = req.headers.get('user-agent') ?? ''
    const ref = req.headers.get('referer') ?? ''
    const enriched = { userAgent: ua, referer: ref, ...metadata }

    // Base row WITHOUT session_id (works even if migration hasn't run)
    const baseRow = {
      user_id:    userId,
      page_id:    pageId ?? null,
      event_type: eventType,
      slug:       slug ?? null,
      metadata:   enriched,
    }

    // ── Attempt 1: insert WITH session_id ──────────────────────────────────
    if (DEBUG_TRACK) console.log('[track] attempt insert with session_id…')

    let { data: inserted, error: insertError } = await supabase
      .from('analytics_events')
      .insert({ ...baseRow, session_id: sessionId ?? null })
      .select()

    // ── Attempt 2: fallback WITHOUT session_id if column missing (code 42703) ──
    if (insertError?.code === '42703') {
      console.warn('[track] ⚠️  session_id column missing — falling back to insert without it.')
      console.warn('[track]    → Run this in Supabase SQL Editor to fix permanently:')
      console.warn('[track]    → ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS session_id TEXT;')

      ;({ data: inserted, error: insertError } = await supabase
        .from('analytics_events')
        .insert(baseRow)
        .select())
    }

    // ── Final error handling ───────────────────────────────────────────────
    if (insertError) {
      console.error('[track] ❌ INSERT FAILED (both attempts)')
      console.error('[track]   message :', insertError.message)
      console.error('[track]   code    :', insertError.code)
      console.error('[track]   details :', insertError.details)
      console.error('[track]   hint    :', insertError.hint)

      // Debug mode: surface real error so Network tab shows it
      return NextResponse.json(
        {
          ok: false,
          error: insertError.message,
          code:  insertError.code,
          details: insertError.details,
        },
        { status: 500 }
      )
    }

    if (DEBUG_TRACK) {
      console.log('[track] ✅ inserted row id:', (inserted as Array<{ id: string }>)?.[0]?.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[track] ❌ Unexpected exception:', err instanceof Error ? err.message : err, { pageId, eventType })
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
