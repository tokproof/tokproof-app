import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EcommerceClient from './EcommerceClient'
import type { Page, Profile } from '@/types'

export default async function EcommercePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: pages }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('pages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <EcommerceClient
      profile={profile as Profile}
      allPages={(pages ?? []) as Page[]}
    />
  )
}
