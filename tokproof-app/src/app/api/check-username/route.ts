import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isValidUsername } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')?.toLowerCase()

  if (!username) {
    return NextResponse.json({ available: false, error: 'Missing username' }, { status: 400 })
  }

  const { valid, error } = isValidUsername(username)
  if (!valid) {
    return NextResponse.json({ available: false, error })
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
