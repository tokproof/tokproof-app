import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pageId, eventType, slug, metadata } = body as {
      pageId?: string
      eventType: string
      slug?: string
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

    await supabase.from('analytics_events').insert({
      user_id:    userId,
      page_id:    pageId ?? null,
      event_type: eventType,
      slug:       slug ?? null,
      metadata:   enriched,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Never fail loudly — analytics should be invisible to users
    return NextResponse.json({ ok: true })
  }
}
