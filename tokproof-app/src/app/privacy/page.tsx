import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidad — Tokproof',
  description: 'Política de privacidad de Tokproof',
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--pink)', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'block', marginBottom: 32 }}>
          ← Volver a Tokproof
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Política de Privacidad</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 40 }}>Última actualización: enero 2025</p>

        {[
          {
            title: '1. Datos que recopilamos',
            body: 'Recopilamos el email, nombre y datos de uso que tú nos proporcionas al crear una cuenta. También registramos eventos de analytics (page views, clicks) asociados a tus páginas publicadas.',
          },
          {
            title: '2. Uso de los datos',
            body: 'Usamos tus datos exclusivamente para operar el servicio: autenticación, generación de páginas públicas, y analytics de tus páginas. No vendemos ni compartimos datos con terceros salvo para operar la plataforma (Supabase, Vercel).',
          },
          {
            title: '3. Cookies',
            body: 'Usamos cookies de sesión para mantener tu sesión activa. No usamos cookies de seguimiento de terceros.',
          },
          {
            title: '4. Analytics',
            body: 'Los eventos de analytics (visitas, clicks) registrados en tus páginas son de tu propiedad y solo tú puedes verlos desde tu dashboard.',
          },
          {
            title: '5. Eliminación de datos',
            body: 'Puedes eliminar tu cuenta en cualquier momento desde Settings → Zona de peligro. Todos tus datos serán eliminados permanentemente.',
          },
          {
            title: '6. Contacto',
            body: 'Para cualquier consulta sobre privacidad escríbenos a: privacy@tokproof.app',
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{title}</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
