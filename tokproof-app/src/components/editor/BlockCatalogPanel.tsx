'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus, Lock, Clock, Search } from 'lucide-react'
import UpgradeProModal from '@/components/shared/UpgradeProModal'
import type { LandingBlock } from '@/types/landing'
import type { Plan } from '@/lib/plans'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  purple: '#7c3aed', purple2: '#8b5cf6', purpleTint: '#f3effe', purpleTint2: '#ede7fd',
  pink: '#e0398d',
  ink: '#1f2430', ink2: '#374151', gray: '#6b7280', gray2: '#9ca3af',
  line: '#eceef2', line2: '#e6e3ec',
  canvas: '#fbf9fc', card: '#FFFFFF',
  green: '#16a34a', greenBg: '#dcfce7',
} as const

// ─── Block catalog definitions ────────────────────────────────────────────────
interface CatalogBlock {
  type: LandingBlock['type']
  label: string
  desc: string
  long: string
  tag: 'free' | 'pro' | 'soon'
  ideal: string[]
  emoji: string
  colors: [string, string]
  defaultData: LandingBlock['data']
}

const CATALOG: CatalogBlock[] = [
  {
    type: 'hero_product', label: 'Hero del producto', tag: 'free', emoji: '🏷️',
    colors: ['#FDF2F8', '#FCE7F3'],
    desc: 'Imagen, titular y descripción del producto.',
    long: 'Bloque principal de tu página. Muestra imagen, headline impactante y descripción para convertir desde el primer scroll.',
    ideal: ['E-commerce', 'Dropshipping', 'Marcas'],
    defaultData: { headline: 'Nuevo titular', subheadline: '', description: '', imageUrl: '', badgeText: '★ 4.9/5', showBadge: true, showRating: true, rating: '4.9' },
  },
  {
    type: 'benefits', label: 'Beneficios', tag: 'free', emoji: '✨',
    colors: ['#F0FDF4', '#DCFCE7'],
    desc: 'Lista de ventajas con iconos y texto.',
    long: 'Presenta las características clave con iconos visuales para convencer al visitante antes del CTA.',
    ideal: ['Todos', 'E-commerce', 'Servicios'],
    defaultData: { title: 'Por qué elegirlo', items: [{ icon: '✨', title: 'Beneficio 1', description: 'Descripción del beneficio.' }] },
  },
  {
    type: 'cta', label: 'Botón CTA', tag: 'free', emoji: '🛒',
    colors: ['#F5F3FF', '#EDE9FE'],
    desc: 'Botón de llamada a la acción con URL.',
    long: 'Añade un botón de compra o acción destacado con tu URL de destino, texto personalizado y estilo de marca.',
    ideal: ['E-commerce', 'Afiliados', 'Landing pages'],
    defaultData: { text: '🛒 Comprar ahora', subtext: '', url: '', style: 'gradient' },
  },
  {
    type: 'link_list', label: 'Lista de links', tag: 'free', emoji: '🔗',
    colors: ['#EFF6FF', '#DBEAFE'],
    desc: 'Múltiples botones de enlace.',
    long: 'Añade varios links de forma ordenada. Perfecto para bio pages o múltiples destinos de afiliación.',
    ideal: ['Creadores', 'Afiliados', 'Multi-producto'],
    defaultData: { title: 'Links', links: [{ id: 'link_new', label: 'Mi link', url: '', visible: true }] },
  },
  {
    type: 'faq', label: 'Preguntas frecuentes', tag: 'free', emoji: '❓',
    colors: ['#FFF7ED', '#FFEDD5'],
    desc: 'Acordeón de FAQ para resolver dudas.',
    long: 'Reduce el abandono respondiendo las dudas más comunes. Formato acordeón interactivo.',
    ideal: ['E-commerce', 'Servicios', 'SaaS'],
    defaultData: { title: 'Preguntas frecuentes', items: [{ id: 'faq_new', question: '¿Pregunta frecuente?', answer: 'Respuesta clara y concisa.' }] },
  },
  {
    type: 'profile_header', label: 'Profile Header', tag: 'free', emoji: '👤',
    colors: ['#F0F9FF', '#E0F2FE'],
    desc: 'Avatar, nombre y bio de creador.',
    long: 'Muestra tu perfil con foto, nombre y descripción. Ideal para creadores de contenido e influencers.',
    ideal: ['Creadores', 'Influencers', 'Freelancers'],
    defaultData: { avatarUrl: '', displayName: 'Tu Nombre', username: 'tuusuario', verifiedBadge: true, bio: 'Creador de contenido 🌟', location: '' },
  },
  {
    type: 'social_links', label: 'Redes Sociales', tag: 'free', emoji: '📱',
    colors: ['#FDF4FF', '#FAE8FF'],
    desc: 'Iconos de redes sociales con links.',
    long: 'Muestra tus perfiles de TikTok, Instagram, YouTube y más con iconos elegantes y enlaces directos.',
    ideal: ['Creadores', 'Marcas', 'Negocios'],
    defaultData: { links: [{ id: 'sl_tt', platform: 'tiktok' as const, url: '', enabled: true }, { id: 'sl_ig', platform: 'instagram' as const, url: '', enabled: true }] },
  },
  {
    type: 'product_grid', label: 'Product Grid', tag: 'pro', emoji: '📦',
    colors: ['#FFFBEB', '#FEF3C7'],
    desc: 'Cuadrícula de productos con precios.',
    long: 'Muestra varios productos en una cuadrícula visual con precio, imagen y botón de compra.',
    ideal: ['E-commerce', 'Dropshipping', 'Catálogos'],
    defaultData: { title: 'Nuestros productos', subtitle: '', products: [{ id: 'p_1', imageUrl: '', title: 'Producto 1', price: '29.99€', compareAtPrice: '', url: '', badge: 'Nuevo', description: '' }] },
  },
  {
    type: 'trust_badges', label: 'Trust Badges', tag: 'pro', emoji: '🛡️',
    colors: ['#F0FDF4', '#DCFCE7'],
    desc: 'Badges de confianza y garantías.',
    long: 'Refuerza la confianza con badges de envío gratis, pago seguro, garantía y devoluciones.',
    ideal: ['E-commerce', 'Tiendas', 'SaaS'],
    defaultData: { badges: [{ id: 'tb1', icon: 'shipping' as const, title: 'Envío gratis', description: 'En pedidos +20€', enabled: true }, { id: 'tb2', icon: 'secure' as const, title: 'Pago seguro', description: 'SSL 256 bits', enabled: true }] },
  },
  {
    type: 'comparison', label: 'Comparativa', tag: 'pro', emoji: '⚖️',
    colors: ['#EFF6FF', '#DBEAFE'],
    desc: 'Tabla de comparación vs competidores.',
    long: 'Muestra por qué tu producto es mejor con una comparativa visual que destaca tus ventajas.',
    ideal: ['E-commerce', 'SaaS', 'Servicios'],
    defaultData: { title: 'Por qué elegirnos', leftTitle: 'Otros', rightTitle: 'Nosotros', rows: [{ id: 'cr1', label: 'Calidad', leftValue: 'Media', rightValue: 'Premium', winner: 'right' as const }] },
  },
  {
    type: 'urgency_offer', label: 'Urgencia / Oferta', tag: 'pro', emoji: '🔥',
    colors: ['#FFF7ED', '#FFEDD5'],
    desc: 'Banner de urgencia con oferta limitada.',
    long: 'Crea urgencia con un banner de oferta limitada y badge para impulsar la decisión de compra.',
    ideal: ['E-commerce', 'Flash sales', 'Promociones'],
    defaultData: { title: '¡Oferta limitada!', description: 'Solo por tiempo limitado.', badgeText: '🔥 Agotándose', countdownEnabled: false, countdownText: 'Quedan 2 horas', ctaText: '🛒 Aprovechar oferta', ctaUrl: '' },
  },
  {
    type: 'footer_legal', label: 'Footer Legal', tag: 'free', emoji: '📋',
    colors: ['#F9FAFB', '#F3F4F6'],
    desc: 'Footer con información legal y contacto.',
    long: 'Añade un pie de página profesional con links a política de privacidad, términos y email de contacto.',
    ideal: ['Todos', 'E-commerce', 'Negocios'],
    defaultData: { brandName: 'Mi Marca', contactEmail: 'hola@mimarca.com', privacyUrl: '', termsUrl: '', showTokproofBranding: true, legalText: '' },
  },
]

const BADGE_CONFIG = {
  free: { label: 'Free',       bg: '#dcfce7', tx: '#16a34a', lock: false },
  pro:  { label: 'Pro',        bg: '#ede7fd', tx: '#7c3aed', lock: true  },
  soon: { label: 'Próximamente', bg: '#eef0f3', tx: '#8b8f98', lock: false },
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ tag, small = false }: { tag: 'free' | 'pro' | 'soon'; small?: boolean }) {
  const c = BADGE_CONFIG[tag]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: c.bg, color: c.tx, fontSize: small ? 9.5 : 10.5, fontWeight: 700, padding: small ? '2px 6px' : '3px 8px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {c.label}
      {c.lock && <Lock size={small ? 9 : 10} strokeWidth={2.5} />}
    </span>
  )
}

// ─── Block thumbnail ──────────────────────────────────────────────────────────
function BlockThumb({ block, big = false }: { block: CatalogBlock; big?: boolean }) {
  const [bg1, bg2] = block.colors
  const h = big ? 138 : 78
  const emojiSize = big ? 38 : 22
  return (
    <div style={{
      width: big ? '100%' : 52, height: h, borderRadius: big ? 11 : 8, flexShrink: 0,
      background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
      border: '1px solid rgba(0,0,0,.07)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: big ? 10 : 5,
    }}>
      <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{block.emoji}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: big ? '52%' : '68%' }}>
        <div style={{ height: big ? 4.5 : 3, borderRadius: 2, background: 'rgba(0,0,0,.13)' }} />
        <div style={{ height: big ? 4.5 : 3, width: '70%', borderRadius: 2, background: 'rgba(0,0,0,.08)' }} />
        {big && <div style={{ height: 4.5, width: '55%', borderRadius: 2, background: 'rgba(0,0,0,.06)' }} />}
      </div>
      {big && (
        <div style={{ width: '44%', height: 9, borderRadius: 5, background: `rgba(124,58,237,.28)` }} />
      )}
    </div>
  )
}

// ─── Preview popover ──────────────────────────────────────────────────────────
interface PopoverProps {
  block: CatalogBlock
  top: number
  pinned: boolean
  panelLeftEdge: number
  onClose: () => void
  onAdd: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  isLocked: boolean
  onUpgrade: () => void
}

function BlockPreviewPopover({ block, top, pinned: _pinned, panelLeftEdge, onClose, onAdd, onMouseEnter, onMouseLeave, isLocked, onUpgrade }: PopoverProps) {
  const H = 430
  const clampedTop = Math.max(64, Math.min(top, (typeof window !== 'undefined' ? window.innerHeight : 800) - H - 12))
  const soon = block.tag === 'soon'

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="bc-popover"
      style={{
        position: 'fixed', left: panelLeftEdge + 8, top: clampedTop, width: 300,
        background: T.card, borderRadius: 18, border: '1px solid #efe9f6',
        boxShadow: '0 24px 60px -18px rgba(60,30,90,.32), 0 4px 14px rgba(60,30,90,.10)',
        zIndex: 60, overflow: 'hidden',
      }}
    >
      {/* Arrow */}
      <div style={{ position: 'absolute', left: -7, top: 32, width: 14, height: 14, background: T.card, borderLeft: '1px solid #efe9f6', borderBottom: '1px solid #efe9f6', transform: 'rotate(45deg)' }} />

      {/* Header */}
      <div style={{ padding: '14px 14px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15.5, fontWeight: 800, color: T.ink, letterSpacing: '-.01em' }}>{block.label}</span>
          <Badge tag={block.tag} />
        </div>
        <button onClick={onClose} style={{ color: T.gray2, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 3, borderRadius: 7, flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f2f3f5'; (e.currentTarget as HTMLButtonElement).style.color = '#5b5566' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = T.gray2 }}>
          <X size={16} />
        </button>
      </div>

      {/* Thumbnail */}
      <div style={{ padding: '11px 14px 0' }}>
        <div style={{ borderRadius: 13, padding: 11, background: 'linear-gradient(160deg,#faf6fe,#f5eefb)', border: '1px solid #efe6f8' }}>
          <BlockThumb block={block} big />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '11px 14px 14px' }}>
        <p style={{ margin: 0, fontSize: 12.5, color: T.gray, lineHeight: 1.45 }}>{block.long}</p>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', color: T.gray2, marginTop: 11, textTransform: 'uppercase' }}>Ideal para</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 7 }}>
          {block.ideal.map(t => (
            <span key={t} style={{ fontSize: 11, fontWeight: 600, color: T.ink2, background: '#f6f4f9', border: '1px solid #ece8f2', padding: '4px 10px', borderRadius: 14 }}>{t}</span>
          ))}
        </div>

        {/* CTA */}
        {soon ? (
          <button disabled style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#eef0f3', color: '#a4a9b2', fontSize: 13.5, fontWeight: 700, padding: '12px', borderRadius: 11, border: 'none', cursor: 'not-allowed' }}>
            <Clock size={15} /> Disponible pronto
          </button>
        ) : isLocked ? (
          <button onClick={onUpgrade} style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', fontSize: 13.5, fontWeight: 700, padding: '12px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,165,0,.3)' }}>
            <Lock size={15} /> Actualizar a Pro
          </button>
        ) : (
          <button onClick={onAdd} style={{ width: '100%', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'linear-gradient(180deg,#8b5cf6,#7c3aed)', color: '#fff', fontSize: 13.5, fontWeight: 700, padding: '12px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 8px 18px rgba(124,58,237,.32)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 24px rgba(124,58,237,.44)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 18px rgba(124,58,237,.32)'}>
            <Plus size={16} strokeWidth={2.5} /> Añadir bloque
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  plan?: Plan
  /** px from screen-left where the catalog panel starts */
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

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  // Click outside to close pinned popover
  useEffect(() => {
    if (!pinned) return
    const fn = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('.bc-popover') || t.closest('[data-bc-card]')) return
      setPinned(false)
      setActiveId(null)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [pinned])

  function scheduleClose() {
    leaveTimer.current = setTimeout(() => {
      if (!pinned) { setActiveId(null) }
    }, 140)
  }
  function cancelClose() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }

  function handleCardHover(type: string, el: HTMLElement) {
    cancelClose()
    if (pinned) return
    const r = el.getBoundingClientRect()
    setPopTop(r.top)
    setActiveId(type)
  }
  function handleCardLeave() { scheduleClose() }

  function handleCardClick(type: string, el: HTMLElement) {
    cancelClose()
    const r = el.getBoundingClientRect()
    setPopTop(r.top)
    setActiveId(type)
    setPinned(true)
  }

  function handleAdd(block: CatalogBlock) {
    onAdd(block.type, block.defaultData)
    setPinned(false)
    setActiveId(null)
  }

  const POPOVER_LEFT = panelLeftEdge + 320 // catalog panel is 320px wide

  return (
    <>
      <style>{`
        @keyframes bcSlideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes bcPopIn   { from { opacity:0; transform:translateY(6px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .bc-panel  { animation: bcSlideIn .17s cubic-bezier(.2,.8,.3,1) both; }
        .bc-popover{ animation: bcPopIn   .16s cubic-bezier(.2,.8,.3,1) both; }
        .bc-card   { transition: border-color .14s, box-shadow .14s, transform .14s, background .14s; }
        .bc-card:hover { border-color: #d9c9f7 !important; box-shadow: 0 9px 22px rgba(124,58,237,.11) !important; transform: translateY(-1px); }
      `}</style>

      {/* Catalog panel */}
      <div className="bc-panel" style={{
        width: 320, flexShrink: 0, background: T.card,
        borderRight: `1px solid ${T.line}`,
        display: 'flex', flexDirection: 'column', zIndex: 20,
        height: '100vh', overflowY: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-.02em', color: T.ink }}>Bloques</h2>
            <button onClick={onClose} style={{ color: T.gray2, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 8 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f2f3f5'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
              <X size={19} />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.gray2, pointerEvents: 'none' }} />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Buscar bloque..."
              style={{ width: '100%', border: `1px solid ${T.line2}`, borderRadius: 10, padding: '9px 11px 9px 34px', fontSize: 13, outline: 'none', background: '#fafbfc', color: T.ink, fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#cbb8f5'}
              onBlur={e => e.target.style.borderColor = T.line2}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6, marginTop: 11, flexWrap: 'wrap' }}>
            {(['todos', 'free', 'pro'] as const).map(k => (
              <button key={k} onClick={() => setFilter(k)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: filter === k ? T.purple : '#f3f4f6',
                color: filter === k ? '#fff' : T.ink2,
                transition: 'all .12s',
              }}>
                {k === 'todos' ? 'Todos' : k === 'free' ? 'Free' : 'Pro'}
                {k === 'pro' && <Lock size={10} strokeWidth={2.5} style={{ opacity: .85 }} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '3px 16px 0', marginTop: 12, fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', color: T.gray2, flexShrink: 0 }}>POPULARES</div>

        {/* Block list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.map(b => {
              const active = activeId === b.type
              const locked = b.tag === 'pro' && plan === 'free'
              return (
                <div
                  key={b.type}
                  data-bc-card={b.type}
                  className="bc-card"
                  onMouseEnter={e => handleCardHover(b.type, e.currentTarget as HTMLElement)}
                  onMouseLeave={handleCardLeave}
                  onClick={e => handleCardClick(b.type, e.currentTarget as HTMLElement)}
                  style={{
                    display: 'flex', gap: 12, padding: '11px 12px',
                    borderRadius: 14, cursor: 'pointer', alignItems: 'center',
                    border: `1.5px solid ${active ? '#c4a9f4' : T.line}`,
                    background: active ? '#f3effe' : T.card,
                    opacity: b.tag === 'soon' ? .75 : 1,
                    boxShadow: active ? '0 10px 24px rgba(124,58,237,.12)' : '0 1px 2px rgba(20,20,40,.03)',
                  }}
                >
                  <BlockThumb block={b} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
                      <span style={{ marginLeft: 'auto' }}><Badge tag={locked ? 'pro' : b.tag} small /></span>
                    </div>
                    <div style={{ fontSize: 12, color: T.gray, marginTop: 4, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {b.desc}
                    </div>
                  </div>
                </div>
              )
            })}
            {list.length === 0 && (
              <div style={{ padding: '28px 0', textAlign: 'center', color: T.gray2, fontSize: 12.5 }}>Sin resultados</div>
            )}
          </div>
        </div>
      </div>

      {/* Preview popover */}
      {activeBlock && (
        <BlockPreviewPopover
          key={activeBlock.type}
          block={activeBlock}
          top={popTop}
          pinned={pinned}
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
