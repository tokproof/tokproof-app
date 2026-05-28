import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DirectExitClient from '@/components/public/DirectExitClient'
import type { Metadata } from 'next'

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Abriendo tienda… — Tokproof',
    robots: 'noindex, nofollow',
  }
}

export default async function DirectExitPage({ params }: Props) {
  const supabase = createClient()

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('username', params.username)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (!page) notFound()

  const s = page.settings as Record<string, unknown>

  if (!s.direct_exit_enabled || !s.direct_exit_url) {
    redirect(`/u/${params.username}`)
  }

  return (
    <DirectExitClient
      pageId={page.id}
      destinationUrl={s.direct_exit_url as string}
      delay={(s.direct_exit_delay as number) ?? 800}
      guideText={s.direct_exit_guide_text as string | undefined}
      brandName={(page.brand_name ?? undefined) as string | undefined}
    />
  )
}
