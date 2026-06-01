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
  title: 'Tokproof — Trust pages para TikTok → Shopify',
  description:
    'Crea trust pages mobile-first para convertir tráfico de TikTok en ventas reales de Shopify.',
  openGraph: {
    title: 'Tokproof',
    description: 'Trust pages para TikTok → Shopify',
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
    <html lang="es" className={fontVars}>
      <body className={nunitoSans.className}>{children}</body>
    </html>
  )
}
