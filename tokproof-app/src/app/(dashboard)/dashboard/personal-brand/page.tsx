import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PersonalBrandClient from './PersonalBrandClient'
import type { Page, Profile } from '@/types'

export default async function PersonalBrandPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: pages }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('pages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <PersonalBrandClient
      profile={profile as Profile}
      allPages={(pages ?? []) as Page[]}
    />
  )
}
