export const dynamic = 'force-dynamic'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFullAnalytics } from '@/lib/analytics'
import { isProUser } from '@/lib/plans'
import type { PageMeta } from '@/lib/analytics'
import AnalyticsDashboard from './AnalyticsDashboard'

export default async function AnalyticsPage() {
  const session = createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const [{ data: profile }, { data: pagesRaw }] = await Promise.all([
    admin.from('profiles').select('plan').eq('user_id', user.id).single(),
    admin.from('pages').select('id, title, product_name, brand_name, username')
      .eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const pages = (pagesRaw ?? []) as PageMeta[]
  const isPro = isProUser(profile)

  const initialData = await getFullAnalytics(user.id, 7, null, pages)

  return (
    <AnalyticsDashboard
      initialData={initialData}
      pages={pages}
      isPro={isPro}
    />
  )
}
