import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// ─── DEBUG MODE ───────────────────────────────────────────────────────────────
// Temporary verbose logging to diagnose analytics issues.
// Set DEBUG_TRACK=false and restore 200 once root cause is confirmed.
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
      console.log('[track] ── incoming request ──────────────────')
      console.log('[track] body     :', JSON.stringify({ pageId, eventType, slug, sessionId, metadata }))
      console.log('[track] userAgent:', req.headers.get('user-agent'))
      console.log('[track] referer  :', req.headers.get('referer'))
      console.log('[track] SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '(not set)')
    }

    if (!eventType) {
      console.error('[track] Missing eventType')
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
        console.log('[track] page lookup → user_id:', page?.user_id ?? null, '| error:', pageErr?.message ?? 'none')
      }
      userId = page?.user_id ?? null
    }

    const ua  = req.headers.get('user-agent') ?? ''
    const ref = req.headers.get('referer') ?? ''
    const enriched = { userAgent: ua, referer: ref, ...metadata }

    const row = {
      user_id:    userId,
      page_id:    pageId ?? null,
      event_type: eventType,
      slug:       slug ?? null,
      session_id: sessionId ?? null,
      metadata:   enriched,
    }

    if (DEBUG_TRACK) {
      console.log('[track] inserting row:', JSON.stringify(row))
    }

    const { data: inserted, error: insertError } = await supabase
      .from('analytics_events')
      .insert(row)
      .select()

    if (insertError) {
      console.error('[track] ❌ INSERT FAILED')
      console.error('[track]   message :', insertError.message)
      console.error('[track]   code    :', insertError.code)
      console.error('[track]   details :', insertError.details)
      console.error('[track]   hint    :', insertError.hint)
      if (insertError.code === '42703') {
        console.error('[track]   → Column missing. Run: supabase/migrations/20260530_analytics_session_id.sql')
      }

      // DEBUG MODE: surface the real error so we can see it in Network tab
      return NextResponse.json(
        {
          ok: false,
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        },
        { status: 500 }
      )
    }

    if (DEBUG_TRACK) {
      console.log('[track] ✅ inserted:', JSON.stringify(inserted))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[track] ❌ Unexpected exception:', err instanceof Error ? err.message : err, { pageId, eventType })

    // DEBUG MODE: surface exception
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
