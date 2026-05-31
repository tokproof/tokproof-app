import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const caller = await getAdminUser()
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json() as { plan: string }
  if (plan !== 'free' && plan !== 'pro') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Upsert in case the profile row doesn't exist yet
  const { error } = await supabase
    .from('profiles')
    .update({ plan })
    .eq('user_id', params.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, userId: params.userId, plan })
}
