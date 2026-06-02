'use client'

// ─── GlowSkin — datos ficticios realistas compartidos por todas las previews ──
export const G = {
  name: 'GlowSkin', handle: '@glowskin',
  product: 'Sérum Vitamina C', fullProduct: 'Sérum Vitamina C Pro',
  price: '39,99€', oldPrice: '59,99€',
  rating: '4.9', reviews: '2.4k', stars: '★★★★★',
  code: 'GLOW20', discount: '20% OFF',
  tagline: 'Brilla desde dentro', email: 'hola@glowskin.es',
  bio: 'Experta en skincare · Rutinas naturales ✨', location: 'Madrid, España',
  cta: '🛒 Ver producto oficial',
  colls: ['Rutina AM', 'Hidratación Profunda', 'Vitamina C'],
  products: [
    { name: 'Sérum Vitamina C', price: '39,99€', emoji: '✨' },
    { name: 'Hidratante 24h',   price: '24,99€', emoji: '💧' },
    { name: 'Protector SPF50', price: '19,99€', emoji: '☀️' },
  ],
}

export type ThumbSize = 'list' | 'card' | 'popover'

function W(w: number | string, h: number, r: number, bg: string, extra?: React.CSSProperties) {
  return { width: w, height: h, borderRadius: r, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,.07)', background: bg, position: 'relative' as const, ...extra }
}

// ─── hero_product ─────────────────────────────────────────────────────────────
function HeroThumb({ size }: { size: ThumbSize }) {
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(155deg,#FDF2F8,#FCE7F3)', { display: 'flex', flexDirection: 'column' })}>
      <div style={{ height: 58, background: 'linear-gradient(135deg,#fbcfe8 0%,#ec4899 55%,#c026d3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🧴</div>
      <div style={{ padding: '8px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        <span style={{ fontSize: 8.5, color: '#ec4899', fontWeight: 700 }}>{G.stars} {G.rating}/5 ({G.reviews} reseñas)</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#1f2430', lineHeight: 1.2 }}>{G.fullProduct}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#1f2430' }}>{G.price}</span>
          <span style={{ fontSize: 9.5, color: '#9ca3af', textDecoration: 'line-through' }}>{G.oldPrice}</span>
        </div>
        <div style={{ marginTop: 'auto', borderRadius: 7, padding: '5px 0', background: 'linear-gradient(135deg,#f472b6,#ec4899)', color: '#fff', fontSize: 9.5, fontWeight: 700, textAlign: 'center' }}>{G.cta}</div>
      </div>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#FDF2F8,#FCE7F3)', { display: 'flex', flexDirection: 'column' })}>
      <div style={{ height: h * 0.47, background: 'linear-gradient(135deg,#fbcfe8,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: w * 0.3 }}>🧴</div>
      <div style={{ padding: '3px 4px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 3.5, borderRadius: 2, background: '#f9a8d4', width: '80%' }} />
        <div style={{ height: 3, borderRadius: 2, background: '#e5e7eb', width: '50%' }} />
        <div style={{ marginTop: 'auto', height: 9, borderRadius: 4, background: 'linear-gradient(135deg,#f472b6,#ec4899)' }} />
      </div>
    </div>
  )
}

// ─── benefits ─────────────────────────────────────────────────────────────────
function BenefitsThumb({ size }: { size: ThumbSize }) {
  const perks = ['Dermatológicamente testado', 'Sin parabenos ni siliconas', 'Vegan & Cruelty-Free']
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(155deg,#F0FDF4,#DCFCE7)', { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9 })}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#166534' }}>Por qué elegirlo</span>
      {perks.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 17, height: 17, borderRadius: 999, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>✓</span>
          </div>
          <span style={{ fontSize: 10, color: '#1f2430', fontWeight: 500, lineHeight: 1.2 }}>{p}</span>
        </div>
      ))}
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#F0FDF4,#DCFCE7)', { padding: '5px', display: 'flex', flexDirection: 'column', gap: 4 })}>
      <div style={{ height: 3.5, borderRadius: 2, background: '#16a34a', width: '55%' }} />
      {perks.map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: '#22c55e', flexShrink: 0 }} />
          <div style={{ height: 3, borderRadius: 2, background: '#bbf7d0', flex: 1 }} />
        </div>
      ))}
    </div>
  )
}

// ─── cta ──────────────────────────────────────────────────────────────────────
function CTAThumb({ size }: { size: ThumbSize }) {
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, '#F5F3FF', { padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 })}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1f2430' }}>¿Lista para brillar?</div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3, lineHeight: 1.4 }}>Consigue tu sérum con<br />{G.discount} — código <strong>{G.code}</strong></div>
      </div>
      <div style={{ width: '100%', borderRadius: 10, padding: '10px 0', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff', fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
        🛒 Comprar ahora — {G.price}
      </div>
      <span style={{ fontSize: 9, color: '#9ca3af' }}>Envío gratis · 30 días devolución</span>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, '#F5F3FF', { padding: '6px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 })}>
      <div style={{ height: 3.5, borderRadius: 2, background: '#c4b5fd', width: '65%' }} />
      <div style={{ height: 3, borderRadius: 2, background: '#ddd6fe', width: '50%' }} />
      <div style={{ height: 13, borderRadius: 5, background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', width: '90%', marginTop: 2 }} />
    </div>
  )
}

// ─── link_list ────────────────────────────────────────────────────────────────
function LinkListThumb({ size }: { size: ThumbSize }) {
  const links = ['Ver en Amazon →', 'Ver en Sephora →', 'Mi tienda oficial →']
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(155deg,#EFF6FF,#DBEAFE)', { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7 })}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#1e3a8a' }}>Mis favoritos</span>
      {links.map((l, i) => (
        <div key={i} style={{ borderRadius: 7, padding: '7px 11px', background: '#fff', border: '1px solid #bfdbfe', fontSize: 10.5, fontWeight: 600, color: '#1e3a8a' }}>{l}</div>
      ))}
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#EFF6FF,#DBEAFE)', { padding: '5px', display: 'flex', flexDirection: 'column', gap: 3 })}>
      <div style={{ height: 3.5, borderRadius: 2, background: '#3b82f6', width: '50%', marginBottom: 2 }} />
      {links.map((_, i) => (
        <div key={i} style={{ height: 10, borderRadius: 4, background: '#fff', border: '1px solid #bfdbfe' }} />
      ))}
    </div>
  )
}

// ─── faq ──────────────────────────────────────────────────────────────────────
function FAQThumb({ size }: { size: ThumbSize }) {
  const items = [
    { q: '¿Cuándo veré resultados?', a: 'En 2-3 semanas de uso continuo.', open: true },
    { q: '¿Es apto para piel sensible?', a: '', open: false },
    { q: '¿Cómo aplicarlo?', a: '', open: false },
  ]
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(155deg,#FFF7ED,#FFEDD5)', { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 })}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#92400e' }}>Preguntas frecuentes</span>
      {items.map((item, i) => (
        <div key={i} style={{ borderRadius: 7, background: '#fff', border: `1px solid ${item.open ? '#fdba74' : '#fed7aa'}`, overflow: 'hidden' }}>
          <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9.5, fontWeight: 600, color: '#1f2430' }}>{item.q}</span>
            <span style={{ fontSize: 9, color: '#f97316' }}>{item.open ? '▼' : '►'}</span>
          </div>
          {item.open && <div style={{ padding: '0 10px 7px', fontSize: 9, color: '#6b7280' }}>{item.a}</div>}
        </div>
      ))}
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#FFF7ED,#FFEDD5)', { padding: '5px', display: 'flex', flexDirection: 'column', gap: 3 })}>
      <div style={{ height: 3.5, borderRadius: 2, background: '#f97316', width: '55%', marginBottom: 1 }} />
      {[1, 1, 0.7].map((o, i) => (
        <div key={i} style={{ height: 11, borderRadius: 4, background: '#fff', border: '1px solid #fed7aa', opacity: o }} />
      ))}
    </div>
  )
}

// ─── profile_header ───────────────────────────────────────────────────────────
function ProfileThumb({ size }: { size: ThumbSize }) {
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(155deg,#F0F9FF,#E0F2FE)', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '14px' })}>
      <div style={{ width: 46, height: 46, borderRadius: 999, background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(139,92,246,.3)' }}>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>G</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1f2430' }}>{G.name} <span style={{ color: '#3b82f6', fontSize: 11 }}>✓</span></div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{G.handle}</div>
        <div style={{ fontSize: 9.5, color: '#6b7280', marginTop: 5, lineHeight: 1.4 }}>{G.bio}</div>
        <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 3 }}>📍 {G.location}</div>
      </div>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#F0F9FF,#E0F2FE)', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px' })}>
      <div style={{ width: w * 0.38, height: w * 0.38, borderRadius: 999, background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontSize: w * 0.14, fontWeight: 800 }}>G</span>
      </div>
      <div style={{ height: 3.5, borderRadius: 2, background: '#1f2430', width: '60%' }} />
      <div style={{ height: 3, borderRadius: 2, background: '#cbd5e1', width: '45%' }} />
      <div style={{ height: 3, borderRadius: 2, background: '#e2e8f0', width: '75%' }} />
    </div>
  )
}

// ─── social_links ─────────────────────────────────────────────────────────────
function SocialThumb({ size }: { size: ThumbSize }) {
  const nets = [
    { label: 'TikTok', bg: '#000', color: '#fff', icon: '♪' },
    { label: 'Instagram', bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', color: '#fff', icon: '◻' },
    { label: 'YouTube', bg: '#ff0000', color: '#fff', icon: '▶' },
  ]
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(155deg,#FDF4FF,#FAE8FF)', { padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 })}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#7e22ce' }}>Sígueme en</span>
      <div style={{ display: 'flex', gap: 10 }}>
        {nets.map(n => (
          <div key={n.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,.15)' }}>
              <span style={{ color: n.color, fontSize: 18, fontWeight: 700 }}>{n.icon}</span>
            </div>
            <span style={{ fontSize: 8.5, color: '#6b7280', fontWeight: 600 }}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#FDF4FF,#FAE8FF)', { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '5px' })}>
      <div style={{ height: 3.5, borderRadius: 2, background: '#a855f7', width: '50%' }} />
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        {['#000', 'linear-gradient(135deg,#833ab4,#fd1d1d)', '#ff0000'].map((bg, i) => (
          <div key={i} style={{ width: size === 'card' ? 12 : 10, height: size === 'card' ? 12 : 10, borderRadius: 4, background: bg }} />
        ))}
      </div>
    </div>
  )
}

// ─── product_grid ─────────────────────────────────────────────────────────────
function ProductGridThumb({ size }: { size: ThumbSize }) {
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(155deg,#FFFBEB,#FEF3C7)', { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 })}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#92400e' }}>Nuestros productos</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {G.products.slice(0, 2).map((p, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 8, background: '#fff', border: '1px solid #fde68a', padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 36, borderRadius: 6, background: `linear-gradient(135deg, ${['#fbcfe8,#ec4899', '#bae6fd,#38bdf8'][i]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.emoji}</div>
            <span style={{ fontSize: 8.5, fontWeight: 600, color: '#1f2430', lineHeight: 1.2 }}>{p.name}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#d97706' }}>{p.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#FFFBEB,#FEF3C7)', { padding: '5px', display: 'flex', flexDirection: 'column', gap: 3 })}>
      <div style={{ height: 3.5, borderRadius: 2, background: '#d97706', width: '55%', marginBottom: 1 }} />
      <div style={{ display: 'flex', gap: 3, flex: 1 }}>
        {[['#fbcfe8', '#ec4899'], ['#bae6fd', '#38bdf8']].map(([c1, c2], i) => (
          <div key={i} style={{ flex: 1, borderRadius: 5, background: '#fff', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', padding: '3px' }}>
            <div style={{ flex: 1, borderRadius: 3, background: `linear-gradient(135deg,${c1},${c2})` }} />
            <div style={{ height: 2.5, borderRadius: 1, background: '#d97706', margin: '3px 0 1px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── trust_badges ─────────────────────────────────────────────────────────────
function TrustThumb({ size }: { size: ThumbSize }) {
  const badges = [
    { icon: '🚚', label: 'Envío gratis', desc: 'En pedidos +30€' },
    { icon: '🔒', label: 'Pago seguro', desc: 'SSL 256 bits' },
    { icon: '⭐', label: 'Garantía 30d', desc: 'Sin preguntas' },
    { icon: '↩️', label: 'Devolución', desc: 'Fácil y gratis' },
  ]
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, '#F0FDF4', { padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 })}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#166534', textAlign: 'center' }}>Compra con confianza</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {badges.map((b, i) => (
          <div key={i} style={{ borderRadius: 8, background: '#fff', border: '1px solid #bbf7d0', padding: '7px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{b.icon}</span>
            <div>
              <div style={{ fontSize: 8.5, fontWeight: 700, color: '#1f2430' }}>{b.label}</div>
              <div style={{ fontSize: 7.5, color: '#6b7280' }}>{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, '#F0FDF4', { padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 })}>
      <div style={{ height: 3, borderRadius: 2, background: '#16a34a', width: '55%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginTop: 2 }}>
        {badges.map((b, i) => (
          <div key={i} style={{ borderRadius: 4, background: '#fff', border: '1px solid #bbf7d0', height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7 }}>{b.icon}</div>
        ))}
      </div>
    </div>
  )
}

// ─── comparison ───────────────────────────────────────────────────────────────
function ComparisonThumb({ size }: { size: ThumbSize }) {
  const rows = [
    { feat: 'Certificados', left: '✗', right: '✓' },
    { feat: 'Vegan',        left: '✗', right: '✓' },
    { feat: 'Resultados',   left: '7 días', right: '3 días' },
  ]
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(155deg,#EFF6FF,#DBEAFE)', { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7 })}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#1e3a8a' }}>Por qué elegirnos</span>
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#1d4ed8' }}>
          {['', 'Otros', 'GlowSkin'].map((h, i) => (
            <div key={i} style={{ padding: '4px 6px', fontSize: 8.5, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{h}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: i % 2 === 0 ? '#fff' : '#eff6ff', borderTop: '1px solid #bfdbfe' }}>
            <div style={{ padding: '5px 6px', fontSize: 8.5, color: '#374151', fontWeight: 500 }}>{r.feat}</div>
            <div style={{ padding: '5px 6px', fontSize: 9, color: '#ef4444', fontWeight: 700, textAlign: 'center' }}>{r.left}</div>
            <div style={{ padding: '5px 6px', fontSize: 9, color: '#16a34a', fontWeight: 700, textAlign: 'center' }}>{r.right}</div>
          </div>
        ))}
      </div>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#EFF6FF,#DBEAFE)', { padding: '5px', display: 'flex', flexDirection: 'column', gap: 2 })}>
      <div style={{ height: 3.5, borderRadius: 2, background: '#3b82f6', width: '55%', marginBottom: 1 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map((_, i) => <div key={i} style={{ height: 8, borderRadius: 3, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 5, color: '#ef4444' }}>✗</span></div>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map((_, i) => <div key={i} style={{ height: 8, borderRadius: 3, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 5, color: '#16a34a' }}>✓</span></div>)}
        </div>
      </div>
    </div>
  )
}

// ─── urgency_offer ────────────────────────────────────────────────────────────
function UrgencyThumb({ size }: { size: ThumbSize }) {
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, 'linear-gradient(135deg,#FEF3C7,#FDE68A)', { padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 })}>
      <div style={{ borderRadius: 999, background: 'linear-gradient(135deg,#f97316,#ef4444)', padding: '4px 14px', fontSize: 10, fontWeight: 800, color: '#fff' }}>🔥 AGOTÁNDOSE</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#1f2430' }}>¡Solo 12 unidades!</div>
        <div style={{ fontSize: 9.5, color: '#92400e', marginTop: 3 }}>Oferta exclusiva · {G.discount} hoy</div>
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        {[['00', 'h'], ['23', 'm'], ['47', 's']].map(([n, l], i) => (
          <div key={i} style={{ background: '#1f2430', borderRadius: 5, padding: '4px 7px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 7, color: '#9ca3af' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', borderRadius: 8, padding: '8px 0', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontSize: 10.5, fontWeight: 700, textAlign: 'center' }}>🛒 Aprovechar ahora</div>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, 'linear-gradient(155deg,#FEF3C7,#FDE68A)', { padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 })}>
      <div style={{ borderRadius: 999, background: 'linear-gradient(135deg,#f97316,#ef4444)', padding: '2px 6px', fontSize: 5.5, fontWeight: 800, color: '#fff' }}>🔥 OFERTA</div>
      <div style={{ height: 4, borderRadius: 2, background: '#92400e', width: '70%' }} />
      <div style={{ display: 'flex', gap: 2.5, marginTop: 1 }}>
        {['00', '23', '47'].map((n, i) => (
          <div key={i} style={{ background: '#1f2430', borderRadius: 3, padding: '2px 3px', fontSize: 6, fontWeight: 800, color: '#fff' }}>{n}</div>
        ))}
      </div>
      <div style={{ height: 10, borderRadius: 4, background: 'linear-gradient(135deg,#f97316,#ef4444)', width: '90%', marginTop: 2 }} />
    </div>
  )
}

// ─── footer_legal ─────────────────────────────────────────────────────────────
function FooterThumb({ size }: { size: ThumbSize }) {
  if (size === 'popover') return (
    <div style={W('100%', 140, 12, '#F9FAFB', { padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1f2430' }}>{G.name}</div>
        <div style={{ fontSize: 9.5, color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>{G.tagline}</div>
      </div>
      <div>
        <div style={{ height: 1, background: '#e5e7eb', margin: '10px 0' }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 5 }}>
          {['Privacidad', 'Términos', 'Contacto'].map(l => (
            <span key={l} style={{ fontSize: 8.5, color: '#6b7280', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize: 8.5, color: '#9ca3af' }}>© 2025 GlowSkin · {G.email}</div>
        <div style={{ fontSize: 7.5, color: '#d1d5db', marginTop: 4 }}>Powered by <strong>Tokproof</strong></div>
      </div>
    </div>
  )
  const [w, h] = size === 'card' ? [52, 78] : [40, 56]
  return (
    <div style={W(w, h, 8, '#F9FAFB', { padding: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 4, borderRadius: 2, background: '#1f2430', width: '60%' }} />
        <div style={{ height: 2.5, borderRadius: 2, background: '#d1d5db', width: '80%' }} />
      </div>
      <div>
        <div style={{ height: 1, background: '#e5e7eb', margin: '4px 0' }} />
        <div style={{ display: 'flex', gap: 2.5, marginBottom: 2 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ height: 2.5, borderRadius: 2, background: '#9ca3af', flex: 1 }} />)}
        </div>
        <div style={{ height: 2.5, borderRadius: 2, background: '#e5e7eb', width: '80%' }} />
      </div>
    </div>
  )
}

// ─── Generic fallback ─────────────────────────────────────────────────────────
function GenericThumb({ size }: { size: ThumbSize }) {
  const [w, h] = size === 'popover' ? [300, 140] : size === 'card' ? [52, 78] : [40, 56]
  return <div style={W(size === 'popover' ? '100%' : w, h, size === 'popover' ? 12 : 8, '#F4F0FF')} />
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function GlowThumb({ type, size = 'card' }: { type: string; size?: ThumbSize }) {
  switch (type) {
    case 'hero_product':  return <HeroThumb size={size} />
    case 'benefits':      return <BenefitsThumb size={size} />
    case 'cta':           return <CTAThumb size={size} />
    case 'link_list':     return <LinkListThumb size={size} />
    case 'faq':           return <FAQThumb size={size} />
    case 'profile_header':return <ProfileThumb size={size} />
    case 'social_links':  return <SocialThumb size={size} />
    case 'product_grid':  return <ProductGridThumb size={size} />
    case 'trust_badges':  return <TrustThumb size={size} />
    case 'comparison':    return <ComparisonThumb size={size} />
    case 'urgency_offer': return <UrgencyThumb size={size} />
    case 'footer_legal':  return <FooterThumb size={size} />
    default:              return <GenericThumb size={size} />
  }
}
