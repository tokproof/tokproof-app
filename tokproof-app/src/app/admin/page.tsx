import { getAdminUser, createAuthAdminClient } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'
import type { AdminUserRow } from '@/app/api/admin/users/route'

export default async function AdminPage() {
  const user = await getAdminUser()
  if (!user) redirect('/dashboard')

  const authAdmin = createAuthAdminClient()
  const supabase  = createAdminClient()

  const [
    { data: authData },
    { data: profiles },
    { data: pages },
  ] = await Promise.all([
    authAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('profiles').select('user_id, display_name, username, plan'),
    supabase.from('pages').select('user_id, settings'),
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))
  const pageCounts:      Record<string, number> = {}
  const quickExitCounts: Record<string, number> = {}

  for (const page of pages ?? []) {
    pageCounts[page.user_id] = (pageCounts[page.user_id] ?? 0) + 1
    const s  = page.settings as Record<string, unknown>
    const cfg = s?._landingConfig as Record<string, unknown> | undefined
    if ((cfg?.pageType ?? s?._pageType) === 'quick_exit') {
      quickExitCounts[page.user_id] = (quickExitCounts[page.user_id] ?? 0) + 1
    }
  }

  const users: AdminUserRow[] = (authData?.users ?? [])
    .map(u => {
      const p = profileMap[u.id]
      return {
        id:             u.id,
        email:          u.email ?? '',
        displayName:    p?.display_name ?? null,
        username:       p?.username ?? null,
        plan:           p?.plan ?? 'free',
        createdAt:      u.created_at,
        lastSignInAt:   u.last_sign_in_at ?? null,
        pageCount:      pageCounts[u.id] ?? 0,
        quickExitCount: quickExitCounts[u.id] ?? 0,
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return <AdminDashboard initialUsers={users} adminEmail={user.email ?? ''} />
}
