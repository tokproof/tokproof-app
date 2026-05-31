import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, createAuthAdminClient } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const caller = await getAdminUser()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase   = createAdminClient()
  const authAdmin  = createAuthAdminClient()

  const [
    { data: authUser },
    { data: profile },
    { data: pages },
    { data: analytics },
  ] = await Promise.all([
    authAdmin.auth.admin.getUserById(params.userId),
    supabase.from('profiles').select('*').eq('user_id', params.userId).single(),
    supabase.from('pages').select('id, title, product_name, brand_name, status, type, username, created_at, published_at')
      .eq('user_id', params.userId).order('created_at', { ascending: false }),
    supabase.from('analytics_events').select('event_type')
      .eq('user_id', params.userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  const events   = analytics ?? []
  const views    = events.filter(e => ['page_view','direct_exit_view'].includes(e.event_type)).length
  const clicks   = events.filter(e => ['direct_exit_redirected','cta_click','link_click','shopify_click'].includes(e.event_type)).length

  return NextResponse.json({
    id:           params.userId,
    email:        authUser.user?.email ?? '',
    createdAt:    authUser.user?.created_at ?? '',
    lastSignInAt: authUser.user?.last_sign_in_at ?? null,
    profile,
    pages:        pages ?? [],
    analytics30d: { views, clicks },
  })
}
