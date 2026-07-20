import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { getFullAnalytics } from '@/lib/analytics'
import type { PageMeta } from '@/lib/analytics'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const caller = await getAdminUser()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const days       = Math.min(90, Math.max(1, parseInt(searchParams.get('days') ?? '7', 10)))
  const pageIdFilter = searchParams.get('pageId') ?? null

  const supabase = createAdminClient()
  const { data: pagesRaw } = await supabase
    .from('pages')
    .select('id, title, product_name, brand_name, username')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false })

  const pages = (pagesRaw ?? []) as PageMeta[]
  const data  = await getFullAnalytics(params.userId, days, pageIdFilter, pages)

  return NextResponse.json({ ...data, pages: data.pages, pageMeta: pages })
}
