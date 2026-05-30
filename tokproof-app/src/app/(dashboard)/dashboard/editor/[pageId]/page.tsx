import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditorClient from './EditorClient'
import SimplePageEditorClient from './SimplePageEditorClient'
import type { FullPage } from '@/types'
import type { LandingConfig } from '@/types/landing'

interface EditorPageProps {
  params: { pageId: string }
}

export default async function EditorPage({ params }: EditorPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: page },
    { data: buttons },
    { data: comments },
    { data: reviews },
    { data: faqs },
    { data: logos },
    { data: profile },
  ] = await Promise.all([
    supabase.from('pages').select('*').eq('id', params.pageId).eq('user_id', user.id).single(),
    supabase.from('buttons').select('*').eq('page_id', params.pageId).order('sort_order'),
    supabase.from('comments').select('*').eq('page_id', params.pageId).order('sort_order'),
    supabase.from('reviews').select('*').eq('page_id', params.pageId).order('sort_order'),
    supabase.from('faqs').select('*').eq('page_id', params.pageId).order('sort_order'),
    supabase.from('logos').select('*').eq('page_id', params.pageId).order('sort_order'),
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
  ])

  if (!page) notFound()

  // Detect pageType from settings._pageType or from saved _landingConfig.pageType
  const settings = page.settings as Record<string, unknown>
  const savedConfig = settings?._landingConfig as LandingConfig | undefined
  const pageType = (settings?._pageType as string | undefined)
    ?? savedConfig?.pageType
    ?? (page.type === 'trust' ? 'trust_page' : 'simple_page')

  const isSimple = pageType === 'simple_page' || pageType === 'creator_page'

  const fullPage: FullPage = {
    page: page as FullPage['page'],
    buttons: (buttons ?? []) as FullPage['buttons'],
    comments: (comments ?? []) as FullPage['comments'],
    reviews: (reviews ?? []) as FullPage['reviews'],
    faqs: (faqs ?? []) as FullPage['faqs'],
    logos: (logos ?? []) as FullPage['logos'],
    profile: profile as FullPage['profile'],
  }

  if (isSimple) {
    return <SimplePageEditorClient fullPage={fullPage} pageType={pageType as 'simple_page' | 'creator_page'} />
  }

  return <EditorClient fullPage={fullPage} />
}
