import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Returns last 20 analytics_events for a page the current user owns.
// Used only by the debug panel — remove after analytics are confirmed working.
export async function GET(req: NextRequest) {
  const session = createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pageId = req.nextUrl.searchParams.get('pageId')
  if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 })

  const admin = createAdminClient()

  // Ownership check
  const { data: page, error: pageErr } = await admin
    .from('pages')
    .select('user_id')
    .eq('id', pageId)
    .single()

  if (pageErr || !page || page.user_id !== user.id) {
    return NextResponse.json({ error: 'Page not found or not yours' }, { status: 404 })
  }

  const { data: events, error } = await admin
    .from('analytics_events')
    .select('id, event_type, page_id, session_id, created_at')
    .eq('page_id', pageId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  }

  // Count by event_type for the summary row
  const counts: Record<string, number> = {}
  for (const e of events ?? []) {
    counts[e.event_type] = (counts[e.event_type] ?? 0) + 1
  }

  return NextResponse.json({ events: events ?? [], counts })
}
