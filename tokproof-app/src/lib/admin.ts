import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// ─── Admin email check ────────────────────────────────────────────────────────

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const allowed = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email.toLowerCase())
}

// ─── Auth-capable admin client (uses @supabase/supabase-js directly) ──────────
// Required for auth.admin.listUsers() — not available on @supabase/ssr client.

export function createAuthAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ─── Server-side admin guard ─────────────────────────────────────────────────
// Returns the current user if admin, null otherwise.

export async function getAdminUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (!isAdminEmail(user.email)) return null
  return user
}
