import type { Metadata } from 'next'
import {
  Nunito_Sans,
  Inter,
  Poppins,
  Manrope,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from 'next/font/google'
import './globals.css'
import './tokproof.css'
import './polish.css'
import Providers from '@/components/shared/Providers'

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Tokproof — Trust Pages para TikTok, Instagram y redes sociales',
    template: '%s | Tokproof',
  },
  description:
    'Convierte más tráfico social con Trust Pages, Quick Exits, Analytics y páginas optimizadas para vender desde TikTok, Instagram y cualquier red social.',
  openGraph: {
    title: 'Tokproof — Trust Pages para TikTok, Instagram y redes sociales',
    description:
      'Convierte más tráfico social con Trust Pages, Quick Exits, Analytics y páginas optimizadas para vender desde TikTok, Instagram y cualquier red social.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontVars = [
    nunitoSans.variable,
    inter.variable,
    poppins.variable,
    manrope.variable,
    playfair.variable,
    plusJakarta.variable,
  ].join(' ')

  return (
    <html lang="en" className={fontVars}>
      <body className={nunitoSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
