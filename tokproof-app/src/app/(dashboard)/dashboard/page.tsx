export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import type { Profile, Page } from '@/types'
import { getDashboardAnalytics, getPageStats, formatAnalytics, formatPageStats } from '@/lib/analytics'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: pages }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('pages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const pageList = (pages ?? []) as Page[]
  const pageIds  = pageList.map(p => p.id)

  const [dashAnalytics, rawPageStats] = await Promise.all([
    getDashboardAnalytics(user.id),
    getPageStats(pageIds),
  ])

  return (
    <DashboardClient
      profile={profile as Profile}
      pages={pageList}
      analytics={formatAnalytics(dashAnalytics)}
      pageStats={formatPageStats(rawPageStats)}
    />
  )
}
