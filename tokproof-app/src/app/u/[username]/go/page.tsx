import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DirectExitClient from '@/components/public/DirectExitClient'
import type { Metadata } from 'next'

interface Props { params: { username: string } }

export async function generateMetadata(_: Props): Promise<Metadata> {
  return {
    title: 'Abriendo en navegador… — Tokproof',
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

  // ── Resolve destination URL from any source ─────────────────────────────
  // Priority: new LandingConfig > old PageSettings > page.shopify_url > landing URL
  let destinationUrl = ''

  const landingConfig = s._landingConfig as Record<string, unknown> | undefined
  if (landingConfig && typeof landingConfig === 'object') {
    const lcSettings = landingConfig.settings as Record<string, unknown> | undefined
    // Prefer directExitUrl when TikTok Rescue is enabled in the new editor
    if (lcSettings?.enableTikTokRescue && typeof lcSettings?.directExitUrl === 'string' && lcSettings.directExitUrl) {
      destinationUrl = lcSettings.directExitUrl
    } else if (typeof landingConfig.destinationUrl === 'string' && landingConfig.destinationUrl) {
      destinationUrl = landingConfig.destinationUrl
    }
  }

  // Legacy PageSettings
  if (!destinationUrl && typeof s.direct_exit_url === 'string' && s.direct_exit_url) {
    destinationUrl = s.direct_exit_url
  }

  // Legacy shopify_url on the page record
  if (!destinationUrl && page.shopify_url) {
    destinationUrl = page.shopify_url
  }

  // Ultimate fallback: send them to the landing page itself
  if (!destinationUrl) {
    const base = process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? 'https://tokproof.app'
    destinationUrl = `${base}/@${params.username}`
  }

  const delay     = typeof s.direct_exit_delay === 'number' ? s.direct_exit_delay : 800
  const guideText = typeof s.direct_exit_guide_text === 'string' ? s.direct_exit_guide_text : undefined
  const brandName = page.brand_name ?? undefined

  return (
    <DirectExitClient
      pageId={page.id}
      destinationUrl={destinationUrl}
      delay={delay}
      guideText={guideText}
      brandName={brandName ?? undefined}
    />
  )
}
