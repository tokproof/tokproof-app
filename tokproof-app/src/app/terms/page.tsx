import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Uso — Tokproof',
  description: 'Términos y condiciones de uso de Tokproof',
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--pink)', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'block', marginBottom: 32 }}>
          ← Volver a Tokproof
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Términos de Uso</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 40 }}>Última actualización: enero 2025</p>

        {[
          {
            title: '1. Uso aceptable',
            body: 'Tokproof es una plataforma para crear páginas de enlace y trust pages para uso comercial legítimo. Está prohibido publicar contenido fraudulento, engañoso, ilegal, para adultos, o que viole derechos de terceros.',
          },
          {
            title: '2. Safe Link Score',
            body: 'Tokproof analiza automáticamente el contenido de tus páginas con el Safe Link Score. Las páginas con score bajo pueden quedar en revisión o bloqueadas. Tokproof se reserva el derecho de rechazar o eliminar páginas que incumplan las políticas.',
          },
          {
            title: '3. Plan Free y Pro',
            body: 'El Plan Free permite publicar 1 página activa. El Plan Pro permite páginas ilimitadas. Las condiciones pueden cambiar con 30 días de aviso previo.',
          },
          {
            title: '4. Responsabilidad del contenido',
            body: 'Eres responsable del contenido que publicas, incluyendo la veracidad de los reviews, comentarios y claims sobre productos. Tokproof no se responsabiliza de las reclamaciones de consumidores derivadas de tu contenido.',
          },
          {
            title: '5. Propiedad intelectual',
            body: 'El código, diseño y marca Tokproof son propiedad exclusiva de Tokproof. El contenido que publicas en tu página (textos, imágenes) sigue siendo tuyo.',
          },
          {
            title: '6. Modificaciones',
            body: 'Nos reservamos el derecho de modificar estos términos. Las modificaciones sustanciales se comunicarán por email con al menos 30 días de antelación.',
          },
          {
            title: '7. Contacto',
            body: 'Para consultas legales: legal@tokproof.app',
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
