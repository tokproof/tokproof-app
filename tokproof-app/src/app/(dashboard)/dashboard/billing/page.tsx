import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, username')
    .eq('user_id', user.id)
    .single()

  return (
    <BillingClient
      isFree={profile?.plan !== 'pro'}
      username={profile?.username ?? null}
    />
  )
}
