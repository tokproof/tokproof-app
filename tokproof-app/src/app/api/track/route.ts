import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

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

    if (!eventType) {
      return NextResponse.json({ error: 'eventType required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Resolve user_id from the page (if pageId provided)
    let userId: string | null = null
    if (pageId) {
      const { data: page } = await supabase
        .from('pages')
        .select('user_id')
        .eq('id', pageId)
        .single()
      userId = page?.user_id ?? null
    }

    // Enrich metadata with request info
    const ua  = req.headers.get('user-agent') ?? ''
    const ref = req.headers.get('referer') ?? ''
    const enriched = {
      userAgent: ua,
      referer: ref,
      ...metadata,
    }

    const { error: insertError } = await supabase.from('analytics_events').insert({
      user_id:    userId,
      page_id:    pageId ?? null,
      event_type: eventType,
      slug:       slug ?? null,
      session_id: sessionId ?? null,
      metadata:   enriched,
    })

    // Log insert errors — visible in server logs, never breaks public page
    if (insertError) {
      console.error('[/api/track] Supabase insert failed:', insertError.message, {
        code: insertError.code,
        pageId,
        eventType,
        hint: insertError.code === '42703'
          ? 'Column does not exist — run: supabase/migrations/20260530_analytics_session_id.sql'
          : undefined,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/track] Unexpected error:', err instanceof Error ? err.message : err, {
      pageId,
      eventType,
    })
    return NextResponse.json({ ok: true })
  }
}
