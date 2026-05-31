import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getFullAnalytics } from '@/lib/analytics'
import type { PageMeta } from '@/lib/analytics'

export async function GET(req: NextRequest) {
  const session = createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const days       = Math.min(90, Math.max(1, parseInt(searchParams.get('days') ?? '7', 10)))
  const pageIdFilter = searchParams.get('pageId') ?? null

  const admin = createAdminClient()
  const { data: pages } = await admin
    .from('pages')
    .select('id, title, product_name, brand_name, username')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const data = await getFullAnalytics(user.id, days, pageIdFilter, (pages ?? []) as PageMeta[])
  return NextResponse.json(data)
}
