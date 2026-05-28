import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditorClient from './EditorClient'
import type { FullPage } from '@/types'

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

  const fullPage: FullPage = {
    page: page as FullPage['page'],
    buttons: (buttons ?? []) as FullPage['buttons'],
    comments: (comments ?? []) as FullPage['comments'],
    reviews: (reviews ?? []) as FullPage['reviews'],
    faqs: (faqs ?? []) as FullPage['faqs'],
    logos: (logos ?? []) as FullPage['logos'],
    profile: profile as FullPage['profile'],
  }

  return <EditorClient fullPage={fullPage} />
}
