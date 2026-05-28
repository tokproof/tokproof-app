import type { Metadata } from 'next'
import { Nunito_Sans } from 'next/font/google'
import './globals.css'
import './tokproof.css'

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800', '900'],
  variable: '--font-nunito',
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
  return (
    <html lang="es" className={nunitoSans.variable}>
      <body className={nunitoSans.className}>{children}</body>
    </html>
  )
}
