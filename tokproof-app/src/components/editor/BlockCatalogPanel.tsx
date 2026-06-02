'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus, Lock, Clock, Search } from 'lucide-react'
import UpgradeProModal from '@/components/shared/UpgradeProModal'
import { GlowThumb } from '@/components/editor/GlowThumb'
import type { LandingBlock } from '@/types/landing'
import type { Plan } from '@/lib/plans'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  purple: '#7c3aed', purpleTint: '#f3effe', purpleTint2: '#ede7fd',
  ink: '#1f2430', ink2: '#374151', gray: '#6b7280', gray2: '#9ca3af',
  line: '#eceef2', line2: '#e6e3ec',
  card: '#FFFFFF',
} as const

// ─── Block catalog definitions ────────────────────────────────────────────────
interface CatalogBlock {
  type: LandingBlock['type']
  label: string
  desc: string
  long: string
  tag: 'free' | 'pro' | 'soon'
  ideal: string[]
  defaultData: LandingBlock['data']
}

const CATALOG: CatalogBlock[] = [
  {
    type: 'hero_product', label: 'Hero del producto', tag: 'free',
    desc: 'Imagen, titular y descripción del producto.',
    long: 'Bloque principal de tu página. Muestra imagen, headline impactante y descripción para convertir desde el primer scroll.',
    ideal: ['E-commerce', 'Dropshipping', 'Marcas'],
    defaultData: { headline: 'Nuevo titular', subheadline: '', description: '', imageUrl: '', badgeText: '★ 4.9/5', showBadge: true, showRating: true, rating: '4.9' },
  },
  {
    type: 'benefits', label: 'Beneficios', tag: 'free',
    desc: 'Lista de ventajas con iconos y texto.',
    long: 'Presenta las características clave con iconos visuales para convencer al visitante antes del CTA.',
    ideal: ['Todos', 'E-commerce', 'Servicios'],
    defaultData: { title: 'Por qué elegirlo', items: [{ icon: '✨', title: 'Beneficio 1', description: 'Descripción del beneficio.' }] },
  },
  {
    type: 'cta', label: 'Botón CTA', tag: 'free',
    desc: 'Botón de llamada a la acción con URL.',
    long: 'Añade un botón de compra o acción destacado con tu URL de destino, texto personalizado y estilo de marca.',
    ideal: ['E-commerce', 'Afiliados', 'Landing pages'],
    defaultData: { text: '🛒 Comprar ahora', subtext: '', url: '', style: 'gradient' },
  },
  {
    type: 'link_list', label: 'Lista de links', tag: 'free',
    desc: 'Múltiples botones de enlace.',
    long: 'Añade varios links de forma ordenada. Perfecto para bio pages o múltiples destinos de afiliación.',
    ideal: ['Creadores', 'Afiliados', 'Multi-producto'],
    defaultData: { title: 'Links', links: [{ id: 'link_new', label: 'Mi link', url: '', visible: true }] },
  },
  {
    type: 'faq', label: 'Preguntas frecuentes', tag: 'free',
    desc: 'Acordeón de FAQ para resolver dudas.',
    long: 'Reduce el abandono respondiendo las dudas más comunes. Formato acordeón interactivo.',
    ideal: ['E-commerce', 'Servicios', 'SaaS'],
    defaultData: { title: 'Preguntas frecuentes', items: [{ id: 'faq_new', question: '¿Pregunta frecuente?', answer: 'Respuesta clara y concisa.' }] },
  },
  {
    type: 'profile_header', label: 'Profile Header', tag: 'free',
    desc: 'Avatar, nombre y bio de creador.',
    long: 'Muestra tu perfil con foto, nombre y descripción. Ideal para creadores de contenido e influencers.',
    ideal: ['Creadores', 'Influencers', 'Freelancers'],
    defaultData: { avatarUrl: '', displayName: 'Tu Nombre', username: 'tuusuario', verifiedBadge: true, bio: 'Creador de contenido 🌟', location: '' },
  },
  {
    type: 'social_links', label: 'Redes Sociales', tag: 'free',
    desc: 'Iconos de redes sociales con links.',
    long: 'Muestra tus perfiles de TikTok, Instagram, YouTube y más con iconos elegantes y enlaces directos.',
    ideal: ['Creadores', 'Marcas', 'Negocios'],
    defaultData: { links: [{ id: 'sl_tt', platform: 'tiktok' as const, url: '', enabled: true }, { id: 'sl_ig', platform: 'instagram' as const, url: '', enabled: true }] },
  },
  {
    type: 'product_grid', label: 'Product Grid', tag: 'pro',
    desc: 'Cuadrícula de productos con precios.',
    long: 'Muestra varios productos en una cuadrícula visual con precio, imagen y botón de compra.',
    ideal: ['E-commerce', 'Dropshipping', 'Catálogos'],
    defaultData: { title: 'Nuestros productos', subtitle: '', products: [{ id: 'p_1', imageUrl: '', title: 'Producto 1', price: '29.99€', compareAtPrice: '', url: '', badge: 'Nuevo', description: '' }] },
  },
  {
    type: 'trust_badges', label: 'Trust Badges', tag: 'pro',
    desc: 'Badges de confianza y garantías.',
    long: 'Refuerza la confianza con badges de envío gratis, pago seguro, garantía y devoluciones.',
    ideal: ['E-commerce', 'Tiendas', 'SaaS'],
    defaultData: { badges: [{ id: 'tb1', icon: 'shipping' as const, title: 'Envío gratis', description: 'En pedidos +20€', enabled: true }, { id: 'tb2', icon: 'secure' as const, title: 'Pago seguro', description: 'SSL 256 bits', enabled: true }] },
  },
  {
    type: 'comparison', label: 'Comparativa', tag: 'pro',
    desc: 'Tabla de comparación vs competidores.',
    long: 'Muestra por qué tu producto es mejor con una comparativa visual que destaca tus ventajas.',
    ideal: ['E-commerce', 'SaaS', 'Servicios'],
    defaultData: { title: 'Por qué elegirnos', leftTitle: 'Otros', rightTitle: 'Nosotros', rows: [{ id: 'cr1', label: 'Calidad', leftValue: 'Media', rightValue: 'Premium', winner: 'right' as const }] },
  },
  {
    type: 'urgency_offer', label: 'Urgencia / Oferta', tag: 'pro',
    desc: 'Banner de urgencia con oferta limitada.',
    long: 'Crea urgencia con un banner de oferta limitada y badge para impulsar la decisión de compra.',
    ideal: ['E-commerce', 'Flash sales', 'Promociones'],
    defaultData: { title: '¡Oferta limitada!', description: 'Solo por tiempo limitado.', badgeText: '🔥 Agotándose', countdownEnabled: false, countdownText: 'Quedan 2 horas', ctaText: '🛒 Aprovechar oferta', ctaUrl: '' },
  },
  {
    type: 'featured_product', label: 'Product Showcase', tag: 'pro',
    desc: 'Destaca tu producto estrella con imagen, precio y CTA.',
    long: 'Destaca un producto estrella con imagen, precio, reseñas, beneficios y botón de compra.',
    ideal: ['E-commerce', 'Afiliados', 'Beauty', 'Fitness'],
    defaultData: {
      imageUrl: '', badgeText: 'Más vendido 🔥', productName: 'Hair Growth Serum',
      description: 'Fórmula avanzada con ingredientes naturales para fortalecer el cabello desde la raíz.',
      rating: 4.9, reviewCount: '2.4K', price: '$29.99', compareAtPrice: '$39.99', discountText: '-25%',
      benefits: ['Estimula el crecimiento capilar', 'Ingredientes 100% naturales', 'Resultados visibles en 7 días'],
      buttonText: 'Ver producto', buttonUrl: '',
      showBadge: true, showRating: true, showReviews: true, showPrice: true,
      showCompareAtPrice: true, showDiscount: true, showBenefits: true,
      layout: 'card', colorTheme: 'light', buttonStyle: 'filled',
    },
  },
  {
    type: 'footer_legal', label: 'Footer Legal', tag: 'free',
    desc: 'Footer con información legal y contacto.',
    long: 'Añade un pie de página profesional con links a política de privacidad, términos y email de contacto.',
    ideal: ['Todos', 'E-commerce', 'Negocios'],
    defaultData: { brandName: 'Mi Marca', contactEmail: 'hola@mimarca.com', privacyUrl: '', termsUrl: '', showTokproofBranding: true, legalText: '' },
  },
  {
    type: 'tiktok_comments', label: 'TikTok Comments', tag: 'free',
    desc: 'Comentarios estilo TikTok para generar confianza y conversiones.',
    long: 'Muestra un feed de comentarios auténticos al estilo TikTok. Genera más confianza que los testimonios clásicos. Feed vertical (Free) o Carousel interactivo (Pro).',
    ideal: ['Beauty', 'E-commerce', 'Ropa', 'Mascotas', 'Viral'],
    defaultData: {
      title: '', subtitle: '', badgeText: '',
      showTitle: false, showSubtitle: false, showBadge: false,
      layout: 'feed',
      comments: [
        { id: 'tc1', avatarUrl: '', username: 'Tri G🌸🥰👣', verified: true,  text: 'Quiero ver donde le entregan el pan🥰',         imageUrl: '', likes: '13',       date: '3 h', replyItems: [{ id: 'r1a', avatarUrl: '', username: 'GlowSkin Oficial 💗', verified: true,  text: '¡Entregamos en toda España! 📦', likes: '7', date: '2 h' }], showReply: true, showLikes: true, showReplies: true  },
        { id: 'tc2', avatarUrl: '', username: 'Mira que bonito',  verified: false, text: 'Mira que bonito se le ven esos zapatitoosss', imageUrl: '', likes: '24.7 mil', date: '1 d', replyItems: [{ id: 'r2a', avatarUrl: '', username: 'Fashionista 💅',  verified: false, text: 'Jajaja exactamente lo que yo dije!!', likes: '127', date: '22 h' }, { id: 'r2b', avatarUrl: '', username: 'Laura M.', verified: false, text: 'Son divinos 😍 yo ya los pedí', likes: '38', date: '1 d' }], showReply: true, showLikes: true, showReplies: true  },
        { id: 'tc3', avatarUrl: '', username: 'Antoni ⺣',         verified: false, text: 'Necesito uno para mi michi 🤣',              imageUrl: '', likes: '824',      date: '2 d', replyItems: [], showReply: true, showLikes: true, showReplies: false },
      ],
      showArrows: true, showDots: true, autoplay: false, autoplaySpeed: 3,
      borderRadius: 'soft', shadowIntensity: 'soft', spacing: 'normal',
    },
  },
  {
    type: 'before_after', label: 'Before / After', tag: 'free',
    desc: 'Muestra transformaciones reales antes y después.',
    long: 'Enseña el impacto visual de tu producto con un bloque antes/después. Ideal para beauty, hair care, skincare, fitness y más.',
    ideal: ['Beauty', 'Hair care', 'Skincare', 'Fitness'],
    defaultData: {
      title: 'Resultados que puedes ver',
      subtitle: 'Mira la diferencia real después de usar nuestro producto.',
      badgeText: 'Transformación real',
      mode: 'cards',
      beforeImageUrl: '', afterImageUrl: '',
      beforeLabel: 'Antes', afterLabel: 'Después',
      beforeDescription: 'Cabello seco, sin brillo y con frizz.',
      afterDescription: 'Cabello hidratado, brillante y saludable.',
      showBadge: true, showSubtitle: true, showDescriptions: true, showCTA: false,
      buttonText: 'Ver producto', buttonUrl: 'https://tutienda.com/producto',
      borderRadius: 'soft', shadowIntensity: 'soft',
    },
  },
]

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE = {
  free: { label: 'Free',         bg: '#dcfce7', tx: '#16a34a', lock: false },
  pro:  { label: 'Pro',          bg: '#ede7fd', tx: '#7c3aed', lock: true  },
  soon: { label: 'Próximamente', bg: '#eef0f3', tx: '#8b8f98', lock: false },
}

function Badge({ tag, small = false }: { tag: 'free' | 'pro' | 'soon'; small?: boolean }) {
  const c = BADGE[tag]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: c.bg, color: c.tx, fontSize: small ? 9.5 : 10.5, fontWeight: 700, padding: small ? '2px 6px' : '3px 8px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {c.label}{c.lock && <Lock size={small ? 9 : 10} strokeWidth={2.5} />}
    </span>
  )
}

// ─── Preview popover ──────────────────────────────────────────────────────────
function BlockPreviewPopover({
  block, top, panelLeftEdge, onClose, onAdd, onMouseEnter, onMouseLeave, isLocked, onUpgrade,
}: {
  block: CatalogBlock; top: number; panelLeftEdge: number
  onClose: () => void; onAdd: () => void; onMouseEnter: () => void; onMouseLeave: () => void
  isLocked: boolean; onUpgrade: () => void
}) {
  const H = 440
  const cTop = Math.max(64, Math.min(top, (typeof window !== 'undefined' ? window.innerHeight : 800) - H - 12))
  const soon = block.tag === 'soon'

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="bc-popover"
      style={{ position: 'fixed', left: panelLeftEdge + 8, top: cTop, width: 300, background: T.card, borderRadius: 18, border: '1px solid #efe9f6', boxShadow: '0 24px 60px -18px rgba(60,30,90,.32), 0 4px 14px rgba(60,30,90,.10)', zIndex: 60, overflow: 'hidden' }}
    >
      {/* Arrow */}
      <div style={{ position: 'absolute', left: -7, top: 32, width: 14, height: 14, background: T.card, borderLeft: '1px solid #efe9f6', borderBottom: '1px solid #efe9f6', transform: 'rotate(45deg)' }} />

      {/* Header */}
      <div style={{ padding: '14px 14px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: T.ink, letterSpacing: '-.01em' }}>{block.label}</span>
          <Badge tag={block.tag} />
        </div>
        <button onClick={onClose}
          style={{ color: T.gray2, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 3, borderRadius: 7, flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f2f3f5' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
          <X size={16} />
        </button>
      </div>

      {/* Real preview */}
      <div style={{ padding: '11px 14px 0' }}>
        <div style={{ borderRadius: 13, padding: 10, background: 'linear-gradient(160deg,#faf6fe,#f5eefb)', border: '1px solid #efe6f8' }}>
          <GlowThumb type={block.type} size="popover" />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '11px 14px 14px' }}>
        <p style={{ margin: 0, fontSize: 12.5, color: T.gray, lineHeight: 1.45 }}>{block.long}</p>

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', color: T.gray2, marginTop: 10, textTransform: 'uppercase' }}>Ideal para</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {block.ideal.map(t => (
            <span key={t} style={{ fontSize: 11, fontWeight: 600, color: T.ink2, background: '#f6f4f9', border: '1px solid #ece8f2', padding: '4px 10px', borderRadius: 14 }}>{t}</span>
          ))}
        </div>

        {/* Único CTA */}
        {soon ? (
          <button disabled style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#eef0f3', color: '#a4a9b2', fontSize: 13.5, fontWeight: 700, padding: '12px', borderRadius: 11, border: 'none', cursor: 'not-allowed' }}>
            <Clock size={14} /> Disponible pronto
          </button>
        ) : isLocked ? (
          <button onClick={onUpgrade} style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', fontSize: 13.5, fontWeight: 700, padding: '12px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,165,0,.28)' }}>
            <Lock size={14} /> Actualizar a Pro
          </button>
        ) : (
          <button onClick={onAdd}
            style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'linear-gradient(180deg,#8b5cf6,#7c3aed)', color: '#fff', fontSize: 13.5, fontWeight: 700, padding: '12px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 8px 18px rgba(124,58,237,.30)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 24px rgba(124,58,237,.44)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 18px rgba(124,58,237,.30)'}>
            <Plus size={15} strokeWidth={2.5} /> Añadir bloque
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  plan?: Plan
  panelLeftEdge: number
  onAdd: (type: LandingBlock['type'], data: LandingBlock['data']) => void
  onClose: () => void
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function BlockCatalogPanel({ plan = 'free', panelLeftEdge, onAdd, onClose }: Props) {
  const [q, setQ]               = useState('')
  const [filter, setFilter]     = useState<'todos' | 'free' | 'pro'>('todos')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pinned, setPinned]     = useState(false)
  const [popTop, setPopTop]     = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const list = CATALOG.filter(b =>
    (filter === 'todos' || b.tag === filter) &&
    b.label.toLowerCase().includes(q.toLowerCase())
  )
  const activeBlock = activeId ? CATALOG.find(b => b.type === activeId) ?? null : null
  const POPOVER_LEFT = panelLeftEdge + 320

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  useEffect(() => {
    if (!pinned) return
    const fn = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('.bc-popover') || t.closest('[data-bc-card]')) return
      setPinned(false); setActiveId(null)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [pinned])

  function scheduleClose() {
    leaveTimer.current = setTimeout(() => { if (!pinned) setActiveId(null) }, 140)
  }
  function cancelClose() { if (leaveTimer.current) clearTimeout(leaveTimer.current) }

  function handleHover(type: string, el: HTMLElement) {
    cancelClose()
    if (pinned) return
    setPopTop(el.getBoundingClientRect().top)
    setActiveId(type)
  }
  function handleClick(type: string, el: HTMLElement) {
    cancelClose()
    setPopTop(el.getBoundingClientRect().top)
    setActiveId(type)
    setPinned(true)
  }
  function handleAdd(block: CatalogBlock) {
    onAdd(block.type, block.defaultData)
    setPinned(false); setActiveId(null)
  }

  return (
    <>
      <style>{`
        @keyframes bcSlideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes bcPopIn   { from { opacity:0; transform:translateY(6px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .bc-panel   { animation: bcSlideIn .17s cubic-bezier(.2,.8,.3,1) both; }
        .bc-popover { animation: bcPopIn   .16s cubic-bezier(.2,.8,.3,1) both; }
        .bc-card    { transition: border-color .14s, box-shadow .14s, transform .14s, background .14s; }
        .bc-card:hover { border-color: #d9c9f7 !important; box-shadow: 0 9px 22px rgba(124,58,237,.11) !important; transform: translateY(-1px); }
      `}</style>

      {/* Panel */}
      <div className="bc-panel" style={{ width: 320, flexShrink: 0, background: T.card, borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Header */}
        <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: '-.02em', color: T.ink }}>Añadir bloque</h2>
            <button onClick={onClose} style={{ color: T.gray2, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f2f3f5'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.gray2, pointerEvents: 'none' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar bloque..."
              style={{ width: '100%', border: `1px solid ${T.line2}`, borderRadius: 10, padding: '9px 11px 9px 33px', fontSize: 12.5, outline: 'none', background: '#fafbfc', color: T.ink, fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#cbb8f5'}
              onBlur={e => e.target.style.borderColor = T.line2}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {(['todos', 'free', 'pro'] as const).map(k => (
              <button key={k} onClick={() => setFilter(k)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11.5, fontWeight: 600, padding: '5px 11px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: filter === k ? T.purple : '#f3f4f6', color: filter === k ? '#fff' : T.ink2, transition: 'all .12s',
              }}>
                {k === 'todos' ? 'Todos' : k === 'free' ? 'Free' : 'Pro'}
                {k === 'pro' && <Lock size={10} strokeWidth={2.5} style={{ opacity: .85 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 12px', marginTop: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {list.map(b => {
              const active = activeId === b.type
              const locked = b.tag === 'pro' && plan === 'free'
              return (
                <div
                  key={b.type}
                  data-bc-card={b.type}
                  className="bc-card"
                  onMouseEnter={e => handleHover(b.type, e.currentTarget as HTMLElement)}
                  onMouseLeave={scheduleClose}
                  onClick={e => handleClick(b.type, e.currentTarget as HTMLElement)}
                  style={{
                    display: 'flex', gap: 11, padding: '10px 11px', borderRadius: 13, cursor: 'pointer', alignItems: 'center',
                    border: `1.5px solid ${active ? '#c4a9f4' : T.line}`,
                    background: active ? T.purpleTint : T.card,
                    opacity: b.tag === 'soon' ? .7 : 1,
                    boxShadow: active ? '0 10px 24px rgba(124,58,237,.12)' : '0 1px 2px rgba(20,20,40,.03)',
                  }}
                >
                  {/* Real thumbnail */}
                  <GlowThumb type={b.type} size="card" />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.ink, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
                      <span style={{ marginLeft: 'auto' }}><Badge tag={locked ? 'pro' : b.tag} small /></span>
                    </div>
                    <div style={{ fontSize: 11.5, color: T.gray, marginTop: 4, lineHeight: 1.38, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {b.desc}
                    </div>
                  </div>
                </div>
              )
            })}
            {list.length === 0 && (
              <div style={{ padding: '32px 0', textAlign: 'center', color: T.gray2, fontSize: 12.5 }}>Sin resultados para &ldquo;{q}&rdquo;</div>
            )}
          </div>
        </div>
      </div>

      {/* Popover */}
      {activeBlock && (
        <BlockPreviewPopover
          key={activeBlock.type}
          block={activeBlock}
          top={popTop}
          panelLeftEdge={POPOVER_LEFT}
          onClose={() => { setPinned(false); setActiveId(null) }}
          onAdd={() => handleAdd(activeBlock)}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          isLocked={activeBlock.tag === 'pro' && plan === 'free'}
          onUpgrade={() => { setPinned(false); setActiveId(null); setUpgradeOpen(true) }}
        />
      )}

      <UpgradeProModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Bloque premium"
        description="Este bloque está disponible en el plan Pro. Actualiza para añadir bloques premium a tus páginas."
      />
    </>
  )
}
