import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getDeviceType, getBrowser } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pageId, eventType, buttonId, referrer, userAgent } = body

    if (!pageId || !eventType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify page exists and is published (or skip for internal use)
    const { data: page } = await supabase
      .from('pages')
      .select('id, user_id, status')
      .eq('id', pageId)
      .single()

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const ua = userAgent ?? req.headers.get('user-agent') ?? ''
    const device = getDeviceType(ua)
    const browser = getBrowser(ua)

    await supabase.from('events').insert({
      page_id: pageId,
      user_id: page.user_id,
      event_type: eventType,
      button_id: buttonId ?? null,
      referrer: referrer ?? req.headers.get('referer') ?? null,
      user_agent: ua,
      device,
      browser,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[events]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
