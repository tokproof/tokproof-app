export const dynamic = 'force-dynamic'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DebugClient from './DebugClient'

export interface DebugPage {
  id:       string
  username: string | null
  title:    string | null
}

export default async function AnalyticsDebugPage() {
  const session = createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: pages } = await admin
    .from('pages')
    .select('id, username, title')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DebugClient
      pages={(pages ?? []) as DebugPage[]}
      userId={user.id}
    />
  )
}
