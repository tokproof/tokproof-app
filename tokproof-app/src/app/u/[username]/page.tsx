import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TrustPageRenderer from '@/components/public/TrustPageRenderer'
import SimplePageRenderer from '@/components/public/SimplePageRenderer'
import LandingPageRenderer from '@/components/public/LandingPageRenderer'
import SimplePagePublicRenderer from '@/components/public/SimplePagePublicRenderer'
import type { FullPage } from '@/types'
import type { LandingConfig } from '@/types/landing'

interface PublicPageProps {
  params: { username: string }
}

export async function generateMetadata({ params }: PublicPageProps) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('username', params.username)
    .single()

  if (!profile) return { title: 'Tokproof' }

  return {
    title: `${profile.display_name ?? `@${profile.username}`} — Tokproof`,
    description: `Visita la trust page de ${profile.display_name ?? profile.username}`,
    openGraph: {
      title: `${profile.display_name ?? `@${profile.username}`}`,
      description: `Trust page en Tokproof`,
    },
  }
}

export default async function PublicPage({ params }: PublicPageProps) {
  const supabase = createClient()

  // Fetch the main published page for this username
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('username', params.username)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (!page) notFound()

  const [
    { data: profile },
    { data: buttons },
    { data: comments },
    { data: reviews },
    { data: faqs },
    { data: logos },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('username', params.username).single(),
    supabase.from('buttons').select('*').eq('page_id', page.id).eq('is_visible', true).order('sort_order'),
    supabase.from('comments').select('*').eq('page_id', page.id).eq('is_visible', true).order('sort_order'),
    supabase.from('reviews').select('*').eq('page_id', page.id).eq('is_visible', true).order('sort_order'),
    supabase.from('faqs').select('*').eq('page_id', page.id).eq('is_visible', true).order('sort_order'),
    supabase.from('logos').select('*').eq('page_id', page.id).eq('is_visible', true).order('sort_order'),
  ])

  if (!profile) notFound()

  const fullPage: FullPage = {
    page: page as FullPage['page'],
    profile: profile as FullPage['profile'],
    buttons: (buttons ?? []) as FullPage['buttons'],
    comments: (comments ?? []) as FullPage['comments'],
    reviews: (reviews ?? []) as FullPage['reviews'],
    faqs: (faqs ?? []) as FullPage['faqs'],
    logos: (logos ?? []) as FullPage['logos'],
  }

  // If the page was built with the new editor, detect which renderer to use
  const settings      = page.settings as Record<string, unknown>
  const landingConfig = settings?._landingConfig as LandingConfig | undefined
  if (landingConfig && typeof landingConfig === 'object') {
    const pt = landingConfig.pageType ?? (settings._pageType as string | undefined)
    // Quick Exit: visiting /@slug redirects to /@slug/go (the exit guide)
    if (pt === 'quick_exit') redirect(`/u/${params.username}/go`)
    if (pt === 'simple_page' || pt === 'creator_page' || landingConfig.simplePage) {
      return <SimplePagePublicRenderer config={landingConfig} />
    }
    if ('blocks' in landingConfig) {
      return <LandingPageRenderer config={landingConfig as LandingConfig} />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {page.type === 'trust'
        ? <TrustPageRenderer data={fullPage} />
        : <SimplePageRenderer data={fullPage} />
      }
    </div>
  )
}
