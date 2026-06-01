import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import LandingPage from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Tokproof — Trust Pages para TikTok, Instagram y redes sociales',
  description:
    'Convierte más tráfico social con Trust Pages, Quick Exits, Analytics y páginas optimizadas para vender desde TikTok, Instagram y cualquier red social.',
  openGraph: {
    title: 'Tokproof — Trust Pages para TikTok, Instagram y redes sociales',
    description:
      'Convierte más tráfico social con Trust Pages, Quick Exits, Analytics y páginas optimizadas para vender desde TikTok, Instagram y cualquier red social.',
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <LandingPage isLoggedIn={!!user} />
}
