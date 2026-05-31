import { NextResponse } from 'next/server'
import { getAdminUser, createAuthAdminClient } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

export interface AdminUserRow {
  id:            string
  email:         string
  displayName:   string | null
  username:      string | null
  plan:          string
  createdAt:     string
  lastSignInAt:  string | null
  pageCount:     number
  quickExitCount: number
}

export async function GET() {
  const caller = await getAdminUser()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const authAdmin = createAuthAdminClient()
  const supabase  = createAdminClient()

  // 1. Auth users (email, timestamps)
  const { data: authData, error: authErr } = await authAdmin.auth.admin.listUsers({ perPage: 1000 })
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })
  const authUsers = authData.users

  // 2. All profiles (plan, display_name, username)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, username, plan')

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

  // 3. Page counts per user
  const { data: pages } = await supabase
    .from('pages')
    .select('user_id, settings')

  const pageCounts:     Record<string, number> = {}
  const quickExitCounts: Record<string, number> = {}

  for (const page of pages ?? []) {
    pageCounts[page.user_id] = (pageCounts[page.user_id] ?? 0) + 1
    const s   = page.settings as Record<string, unknown>
    const cfg = s?._landingConfig as Record<string, unknown> | undefined
    const pt  = cfg?.pageType ?? s?._pageType
    if (pt === 'quick_exit') {
      quickExitCounts[page.user_id] = (quickExitCounts[page.user_id] ?? 0) + 1
    }
  }

  const rows: AdminUserRow[] = authUsers.map(u => {
    const p = profileMap[u.id]
    return {
      id:            u.id,
      email:         u.email ?? '',
      displayName:   p?.display_name ?? null,
      username:      p?.username ?? null,
      plan:          p?.plan ?? 'free',
      createdAt:     u.created_at,
      lastSignInAt:  u.last_sign_in_at ?? null,
      pageCount:     pageCounts[u.id] ?? 0,
      quickExitCount: quickExitCounts[u.id] ?? 0,
    }
  })

  // Sort: most recently created first
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({ users: rows })
}
