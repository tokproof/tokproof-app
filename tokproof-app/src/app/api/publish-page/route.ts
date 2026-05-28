import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { computeSafeScore } from '@/lib/safe-score'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { pageId } = await req.json()
  if (!pageId) {
    return NextResponse.json({ error: 'Missing pageId' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch page (verify ownership)
  const { data: page } = await admin
    .from('pages')
    .select('*')
    .eq('id', pageId)
    .eq('user_id', user.id)
    .single()

  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  // Check plan limits
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  if (profile?.plan === 'free') {
    const { count } = await admin
      .from('pages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'published')
      .neq('id', pageId)

    if ((count ?? 0) >= 1) {
      return NextResponse.json(
        { error: 'PLAN_LIMIT', message: 'Has alcanzado el límite de 1 página publicada en el Plan Free. Actualiza a Pro para publicar más.' },
        { status: 403 }
      )
    }
  }

  // Run safe score
  const scoreResult = computeSafeScore({
    shopify_url: page.shopify_url,
    settings: page.settings ?? {},
  })

  // Determine status based on score
  let status: string
  if (scoreResult.score < 30) {
    status = 'blocked'
  } else if (scoreResult.score < 50) {
    status = 'in_review'
  } else {
    status = 'published'
  }

  // Update page
  const { error } = await admin.from('pages').update({
    status,
    safe_score: scoreResult.score,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }).eq('id', pageId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (status === 'blocked') {
    return NextResponse.json({ error: 'BLOCKED', message: 'Tu página contiene contenido no permitido. Revisa el Safe Link Score.' }, { status: 422 })
  }

  if (status === 'in_review') {
    return NextResponse.json({ status: 'in_review', message: 'Tu página está en revisión. Te notificaremos en breve.', score: scoreResult })
  }

  return NextResponse.json({ status: 'published', score: scoreResult })
}
