'use client'

import { useState } from 'react'

const FAQS = [
  { q: '¿Cómo publico mi página en TikTok?', a: 'Una vez publicada, copia tu URL (tokproof.app/@tuusername) y pégala en la bio de tu perfil de TikTok o en tu Linktree. Cuando alguien haga clic en tu bio irá directamente a tu trust page.', cat: 'tiktok' },
  { q: '¿Cuántas páginas puedo tener en el Plan Free?', a: 'En el Plan Free puedes crear páginas ilimitadas en borrador, pero solo puedes tener 1 página publicada activa. Para publicar más páginas necesitas el Plan Pro.', cat: 'billing' },
  { q: '¿Qué es una Trust Page?', a: 'Una Trust Page es una landing page mobile-first optimizada para tráfico de TikTok. Incluye media del producto, reviews, comentarios de TikTok, logos "visto en", FAQ y un CTA sticky directo a tu Shopify.', cat: 'pages' },
  { q: '¿Qué es el Safe Link Score?', a: 'El Safe Link Score analiza tu página y te da una puntuación de 0-100 basada en factores de confianza: URL HTTPS, footer legal, contacto visible, sin acortadores de URL y sin claims engañosos.', cat: 'analytics' },
  { q: '¿Puedo conectar mi dominio propio?', a: 'Los dominios personalizados están disponibles en el Plan Pro. Podrás usar tu propio dominio en lugar de tokproof.app/@username.', cat: 'billing' },
  { q: '¿Cómo funciona el analytics?', a: 'Tokproof registra automáticamente page views, clicks en CTAs y clicks hacia Shopify. Puedes ver el CTR (shopify_clicks / page_views) y la fuente de tráfico de cada visita.', cat: 'analytics' },
  { q: '¿Funciona con cualquier tienda Shopify?', a: 'Sí. Solo necesitas poner la URL de tu producto o colección de Shopify en el editor. El botón CTA llevará al visitante directamente a esa URL.', cat: 'tiktok' },
]

export default function FAQPage() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<number | null>(null)

  const filtered = FAQS.filter(f =>
    !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <div className="db-hero">
        <div className="db-hero-top">
          <div>
            <h1 className="db-title">FAQ & <span className="gt">Ayuda</span></h1>
            <p className="db-sub">Respuestas rápidas a las preguntas más frecuentes.</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted2)', fontSize: 15 }}>🔍</span>
        <input
          className="fi"
          type="search"
          placeholder="Buscar en FAQ..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {/* FAQ items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 720 }}>
        {filtered.length === 0 && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '32px 24px', textAlign: 'center', color: 'var(--muted)' }}>
            No encontramos resultados para &quot;{query}&quot;
          </div>
        )}
        {filtered.map((f, i) => (
          <div
            key={i}
            style={{
              background: 'var(--card)',
              border: `1px solid ${open === i ? 'rgba(255,45,117,.2)' : 'var(--border)'}`,
              borderRadius: 'var(--r-xl)',
              overflow: 'hidden',
              borderLeft: open === i ? '2px solid var(--pink)' : '2px solid transparent',
            }}
          >
            <button
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{f.q}</span>
              <span style={{ color: 'var(--muted)', flexShrink: 0, transition: 'transform .2s', transform: open === i ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 20px 18px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ marginTop: 32, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px', maxWidth: 720 }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>¿No encuentras tu respuesta?</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16 }}>Escríbenos y te ayudamos en menos de 24 horas.</p>
        <a href="mailto:support@tokproof.app" className="btn btn-primary btn-sm">✉ Contactar soporte</a>
      </div>
      <div style={{ height: 52 }} />
    </>
  )
}
