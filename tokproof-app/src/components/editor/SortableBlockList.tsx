'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import type { Plan } from '@/lib/plans'
import { GlowThumb } from '@/components/editor/GlowThumb'
import UpgradeProModal from '@/components/shared/UpgradeProModal'
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Eye, EyeOff, Copy, Trash2, ChevronDown, Plus, RotateCcw,
  X, Search, Lock,
  Tag, Star, HelpCircle, ShoppingCart, Link2, User, Share2,
  LayoutGrid, Shield, BarChart2, Zap, FileText, Package, Info, Gift, Layers, MessageCircle,
} from 'lucide-react'
import type {
  LandingBlock, LandingTheme, BlockStyle,
  HeroProductData, HeroMedia, BenefitsData, BenefitItem,
  LinkListData, LinkItem,
  FAQData, FaqItem,
  CTAData,
  ProfileHeaderData,
  SocialLinksData, SocialLink, SocialPlatform,
  ProductGridData, ProductItem,
  TrustBadgesData, TrustBadge, TrustBadgeIcon,
  ComparisonData, ComparisonRow,
  UrgencyOfferData,
  FooterLegalData,
  FeaturedProductData,
  PartnerDiscountsData,
  PartnerDiscount,
  PDColors,
  BeforeAfterData,
  BeforeAfterColors,
  TikTokCommentsData,
  TikTokComment,
  TikTokReply,
  TikTokCommentsColors,
} from '@/types/landing'
import { FONT_OPTIONS } from '@/lib/blockStyle'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  pink: '#F647A9', purple: '#7B61FF',
  ink: '#171717', ink2: '#6B7280', ink3: '#9CA3AF',
  border: 'rgba(123,97,255,0.10)', border2: 'rgba(123,97,255,0.16)',
  softPink2: '#FFE3F1', card: '#FFFFFF', bg: '#FEFBFF',
  red: '#EF4444', redBg: 'rgba(239,68,68,.06)', redBorder: 'rgba(239,68,68,.2)',
} as const

// ─── Inline block catalog ─────────────────────────────────────────────────────
interface CatalogEntry {
  type: string
  label: string
  desc: string
  tag: 'free' | 'pro' | 'soon'
  defaultData?: LandingBlock['data']
}
const BLOCKS_CATALOG: CatalogEntry[] = [
  { type: 'hero_product',   label: 'Hero del producto',    tag: 'free', desc: 'Imagen, titular y descripción del producto.',  defaultData: { headline: 'Nuevo titular', subheadline: '', description: '', imageUrl: '', badgeText: '★ 4.9/5', showBadge: true, showRating: true, rating: '4.9' } },
  { type: 'benefits',       label: 'Beneficios',           tag: 'free', desc: 'Lista de ventajas con iconos y texto.',         defaultData: { title: 'Por qué elegirlo', items: [{ icon: '✨', title: 'Beneficio 1', description: 'Descripción.' }] } },
  { type: 'cta',            label: 'Botón CTA',            tag: 'free', desc: 'Botón de llamada a la acción con URL.',         defaultData: { text: '🛒 Comprar ahora', subtext: '', url: '', style: 'gradient' } },
  { type: 'link_list',      label: 'Lista de links',       tag: 'free', desc: 'Múltiples botones de enlace en columna.',       defaultData: { title: 'Links', links: [{ id: 'link_new', label: 'Mi link', url: '', visible: true }] } },
  { type: 'faq',            label: 'Preguntas frecuentes', tag: 'free', desc: 'Acordeón de FAQ para resolver dudas.',          defaultData: { title: 'Preguntas frecuentes', items: [{ id: 'faq_new', question: '¿Pregunta?', answer: 'Respuesta.' }] } },
  { type: 'profile_header', label: 'Profile Header',       tag: 'free', desc: 'Avatar, nombre y bio de creador.',             defaultData: { avatarUrl: '', displayName: 'Tu Nombre', username: 'tuusuario', verifiedBadge: true, bio: 'Creador de contenido 🌟', location: '' } },
  { type: 'social_links',   label: 'Redes Sociales',       tag: 'free', desc: 'Iconos de redes sociales con links.',          defaultData: { links: [{ id: 'sl_tt', platform: 'tiktok' as const, url: '', enabled: true }, { id: 'sl_ig', platform: 'instagram' as const, url: '', enabled: true }] } },
  { type: 'footer_legal',   label: 'Footer Legal',         tag: 'free', desc: 'Footer con info legal y contacto.',            defaultData: { brandName: 'Mi Marca', contactEmail: 'hola@mimarca.com', privacyUrl: '', termsUrl: '', showTokproofBranding: true, legalText: '' } },
  { type: 'product_grid',   label: 'Product Grid',         tag: 'pro',  desc: 'Cuadrícula de productos con precios.',         defaultData: { title: 'Nuestros productos', subtitle: '', products: [{ id: 'p_1', imageUrl: '', title: 'Producto 1', price: '29.99€', compareAtPrice: '', url: '', badge: 'Nuevo', description: '' }] } },
  { type: 'trust_badges',   label: 'Trust Badges',         tag: 'pro',  desc: 'Badges de confianza y garantías.',             defaultData: { badges: [{ id: 'tb1', icon: 'shipping' as const, title: 'Envío gratis', description: 'En pedidos +20€', enabled: true }, { id: 'tb2', icon: 'secure' as const, title: 'Pago seguro', description: 'SSL 256 bits', enabled: true }] } },
  { type: 'comparison',     label: 'Comparativa',          tag: 'pro',  desc: 'Tabla comparativa vs competidores.',           defaultData: { title: 'Por qué elegirnos', leftTitle: 'Otros', rightTitle: 'Nosotros', rows: [{ id: 'cr1', label: 'Calidad', leftValue: 'Media', rightValue: 'Premium', winner: 'right' as const }] } },
  { type: 'urgency_offer',  label: 'Urgencia / Oferta',    tag: 'pro',  desc: 'Banner de urgencia con oferta limitada.',      defaultData: { title: '¡Oferta limitada!', description: 'Solo por tiempo limitado.', badgeText: '🔥 Agotándose', countdownEnabled: false, countdownText: 'Quedan 2 horas', ctaText: '🛒 Aprovechar oferta', ctaUrl: '' } },
  { type: 'featured_product', label: 'Product Showcase',   tag: 'pro',  desc: 'Destaca tu producto estrella con imagen, precio y CTA.', defaultData: { imageUrl: '', badgeText: 'Más vendido 🔥', productName: 'Hair Growth Serum', description: 'Fórmula avanzada con ingredientes naturales para fortalecer el cabello desde la raíz.', rating: 4.9, reviewCount: '2.4K', price: '$29.99', compareAtPrice: '$39.99', discountText: '-25%', benefits: ['Estimula el crecimiento capilar', 'Ingredientes 100% naturales', 'Resultados visibles en 7 días'], buttonText: 'Ver producto', buttonUrl: '', showBadge: true, showRating: true, showReviews: true, showPrice: true, showCompareAtPrice: true, showDiscount: true, showBenefits: true, layout: 'card', colorTheme: 'light', buttonStyle: 'filled' } },
  { type: 'testimonials',   label: 'Testimonials',         tag: 'soon', desc: 'Carrusel de reseñas reales de clientes.' },
  { type: 'video_featured', label: 'YouTube Featured',     tag: 'soon', desc: 'Video de YouTube incrustado en la página.' },
  { type: 'partner_discounts', label: 'Partner Discounts', tag: 'free', desc: 'Muestra códigos de descuento y ofertas exclusivas de tus partners.', defaultData: { title: 'Descuentos de nuestros partners', subtitle: 'Ahorra en tus marcas favoritas con códigos exclusivos. 🎁', badgeText: '♦ Ofertas exclusivas', footerText: 'Nuevas ofertas cada semana', layout: 'compact', showLogos: true, showDescriptions: false, showCopyButton: true, showExternalButton: true, showFooterText: true, discounts: [{ id: 'pd1', brandName: 'Gymshark', storeUrl: 'https://gymshark.com', logoUrl: '', description: 'En toda la tienda.', discountText: '15% OFF', code: 'GYM15', buttonText: 'Ver oferta', buttonUrl: 'https://gymshark.com', isPopular: true, enabled: true }, { id: 'pd2', brandName: 'LSKD', storeUrl: 'https://lskd.co', logoUrl: '', description: 'En pedidos superiores a $100.', discountText: '20% OFF', code: 'LSKD20', buttonText: 'Ver oferta', buttonUrl: 'https://lskd.co', isPopular: false, enabled: true }, { id: 'pd3', brandName: 'Alo Yoga', storeUrl: 'https://aloyoga.com', logoUrl: '', description: 'En toda la tienda.', discountText: '10% OFF', code: 'ALO10', buttonText: 'Ver oferta', buttonUrl: 'https://aloyoga.com', isPopular: false, enabled: true }] } },
  { type: 'tiktok_comments', label: 'TikTok Comments', tag: 'free', desc: 'Comentarios estilo TikTok para generar confianza y conversiones.', defaultData: { title: '', subtitle: '', badgeText: '', showTitle: false, showSubtitle: false, showBadge: false, layout: 'feed', comments: [{ id: 'tc1', avatarUrl: '', username: 'Tri G🌸🥰👣', verified: true, text: 'Quiero ver donde le entregan el pan🥰', imageUrl: '', likes: '13', date: '3 h', replyItems: [{ id: 'r1a', avatarUrl: '', username: 'GlowSkin Oficial 💗', verified: true, text: '¡Entregamos en toda España! Usa el código TIKTOK para un 15% off 📦', likes: '7', date: '2 h' }], showReply: true, showLikes: true, showReplies: true }, { id: 'tc2', avatarUrl: '', username: 'Mira que bonito', verified: false, text: 'Mira que bonito se le ven esos zapatitoosss', imageUrl: '', likes: '24.7 mil', date: '1 d', replyItems: [{ id: 'r2a', avatarUrl: '', username: 'Fashionista 💅', verified: false, text: 'Jajaja exactamente lo que yo dije!!', likes: '127', date: '22 h' }, { id: 'r2b', avatarUrl: '', username: 'Laura M.', verified: false, text: 'Son divinos 😍 yo ya los pedí', likes: '38', date: '1 d' }], showReply: true, showLikes: true, showReplies: true }, { id: 'tc3', avatarUrl: '', username: 'Antoni ⺣', verified: false, text: 'Necesito uno para mi michi 🤣', imageUrl: '', likes: '824', date: '2 d', replyItems: [], showReply: true, showLikes: true, showReplies: false }], showArrows: true, showDots: true, autoplay: false, autoplaySpeed: 3, borderRadius: 'soft', shadowIntensity: 'soft', spacing: 'normal' } },
  { type: 'before_after', label: 'Before / After', tag: 'free', desc: 'Muestra transformaciones reales antes y después.', defaultData: { title: 'Resultados que puedes ver', subtitle: 'Mira la diferencia real después de usar nuestro producto.', badgeText: 'Transformación real', mode: 'cards', beforeImageUrl: '', afterImageUrl: '', beforeLabel: 'Antes', afterLabel: 'Después', beforeDescription: 'Cabello seco, sin brillo y con frizz.', afterDescription: 'Cabello hidratado, brillante y saludable.', showBadge: true, showSubtitle: true, showDescriptions: true, showCTA: false, buttonText: 'Ver producto', buttonUrl: 'https://tutienda.com/producto', borderRadius: 'soft', shadowIntensity: 'soft' } },
]

// ─── Small badge for catalog cards ────────────────────────────────────────────
function SBadge({ tag }: { tag: 'free' | 'pro' | 'soon' }) {
  const { t } = useTranslation()
  const cfg = {
    free: { label: 'Free',           bg: '#dcfce7', tx: '#16a34a', lock: false },
    pro:  { label: 'Pro',            bg: '#ede7fd', tx: '#7c3aed', lock: true  },
    soon: { label: t('block.soon'),  bg: '#eef0f3', tx: '#8b8f98', lock: false },
  }
  const c = cfg[tag]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: c.bg, color: c.tx, fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 5, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {c.label}{c.lock && <Lock size={9} strokeWidth={2.5} />}
    </span>
  )
}

// ─── Inline catalog card ──────────────────────────────────────────────────────
// Hover → muestra popover | Click → añade bloque directamente
function InlineBlockCard({ entry, plan, isActive, onAdd, onUpgrade, onHover, onLeave }: {
  entry: CatalogEntry; plan: Plan; isActive: boolean
  onAdd: (type: LandingBlock['type'], data: LandingBlock['data']) => void
  onUpgrade: () => void
  onHover: (entry: CatalogEntry, el: HTMLElement) => void
  onLeave: () => void
}) {
  const isSoon   = entry.tag === 'soon'
  const isLocked = entry.tag === 'pro' && plan === 'free'

  function handleClick() {
    if (isSoon) return
    if (isLocked) { onUpgrade(); return }
    if (entry.defaultData) onAdd(entry.type as LandingBlock['type'], entry.defaultData)
  }

  return (
    <div
      data-bc-card={entry.type}
      onMouseEnter={e => { if (!isSoon) onHover(entry, e.currentTarget as HTMLElement) }}
      onMouseLeave={onLeave}
      onClick={handleClick}
      style={{
        display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 10,
        cursor: isSoon ? 'default' : 'pointer', marginBottom: 5,
        border: `1.5px solid ${isActive ? '#c4a9f4' : 'rgba(123,97,255,0.12)'}`,
        background: isActive ? '#f3effe' : '#fefbff',
        opacity: isSoon ? 0.6 : 1,
        boxShadow: isActive ? '0 6px 16px rgba(124,58,237,.10)' : 'none',
        transition: 'border-color .13s, box-shadow .13s, background .13s',
        alignItems: 'center',
      }}
    >
      <GlowThumb type={entry.type} size="list" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.label}</span>
          <SBadge tag={entry.tag} />
        </div>
        <span style={{ fontSize: 11, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{entry.desc}</span>
      </div>
      {!isSoon && !isLocked && (
        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#f3effe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Plus size={13} color="#7c3aed" strokeWidth={2.5} />
        </div>
      )}
    </div>
  )
}

// ─── Floating preview popover (position: fixed — escapa overflow del panel) ──
const CATALOG_DESC_LONG: Record<string, string> = {
  hero_product:   'Bloque principal de tu página. Muestra imagen, headline impactante y descripción para convertir desde el primer scroll.',
  benefits:       'Presenta las características clave con iconos visuales para convencer al visitante antes del CTA.',
  cta:            'Añade un botón de compra o acción destacado con tu URL de destino, texto personalizado y estilo de marca.',
  link_list:      'Añade varios links de forma ordenada. Perfecto para bio pages o múltiples destinos de afiliación.',
  faq:            'Reduce el abandono respondiendo las dudas más comunes. Formato acordeón interactivo.',
  profile_header: 'Muestra tu perfil con foto, nombre y descripción. Ideal para creadores de contenido e influencers.',
  social_links:   'Muestra tus perfiles de TikTok, Instagram, YouTube y más con iconos elegantes y enlaces directos.',
  footer_legal:   'Añade un pie de página profesional con links a política de privacidad, términos y email de contacto.',
  product_grid:   'Muestra varios productos en una cuadrícula visual con precio, imagen y botón de compra.',
  trust_badges:   'Refuerza la confianza con badges de envío gratis, pago seguro, garantía y devoluciones.',
  comparison:     'Muestra por qué tu producto es mejor con una comparativa visual que destaca tus ventajas.',
  urgency_offer:  'Crea urgencia con un banner de oferta limitada y badge para impulsar la decisión de compra.',
  featured_product: 'Destaca un producto estrella con imagen, precio, reseñas, beneficios y botón de compra.',
  testimonials:   'Carrusel de reseñas reales para reforzar la prueba social de tu marca.',
  video_featured: 'Incrusta tu mejor video de YouTube para generar confianza al instante.',
  partner_discounts: 'Muestra códigos de descuento y ofertas exclusivas de tus partners. Ideal para afiliados, e-commerce e influencers.',
  before_after: 'Enseña el impacto visual de tu producto con un bloque antes/después. Modo Cards (Free) o Slider interactivo (Pro).',
  tiktok_comments: 'Feed de comentarios auténticos al estilo TikTok. Genera más confianza que los testimonios clásicos. Feed vertical (Free) o Carousel (Pro).',
}
const CATALOG_IDEAL: Record<string, string[]> = {
  hero_product:   ['E-commerce', 'Marcas', 'Dropshipping'],
  benefits:       ['Todos', 'E-commerce', 'Servicios'],
  cta:            ['E-commerce', 'Afiliados', 'Landing pages'],
  link_list:      ['Creadores', 'Afiliados', 'Bio pages'],
  faq:            ['E-commerce', 'Servicios', 'SaaS'],
  profile_header: ['Creadores', 'Influencers', 'Freelancers'],
  social_links:   ['Creadores', 'Marcas', 'Negocios'],
  footer_legal:   ['Todos', 'E-commerce', 'Negocios'],
  product_grid:   ['E-commerce', 'Catálogos', 'Dropshipping'],
  trust_badges:   ['E-commerce', 'Tiendas', 'SaaS'],
  comparison:     ['E-commerce', 'SaaS', 'Servicios'],
  urgency_offer:  ['E-commerce', 'Flash sales', 'Promociones'],
  featured_product: ['E-commerce', 'Afiliados', 'Beauty', 'Fitness'],
  testimonials:   ['E-commerce', 'Servicios', 'Marcas'],
  video_featured: ['Creadores', 'Educadores', 'Marcas'],
  partner_discounts: ['E-commerce', 'Afiliados', 'Creadores', 'Fitness', 'Beauty'],
  before_after: ['Beauty', 'Hair care', 'Skincare', 'Fitness', 'E-commerce'],
  tiktok_comments: ['Beauty', 'E-commerce', 'Ropa', 'Mascotas', 'Viral'],
}

function BlockPreviewPopover({ entry, top, left, onClose, onAdd, onMouseEnter, onMouseLeave, plan, onUpgrade }: {
  entry: CatalogEntry; top: number; left: number
  onClose: () => void
  onAdd: (type: LandingBlock['type'], data: LandingBlock['data']) => void
  onMouseEnter: () => void; onMouseLeave: () => void
  plan: Plan; onUpgrade: () => void
}) {
  const { t } = useTranslation()
  const H = 440
  const safeTop = Math.max(64, Math.min(top, (typeof window !== 'undefined' ? window.innerHeight : 800) - H - 12))
  const isSoon   = entry.tag === 'soon'
  const isLocked = entry.tag === 'pro' && plan === 'free'
  const cfg = {
    free: { label: 'Free',              bg: '#dcfce7', tx: '#16a34a', lock: false },
    pro:  { label: 'Pro',              bg: '#ede7fd', tx: '#7c3aed', lock: true  },
    soon: { label: t('block.soon'),    bg: '#eef0f3', tx: '#8b8f98', lock: false },
  }
  const bc = cfg[entry.tag]

  return (
    <div
      className="blk-popover"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed', left: left, top: safeTop, width: 296,
        background: '#fff', borderRadius: 18,
        border: '1px solid #efe9f6',
        boxShadow: '0 24px 60px -18px rgba(60,30,90,.30), 0 4px 14px rgba(60,30,90,.09)',
        zIndex: 9999, overflow: 'hidden',
        animation: 'blkPopIn .15s cubic-bezier(.2,.8,.3,1) both',
      }}
    >
      {/* Arrow pointing left */}
      <div style={{ position: 'absolute', left: -7, top: 30, width: 14, height: 14, background: '#fff', borderLeft: '1px solid #efe9f6', borderBottom: '1px solid #efe9f6', transform: 'rotate(45deg)', zIndex: 1 }} />

      {/* Header */}
      <div style={{ padding: '14px 14px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: '#1f2430', letterSpacing: '-.01em' }}>{entry.label}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: bc.bg, color: bc.tx, fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>
            {bc.label}{bc.lock && <Lock size={10} strokeWidth={2.5} />}
          </span>
        </div>
        <button onClick={onClose}
          style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 3, borderRadius: 7, flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f2f3f5'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
          <X size={16} />
        </button>
      </div>

      {/* Thumbnail */}
      <div style={{ padding: '11px 14px 0' }}>
        <div style={{ borderRadius: 13, padding: 10, background: 'linear-gradient(160deg,#faf6fe,#f5eefb)', border: '1px solid #efe6f8' }}>
          <GlowThumb type={entry.type} size="popover" />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 14px 14px' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.45 }}>
          {CATALOG_DESC_LONG[entry.type] ?? entry.desc}
        </p>

        {(CATALOG_IDEAL[entry.type]?.length ?? 0) > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', color: '#9ca3af', marginTop: 10, textTransform: 'uppercase' }}>{t('block.idealFor')}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
              {(CATALOG_IDEAL[entry.type] ?? []).map(t => (
                <span key={t} style={{ fontSize: 10.5, fontWeight: 600, color: '#374151', background: '#f6f4f9', border: '1px solid #ece8f2', padding: '3px 9px', borderRadius: 12 }}>{t}</span>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        {isSoon ? (
          <button disabled style={{ width: '100%', marginTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#eef0f3', color: '#a4a9b2', fontSize: 13, fontWeight: 700, padding: '11px', borderRadius: 11, border: 'none', cursor: 'not-allowed' }}>
            {t('block.availableSoon')}
          </button>
        ) : isLocked ? (
          <button onClick={onUpgrade} style={{ width: '100%', marginTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '11px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 6px 14px rgba(255,165,0,.25)' }}>
            <Lock size={14} /> {t('block.upgradePro')}
          </button>
        ) : (
          <button
            onClick={() => { if (entry.defaultData) onAdd(entry.type as LandingBlock['type'], entry.defaultData) }}
            style={{ width: '100%', marginTop: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'linear-gradient(180deg,#8b5cf6,#7c3aed)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '11px', borderRadius: 11, border: 'none', cursor: 'pointer', boxShadow: '0 8px 18px rgba(124,58,237,.28)' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 22px rgba(124,58,237,.42)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 18px rgba(124,58,237,.28)'}>
            <Plus size={15} strokeWidth={2.5} /> {t('block.addBlock')}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Block icons ──────────────────────────────────────────────────────────────
const BLOCK_ICONS: Record<string, string> = {
  hero_product: '🏷️', benefits: '✨', tiktok_comments: '💬',
  reviews: '⭐', faq: '❓', cta: '🛒', link_list: '🔗',
  profile_header: '👤', social_links: '📱', product_grid: '📦',
  trust_badges: '🛡️', comparison: '⚖️', urgency_offer: '🔥', footer_legal: '📋',
  featured_product: '🌟',
  partner_discounts: '🏷️',
  before_after: '↔️',
}

// ─── Lucide icons por tipo de bloque (sin fondo, color alterno rosa/lila) ────
const BLOCK_LUCIDE: Record<string, React.ElementType> = {
  hero_product:   Tag,
  benefits:       Star,
  faq:            HelpCircle,
  cta:            ShoppingCart,
  link_list:      Link2,
  profile_header: User,
  social_links:   Share2,
  product_grid:   LayoutGrid,
  trust_badges:   Shield,
  comparison:     BarChart2,
  urgency_offer:   Zap,
  footer_legal:    FileText,
  featured_product:   Package,
  partner_discounts:  Gift,
  before_after:       Layers,
  tiktok_comments:    MessageCircle,
}
const ACCENT = ['#F647A9', '#8B5CF6'] // rosa, lila — alternan por índice

// ─── Block categories ─────────────────────────────────────────────────────────
interface BlockDef { type: LandingBlock['type']; label: string; defaultData: LandingBlock['data']; isPremium?: boolean }
const BLOCK_CATEGORIES: Array<{ label: string; blocks: BlockDef[] }> = [
  {
    label: 'General',
    blocks: [
      { type: 'hero_product',  label: 'Hero del producto',    defaultData: { headline: 'Nuevo titular', subheadline: '', description: '', imageUrl: '', badgeText: '★ 4.9/5', showBadge: true, showRating: true, rating: '4.9' } },
      { type: 'benefits',      label: 'Beneficios',           defaultData: { title: 'Por qué elegirlo', items: [{ icon: '✨', title: 'Beneficio 1', description: 'Descripción.' }] } },
      { type: 'faq',           label: 'Preguntas frecuentes', defaultData: { title: 'FAQ', items: [{ id: 'faq_new', question: '¿Pregunta?', answer: 'Respuesta.' }] } },
      { type: 'cta',           label: 'Botón CTA',            defaultData: { text: '🛒 Comprar ahora', subtext: '', url: '', style: 'gradient' } },
      { type: 'link_list',     label: 'Lista de links',        defaultData: { title: 'Links', links: [{ id: 'link_new', label: 'Mi link', url: '', visible: true }] } },
      { type: 'footer_legal',  label: 'Footer Legal',          defaultData: { brandName: 'Mi Marca', contactEmail: 'hola@mimarca.com', privacyUrl: '', termsUrl: '', showTokproofBranding: true, legalText: '' } },
    ],
  },
  {
    label: 'Ecommerce',
    blocks: [
      { type: 'featured_product', label: 'Product Showcase', isPremium: true, defaultData: { imageUrl: '', badgeText: 'Más vendido 🔥', productName: 'Hair Growth Serum', description: 'Fórmula avanzada con ingredientes naturales para fortalecer el cabello desde la raíz.', rating: 4.9, reviewCount: '2.4K', price: '$29.99', compareAtPrice: '$39.99', discountText: '-25%', benefits: ['Estimula el crecimiento capilar', 'Ingredientes 100% naturales', 'Resultados visibles en 7 días'], buttonText: 'Ver producto', buttonUrl: '', showBadge: true, showRating: true, showReviews: true, showPrice: true, showCompareAtPrice: true, showDiscount: true, showBenefits: true, layout: 'card', colorTheme: 'light', buttonStyle: 'filled' } },
      { type: 'product_grid',  label: 'Product Grid',       isPremium: true,  defaultData: { title: 'Nuestros productos', subtitle: '', products: [{ id: `p_${Date.now()}`, imageUrl: '', title: 'Producto 1', price: '29.99€', compareAtPrice: '', url: '', badge: 'Nuevo', description: '' }] } },
      { type: 'trust_badges',  label: 'Trust Badges',       isPremium: true,  defaultData: { badges: [{ id: 'tb1', icon: 'shipping', title: 'Envío gratis', description: 'En pedidos +20€', enabled: true }, { id: 'tb2', icon: 'secure', title: 'Pago seguro', description: 'SSL 256 bits', enabled: true }, { id: 'tb3', icon: 'guarantee', title: 'Garantía 30d', description: 'Sin preguntas', enabled: true }, { id: 'tb4', icon: 'returns', title: 'Devoluciones', description: 'Fáciles y gratis', enabled: true }] } },
      { type: 'comparison',    label: 'Comparativa',        isPremium: true,  defaultData: { title: 'Por qué elegirnos', leftTitle: 'Otros', rightTitle: 'Nosotros', rows: [{ id: 'cr1', label: 'Calidad', leftValue: 'Media', rightValue: 'Premium', winner: 'right' }, { id: 'cr2', label: 'Precio', leftValue: 'Caro', rightValue: 'Justo', winner: 'right' }, { id: 'cr3', label: 'Soporte', leftValue: 'Limitado', rightValue: '24/7', winner: 'right' }] } },
      { type: 'urgency_offer',    label: 'Urgencia / Oferta',  isPremium: true, defaultData: { title: '¡Oferta limitada!', description: 'Solo por tiempo limitado.', badgeText: '🔥 Agotándose', countdownEnabled: false, countdownText: 'Quedan 2 horas', ctaText: '🛒 Aprovechar oferta', ctaUrl: '' } },
      { type: 'partner_discounts', label: 'Partner Discounts', defaultData: { title: 'Descuentos de nuestros partners', subtitle: 'Ahorra en tus marcas favoritas con códigos exclusivos. 🎁', badgeText: '♦ Ofertas exclusivas', footerText: 'Nuevas ofertas cada semana', layout: 'compact', showLogos: true, showDescriptions: false, showCopyButton: true, showExternalButton: true, showFooterText: true, discounts: [{ id: 'pd1', brandName: 'Gymshark', storeUrl: 'https://gymshark.com', logoUrl: '', description: 'En toda la tienda.', discountText: '15% OFF', code: 'GYM15', buttonText: 'Ver oferta', buttonUrl: 'https://gymshark.com', isPopular: true, enabled: true }] } },
    ],
  },
  {
    label: 'Creator / Links',
    blocks: [
      { type: 'profile_header', label: 'Profile Header',  defaultData: { avatarUrl: '', displayName: 'Tu Nombre', username: 'tuusuario', verifiedBadge: true, bio: 'Creador de contenido 🌟', location: '' } },
      { type: 'social_links',   label: 'Redes Sociales',  defaultData: { links: [{ id: 'sl_tt', platform: 'tiktok', url: '', enabled: true }, { id: 'sl_ig', platform: 'instagram', url: '', enabled: true }, { id: 'sl_yt', platform: 'youtube', url: '', enabled: false }] } },
    ],
  },
]

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  blocks: LandingBlock[]
  theme: LandingTheme
  plan?: Plan
  onUpdateBlock: (id: string, data: Partial<LandingBlock['data']>) => void
  onUpdateBlockStyle: (id: string, style: Partial<BlockStyle>) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (from: number, to: number) => void
  onAdd: (type: LandingBlock['type'], defaultData: LandingBlock['data']) => void
}

// ─── Sortable item ────────────────────────────────────────────────────────────
function SortableItem({
  block, theme, highlighted, idx, plan,
  onUpdateBlock, onUpdateBlockStyle, onToggleVisibility, onDelete, onDuplicate,
}: {
  block: LandingBlock; theme: LandingTheme; highlighted?: boolean; idx: number; plan: Plan
  onUpdateBlock: (id: string, data: Partial<LandingBlock['data']>) => void
  onUpdateBlockStyle: (id: string, style: Partial<BlockStyle>) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState<'content' | 'design'>('content')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform), transition,
    zIndex: isDragging ? 100 : 'auto',
  }

  const accent   = ACCENT[idx % 2]
  const BlockIcon = BLOCK_LUCIDE[block.type]

  return (
    <div ref={setNodeRef} style={{
      ...dragStyle,
      marginBottom: 6,
      borderRadius: 12,
      overflow: 'hidden',
      background: T.card,
      border: highlighted ? `1.5px solid #8b5cf6` : '1px solid rgba(0,0,0,.08)',
      boxShadow: highlighted ? '0 0 0 3px rgba(139,92,246,.12)' : 'none',
      opacity: isDragging ? 0.45 : (block.visible ? 1 : 0.48),
      transition: 'border-color .18s, box-shadow .18s, opacity .15s',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 8px 8px 6px',
        background: expanded ? '#F8F8FA' : T.card,
        borderBottom: expanded ? `1px solid ${T.border}` : 'none',
      }}>
        {/* Grip */}
        <button {...attributes} {...listeners}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', padding: '2px 3px', background: 'none', border: 'none', color: '#C8D0DB', flexShrink: 0, display: 'flex', touchAction: 'none' }}>
          <GripVertical size={14} />
        </button>

        {/* Icono sin fondo + nombre */}
        <button onClick={() => setExpanded(e => !e)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {BlockIcon
              ? <BlockIcon size={19} color={accent} strokeWidth={1.9} />
              : <span style={{ fontSize: 17, color: accent }}>{BLOCK_ICONS[block.type] ?? '▪️'}</span>
            }
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>
            {block.label}
          </span>
        </button>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
          <IconBtn title={block.visible ? t('block.hide') : t('block.show')} onClick={() => onToggleVisibility(block.id)}>
            {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </IconBtn>
          <IconBtn title={t('block.duplicate')} onClick={() => onDuplicate(block.id)} disabled={!!block.locked}>
            <Copy size={13} />
          </IconBtn>
          <IconBtn title={t('block.delete')} onClick={() => onDelete(block.id)} disabled={!!block.locked} danger>
            <Trash2 size={13} />
          </IconBtn>
          <ChevronDown size={13} color={T.ink3}
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', cursor: 'pointer', flexShrink: 0, marginLeft: 1 }}
            onClick={() => setExpanded(e => !e)} />
        </div>
      </div>

      {/* ── Expanded editor ── */}
      {expanded && (
        <div style={{ background: T.bg }}>
          {block.type === 'partner_discounts' ? (
            /* Partner Discounts has its own 2-tab layout (Contenido/Estilo) */
            <PartnerDiscountsEditor
              block={block}
              onUpdate={(data) => onUpdateBlock(block.id, data)}
              onUpdateStyle={(patch) => onUpdateBlockStyle(block.id, patch)}
              plan={plan}
              theme={theme}
            />
          ) : block.type === 'tiktok_comments' ? (
            /* TikTok Comments has its own 2-tab layout (Contenido/Estilo) */
            <TikTokCommentsEditor
              block={block}
              onUpdate={(data) => onUpdateBlock(block.id, data)}
              plan={plan}
            />
          ) : block.type === 'before_after' ? (
            /* Before / After has its own 2-tab layout (Contenido/Estilo) */
            <BeforeAfterEditor
              block={block}
              onUpdate={(data) => onUpdateBlock(block.id, data)}
              plan={plan}
            />
          ) : (
            <>
              <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.card }}>
                {(['content', 'design'] as const).map(key => (
                  <button key={key} onClick={() => setTab(key)} style={{
                    flex: 1, padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 11.5, fontWeight: 600,
                    color: tab === key ? T.pink : T.ink3,
                    borderBottom: tab === key ? `2px solid ${T.pink}` : '2px solid transparent',
                  }}>
                    {key === 'content' ? t('block.content') : t('block.design')}
                  </button>
                ))}
              </div>
              <div style={{ padding: '12px 14px 16px' }}>
                {tab === 'content'
                  ? <BlockEditor block={block} onUpdate={(data) => onUpdateBlock(block.id, data)} plan={plan} />
                  : <DesignEditor block={block} theme={theme} onUpdateStyle={(patch) => onUpdateBlockStyle(block.id, patch)} />
                }
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Icon button ──────────────────────────────────────────────────────────────
function IconBtn({ children, onClick, title, disabled, danger }: {
  children: React.ReactNode; onClick: () => void; title?: string; disabled?: boolean; danger?: boolean
}) {
  return (
    <button title={title} disabled={disabled} onClick={onClick} style={{
      width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent',
      cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: danger ? T.red : T.ink3, opacity: disabled ? 0.3 : 1,
    }}>{children}</button>
  )
}

// ─── Form primitives ──────────────────────────────────────────────────────────
function FL({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 4 }}>{children}</label>
}
function FG({ children, mb = 10, style }: { children: React.ReactNode; mb?: number; style?: React.CSSProperties }) {
  return <div style={{ marginBottom: mb, ...style }}>{children}</div>
}
function FI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12, border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none', ...props.style }} />
}
function FTA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12, border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none', resize: 'vertical', minHeight: 52, ...props.style }} />
}
function FSel(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12, border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none', ...props.style }} />
}
function DelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${T.redBorder}`, background: T.redBg, color: T.red, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Trash2 size={12} />
    </button>
  )
}
function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <Plus size={13} />{label}
    </button>
  )
}

// ─── Pill group ───────────────────────────────────────────────────────────────
function PillGroup<V extends string>({ options, value, onChange }: {
  options: Array<{ key: V; label: string }>
  value: V | undefined
  onChange: (v: V | undefined) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o.key
        return (
          <button key={o.key} onClick={() => onChange(active ? undefined : o.key)} style={{
            padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            border: `1.5px solid ${active ? T.pink : T.border2}`,
            background: active ? T.softPink2 : T.card,
            color: active ? T.pink : T.ink2, transition: 'all .12s',
          }}>{o.label}</button>
        )
      })}
    </div>
  )
}

// ─── Color row ────────────────────────────────────────────────────────────────
function ColRow({ label, value, overridden, onChange, onReset }: {
  label: string; value: string; overridden: boolean; onChange: (v: string) => void; onReset: () => void
}) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <input type="color" value={value.startsWith('#') ? value : '#1F1F22'} onChange={e => onChange(e.target.value)}
        style={{ width: 26, height: 26, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 11.5, fontWeight: 500, color: T.ink2 }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: T.ink3, fontFamily: 'monospace', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value.toUpperCase()}</span>
      {overridden && (
        <button onClick={onReset} title={t('block.useTheme')} style={{ width: 18, height: 18, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink3 }}>
          <RotateCcw size={10} />
        </button>
      )}
    </div>
  )
}

// ─── Toggle section ───────────────────────────────────────────────────────────
function ToggleSection({ label, enabled, onToggle, pro, children }: {
  label: string; enabled: boolean; onToggle: (v: boolean) => void
  pro?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 10, border: `1px solid ${enabled ? 'rgba(246,71,169,0.25)' : T.border2}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: enabled ? '#FFF5FB' : T.card }}>
        <button
          onClick={() => onToggle(!enabled)}
          style={{
            width: 34, height: 18, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, padding: 2,
            background: enabled ? T.pink : '#D1D5DB',
            display: 'flex', alignItems: 'center', justifyContent: enabled ? 'flex-end' : 'flex-start',
            transition: 'background .15s',
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
        </button>
        <span style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: enabled ? T.ink : T.ink2 }}>{label}</span>
        {pro && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', letterSpacing: '.03em' }}>PRO</span>
        )}
      </div>
      {enabled && (
        <div style={{ padding: '10px 10px 12px', borderTop: `1px solid ${T.border}` }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Design editor ────────────────────────────────────────────────────────────
function DesignEditor({ block, theme, onUpdateStyle }: {
  block: LandingBlock; theme: LandingTheme; onUpdateStyle: (patch: Partial<BlockStyle>) => void
}) {
  const { t } = useTranslation()
  const s = block.style ?? {}

  const hasColorOverrides = !!(s.backgroundColor || s.textColor || s.accentColor || s.elementBackgroundColor || s.borderColor)
  const hasFontOverrides  = !!(s.fontFamily || s.fontSize)
  const hasBorderOverrides = !!(s.borderRadius || s.spacing)

  const colorsOn = s.customColorsEnabled ?? hasColorOverrides
  const fontOn   = s.customFontEnabled   ?? hasFontOverrides
  const borderOn = s.customBorderEnabled ?? hasBorderOverrides

  const sub = (text: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, marginTop: 10 }}>{text}</div>
  )

  return (
    <div>
      {/* Colors section */}
      <ToggleSection label={t('block.customizeColors')} enabled={colorsOn} onToggle={v => onUpdateStyle({ customColorsEnabled: v })} pro>
        <ColRow label={t('block.bgBlock')}        value={s.backgroundColor ?? theme.backgroundColor} overridden={!!s.backgroundColor}  onChange={v => onUpdateStyle({ backgroundColor: v })}  onReset={() => onUpdateStyle({ backgroundColor: undefined })} />
        <ColRow label={t('block.text')}            value={s.textColor ?? theme.textColor}              overridden={!!s.textColor}         onChange={v => onUpdateStyle({ textColor: v })}         onReset={() => onUpdateStyle({ textColor: undefined })} />
        <ColRow label={t('block.accentBtn')}       value={s.accentColor ?? theme.primaryColor}         overridden={!!s.accentColor}       onChange={v => onUpdateStyle({ accentColor: v })}       onReset={() => onUpdateStyle({ accentColor: undefined })} />
        <ColRow label={t('block.bgElements')}      value={s.elementBackgroundColor ?? '#1F1F22'}        overridden={!!s.elementBackgroundColor} onChange={v => onUpdateStyle({ elementBackgroundColor: v })} onReset={() => onUpdateStyle({ elementBackgroundColor: undefined })} />
        <ColRow label={t('block.borderElements')}  value={s.borderColor ?? '#2A2A2E'}                  overridden={!!s.borderColor}       onChange={v => onUpdateStyle({ borderColor: v })}       onReset={() => onUpdateStyle({ borderColor: undefined })} />
        {sub(t('block.glassEffect'))}
        <PillGroup
          options={[{ key: 'none', label: t('block.none') }, { key: 'soft', label: t('block.soft') }, { key: 'medium', label: t('block.medium') }, { key: 'strong', label: 'Fuerte' }]}
          value={s.glassIntensity}
          onChange={v => onUpdateStyle({ glassIntensity: v as BlockStyle['glassIntensity'] })}
        />
      </ToggleSection>

      {/* Typography section */}
      <ToggleSection label={t('block.customizeTypography')} enabled={fontOn} onToggle={v => onUpdateStyle({ customFontEnabled: v })} pro>
        <FG mb={8}>
          <div style={{ display: 'flex', gap: 6 }}>
            <FSel value={s.fontFamily ?? theme.fontFamily} onChange={e => onUpdateStyle({ fontFamily: e.target.value })} style={{ flex: 1 }}>
              {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </FSel>
            {s.fontFamily && <button onClick={() => onUpdateStyle({ fontFamily: undefined })} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border2}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink3, flexShrink: 0 }}><RotateCcw size={11} /></button>}
          </div>
        </FG>
        {sub(t('block.size'))}
        <PillGroup options={[{ key: 'small', label: t('block.small') }, { key: 'medium', label: t('block.medium') }, { key: 'large', label: t('block.large') }]} value={s.fontSize} onChange={v => onUpdateStyle({ fontSize: v })} />
        {sub(t('block.alignment'))}
        <PillGroup options={[{ key: 'left', label: t('block.left') }, { key: 'center', label: t('block.center') }]} value={s.textAlign} onChange={v => onUpdateStyle({ textAlign: v })} />
      </ToggleSection>

      {/* Border & spacing section */}
      <ToggleSection label={t('block.bordersSpacing')} enabled={borderOn} onToggle={v => onUpdateStyle({ customBorderEnabled: v })} pro>
        {sub(t('block.borders'))}
        <PillGroup options={[{ key: 'square', label: t('editor.square') }, { key: 'soft', label: t('editor.soft') }, { key: 'medium', label: t('editor.medium') }, { key: 'round', label: t('editor.round') }]} value={s.borderRadius} onChange={v => onUpdateStyle({ borderRadius: v })} />
        {sub(t('block.spacing'))}
        <PillGroup options={[{ key: 'compact', label: t('block.compact') }, { key: 'normal', label: t('block.normal') }, { key: 'airy', label: t('block.airy') }]} value={s.spacing} onChange={v => onUpdateStyle({ spacing: v })} />
      </ToggleSection>

      {Object.keys(s).length > 0 && (
        <button onClick={() => onUpdateStyle({
          customColorsEnabled: undefined, customFontEnabled: undefined, customBorderEnabled: undefined,
          backgroundColor: undefined, textColor: undefined, accentColor: undefined,
          elementBackgroundColor: undefined, borderColor: undefined, glassIntensity: undefined,
          fontFamily: undefined, fontSize: undefined, textAlign: undefined,
          borderRadius: undefined, spacing: undefined,
        })}
          style={{ marginTop: 4, width: '100%', padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border2}`, background: 'none', color: T.ink3, fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <RotateCcw size={11} />{t('block.resetToTheme')}
        </button>
      )}
    </div>
  )
}

// ─── Block content editor router ──────────────────────────────────────────────
function BlockEditor({ block, onUpdate, plan }: {
  block: LandingBlock; onUpdate: (data: Partial<LandingBlock['data']>) => void; plan: Plan
}) {
  const { t } = useTranslation()
  switch (block.type) {
    case 'hero_product':   return <HeroEditor       block={block} onUpdate={onUpdate} />
    case 'benefits':       return <BenefitsEditor   block={block} onUpdate={onUpdate} />
    case 'link_list':      return <LinkListEditor   block={block} onUpdate={onUpdate} />
    case 'faq':            return <FAQEditor        block={block} onUpdate={onUpdate} />
    case 'cta':            return <CTAEditor        block={block} onUpdate={onUpdate} />
    case 'profile_header': return <ProfileHeaderEditor block={block} onUpdate={onUpdate} />
    case 'social_links':   return <SocialLinksEditor   block={block} onUpdate={onUpdate} />
    case 'product_grid':   return <ProductGridEditor   block={block} onUpdate={onUpdate} />
    case 'trust_badges':   return <TrustBadgesEditor   block={block} onUpdate={onUpdate} />
    case 'comparison':     return <ComparisonEditor    block={block} onUpdate={onUpdate} />
    case 'urgency_offer':    return <UrgencyOfferEditor    block={block} onUpdate={onUpdate} />
    case 'footer_legal':     return <FooterLegalEditor     block={block} onUpdate={onUpdate} />
    case 'featured_product':  return <FeaturedProductEditor  block={block} onUpdate={onUpdate} plan={plan} />
    case 'partner_discounts': return null // handled directly in SortableItem with its own 3-tab layout
    case 'before_after':      return null // handled directly in SortableItem with its own 2-tab layout
    case 'tiktok_comments':   return null // handled directly in SortableItem with its own 2-tab layout
    default:
      return <p style={{ fontSize: 11, color: T.ink3, fontStyle: 'italic' }}>{t('block.editorComingSoon')}</p>
  }
}

// ─── Hero editor ──────────────────────────────────────────────────────────────
function HeroEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as HeroProductData
  const [mediaTab, setMediaTab] = useState<'extract' | 'image' | 'video' | 'url'>('extract')
  const [extractUrl, setExtractUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  async function handleExtract() {
    if (!extractUrl) return
    setExtracting(true); setExtractError(null)
    try {
      const res  = await fetch('/api/extract-product-media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: extractUrl }) })
      const data = await res.json()
      if (data.imageUrl) {
        onUpdate({ media: { type: 'image', url: data.imageUrl, source: 'extracted' } as HeroMedia, imageUrl: data.imageUrl })
      } else {
        setExtractError(data.error ?? 'No se encontró imagen')
      }
    } catch { setExtractError('Error de conexión') }
    finally { setExtracting(false) }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') {
    const file = e.target.files?.[0]
    if (!file) return
    let url: string | null = null
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const sb   = createClient()
      const path = `hero-media/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const { error } = await sb.storage.from('uploads').upload(path, file)
      if (!error) url = sb.storage.from('uploads').getPublicUrl(path).data.publicUrl
    } catch { /* fallback below */ }
    const finalUrl = url ?? URL.createObjectURL(file)
    onUpdate({ media: { type, url: finalUrl, source: 'upload' } as HeroMedia, ...(type === 'image' ? { imageUrl: finalUrl } : {}) })
  }

  const currentMedia = d.media?.url ?? d.imageUrl

  return (
    <>
      <FG><FL>{t('block.field.headline')}</FL><FI value={d.headline} onChange={e => onUpdate({ headline: e.target.value })} /></FG>
      <FG><FL>{t('block.field.subheadline')}</FL><FI value={d.subheadline} onChange={e => onUpdate({ subheadline: e.target.value })} /></FG>
      <FG><FL>{t('block.field.description')}</FL><FTA value={d.description} onChange={e => onUpdate({ description: e.target.value })} /></FG>

      {/* ── Media section ── */}
      <div style={{ marginTop: 4, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <FL>{t('block.field.imageOrVideo')}</FL>

        {/* Current preview */}
        {currentMedia && (
          <div style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border2}` }}>
            {d.media?.type === 'video'
              ? <video src={currentMedia} controls muted playsInline style={{ width: '100%', maxHeight: 110, display: 'block' }} />
              // eslint-disable-next-line @next/next/no-img-element
              : <img src={currentMedia} alt="" style={{ width: '100%', maxHeight: 110, objectFit: 'cover', display: 'block' }} />
            }
          </div>
        )}

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 2, background: T.bg, borderRadius: 8, padding: 3, marginBottom: 10, border: `1px solid ${T.border}` }}>
          {([
            { key: 'extract', label: t('block.field.extract') },
            { key: 'image',   label: t('block.field.image')   },
            { key: 'video',   label: t('block.field.video')   },
            { key: 'url',     label: 'URL'                    },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setMediaTab(tab.key)} style={{
              flex: 1, padding: '4px 0', borderRadius: 6, border: 'none', fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
              background: mediaTab === tab.key ? T.card : 'transparent',
              color: mediaTab === tab.key ? T.pink : T.ink3,
              boxShadow: mediaTab === tab.key ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            }}>{tab.label}</button>
          ))}
        </div>

        {mediaTab === 'extract' && (
          <div>
            <FI value={extractUrl} onChange={e => setExtractUrl(e.target.value)} placeholder="https://tuproducto.com/..." style={{ marginBottom: 6 }} />
            {extractError && <div style={{ fontSize: 11, color: T.red, marginBottom: 6 }}>{extractError}</div>}
            <button onClick={handleExtract} disabled={extracting || !extractUrl} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: 'none', background: T.purple, color: '#fff', fontSize: 12, fontWeight: 600, cursor: extracting || !extractUrl ? 'not-allowed' : 'pointer', opacity: extracting || !extractUrl ? 0.55 : 1 }}>
              {extracting ? t('block.field.extracting') : t('block.field.extractImage')}
            </button>
          </div>
        )}

        {mediaTab === 'image' && (
          <label style={{ display: 'block', padding: '10px', borderRadius: 8, border: `1.5px dashed ${T.border2}`, textAlign: 'center', cursor: 'pointer', fontSize: 11.5, color: T.ink2 }}>
            {t('block.field.selectImage')}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'image')} />
          </label>
        )}

        {mediaTab === 'video' && (
          <label style={{ display: 'block', padding: '10px', borderRadius: 8, border: `1.5px dashed ${T.border2}`, textAlign: 'center', cursor: 'pointer', fontSize: 11.5, color: T.ink2 }}>
            {t('block.field.selectVideo')}
            <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'video')} />
          </label>
        )}

        {mediaTab === 'url' && (
          <FI type="url" value={d.media?.url ?? d.imageUrl ?? ''} placeholder="https://..." onChange={e => {
            const url = e.target.value
            onUpdate({ media: { type: 'image', url, source: 'url' } as HeroMedia, imageUrl: url })
          }} />
        )}

        {currentMedia && (
          <button onClick={() => onUpdate({ media: undefined, imageUrl: '' })} style={{ marginTop: 8, width: '100%', padding: '5px 0', borderRadius: 6, border: `1px solid ${T.redBorder}`, background: T.redBg, color: T.red, fontSize: 11, cursor: 'pointer' }}>
            {t('block.field.removeMedia')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <FG style={{ flex: 1, marginBottom: 0 }}><FL>{t('block.field.badge')}</FL><FI value={d.badgeText} onChange={e => onUpdate({ badgeText: e.target.value })} /></FG>
        <FG style={{ flex: 1, marginBottom: 0 }}><FL>{t('block.field.rating')}</FL><FI value={d.rating} onChange={e => onUpdate({ rating: e.target.value })} /></FG>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.ink2, cursor: 'pointer' }}>
          <input type="checkbox" checked={d.showBadge} onChange={e => onUpdate({ showBadge: e.target.checked })} /> {t('block.field.showBadge')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.ink2, cursor: 'pointer' }}>
          <input type="checkbox" checked={d.showRating} onChange={e => onUpdate({ showRating: e.target.checked })} /> {t('block.field.showRating')}
        </label>
      </div>
    </>
  )
}

// ─── Benefits editor ──────────────────────────────────────────────────────────
function BenefitsEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as BenefitsData
  const upd = (i: number, patch: Partial<BenefitItem>) => { const items = [...d.items]; items[i] = { ...items[i], ...patch }; onUpdate({ items }) }
  return (
    <>
      <FG><FL>{t('block.field.title')}</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.items.map((item, i) => (
        <div key={i} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={item.icon} onChange={e => upd(i, { icon: e.target.value })} style={{ width: 44, textAlign: 'center', flexShrink: 0 }} />
            <FI value={item.title} onChange={e => upd(i, { title: e.target.value })} placeholder="Título" style={{ flex: 1 }} />
            <DelBtn onClick={() => onUpdate({ items: d.items.filter((_, j) => j !== i) })} />
          </div>
          <FTA value={item.description} onChange={e => upd(i, { description: e.target.value })} placeholder={t('block.field.description')} style={{ minHeight: 40 }} />
        </div>
      ))}
      <AddBtn onClick={() => onUpdate({ items: [...d.items, { icon: '⭐', title: 'Beneficio', description: '' }] })} label={t('block.add.benefit')} />
    </>
  )
}

// ─── LinkList editor ──────────────────────────────────────────────────────────
function LinkListEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as LinkListData
  const upd = (i: number, patch: Partial<LinkItem>) => { const links = [...d.links]; links[i] = { ...links[i], ...patch }; onUpdate({ links }) }
  return (
    <>
      <FG><FL>{t('block.field.title')}</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.links.map((link, i) => (
        <div key={link.id ?? i} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <FG mb={6}><FI value={link.label} onChange={e => upd(i, { label: e.target.value })} placeholder={t('block.field.btnText')} /></FG>
          <div style={{ display: 'flex', gap: 6 }}>
            <FI value={link.url} onChange={e => upd(i, { url: e.target.value })} placeholder="https://..." style={{ flex: 1 }} />
            <DelBtn onClick={() => onUpdate({ links: d.links.filter((_, j) => j !== i) })} />
          </div>
        </div>
      ))}
      <AddBtn onClick={() => onUpdate({ links: [...d.links, { id: `link_${Date.now()}`, label: 'Nuevo link', url: '', visible: true }] })} label={t('block.add.link')} />
    </>
  )
}

// ─── FAQ editor ───────────────────────────────────────────────────────────────
function FAQEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as FAQData
  const upd = (i: number, patch: Partial<FaqItem>) => { const items = [...d.items]; items[i] = { ...items[i], ...patch }; onUpdate({ items }) }
  return (
    <>
      <FG><FL>{t('block.field.title')}</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.items.map((item, i) => (
        <div key={item.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <FG mb={6}><FI value={item.question} onChange={e => upd(i, { question: e.target.value })} placeholder="Pregunta" /></FG>
          <div style={{ display: 'flex', gap: 6 }}>
            <FTA value={item.answer} onChange={e => upd(i, { answer: e.target.value })} placeholder="Respuesta" style={{ flex: 1, minHeight: 40 }} />
            <DelBtn onClick={() => onUpdate({ items: d.items.filter((_, j) => j !== i) })} />
          </div>
        </div>
      ))}
      <AddBtn onClick={() => onUpdate({ items: [...d.items, { id: `faq_${Date.now()}`, question: 'Nueva pregunta', answer: 'Respuesta.' }] })} label={t('block.add.question')} />
    </>
  )
}

// ─── CTA editor ───────────────────────────────────────────────────────────────
function CTAEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as CTAData
  return (
    <>
      <FG><FL>{t('block.field.btnText')}</FL><FI value={d.text} onChange={e => onUpdate({ text: e.target.value })} /></FG>
      <FG><FL>{t('block.field.microcopy')}</FL><FI value={d.subtext} onChange={e => onUpdate({ subtext: e.target.value })} /></FG>
      <FG><FL>{t('block.field.destUrl')}</FL><FI type="url" value={d.url} placeholder="https://..." onChange={e => onUpdate({ url: e.target.value })} /></FG>
      <FG mb={0}><FL>{t('block.field.style')}</FL>
        <FSel value={d.style} onChange={e => onUpdate({ style: e.target.value as CTAData['style'] })}>
          <option value="gradient">{t('editor.gradient')}</option>
          <option value="solid">{t('editor.solid')}</option>
          <option value="outline">Outline</option>
        </FSel>
      </FG>
    </>
  )
}

// ─── Profile Header editor ────────────────────────────────────────────────────
function ProfileHeaderEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as ProfileHeaderData
  return (
    <>
      <FG><FL>{t('block.field.name')}</FL><FI value={d.displayName} onChange={e => onUpdate({ displayName: e.target.value })} /></FG>
      <FG><FL>{t('block.field.username')}</FL><FI value={d.username} onChange={e => onUpdate({ username: e.target.value })} /></FG>
      <FG><FL>{t('block.field.bio')}</FL><FTA value={d.bio} onChange={e => onUpdate({ bio: e.target.value })} style={{ minHeight: 48 }} /></FG>
      <FG><FL>{t('block.field.avatarUrl')}</FL><FI type="url" value={d.avatarUrl} placeholder="https://..." onChange={e => onUpdate({ avatarUrl: e.target.value })} /></FG>
      <FG><FL>{t('block.field.location')}</FL><FI value={d.location ?? ''} placeholder="Ciudad, País" onChange={e => onUpdate({ location: e.target.value })} /></FG>
      <FG mb={0}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: T.ink2 }}>
          <input type="checkbox" checked={d.verifiedBadge} onChange={e => onUpdate({ verifiedBadge: e.target.checked })} />
          {t('block.field.showVerified')}
        </label>
      </FG>
    </>
  )
}

// ─── Social Links editor ──────────────────────────────────────────────────────
const PLATFORMS: SocialPlatform[] = ['tiktok', 'instagram', 'youtube', 'website', 'email', 'whatsapp', 'x', 'linkedin']
const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', website: 'Website',
  email: 'Email', whatsapp: 'WhatsApp', x: 'X (Twitter)', linkedin: 'LinkedIn',
}

function SocialLinksEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as SocialLinksData
  const upd = (i: number, patch: Partial<SocialLink>) => { const links = [...d.links]; links[i] = { ...links[i], ...patch }; onUpdate({ links }) }
  return (
    <>
      {d.links.map((link, i) => (
        <div key={link.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <FSel value={link.platform} onChange={e => upd(i, { platform: e.target.value as SocialPlatform })} style={{ flex: 1 }}>
              {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
            </FSel>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.ink2, cursor: 'pointer', flexShrink: 0 }}>
              <input type="checkbox" checked={link.enabled} onChange={e => upd(i, { enabled: e.target.checked })} />
              {t('block.field.active')}
            </label>
            <DelBtn onClick={() => onUpdate({ links: d.links.filter((_, j) => j !== i) })} />
          </div>
          <FI value={link.url} onChange={e => upd(i, { url: e.target.value })} placeholder="https://..." />
          <FI value={link.label ?? ''} onChange={e => upd(i, { label: e.target.value })} placeholder="Texto personalizado (opcional)" style={{ marginTop: 6 }} />
        </div>
      ))}
      <AddBtn
        onClick={() => onUpdate({ links: [...d.links, { id: `sl_${Date.now()}`, platform: 'website', url: '', enabled: true }] })}
        label={t('block.add.social')}
      />
    </>
  )
}

// ─── Product Grid editor ──────────────────────────────────────────────────────
function ProductGridEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as ProductGridData
  const upd = (i: number, patch: Partial<ProductItem>) => { const products = [...d.products]; products[i] = { ...products[i], ...patch }; onUpdate({ products }) }
  return (
    <>
      <FG><FL>{t('block.field.title')}</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      <FG><FL>{t('block.field.subtitle')}</FL><FI value={d.subtitle ?? ''} onChange={e => onUpdate({ subtitle: e.target.value })} /></FG>
      {d.products.map((p, i) => (
        <div key={p.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.ink3 }}>{t('block.field.product', { n: String(i + 1) })}</span>
            <DelBtn onClick={() => onUpdate({ products: d.products.filter((_, j) => j !== i) })} />
          </div>
          <FG mb={6}><FI value={p.title} onChange={e => upd(i, { title: e.target.value })} placeholder={t('block.field.productName')} /></FG>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={p.price ?? ''} onChange={e => upd(i, { price: e.target.value })} placeholder={t('block.field.price')} style={{ flex: 1 }} />
            <FI value={p.compareAtPrice ?? ''} onChange={e => upd(i, { compareAtPrice: e.target.value })} placeholder={t('block.field.comparePrice')} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={p.badge ?? ''} onChange={e => upd(i, { badge: e.target.value })} placeholder="Badge (ej. Nuevo)" style={{ flex: 1 }} />
          </div>
          <FI value={p.url} onChange={e => upd(i, { url: e.target.value })} placeholder={t('block.field.productUrl')} />
        </div>
      ))}
      <AddBtn
        onClick={() => onUpdate({ products: [...d.products, { id: `p_${Date.now()}`, imageUrl: '', title: 'Nuevo producto', price: '', compareAtPrice: '', url: '', badge: '', description: '' }] })}
        label={t('block.add.product')}
      />
    </>
  )
}

// ─── Trust Badges editor ──────────────────────────────────────────────────────
const BADGE_ICONS_LIST: TrustBadgeIcon[] = ['shipping', 'secure', 'guarantee', 'returns', 'support', 'verified']
const BADGE_LABELS: Record<TrustBadgeIcon, string> = {
  shipping: '🚚 Envío', secure: '🔒 Seguro', guarantee: '⭐ Garantía',
  returns: '↩️ Devoluciones', support: '🎧 Soporte', verified: '✅ Verificado',
}

function TrustBadgesEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as TrustBadgesData
  const upd = (i: number, patch: Partial<TrustBadge>) => { const badges = [...d.badges]; badges[i] = { ...badges[i], ...patch }; onUpdate({ badges }) }
  return (
    <>
      {d.badges.map((badge, i) => (
        <div key={badge.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <FSel value={badge.icon} onChange={e => upd(i, { icon: e.target.value as TrustBadgeIcon })} style={{ flex: 1 }}>
              {BADGE_ICONS_LIST.map(k => <option key={k} value={k}>{BADGE_LABELS[k]}</option>)}
            </FSel>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.ink2, cursor: 'pointer', flexShrink: 0 }}>
              <input type="checkbox" checked={badge.enabled} onChange={e => upd(i, { enabled: e.target.checked })} />{t('block.field.visible')}
            </label>
            <DelBtn onClick={() => onUpdate({ badges: d.badges.filter((_, j) => j !== i) })} />
          </div>
          <FG mb={6}><FI value={badge.title} onChange={e => upd(i, { title: e.target.value })} placeholder={t('block.field.title')} /></FG>
          <FI value={badge.description ?? ''} onChange={e => upd(i, { description: e.target.value })} placeholder="Descripción corta (opcional)" />
        </div>
      ))}
      <AddBtn
        onClick={() => onUpdate({ badges: [...d.badges, { id: `tb_${Date.now()}`, icon: 'verified', title: 'Nuevo badge', enabled: true }] })}
        label={t('block.add.badge')}
      />
    </>
  )
}

// ─── Comparison editor ────────────────────────────────────────────────────────
function ComparisonEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const { t } = useTranslation()
  const d = block.data as unknown as ComparisonData
  const upd = (i: number, patch: Partial<ComparisonRow>) => { const rows = [...d.rows]; rows[i] = { ...rows[i], ...patch }; onUpdate({ rows }) }
  return (
    <>
      <FG><FL>{t('block.field.title')}</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      <div style={{ display: 'flex', gap: 8 }}>
        <FG style={{ flex: 1, marginBottom: 10 }}><FL>{t('block.field.leftColumn')}</FL><FI value={d.leftTitle} onChange={e => onUpdate({ leftTitle: e.target.value })} placeholder="Otros" /></FG>
        <FG style={{ flex: 1, marginBottom: 10 }}><FL>{t('block.field.rightColumn')}</FL><FI value={d.rightTitle} onChange={e => onUpdate({ rightTitle: e.target.value })} placeholder="Nosotros" /></FG>
      </div>
      {d.rows.map((row, i) => (
        <div key={row.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
            <FI value={row.label} onChange={e => upd(i, { label: e.target.value })} placeholder="Característica" style={{ flex: 2 }} />
            <DelBtn onClick={() => onUpdate({ rows: d.rows.filter((_, j) => j !== i) })} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={row.leftValue} onChange={e => upd(i, { leftValue: e.target.value })} placeholder="Valor izq." style={{ flex: 1 }} />
            <FI value={row.rightValue} onChange={e => upd(i, { rightValue: e.target.value })} placeholder="Valor der." style={{ flex: 1 }} />
          </div>
          <FG mb={0}><FL>Ganador</FL>
            <FSel value={row.winner} onChange={e => upd(i, { winner: e.target.value as 'left' | 'right' })}>
              <option value="left">{d.leftTitle || 'Izquierda'}</option>
              <option value="right">{d.rightTitle || 'Derecha'}</option>
            </FSel>
          </FG>
        </div>
      ))}
      <AddBtn
        onClick={() => onUpdate({ rows: [...d.rows, { id: `cr_${Date.now()}`, label: 'Característica', leftValue: 'Valor', rightValue: 'Valor', winner: 'right' }] })}
        label={t('block.add.row')}
      />
    </>
  )
}

// ─── Urgency / Offer editor ───────────────────────────────────────────────────
function UrgencyOfferEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as UrgencyOfferData
  return (
    <>
      <FG><FL>Badge de urgencia</FL><FI value={d.badgeText} onChange={e => onUpdate({ badgeText: e.target.value })} placeholder="🔥 Oferta limitada" /></FG>
      <FG><FL>Título</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      <FG><FL>Descripción</FL><FTA value={d.description} onChange={e => onUpdate({ description: e.target.value })} style={{ minHeight: 48 }} /></FG>
      <FG>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: T.ink2, marginBottom: 6 }}>
          <input type="checkbox" checked={d.countdownEnabled} onChange={e => onUpdate({ countdownEnabled: e.target.checked })} />
          Mostrar texto de cuenta atrás
        </label>
        {d.countdownEnabled && <FI value={d.countdownText ?? ''} onChange={e => onUpdate({ countdownText: e.target.value })} placeholder="Quedan 2 horas" />}
      </FG>
      <FG><FL>Texto del botón</FL><FI value={d.ctaText ?? ''} onChange={e => onUpdate({ ctaText: e.target.value })} placeholder="🛒 Aprovechar oferta" /></FG>
      <FG mb={0}><FL>URL del botón</FL><FI type="url" value={d.ctaUrl ?? ''} placeholder="https://..." onChange={e => onUpdate({ ctaUrl: e.target.value })} /></FG>
    </>
  )
}

// ─── Footer Legal editor ──────────────────────────────────────────────────────
function FooterLegalEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as FooterLegalData
  return (
    <>
      <FG><FL>Nombre de marca</FL><FI value={d.brandName} onChange={e => onUpdate({ brandName: e.target.value })} /></FG>
      <FG><FL>Email de contacto</FL><FI type="email" value={d.contactEmail} onChange={e => onUpdate({ contactEmail: e.target.value })} /></FG>
      <div style={{ display: 'flex', gap: 8 }}>
        <FG style={{ flex: 1, marginBottom: 10 }}><FL>URL Privacidad</FL><FI type="url" value={d.privacyUrl} placeholder="https://..." onChange={e => onUpdate({ privacyUrl: e.target.value })} /></FG>
        <FG style={{ flex: 1, marginBottom: 10 }}><FL>URL Términos</FL><FI type="url" value={d.termsUrl} placeholder="https://..." onChange={e => onUpdate({ termsUrl: e.target.value })} /></FG>
      </div>
      <FG><FL>Texto legal (opcional)</FL><FTA value={d.legalText ?? ''} onChange={e => onUpdate({ legalText: e.target.value })} placeholder="© 2025 Mi Marca. Todos los derechos reservados." style={{ minHeight: 48 }} /></FG>
      <FG mb={0}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: T.ink2 }}>
          <input type="checkbox" checked={d.showTokproofBranding} onChange={e => onUpdate({ showTokproofBranding: e.target.checked })} />
          Mostrar &quot;Powered by Tokproof&quot;
        </label>
      </FG>
    </>
  )
}

// ─── Featured Product — editor helper components ──────────────────────────────

function FPInfoTooltip({ text }: { text: string }) {
  const [vis, setVis]       = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const iconRef             = useRef<HTMLSpanElement>(null)

  const handleEnter = () => {
    if (iconRef.current) {
      const r = iconRef.current.getBoundingClientRect()
      /* position to the right of the icon, vertically centered */
      setCoords({ top: r.top - 4, left: r.right + 10 })
    }
    setVis(true)
  }

  return (
    <>
      <span
        ref={iconRef}
        style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', marginLeft: 4, verticalAlign: 'middle' }}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setVis(false)}
      >
        <Info size={11} color="#9CA3AF" />
      </span>
      {/* position:fixed escapes any overflow:hidden ancestor */}
      {vis && (
        <div style={{
          position: 'fixed', top: coords.top, left: coords.left,
          width: 210, zIndex: 99999,
          background: '#1f2430', color: '#fff', fontSize: 11, lineHeight: 1.5,
          padding: '8px 10px', borderRadius: 9,
          boxShadow: '0 4px 16px rgba(0,0,0,.28)', pointerEvents: 'none',
          whiteSpace: 'normal', wordBreak: 'break-word',
        }}>
          {text}
        </div>
      )}
    </>
  )
}

function FPSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={on ? 'Ocultar sección' : 'Mostrar sección'}
      style={{
        width: 30, height: 17, borderRadius: 999, border: 'none', padding: 2, flexShrink: 0,
        background: on ? T.purple : '#D1D5DB', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start',
        transition: 'background .15s',
      }}
    >
      <div style={{ width: 13, height: 13, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.22)' }} />
    </button>
  )
}

/* Section with optional toggle. When toggle is OFF, children are hidden. */
function FPSection({ label, toggle, on, onToggle, children }: {
  label: string; toggle?: boolean; on?: boolean; onToggle?: () => void; children: React.ReactNode
}) {
  const isOpen = !toggle || on
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: isOpen ? 8 : 0,
        paddingBottom: isOpen ? 6 : 0, borderBottom: isOpen ? `1px solid ${T.border}` : 'none',
      }}>
        {toggle && <FPSwitch on={!!on} onToggle={onToggle!} />}
        <span style={{
          fontSize: 10, fontWeight: 700, color: toggle && !on ? T.ink3 : T.purple,
          textTransform: 'uppercase', letterSpacing: '.07em',
        }}>
          {label}
        </span>
        {toggle && !on && (
          <span style={{ fontSize: 9.5, color: T.ink3, fontWeight: 500, marginLeft: 2 }}>(oculto)</span>
        )}
      </div>
      {isOpen && <div>{children}</div>}
    </div>
  )
}

// ─── Featured Product editor ──────────────────────────────────────────────────
function FeaturedProductEditor({ block, onUpdate, plan }: {
  block: LandingBlock
  onUpdate: (d: Partial<LandingBlock['data']>) => void
  plan: Plan
}) {
  const d = block.data as unknown as FeaturedProductData
  const [upgradeOpen, setUpgradeOpen]     = useState(false)
  const [uploadNotice, setUploadNotice]   = useState(false)

  const benefits: string[] = Array.isArray(d.benefits)
    ? d.benefits
    : ['Estimula el crecimiento capilar', 'Ingredientes 100% naturales', 'Resultados visibles en 7 días']

  const updBenefit = (i: number, val: string) => {
    const arr = [...benefits]; arr[i] = val; onUpdate({ benefits: arr })
  }

  const isPro = plan === 'pro'
  const imageFit = d.imageFit ?? 'cover'

  return (
    <>
      {/* ── PRODUCT IMAGE ── */}
      <FPSection label="Product Image">
        {/* Image URL + info tooltip */}
        <FG>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <FL>URL de imagen</FL>
            <FPInfoTooltip text="Puedes pegar una URL de imagen desde Shopify, Amazon, AliExpress, tu CDN u otra plataforma. Copia la URL de la imagen y pégala aquí." />
          </div>
          <FI
            type="url"
            value={d.imageUrl ?? ''}
            placeholder="https://cdn.tumarca.com/producto.jpg"
            onChange={e => onUpdate({ imageUrl: e.target.value })}
          />
        </FG>

        {/* Upload — Pro-gated */}
        {isPro ? (
          <>
            <button
              onClick={() => setUploadNotice(n => !n)}
              style={{
                width: '100%', padding: '8px 0', borderRadius: 8, marginBottom: uploadNotice ? 6 : 10,
                border: `1.5px dashed ${T.purple}`, background: '#f3effe',
                color: T.purple, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#ede7fd')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f3effe')}
            >
              📷 Subir imagen personalizada
            </button>
            {uploadNotice && (
              <div style={{
                marginBottom: 10, padding: '8px 10px', borderRadius: 8,
                background: '#faf7ff', border: `1px solid ${T.border2}`,
                fontSize: 11, color: T.ink2, lineHeight: 1.5,
              }}>
                La subida de imágenes desde el editor estará disponible próximamente.
                Por ahora puedes pegar la URL de tu imagen en el campo de arriba.
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setUpgradeOpen(true)}
              style={{
                width: '100%', padding: '8px 0', borderRadius: 8, marginBottom: 4,
                border: `1.5px dashed ${T.border2}`, background: '#fafbfc',
                color: '#9CA3AF', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Lock size={11} />
              Subir imagen personalizada
              <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1px 5px', borderRadius: 4 }}>Pro</span>
            </button>
            <p style={{ fontSize: 10.5, color: T.ink3, margin: '0 0 10px', textAlign: 'center' }}>
              Disponible en Pro
            </p>
            <UpgradeProModal
              open={upgradeOpen}
              onClose={() => setUpgradeOpen(false)}
              title="Subir imágenes"
              description="Subir imágenes personalizadas está disponible en el plan Pro. Actualiza para usar tus propias fotos de producto."
            />
          </>
        )}

        {/* Image fit */}
        <FG mb={0}>
          <FL>Image fit</FL>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['cover', 'contain'] as const).map(v => (
              <button
                key={v}
                onClick={() => onUpdate({ imageFit: v })}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600,
                  border: `1.5px solid ${imageFit === v ? T.purple : T.border2}`,
                  background: imageFit === v ? '#f3effe' : T.card,
                  color: imageFit === v ? T.purple : T.ink2,
                }}
              >
                {v === 'cover' ? 'Cover' : 'Contain'}
              </button>
            ))}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 10, color: T.ink3, lineHeight: 1.4 }}>
            Cover recorta la imagen para rellenar. Contain la muestra completa.
          </p>
        </FG>
      </FPSection>

      {/* ── BADGE [toggle] ── */}
      <FPSection
        label="Badge"
        toggle
        on={d.showBadge ?? true}
        onToggle={() => onUpdate({ showBadge: !(d.showBadge ?? true) })}
      >
        <FG mb={0}>
          <FI value={d.badgeText ?? ''} placeholder="Más vendido 🔥" onChange={e => onUpdate({ badgeText: e.target.value })} />
        </FG>
      </FPSection>

      {/* ── PRODUCT INFO ── */}
      <FPSection label="Product Info">
        <FG>
          <FL>Nombre del producto</FL>
          <FI value={d.productName ?? ''} onChange={e => onUpdate({ productName: e.target.value })} />
        </FG>
        <FG mb={0}>
          <FL>Descripción</FL>
          <FTA value={d.description ?? ''} onChange={e => onUpdate({ description: e.target.value })} style={{ minHeight: 52 }} />
        </FG>
      </FPSection>

      {/* ── RATING [toggle] ── */}
      <FPSection
        label="Rating"
        toggle
        on={d.showRating ?? true}
        onToggle={() => onUpdate({ showRating: !(d.showRating ?? true) })}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <FG style={{ flex: 1, marginBottom: 0 }}>
            <FL>Rating</FL>
            <FI type="number" value={d.rating ?? 4.9} step="0.1" min="0" max="5" onChange={e => onUpdate({ rating: parseFloat(e.target.value) || 0 })} />
          </FG>
          <FG style={{ flex: 1, marginBottom: 0 }}>
            <FL>Nº reseñas</FL>
            <FI value={d.reviewCount ?? ''} placeholder="2.4K" onChange={e => onUpdate({ reviewCount: e.target.value })} />
          </FG>
        </div>
      </FPSection>

      {/* ── PRICING [toggle] ── */}
      <FPSection
        label="Pricing"
        toggle
        on={d.showPrice ?? true}
        onToggle={() => onUpdate({ showPrice: !(d.showPrice ?? true) })}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <FG style={{ flex: 1, marginBottom: 8 }}>
            <FL>Precio</FL>
            <FI value={d.price ?? ''} placeholder="$29.99" onChange={e => onUpdate({ price: e.target.value })} />
          </FG>
          <FG style={{ flex: 1, marginBottom: 8 }}>
            <FL>Precio anterior</FL>
            <FI value={d.compareAtPrice ?? ''} placeholder="$39.99" onChange={e => onUpdate({ compareAtPrice: e.target.value })} />
          </FG>
        </div>
        <FG mb={0}>
          <FL>Texto descuento</FL>
          <FI value={d.discountText ?? ''} placeholder="-25%" onChange={e => onUpdate({ discountText: e.target.value })} />
        </FG>
      </FPSection>

      {/* ── BENEFITS [toggle] ── */}
      <FPSection
        label="Benefits"
        toggle
        on={d.showBenefits ?? true}
        onToggle={() => onUpdate({ showBenefits: !(d.showBenefits ?? true) })}
      >
        {benefits.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={b} onChange={e => updBenefit(i, e.target.value)} placeholder={`Beneficio ${i + 1}`} style={{ flex: 1 }} />
            <DelBtn onClick={() => onUpdate({ benefits: benefits.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <AddBtn onClick={() => onUpdate({ benefits: [...benefits, 'Nuevo beneficio'] })} label="Añadir beneficio" />
      </FPSection>

      {/* ── BUTTON [toggle] ── */}
      <FPSection
        label="Button"
        toggle
        on={d.showButton ?? true}
        onToggle={() => onUpdate({ showButton: !(d.showButton ?? true) })}
      >
        <FG>
          <FL>Texto del botón</FL>
          <FI value={d.buttonText ?? ''} onChange={e => onUpdate({ buttonText: e.target.value })} />
        </FG>
        <FG>
          <FL>URL del botón</FL>
          <FI type="url" value={d.buttonUrl ?? ''} placeholder="https://tutienda.com/producto" onChange={e => onUpdate({ buttonUrl: e.target.value })} />
        </FG>
        <FG mb={0}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: T.ink2 }}>
            <input type="checkbox" checked={d.openInNewTab ?? false} onChange={e => onUpdate({ openInNewTab: e.target.checked })} />
            Abrir en nueva pestaña
          </label>
        </FG>
      </FPSection>
    </>
  )
}

// ─── Partner Discounts editor ─────────────────────────────────────────────────

/* Logo preview in the editor item list — auto-detects from storeUrl via Clearbit */
function PDLogo({ storeUrl, logoUrl, brandName }: { storeUrl: string; logoUrl: string; brandName: string }) {
  const [failed, setFailed] = useState(false)
  const domain = storeUrl ? (() => {
    try {
      const u = new URL(storeUrl.startsWith('http') ? storeUrl : `https://${storeUrl}`)
      return u.hostname.replace(/^www\./, '')
    } catch { return '' }
  })() : ''
  const src = logoUrl || (domain ? `https://logo.clearbit.com/${domain}` : '')
  const initials = brandName.split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F4F4F6', border: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt={brandName} onError={() => setFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{initials}</span>
      )}
    </div>
  )
}

/* Inline toggle row */
function PDToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: T.ink2 }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 34, height: 18, borderRadius: 999, border: 'none', padding: 2, cursor: 'pointer', flexShrink: 0,
        background: value ? T.purple : '#D1D5DB', transition: 'background .15s',
        display: 'flex', alignItems: 'center', justifyContent: value ? 'flex-end' : 'flex-start',
      }}>
        <div style={{ width: 14, height: 14, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
      </button>
    </div>
  )
}

// ─── Color row for the Estilo tab ────────────────────────────────────────────
function PDColorRow({ label, value, onChange, onReset }: {
  label: string; value: string | undefined; onChange: (v: string) => void; onReset: () => void
}) {
  const fallback = value?.startsWith('#') ? value : '#888888'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
      <input type="color" value={value ?? fallback} onChange={e => onChange(e.target.value)}
        style={{ width: 22, height: 22, borderRadius: 4, cursor: 'pointer', padding: 1, border: 'none', background: 'none', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 11, color: T.ink2 }}>{label}</span>
      {value !== undefined && (
        <button onClick={onReset} title="Resetear" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: T.ink3, padding: 0 }}>
          <RotateCcw size={9} />
        </button>
      )}
    </div>
  )
}

function PDColorSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

// ─── Presets ──────────────────────────────────────────────────────────────────
type PresetName = 'light' | 'pink' | 'purple' | 'dark'
const PD_PRESETS: Record<PresetName, PDColors> = {
  light: {
    sectionBg: '#F9FAFB', titleColor: '#111827', subtitleColor: '#6B7280',
    badgeBg: '#FDF2F8', badgeText: '#DB2777',
    cardBg: '#FFFFFF', cardBorder: '#E5E7EB',
    brandColor: '#111827', descriptionColor: '#6B7280',
    discountBg: '#FDF2F8', discountText: '#DB2777',
    codeBg: '#F3F4F6', codeText: '#374151',
    copyBg: '#F3F4F6', copyText: '#6B7280',
    ctaBg: '#111827', ctaText: '#FFFFFF',
    footerBg: '#FDF2F8', footerTextColor: '#DB2777',
  },
  pink: {
    sectionBg: '#FFF1F8', titleColor: '#831843', subtitleColor: '#9D174D',
    badgeBg: '#FCE7F3', badgeText: '#BE185D',
    cardBg: '#FFFFFF', cardBorder: '#FBCFE8',
    brandColor: '#831843', descriptionColor: '#9D174D',
    discountBg: '#FCE7F3', discountText: '#BE185D',
    codeBg: '#FFF1F8', codeText: '#831843',
    copyBg: '#FCE7F3', copyText: '#BE185D',
    ctaBg: '#EC4899', ctaText: '#FFFFFF',
    footerBg: '#FCE7F3', footerTextColor: '#BE185D',
  },
  purple: {
    sectionBg: '#F5F3FF', titleColor: '#3B0764', subtitleColor: '#6B21A8',
    badgeBg: '#EDE9FE', badgeText: '#6D28D9',
    cardBg: '#FFFFFF', cardBorder: '#DDD6FE',
    brandColor: '#3B0764', descriptionColor: '#6B21A8',
    discountBg: '#EDE9FE', discountText: '#6D28D9',
    codeBg: '#F5F3FF', codeText: '#3B0764',
    copyBg: '#EDE9FE', copyText: '#6D28D9',
    ctaBg: '#7C3AED', ctaText: '#FFFFFF',
    footerBg: '#EDE9FE', footerTextColor: '#6D28D9',
  },
  dark: {
    sectionBg: '#0F0F10', titleColor: '#FFFFFF', subtitleColor: 'rgba(255,255,255,0.55)',
    badgeBg: 'rgba(246,71,169,0.15)', badgeText: '#F647A9',
    cardBg: 'rgba(255,255,255,0.08)', cardBorder: 'rgba(255,255,255,0.12)',
    brandColor: '#FFFFFF', descriptionColor: 'rgba(255,255,255,0.55)',
    discountBg: 'rgba(246,71,169,0.18)', discountText: '#F647A9',
    codeBg: 'rgba(255,255,255,0.08)', codeText: '#FFFFFF',
    copyBg: 'rgba(255,255,255,0.08)', copyText: 'rgba(255,255,255,0.65)',
    ctaBg: '#FFFFFF', ctaText: '#0F0F10',
    footerBg: 'rgba(246,71,169,0.12)', footerTextColor: '#F647A9',
  },
}
const PRESET_LABELS: Record<PresetName, string> = { light: 'Light', pink: 'Pink', purple: 'Purple', dark: 'Dark' }

// ─── TikTok Comments editor (2 tabs: Contenido / Estilo) ─────────────────────
function TikTokAvatar({ url, name, size = 28 }: { url: string; name: string; size?: number }) {
  const bgs = ['#F647A9','#7B61FF','#0EA5E9','#10B981','#F59E0B','#EF4444']
  const bg  = bgs[name.charCodeAt(0) % bgs.length] ?? '#F647A9'
  const init = name.slice(0, 1).toUpperCase() || '?'
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: url ? 'transparent' : bg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.07)' }}>
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontSize: size * 0.36, fontWeight: 700, lineHeight: 1 }}>{init}</span>
      }
    </div>
  )
}

function TikTokCommentsEditor({ block, onUpdate, plan }: {
  block: LandingBlock
  onUpdate: (d: Partial<LandingBlock['data']>) => void
  plan: Plan
}) {
  const d = block.data as unknown as TikTokCommentsData
  const [tab, setTab]                       = useState<'content' | 'style'>('content')
  const [expandedIds, setExpandedIds]       = useState<Set<string>>(new Set())
  const [upgradeOpen, setUpgradeOpen]       = useState(false)
  const [uploadingAvatarId, setUpAvatarId]  = useState<string | null>(null)
  const [uploadingImageId,  setUpImageId]   = useState<string | null>(null)

  const isPro     = plan === 'pro'
  const comments: TikTokComment[] = Array.isArray(d.comments) ? d.comments : []
  const colors    = d.colors ?? {}
  const layout    = d.layout ?? 'feed'

  function setColor(key: keyof TikTokCommentsColors, val: string) {
    onUpdate({ colors: { ...colors, [key]: val } })
  }
  function resetColor(key: keyof TikTokCommentsColors) {
    const next = { ...colors }; delete next[key]
    onUpdate({ colors: Object.keys(next).length > 0 ? next : undefined })
  }

  function updComment(id: string, patch: Partial<TikTokComment>) {
    onUpdate({ comments: comments.map(c => c.id === id ? { ...c, ...patch } : c) })
  }
  function deleteComment(id: string) { onUpdate({ comments: comments.filter(c => c.id !== id) }) }
  function addComment() {
    const id = `tc_${Date.now()}`
    const newC: TikTokComment = { id, avatarUrl: '', username: 'Usuario TikTok', verified: false, text: 'Este producto es increíble 🔥', imageUrl: '', likes: '42', date: '1 h', replyItems: [], showReply: true, showLikes: true, showReplies: false }
    onUpdate({ comments: [...comments, newC] })
    setExpandedIds(prev => { const s = new Set(Array.from(prev)); s.add(id); return s })
  }

  function updReply(commentId: string, replyId: string, patch: Partial<TikTokReply>) {
    onUpdate({ comments: comments.map(c => c.id === commentId
      ? { ...c, replyItems: (c.replyItems ?? []).map(r => r.id === replyId ? { ...r, ...patch } : r) }
      : c )})
  }
  function deleteReply(commentId: string, replyId: string) {
    onUpdate({ comments: comments.map(c => c.id === commentId
      ? { ...c, replyItems: (c.replyItems ?? []).filter(r => r.id !== replyId) }
      : c )})
  }
  function addReply(commentId: string) {
    const id = `tr_${Date.now()}`
    const newR: TikTokReply = { id, avatarUrl: '', username: 'Usuario', verified: false, text: 'Me pasó lo mismo 😂', likes: '5', date: '30 min' }
    onUpdate({ comments: comments.map(c => c.id === commentId
      ? { ...c, replyItems: [...(c.replyItems ?? []), newR], showReplies: true }
      : c )})
  }
  function toggleExpand(id: string) {
    setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, id: string, field: 'avatarUrl' | 'imageUrl') {
    const file = e.target.files?.[0]; if (!file) return
    if (field === 'avatarUrl') setUpAvatarId(id); else setUpImageId(id)
    let url: string | null = null
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const sb = createClient()
      const folder = field === 'avatarUrl' ? 'tiktok-avatars' : 'tiktok-images'
      const path = `${folder}/${Date.now()}_${file.name.replace(/\s+/g,'_')}`
      const { error } = await sb.storage.from('uploads').upload(path, file)
      if (!error) url = sb.storage.from('uploads').getPublicUrl(path).data.publicUrl
    } catch { /* fallback */ }
    updComment(id, { [field]: url ?? URL.createObjectURL(file) })
    if (field === 'avatarUrl') setUpAvatarId(null); else setUpImageId(null)
  }

  function InlineToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
      <button onClick={() => onChange(!enabled)} style={{ width: 32, height: 17, borderRadius: 999, border: 'none', padding: 2, flexShrink: 0, background: enabled ? T.purple : '#D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: enabled ? 'flex-end' : 'flex-start' }}>
        <div style={{ width: 13, height: 13, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.22)' }} />
      </button>
    )
  }

  return (
    <>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.card }}>
        {(['content', 'style'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: tab === t ? T.pink : T.ink3, borderBottom: tab === t ? `2px solid ${T.pink}` : '2px solid transparent' }}>
            {t === 'content' ? 'Contenido' : 'Estilo'}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 14px 16px' }}>

        {/* ══ CONTENIDO ══ */}
        {tab === 'content' && (
          <div>
            <FG><FL>Título</FL><FI value={d.title ?? ''} onChange={e => onUpdate({ title: e.target.value })} /></FG>

            <ToggleSection label="Subtítulo" enabled={d.showSubtitle ?? false} onToggle={v => onUpdate({ showSubtitle: v })}>
              <FTA value={d.subtitle ?? ''} onChange={e => onUpdate({ subtitle: e.target.value })} style={{ minHeight: 40 }} />
            </ToggleSection>

            <ToggleSection label="Badge" enabled={d.showBadge ?? false} onToggle={v => onUpdate({ showBadge: v })}>
              <FI value={d.badgeText ?? ''} placeholder="💬 Comentarios reales" onChange={e => onUpdate({ badgeText: e.target.value })} />
            </ToggleSection>

            {/* Comments list */}
            <div style={{ fontSize: 10, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, marginTop: 4 }}>
              Comentarios · {comments.length}
            </div>

            {comments.map(c => {
              const isOpen = expandedIds.has(c.id)
              return (
                <div key={c.id} style={{ marginBottom: 8, borderRadius: 10, border: `1px solid ${T.border2}`, background: T.card, overflow: 'hidden' }}>
                  {/* Collapsed header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                    <TikTokAvatar url={c.avatarUrl} name={c.username} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.username}</span>
                        {c.verified && <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#20d5ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#fff', fontSize: 7, fontWeight: 900 }}>✓</span></div>}
                      </div>
                      {!isOpen && <span style={{ fontSize: 10.5, color: T.ink2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{c.text}</span>}
                    </div>
                    <InlineToggle enabled={true} onChange={() => {}} />
                    <button onClick={() => toggleExpand(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: T.ink3 }}>
                      <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                  </div>

                  {/* Expanded fields */}
                  {isOpen && (
                    <div style={{ padding: '0 10px 10px', borderTop: `1px solid ${T.border}` }}>
                      <div style={{ marginTop: 10 }}>
                        {/* Username */}
                        <FG><FL>Nombre</FL><FI value={c.username} onChange={e => updComment(c.id, { username: e.target.value })} /></FG>

                        {/* Comment text */}
                        <FG><FL>Comentario</FL><FTA value={c.text} onChange={e => updComment(c.id, { text: e.target.value })} style={{ minHeight: 52 }} /></FG>

                        {/* Avatar */}
                        <FG mb={10}>
                          <FL>Avatar URL</FL>
                          <FI type="url" value={c.avatarUrl} placeholder="https://..." onChange={e => updComment(c.id, { avatarUrl: e.target.value })} />
                          {isPro ? (
                            <label style={{ display: 'block', marginTop: 6, cursor: 'pointer' }}>
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, c.id, 'avatarUrl')} />
                              <div style={{ padding: '5px 0', borderRadius: 7, border: `1.5px dashed ${T.purple}`, background: '#f3effe', color: T.purple, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                                {uploadingAvatarId === c.id ? '⏳ Subiendo...' : '🖼️ Subir avatar'}
                              </div>
                            </label>
                          ) : (
                            <button onClick={() => setUpgradeOpen(true)} style={{ width: '100%', marginTop: 6, padding: '5px 0', borderRadius: 7, border: `1.5px dashed ${T.border2}`, background: '#fafbfc', color: '#9CA3AF', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                              <Lock size={10} /> Subir avatar <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1px 5px', borderRadius: 4 }}>Pro</span>
                            </button>
                          )}
                        </FG>

                        {/* Image */}
                        <FG mb={10}>
                          <FL>Imagen en comentario (URL)</FL>
                          <FI type="url" value={c.imageUrl} placeholder="https://..." onChange={e => updComment(c.id, { imageUrl: e.target.value })} />
                          {isPro ? (
                            <label style={{ display: 'block', marginTop: 6, cursor: 'pointer' }}>
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e, c.id, 'imageUrl')} />
                              <div style={{ padding: '5px 0', borderRadius: 7, border: `1.5px dashed ${T.purple}`, background: '#f3effe', color: T.purple, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                                {uploadingImageId === c.id ? '⏳ Subiendo...' : '🖼️ Subir imagen'}
                              </div>
                            </label>
                          ) : (
                            <button onClick={() => setUpgradeOpen(true)} style={{ width: '100%', marginTop: 6, padding: '5px 0', borderRadius: 7, border: `1.5px dashed ${T.border2}`, background: '#fafbfc', color: '#9CA3AF', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                              <Lock size={10} /> Subir imagen <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1px 5px', borderRadius: 4 }}>Pro</span>
                            </button>
                          )}
                        </FG>

                        {/* Likes + Date row */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <FG style={{ flex: 1, marginBottom: 10 }}>
                            <FL>Likes</FL>
                            <FI value={c.likes} placeholder="13" onChange={e => updComment(c.id, { likes: e.target.value })} />
                          </FG>
                          <FG style={{ flex: 1, marginBottom: 10 }}>
                            <FL>Fecha</FL>
                            <FI value={c.date} placeholder="3 h" onChange={e => updComment(c.id, { date: e.target.value })} />
                          </FG>
                        </div>

                        {/* Toggles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                          {([
                            { key: 'verified',    label: 'Verificado' },
                            { key: 'showReply',   label: 'Mostrar botón Responder' },
                            { key: 'showLikes',   label: 'Mostrar likes' },
                            { key: 'showReplies', label: 'Mostrar "Ver respuestas"' },
                          ] as { key: keyof TikTokComment; label: string }[]).map(({ key, label }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 11.5, color: T.ink2 }}>{label}</span>
                              <InlineToggle enabled={!!c[key]} onChange={v => updComment(c.id, { [key]: v })} />
                            </div>
                          ))}
                        </div>

                        {/* Replies management */}
                        <div style={{ marginTop: 10, marginBottom: 12 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                            Respuestas · {(c.replyItems ?? []).length}/2
                          </div>
                          {(c.replyItems ?? []).map((r, ri) => (
                            <div key={r.id} style={{ marginBottom: 6, borderRadius: 8, border: `1px solid ${T.border}`, padding: '8px 10px', background: '#fafbff' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <TikTokAvatar url={r.avatarUrl} name={r.username} size={22} />
                                  <span style={{ fontSize: 11.5, fontWeight: 600, color: T.ink }}>Respuesta {ri + 1}</span>
                                </div>
                                <button onClick={() => deleteReply(c.id, r.id)} style={{ background: T.redBg, border: `1px solid ${T.redBorder}`, borderRadius: 5, color: T.red, cursor: 'pointer', padding: '3px 6px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <Trash2 size={9} /> Eliminar
                                </button>
                              </div>
                              <FG mb={5}><FL>Nombre</FL><FI value={r.username} onChange={e => updReply(c.id, r.id, { username: e.target.value })} /></FG>
                              <FG mb={5}><FL>Texto</FL><FTA value={r.text} onChange={e => updReply(c.id, r.id, { text: e.target.value })} style={{ minHeight: 40 }} /></FG>
                              <FG mb={5}>
                                <FL>Avatar URL</FL>
                                <FI type="url" value={r.avatarUrl} placeholder="https://..." onChange={e => updReply(c.id, r.id, { avatarUrl: e.target.value })} />
                              </FG>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <FG style={{ flex: 1, marginBottom: 5 }}><FL>Likes</FL><FI value={r.likes} placeholder="5" onChange={e => updReply(c.id, r.id, { likes: e.target.value })} /></FG>
                                <FG style={{ flex: 1, marginBottom: 5 }}><FL>Fecha</FL><FI value={r.date} placeholder="30 min" onChange={e => updReply(c.id, r.id, { date: e.target.value })} /></FG>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 11, color: T.ink2 }}>Verificado</span>
                                <button onClick={() => updReply(c.id, r.id, { verified: !r.verified })} style={{ width: 32, height: 17, borderRadius: 999, border: 'none', padding: 2, background: r.verified ? T.purple : '#D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: r.verified ? 'flex-end' : 'flex-start' }}>
                                  <div style={{ width: 13, height: 13, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.22)' }} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {(c.replyItems ?? []).length < 2 && (
                            <AddBtn onClick={() => addReply(c.id)} label="+ Añadir respuesta" />
                          )}
                        </div>

                        {/* Delete */}
                        <button onClick={() => deleteComment(c.id)} style={{ width: '100%', padding: '6px 0', borderRadius: 8, border: `1px solid ${T.redBorder}`, background: T.redBg, color: T.red, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          <Trash2 size={11} /> Eliminar comentario
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <AddBtn onClick={addComment} label="Añadir comentario" />
          </div>
        )}

        {/* ══ ESTILO ══ */}
        {tab === 'style' && (
          <div>

            {/* Layout */}
            <FG mb={14}>
              <FL>Layout</FL>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => onUpdate({ layout: 'feed' })} style={{ flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, border: `1.5px solid ${layout === 'feed' ? T.purple : T.border2}`, background: layout === 'feed' ? '#f3effe' : T.card, color: layout === 'feed' ? T.purple : T.ink2 }}>
                  Feed Vertical
                </button>
                {isPro ? (
                  <button onClick={() => onUpdate({ layout: 'carousel' })} style={{ flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, border: `1.5px solid ${layout === 'carousel' ? T.purple : T.border2}`, background: layout === 'carousel' ? '#f3effe' : T.card, color: layout === 'carousel' ? T.purple : T.ink2 }}>
                    Carousel
                  </button>
                ) : (
                  <button onClick={() => setUpgradeOpen(true)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, border: `1.5px solid ${T.border2}`, background: T.card, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Lock size={10} /> Carousel <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1px 5px', borderRadius: 4 }}>Pro</span>
                  </button>
                )}
              </div>
              {!isPro && layout === 'carousel' && (
                <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: '#FFFBF0', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Lock size={11} color="#d97706" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.ink }}>Carousel is available on Pro</span>
                  </div>
                  <button onClick={() => setUpgradeOpen(true)} style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Upgrade to Pro</button>
                </div>
              )}
            </FG>

            {/* Carousel options */}
            {layout === 'carousel' && isPro && (
              <div style={{ marginBottom: 14, padding: '10px 10px 8px', borderRadius: 8, border: `1px solid ${T.border2}`, background: '#fafbff' }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Opciones Carousel</div>
                {([
                  { key: 'showArrows', label: 'Mostrar flechas' },
                  { key: 'showDots',   label: 'Mostrar dots' },
                ] as { key: 'showArrows' | 'showDots'; label: string }[]).map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 11.5, color: T.ink2 }}>{label}</span>
                    <button onClick={() => onUpdate({ [key]: !((d as unknown as Record<string, unknown>)[key] ?? true) })} style={{ width: 32, height: 17, borderRadius: 999, border: 'none', padding: 2, background: (d[key] ?? true) ? T.pink : '#D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: (d[key] ?? true) ? 'flex-end' : 'flex-start' }}>
                      <div style={{ width: 13, height: 13, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.22)' }} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 11.5, color: T.ink2 }}>Autoplay</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1.5px 5px', borderRadius: 4 }}>Pro</span>
                  </div>
                  <button onClick={() => onUpdate({ autoplay: !d.autoplay })} style={{ width: 32, height: 17, borderRadius: 999, border: 'none', padding: 2, background: d.autoplay ? T.pink : '#D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: d.autoplay ? 'flex-end' : 'flex-start' }}>
                    <div style={{ width: 13, height: 13, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.22)' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Border radius */}
            <FG mb={12}>
              <FL>Border radius</FL>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['square','soft','medium','round'] as const).map(v => {
                  const active = (d.borderRadius ?? 'soft') === v
                  return <button key={v} onClick={() => onUpdate({ borderRadius: v })} style={{ flex: 1, padding: '5px 0', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 600, border: `1.5px solid ${active ? T.purple : T.border2}`, background: active ? '#f3effe' : T.card, color: active ? T.purple : T.ink2 }}>
                    {v === 'square' ? 'Sq' : v === 'soft' ? 'Soft' : v === 'medium' ? 'Med' : 'Rnd'}
                  </button>
                })}
              </div>
            </FG>

            {/* Shadow */}
            <FG mb={12}>
              <FL>Shadow</FL>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['none','soft','medium'] as const).map(v => {
                  const active = (d.shadowIntensity ?? 'soft') === v
                  return <button key={v} onClick={() => onUpdate({ shadowIntensity: v })} style={{ flex: 1, padding: '6px 0', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 600, border: `1.5px solid ${active ? T.purple : T.border2}`, background: active ? '#f3effe' : T.card, color: active ? T.purple : T.ink2 }}>
                    {v === 'none' ? 'None' : v === 'soft' ? 'Soft' : 'Medium'}
                  </button>
                })}
              </div>
            </FG>

            {/* Spacing */}
            <FG mb={14}>
              <FL>Espaciado</FL>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['compact','normal','airy'] as const).map(v => {
                  const active = (d.spacing ?? 'normal') === v
                  return <button key={v} onClick={() => onUpdate({ spacing: v })} style={{ flex: 1, padding: '6px 0', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 600, border: `1.5px solid ${active ? T.purple : T.border2}`, background: active ? '#f3effe' : T.card, color: active ? T.purple : T.ink2 }}>
                    {v === 'compact' ? 'Compact' : v === 'normal' ? 'Normal' : 'Airy'}
                  </button>
                })}
              </div>
            </FG>

            <div style={{ height: 1, background: T.border, margin: '0 0 12px' }} />

            {/* Colors */}
            <div style={{ fontSize: 9.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Colores</div>

            <PDColorSection label="Fondo">
              <PDColorRow label="Fondo sección" value={colors.sectionBg}      onChange={v => setColor('sectionBg', v)}      onReset={() => resetColor('sectionBg')} />
              <PDColorRow label="Fondo card"    value={colors.cardBg}         onChange={v => setColor('cardBg', v)}         onReset={() => resetColor('cardBg')} />
            </PDColorSection>

            <PDColorSection label="Texto">
              <PDColorRow label="Nombre"     value={colors.nameColor}  onChange={v => setColor('nameColor', v)}  onReset={() => resetColor('nameColor')} />
              <PDColorRow label="Comentario" value={colors.textColor}  onChange={v => setColor('textColor', v)}  onReset={() => resetColor('textColor')} />
              <PDColorRow label="Likes"      value={colors.likesColor} onChange={v => setColor('likesColor', v)} onReset={() => resetColor('likesColor')} />
              <PDColorRow label="Enlaces"    value={colors.linkColor}  onChange={v => setColor('linkColor', v)}  onReset={() => resetColor('linkColor')} />
            </PDColorSection>

            <PDColorSection label="Badges">
              <PDColorRow label="Badge accent" value={colors.badgeColor}    onChange={v => setColor('badgeColor', v)}    onReset={() => resetColor('badgeColor')} />
              <PDColorRow label="Verificado"   value={colors.verifiedColor} onChange={v => setColor('verifiedColor', v)} onReset={() => resetColor('verifiedColor')} />
              <PDColorRow label="Separador"    value={colors.separatorColor} onChange={v => setColor('separatorColor', v)} onReset={() => resetColor('separatorColor')} />
            </PDColorSection>

            {Object.keys(colors).length > 0 && (
              <button onClick={() => onUpdate({ colors: undefined })} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border2}`, background: 'none', color: T.ink3, fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <RotateCcw size={11} /> Restablecer colores
              </button>
            )}
          </div>
        )}

      </div>

      {upgradeOpen && (
        <UpgradeProModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          title="Función Pro"
          description="El Carousel, subida de imágenes y Autoplay están disponibles en el plan Pro."
        />
      )}
    </>
  )
}

// ─── Before / After editor (2 tabs: Contenido / Estilo) ──────────────────────
type BAPreset = 'light' | 'pink' | 'purple' | 'dark'
interface BAPresetFull {
  colors: BeforeAfterColors
  borderRadius: 'square' | 'soft' | 'medium' | 'round'
  shadowIntensity: 'none' | 'soft' | 'medium'
}
const BA_PRESETS: Record<BAPreset, BAPresetFull> = {
  light: {
    colors: {
      backgroundColor: '#ffffff', cardBackgroundColor: '#f9fafb',
      titleColor: '#111827', subtitleColor: '#6b7280',
      badgeBackgroundColor: '#fce7f3', badgeTextColor: '#db2777',
      labelBeforeBackground: '#374151', labelAfterBackground: '#16a34a', labelTextColor: '#ffffff',
      buttonBackgroundColor: '#111827', buttonTextColor: '#ffffff', borderColor: '#e5e7eb',
    },
    borderRadius: 'soft', shadowIntensity: 'soft',
  },
  pink: {
    colors: {
      backgroundColor: '#fdf2f8', cardBackgroundColor: '#ffffff',
      titleColor: '#831843', subtitleColor: '#9d174d',
      badgeBackgroundColor: '#fce7f3', badgeTextColor: '#be185d',
      labelBeforeBackground: '#9d174d', labelAfterBackground: '#ec4899', labelTextColor: '#ffffff',
      buttonBackgroundColor: '#db2777', buttonTextColor: '#ffffff', borderColor: '#fbcfe8',
    },
    borderRadius: 'soft', shadowIntensity: 'soft',
  },
  purple: {
    colors: {
      backgroundColor: '#f5f3ff', cardBackgroundColor: '#ffffff',
      titleColor: '#3b0764', subtitleColor: '#6b21a8',
      badgeBackgroundColor: '#ede9fe', badgeTextColor: '#6d28d9',
      labelBeforeBackground: '#6d28d9', labelAfterBackground: '#7c3aed', labelTextColor: '#ffffff',
      buttonBackgroundColor: '#7c3aed', buttonTextColor: '#ffffff', borderColor: '#ddd6fe',
    },
    borderRadius: 'medium', shadowIntensity: 'medium',
  },
  dark: {
    colors: {
      backgroundColor: '#0f0f10', cardBackgroundColor: 'rgba(255,255,255,0.07)',
      titleColor: '#ffffff', subtitleColor: 'rgba(255,255,255,0.60)',
      badgeBackgroundColor: 'rgba(246,71,169,0.18)', badgeTextColor: '#F647A9',
      labelBeforeBackground: '#374151', labelAfterBackground: '#F647A9', labelTextColor: '#ffffff',
      buttonBackgroundColor: '#F647A9', buttonTextColor: '#ffffff', borderColor: 'rgba(255,255,255,0.10)',
    },
    borderRadius: 'soft', shadowIntensity: 'none',
  },
}
const BA_PRESET_LABELS: Record<BAPreset, string> = { light: 'Light', pink: 'Pink', purple: 'Purple', dark: 'Dark' }

function BeforeAfterEditor({ block, onUpdate, plan }: {
  block: LandingBlock
  onUpdate: (d: Partial<LandingBlock['data']>) => void
  plan: Plan
}) {
  const d = block.data as unknown as BeforeAfterData
  const [tab, setTab]                   = useState<'content' | 'style'>('content')
  const [upgradeOpen, setUpgradeOpen]   = useState(false)
  const [uploadingBefore, setUploadingBefore] = useState(false)
  const [uploadingAfter,  setUploadingAfter]  = useState(false)

  const isPro   = plan === 'pro'
  const colors  = d.colors ?? {}
  const mode    = d.mode ?? 'cards'

  function setColor(key: keyof BeforeAfterColors, val: string) {
    onUpdate({ colors: { ...colors, [key]: val } })
  }
  function resetColor(key: keyof BeforeAfterColors) {
    const next = { ...colors }; delete next[key]
    onUpdate({ colors: Object.keys(next).length > 0 ? next : undefined })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'beforeImageUrl' | 'afterImageUrl') {
    const file = e.target.files?.[0]
    if (!file) return
    if (field === 'beforeImageUrl') setUploadingBefore(true)
    else setUploadingAfter(true)
    let url: string | null = null
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const sb = createClient()
      const path = `before-after/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const { error } = await sb.storage.from('uploads').upload(path, file)
      if (!error) url = sb.storage.from('uploads').getPublicUrl(path).data.publicUrl
    } catch { /* fallback */ }
    onUpdate({ [field]: url ?? URL.createObjectURL(file) })
    if (field === 'beforeImageUrl') setUploadingBefore(false)
    else setUploadingAfter(false)
  }

  return (
    <>
      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.card }}>
        {(['content', 'style'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 11.5, fontWeight: 600,
            color: tab === t ? T.pink : T.ink3,
            borderBottom: tab === t ? `2px solid ${T.pink}` : '2px solid transparent',
          }}>
            {t === 'content' ? 'Contenido' : 'Estilo'}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 14px 16px' }}>

        {/* ══ CONTENIDO ══ */}
        {tab === 'content' && (
          <div>
            <FG>
              <FL>Título</FL>
              <FI value={d.title ?? ''} onChange={e => onUpdate({ title: e.target.value })} />
            </FG>

            <ToggleSection label="Badge" enabled={d.showBadge ?? true} onToggle={v => onUpdate({ showBadge: v })}>
              <FI value={d.badgeText ?? ''} placeholder="Transformación real" onChange={e => onUpdate({ badgeText: e.target.value })} />
            </ToggleSection>

            <ToggleSection label="Subtítulo" enabled={d.showSubtitle ?? true} onToggle={v => onUpdate({ showSubtitle: v })}>
              <FTA value={d.subtitle ?? ''} onChange={e => onUpdate({ subtitle: e.target.value })} style={{ minHeight: 44 }} />
            </ToggleSection>

            {/* Mode selector */}
            <FG mb={4}>
              <FL>Modo</FL>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => onUpdate({ mode: 'cards' })}
                  style={{ flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, border: `1.5px solid ${mode === 'cards' ? T.purple : T.border2}`, background: mode === 'cards' ? '#f3effe' : T.card, color: mode === 'cards' ? T.purple : T.ink2 }}>
                  Cards
                </button>
                {isPro ? (
                  <button
                    onClick={() => onUpdate({ mode: 'slider' })}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, border: `1.5px solid ${mode === 'slider' ? T.purple : T.border2}`, background: mode === 'slider' ? '#f3effe' : T.card, color: mode === 'slider' ? T.purple : T.ink2 }}>
                    Slider
                  </button>
                ) : (
                  <button
                    onClick={() => setUpgradeOpen(true)}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, border: `1.5px solid ${T.border2}`, background: T.card, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Lock size={10} />
                    Slider
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1px 5px', borderRadius: 4 }}>Pro</span>
                  </button>
                )}
              </div>
            </FG>
            {!isPro && mode === 'slider' && (
              <div style={{ marginBottom: 12, padding: '8px 10px', borderRadius: 8, background: '#FFFBF0', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Lock size={11} color="#d97706" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.ink }}>Before / After Slider is available on Pro</span>
                </div>
                <button onClick={() => setUpgradeOpen(true)} style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  Upgrade to Pro
                </button>
              </div>
            )}

            {/* Images */}
            <div style={{ fontSize: 10, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, marginTop: 4 }}>Imágenes</div>

            <FG mb={12}>
              <FL>Before image URL</FL>
              <FI type="url" value={d.beforeImageUrl ?? ''} placeholder="https://..." onChange={e => onUpdate({ beforeImageUrl: e.target.value })} />
              {isPro ? (
                <label style={{ display: 'block', marginTop: 6, cursor: 'pointer' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'beforeImageUrl')} />
                  <div style={{ padding: '6px 0', borderRadius: 7, border: `1.5px dashed ${T.purple}`, background: '#f3effe', color: T.purple, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                    {uploadingBefore ? '⏳ Subiendo...' : '🖼️ Subir imagen Before'}
                  </div>
                </label>
              ) : (
                <button onClick={() => setUpgradeOpen(true)} style={{ width: '100%', marginTop: 6, padding: '6px 0', borderRadius: 7, border: `1.5px dashed ${T.border2}`, background: '#fafbfc', color: '#9CA3AF', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Lock size={10} /> Subir imagen <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1px 5px', borderRadius: 4 }}>Pro</span>
                </button>
              )}
            </FG>

            <FG mb={14}>
              <FL>After image URL</FL>
              <FI type="url" value={d.afterImageUrl ?? ''} placeholder="https://..." onChange={e => onUpdate({ afterImageUrl: e.target.value })} />
              {isPro ? (
                <label style={{ display: 'block', marginTop: 6, cursor: 'pointer' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'afterImageUrl')} />
                  <div style={{ padding: '6px 0', borderRadius: 7, border: `1.5px dashed ${T.purple}`, background: '#f3effe', color: T.purple, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                    {uploadingAfter ? '⏳ Subiendo...' : '🖼️ Subir imagen After'}
                  </div>
                </label>
              ) : (
                <button onClick={() => setUpgradeOpen(true)} style={{ width: '100%', marginTop: 6, padding: '6px 0', borderRadius: 7, border: `1.5px dashed ${T.border2}`, background: '#fafbfc', color: '#9CA3AF', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <Lock size={10} /> Subir imagen <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1px 5px', borderRadius: 4 }}>Pro</span>
                </button>
              )}
            </FG>

            {/* Labels */}
            <div style={{ display: 'flex', gap: 8 }}>
              <FG style={{ flex: 1, marginBottom: 14 }}>
                <FL>Label Before</FL>
                <FI value={d.beforeLabel ?? 'Antes'} onChange={e => onUpdate({ beforeLabel: e.target.value })} />
              </FG>
              <FG style={{ flex: 1, marginBottom: 14 }}>
                <FL>Label After</FL>
                <FI value={d.afterLabel ?? 'Después'} onChange={e => onUpdate({ afterLabel: e.target.value })} />
              </FG>
            </div>

            <ToggleSection label="Descriptions" enabled={d.showDescriptions ?? true} onToggle={v => onUpdate({ showDescriptions: v })}>
              <FG mb={8}>
                <FL>Before description</FL>
                <FTA value={d.beforeDescription ?? ''} onChange={e => onUpdate({ beforeDescription: e.target.value })} style={{ minHeight: 44 }} />
              </FG>
              <FG mb={0}>
                <FL>After description</FL>
                <FTA value={d.afterDescription ?? ''} onChange={e => onUpdate({ afterDescription: e.target.value })} style={{ minHeight: 44 }} />
              </FG>
            </ToggleSection>

            <ToggleSection label="CTA" enabled={d.showCTA ?? false} onToggle={v => onUpdate({ showCTA: v })}>
              <FG mb={8}>
                <FL>Button text</FL>
                <FI value={d.buttonText ?? 'Ver producto'} onChange={e => onUpdate({ buttonText: e.target.value })} />
              </FG>
              <FG mb={0}>
                <FL>Button URL</FL>
                <FI type="url" value={d.buttonUrl ?? ''} placeholder="https://tutienda.com/producto" onChange={e => onUpdate({ buttonUrl: e.target.value })} />
              </FG>
            </ToggleSection>
          </div>
        )}

        {/* ══ ESTILO ══ */}
        {tab === 'style' && (
          <div>

            {/* ── Free: Border radius + Shadow ── */}
            <FG mb={12}>
              <FL>Border radius</FL>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['square', 'soft', 'medium', 'round'] as const).map(v => {
                  const active = (d.borderRadius ?? 'soft') === v
                  return (
                    <button key={v} onClick={() => onUpdate({ borderRadius: v })} style={{
                      flex: 1, padding: '5px 0', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 600,
                      border: `1.5px solid ${active ? T.purple : T.border2}`,
                      background: active ? '#f3effe' : T.card,
                      color: active ? T.purple : T.ink2,
                    }}>
                      {v === 'square' ? 'Sq' : v === 'soft' ? 'Soft' : v === 'medium' ? 'Med' : 'Rnd'}
                    </button>
                  )
                })}
              </div>
            </FG>

            <FG mb={14}>
              <FL>Shadow</FL>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['none', 'soft', 'medium'] as const).map(v => {
                  const active = (d.shadowIntensity ?? 'soft') === v
                  return (
                    <button key={v} onClick={() => onUpdate({ shadowIntensity: v })} style={{
                      flex: 1, padding: '6px 0', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      border: `1.5px solid ${active ? T.purple : T.border2}`,
                      background: active ? '#f3effe' : T.card,
                      color: active ? T.purple : T.ink2,
                    }}>
                      {v === 'none' ? 'None' : v === 'soft' ? 'Soft' : 'Medium'}
                    </button>
                  )
                })}
              </div>
            </FG>

            <div style={{ height: 1, background: T.border, margin: '0 0 14px' }} />

            {/* ── Pro: Presets + Custom Colors ── */}
            {isPro ? (
              <>
                {/* Presets */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>Presets</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {(Object.keys(BA_PRESETS) as BAPreset[]).map(name => {
                      const p = BA_PRESETS[name]
                      return (
                        <button key={name}
                          onClick={() => onUpdate({ colors: p.colors, borderRadius: p.borderRadius, shadowIntensity: p.shadowIntensity })}
                          style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border2}`, background: T.card, fontSize: 11, fontWeight: 600, color: T.ink2, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f3effe')}
                          onMouseLeave={e => (e.currentTarget.style.background = T.card)}
                        >
                          {BA_PRESET_LABELS[name]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ height: 1, background: T.border, margin: '0 0 12px' }} />

                {/* Custom Colors */}
                <div style={{ fontSize: 9.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Custom Colors</div>

                <PDColorSection label="Sección">
                  <PDColorRow label="Background" value={colors.backgroundColor}    onChange={v => setColor('backgroundColor', v)}    onReset={() => resetColor('backgroundColor')} />
                  <PDColorRow label="Título"      value={colors.titleColor}          onChange={v => setColor('titleColor', v)}          onReset={() => resetColor('titleColor')} />
                  <PDColorRow label="Subtítulo"   value={colors.subtitleColor}       onChange={v => setColor('subtitleColor', v)}       onReset={() => resetColor('subtitleColor')} />
                </PDColorSection>

                <PDColorSection label="Badge">
                  <PDColorRow label="Badge background" value={colors.badgeBackgroundColor} onChange={v => setColor('badgeBackgroundColor', v)} onReset={() => resetColor('badgeBackgroundColor')} />
                  <PDColorRow label="Badge text"       value={colors.badgeTextColor}       onChange={v => setColor('badgeTextColor', v)}       onReset={() => resetColor('badgeTextColor')} />
                </PDColorSection>

                <PDColorSection label="Cards">
                  <PDColorRow label="Card color"   value={colors.cardBackgroundColor} onChange={v => setColor('cardBackgroundColor', v)} onReset={() => resetColor('cardBackgroundColor')} />
                  <PDColorRow label="Border color" value={colors.borderColor}         onChange={v => setColor('borderColor', v)}         onReset={() => resetColor('borderColor')} />
                </PDColorSection>

                <PDColorSection label="Labels">
                  <PDColorRow label="Before label bg" value={colors.labelBeforeBackground} onChange={v => setColor('labelBeforeBackground', v)} onReset={() => resetColor('labelBeforeBackground')} />
                  <PDColorRow label="After label bg"  value={colors.labelAfterBackground}  onChange={v => setColor('labelAfterBackground', v)}  onReset={() => resetColor('labelAfterBackground')} />
                  <PDColorRow label="Label text"      value={colors.labelTextColor}         onChange={v => setColor('labelTextColor', v)}         onReset={() => resetColor('labelTextColor')} />
                </PDColorSection>

                <PDColorSection label="Botón CTA">
                  <PDColorRow label="Button background" value={colors.buttonBackgroundColor} onChange={v => setColor('buttonBackgroundColor', v)} onReset={() => resetColor('buttonBackgroundColor')} />
                  <PDColorRow label="Button text"       value={colors.buttonTextColor}       onChange={v => setColor('buttonTextColor', v)}       onReset={() => resetColor('buttonTextColor')} />
                </PDColorSection>

                {Object.keys(colors).length > 0 && (
                  <button onClick={() => onUpdate({ colors: undefined })} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border2}`, background: 'none', color: T.ink3, fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <RotateCcw size={11} /> Restablecer colores
                  </button>
                )}
              </>
            ) : (
              /* Lock for Free users */
              <div style={{ padding: '14px', borderRadius: 10, background: '#FFFBF0', border: '1px solid #FDE68A', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 5 }}>
                  <Lock size={13} color="#d97706" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>Presets & Custom Colors</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#92400e', background: '#FEF3C7', padding: '1.5px 6px', borderRadius: 4 }}>Pro</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: T.ink2, lineHeight: 1.4 }}>
                  Personaliza colores, presets y el estilo visual completo del bloque.
                </p>
                <button onClick={() => setUpgradeOpen(true)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
                  Actualizar a Pro
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {upgradeOpen && (
        <UpgradeProModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          title="Función Pro"
          description="El modo Slider y la subida de imágenes están disponibles en el plan Pro."
        />
      )}
    </>
  )
}

// ─── Partner Discounts editor (2 tabs: Contenido / Estilo) ────────────────────
function PartnerDiscountsEditor({ block, onUpdate, onUpdateStyle, plan, theme }: {
  block: LandingBlock
  onUpdate: (d: Partial<LandingBlock['data']>) => void
  onUpdateStyle: (patch: Partial<BlockStyle>) => void
  plan: Plan
  theme: LandingTheme
}) {
  const d = block.data as unknown as PartnerDiscountsData
  const [tab, setTab]                   = useState<'content' | 'style'>('content')
  const [expandedIds, setExpandedIds]   = useState<Set<string>>(new Set())
  const [upgradeOpen, setUpgradeOpen]   = useState(false)
  const [uploadingId, setUploadingId]   = useState<string | null>(null)

  const isPro      = plan === 'pro'
  const discounts: PartnerDiscount[] = Array.isArray(d.discounts) ? d.discounts : []
  const layout     = d.layout ?? 'compact'
  const colors     = d.colors ?? {}

  function setColor(key: keyof PDColors, val: string) {
    onUpdate({ colors: { ...colors, [key]: val } })
  }
  function resetColor(key: keyof PDColors) {
    const next = { ...colors }; delete next[key]
    onUpdate({ colors: Object.keys(next).length > 0 ? next : undefined })
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>, dcId: string) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingId(dcId)
    let url: string | null = null
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const sb = createClient()
      const path = `partner-logos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const { error } = await sb.storage.from('uploads').upload(path, file)
      if (!error) url = sb.storage.from('uploads').getPublicUrl(path).data.publicUrl
    } catch { /* fallback */ }
    const finalUrl = url ?? URL.createObjectURL(file)
    updDiscount(dcId, { logoUrl: finalUrl })
    setUploadingId(null)
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  function updDiscount(id: string, patch: Partial<PartnerDiscount>) {
    onUpdate({ discounts: discounts.map(dc => dc.id === id ? { ...dc, ...patch } : dc) })
  }

  function deleteDiscount(id: string) {
    onUpdate({ discounts: discounts.filter(dc => dc.id !== id) })
  }

  function duplicateDiscount(id: string) {
    const dc = discounts.find(dc => dc.id === id)
    if (!dc) return
    const idx = discounts.findIndex(dc => dc.id === id)
    const newDc: PartnerDiscount = { ...dc, id: `pd_${Date.now()}` }
    const next = [...discounts]; next.splice(idx + 1, 0, newDc)
    onUpdate({ discounts: next })
    setExpandedIds(prev => { const s = new Set(Array.from(prev)); s.add(newDc.id); return s })
  }

  function addDiscount() {
    const id = `pd_${Date.now()}`
    const newDc: PartnerDiscount = { id, brandName: 'Nueva Marca', storeUrl: '', logoUrl: '', description: '', discountText: '10% OFF', code: 'CODIGO10', buttonText: 'Ver oferta', buttonUrl: '', isPopular: false, enabled: true }
    onUpdate({ discounts: [...discounts, newDc] })
    setExpandedIds(prev => { const s = new Set(Array.from(prev)); s.add(id); return s })
  }

  const tabLabels: Record<typeof tab, string> = { content: 'Contenido', style: 'Estilo' }

  return (
    <>
      {/* ── Tab bar (spans full width, no outer padding) ── */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.card }}>
        {(['content', 'style'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 11.5, fontWeight: 600,
            color: tab === t ? T.pink : T.ink3,
            borderBottom: tab === t ? `2px solid ${T.pink}` : '2px solid transparent',
          }}>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 14px 16px' }}>

        {/* ══ CONTENIDO ══ */}
        {tab === 'content' && (
          <div>
            {/* Block text fields */}
            <FG>
              <FL>Título</FL>
              <FI value={d.title ?? ''} onChange={e => onUpdate({ title: e.target.value })} />
            </FG>
            <FG>
              <FL>Subtítulo</FL>
              <FTA value={d.subtitle ?? ''} onChange={e => onUpdate({ subtitle: e.target.value })} style={{ minHeight: 44 }} />
            </FG>
            <FG>
              <FL>Texto del badge</FL>
              <FI value={d.badgeText ?? ''} placeholder="♦ Ofertas exclusivas" onChange={e => onUpdate({ badgeText: e.target.value })} />
            </FG>
            <FG mb={14}>
              <FL>Texto del footer</FL>
              <FI value={d.footerText ?? ''} placeholder="Nuevas ofertas cada semana" onChange={e => onUpdate({ footerText: e.target.value })} />
            </FG>

            {/* Section header */}
            <div style={{ fontSize: 10, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
              Descuentos
            </div>

            {/* Discount items */}
            {discounts.map(dc => {
              const isOpen = expandedIds.has(dc.id)
              return (
                <div key={dc.id} style={{ marginBottom: 8, borderRadius: 10, border: `1px solid ${T.border2}`, background: T.card, overflow: 'hidden' }}>
                  {/* Collapsed header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                    <GripVertical size={13} color={T.ink3} style={{ flexShrink: 0 }} />
                    <PDLogo storeUrl={dc.storeUrl} logoUrl={dc.logoUrl} brandName={dc.brandName} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: isOpen ? 0 : 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dc.brandName || 'Sin nombre'}</span>
                        {dc.isPopular && <span style={{ fontSize: 9, fontWeight: 700, color: T.pink, background: '#FFE3F1', padding: '1.5px 6px', borderRadius: 999, flexShrink: 0 }}>♦ Popular</span>}
                      </div>
                      {!isOpen && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {dc.discountText && <span style={{ fontSize: 10, fontWeight: 700, color: T.pink, background: '#FFE3F1', padding: '1px 6px', borderRadius: 5 }}>{dc.discountText}</span>}
                          {dc.code && <span style={{ fontSize: 10, fontWeight: 600, color: T.ink2, background: '#F4F4F6', padding: '1px 6px', borderRadius: 5 }}>{dc.code}</span>}
                        </div>
                      )}
                    </div>
                    {/* Enabled toggle */}
                    <button onClick={() => updDiscount(dc.id, { enabled: !dc.enabled })} style={{ width: 32, height: 17, borderRadius: 999, border: 'none', padding: 2, flexShrink: 0, background: dc.enabled ? T.purple : '#D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: dc.enabled ? 'flex-end' : 'flex-start' }}>
                      <div style={{ width: 13, height: 13, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.22)' }} />
                    </button>
                    {/* Expand chevron */}
                    <button onClick={() => toggleExpand(dc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: T.ink3 }}>
                      <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                  </div>

                  {/* Expanded fields */}
                  {isOpen && (
                    <div style={{ padding: '0 10px 10px', borderTop: `1px solid ${T.border}` }}>
                      <div style={{ marginTop: 10 }}>
                        <FG>
                          <FL>Nombre del partner</FL>
                          <FI value={dc.brandName} onChange={e => updDiscount(dc.id, { brandName: e.target.value })} />
                        </FG>

                        {/* Store URL with tooltip */}
                        <FG>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                            <FL>Store URL</FL>
                            <FPInfoTooltip text="Pega la URL de la tienda o partner. Tokproof intentará detectar automáticamente el logo desde el dominio." />
                          </div>
                          <FI type="url" value={dc.storeUrl} placeholder="https://gymshark.com" onChange={e => updDiscount(dc.id, { storeUrl: e.target.value })} />
                        </FG>

                        {/* Upload custom logo — Pro gated, real upload */}
                        {isPro ? (
                          <FG mb={10}>
                            <label style={{ display: 'block', cursor: 'pointer' }}>
                              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleLogoUpload(e, dc.id)} />
                              <div style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1.5px dashed ${T.purple}`, background: '#f3effe', color: T.purple, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                {uploadingId === dc.id ? '⏳ Subiendo...' : (dc.logoUrl ? '🖼️ Cambiar logo' : '🖼️ Subir logo personalizado')}
                              </div>
                            </label>
                            {dc.logoUrl && (
                              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={dc.logoUrl} alt="" style={{ width: 28, height: 28, borderRadius: 5, objectFit: 'contain', border: `1px solid ${T.border2}` }} />
                                <button onClick={() => updDiscount(dc.id, { logoUrl: '' })} style={{ fontSize: 10, color: T.red, background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
                              </div>
                            )}
                          </FG>
                        ) : (
                          <FG mb={10}>
                            <button onClick={() => setUpgradeOpen(true)} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1.5px dashed ${T.border2}`, background: '#fafbfc', color: '#9CA3AF', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                              <Lock size={11} /> Subir logo personalizado
                              <span style={{ fontSize: 9, fontWeight: 700, color: '#7c3aed', background: '#ede7fd', padding: '1px 5px', borderRadius: 4 }}>Pro</span>
                            </button>
                          </FG>
                        )}

                        {/* Code + Discount row */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <FG style={{ flex: 1, marginBottom: 10 }}>
                            <FL>Código de descuento</FL>
                            <FI value={dc.code} placeholder="GYM15" onChange={e => updDiscount(dc.id, { code: e.target.value.toUpperCase() })} />
                          </FG>
                          <FG style={{ flex: 1, marginBottom: 10 }}>
                            <FL>Descuento</FL>
                            <FI value={dc.discountText} placeholder="15% OFF" onChange={e => updDiscount(dc.id, { discountText: e.target.value })} />
                          </FG>
                        </div>

                        {/* Popular toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: T.ink2 }}>Popular</span>
                          <button onClick={() => updDiscount(dc.id, { isPopular: !dc.isPopular })} style={{ width: 32, height: 17, borderRadius: 999, border: 'none', padding: 2, background: dc.isPopular ? T.pink : '#D1D5DB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: dc.isPopular ? 'flex-end' : 'flex-start' }}>
                            <div style={{ width: 13, height: 13, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.22)' }} />
                          </button>
                        </div>

                        <FG>
                          <FL>Descripción (opcional)</FL>
                          <FTA value={dc.description} placeholder="En toda la tienda. No acumulable con otras ofertas." onChange={e => updDiscount(dc.id, { description: e.target.value })} style={{ minHeight: 44 }} />
                        </FG>

                        <FG>
                          <FL>Enlace del botón</FL>
                          <FI type="url" value={dc.buttonUrl || dc.storeUrl} placeholder="https://gymshark.com" onChange={e => updDiscount(dc.id, { buttonUrl: e.target.value })} />
                        </FG>

                        <FG mb={12}>
                          <FL>Texto del botón</FL>
                          <FI value={dc.buttonText} placeholder="Ver oferta" onChange={e => updDiscount(dc.id, { buttonText: e.target.value })} />
                        </FG>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => duplicateDiscount(dc.id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${T.border2}`, background: 'none', color: T.ink2, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Copy size={11} /> Duplicar
                          </button>
                          <button onClick={() => deleteDiscount(dc.id)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1px solid ${T.redBorder}`, background: T.redBg, color: T.red, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <Trash2 size={11} /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <AddBtn onClick={addDiscount} label="Añadir descuento" />

            {/* Ajustes del bloque */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Ajustes del bloque</div>
              <PDToggle label="Mostrar logos"                  value={d.showLogos          ?? true}  onChange={v => onUpdate({ showLogos: v })} />
              <PDToggle label="Mostrar descripción"            value={d.showDescriptions   ?? false} onChange={v => onUpdate({ showDescriptions: v })} />
              <PDToggle label='Mostrar botón "Copiar código"'  value={d.showCopyButton     ?? true}  onChange={v => onUpdate({ showCopyButton: v })} />
              <PDToggle label="Mostrar botón externo"          value={d.showExternalButton ?? true}  onChange={v => onUpdate({ showExternalButton: v })} />
              <PDToggle label="Mostrar footer"                 value={d.showFooterText     ?? true}  onChange={v => onUpdate({ showFooterText: v })} />
            </div>

            {upgradeOpen && (
              <UpgradeProModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} title="Logos personalizados" description="Sube logos personalizados para tus partners con el plan Pro." />
            )}
          </div>
        )}

        {/* ══ ESTILO ══ */}
        {tab === 'style' && (
          <div>
            {/* Layout */}
            <FG mb={12}>
              <FL>Layout</FL>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['compact', 'detailed'] as const).map(v => (
                  <button key={v} onClick={() => onUpdate({ layout: v })} style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 600,
                    border: `1.5px solid ${layout === v ? T.purple : T.border2}`,
                    background: layout === v ? '#f3effe' : T.card,
                    color: layout === v ? T.purple : T.ink2,
                  }}>
                    {v === 'compact' ? 'Compact' : 'Detailed'}
                  </button>
                ))}
              </div>
            </FG>

            {/* Shadow intensity */}
            <FG mb={12}>
              <FL>Shadow</FL>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['none', 'soft', 'medium'] as const).map(v => {
                  const active = (d.shadowIntensity ?? 'soft') === v
                  return (
                    <button key={v} onClick={() => onUpdate({ shadowIntensity: v })} style={{
                      flex: 1, padding: '6px 0', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      border: `1.5px solid ${active ? T.purple : T.border2}`,
                      background: active ? '#f3effe' : T.card,
                      color: active ? T.purple : T.ink2,
                    }}>
                      {v === 'none' ? 'None' : v === 'soft' ? 'Soft' : 'Medium'}
                    </button>
                  )
                })}
              </div>
            </FG>

            <div style={{ height: 1, background: T.border, margin: '0 0 12px' }} />

            {/* Presets + Colors — Pro only */}
            {isPro ? (
              <>
                {/* Presets */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: T.ink3, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>Presets</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {(Object.keys(PD_PRESETS) as PresetName[]).map(name => (
                      <button key={name} onClick={() => onUpdate({ colors: PD_PRESETS[name] })} style={{
                        flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border2}`,
                        background: T.card, fontSize: 11, fontWeight: 600, color: T.ink2, cursor: 'pointer',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f3effe')}
                        onMouseLeave={e => (e.currentTarget.style.background = T.card)}
                      >
                        {PRESET_LABELS[name]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color grid */}
                <PDColorSection label="Sección">
                  <PDColorRow label="Fondo sección"  value={colors.sectionBg}      onChange={v => setColor('sectionBg', v)}      onReset={() => resetColor('sectionBg')} />
                  <PDColorRow label="Título"         value={colors.titleColor}     onChange={v => setColor('titleColor', v)}     onReset={() => resetColor('titleColor')} />
                  <PDColorRow label="Subtítulo"      value={colors.subtitleColor}  onChange={v => setColor('subtitleColor', v)}  onReset={() => resetColor('subtitleColor')} />
                </PDColorSection>

                <PDColorSection label="Badge">
                  <PDColorRow label="Fondo badge"  value={colors.badgeBg}   onChange={v => setColor('badgeBg', v)}   onReset={() => resetColor('badgeBg')} />
                  <PDColorRow label="Texto badge"  value={colors.badgeText} onChange={v => setColor('badgeText', v)} onReset={() => resetColor('badgeText')} />
                </PDColorSection>

                <PDColorSection label="Tarjetas">
                  <PDColorRow label="Fondo card"    value={colors.cardBg}          onChange={v => setColor('cardBg', v)}          onReset={() => resetColor('cardBg')} />
                  <PDColorRow label="Borde card"    value={colors.cardBorder}      onChange={v => setColor('cardBorder', v)}      onReset={() => resetColor('cardBorder')} />
                  <PDColorRow label="Nombre marca"  value={colors.brandColor}      onChange={v => setColor('brandColor', v)}      onReset={() => resetColor('brandColor')} />
                  <PDColorRow label="Descripción"   value={colors.descriptionColor}onChange={v => setColor('descriptionColor', v)}onReset={() => resetColor('descriptionColor')} />
                </PDColorSection>

                <PDColorSection label="Chips">
                  <PDColorRow label="Descuento fondo"  value={colors.discountBg}   onChange={v => setColor('discountBg', v)}   onReset={() => resetColor('discountBg')} />
                  <PDColorRow label="Descuento texto"  value={colors.discountText} onChange={v => setColor('discountText', v)} onReset={() => resetColor('discountText')} />
                  <PDColorRow label="Código fondo"     value={colors.codeBg}       onChange={v => setColor('codeBg', v)}       onReset={() => resetColor('codeBg')} />
                  <PDColorRow label="Código texto"     value={colors.codeText}     onChange={v => setColor('codeText', v)}     onReset={() => resetColor('codeText')} />
                  <PDColorRow label="Copiar fondo"     value={colors.copyBg}       onChange={v => setColor('copyBg', v)}       onReset={() => resetColor('copyBg')} />
                  <PDColorRow label="Copiar icono"     value={colors.copyText}     onChange={v => setColor('copyText', v)}     onReset={() => resetColor('copyText')} />
                </PDColorSection>

                <PDColorSection label="Botón externo (Detailed)">
                  <PDColorRow label="Fondo botón"  value={colors.ctaBg}   onChange={v => setColor('ctaBg', v)}   onReset={() => resetColor('ctaBg')} />
                  <PDColorRow label="Texto botón"  value={colors.ctaText} onChange={v => setColor('ctaText', v)} onReset={() => resetColor('ctaText')} />
                </PDColorSection>

                <PDColorSection label="Footer">
                  <PDColorRow label="Fondo footer"  value={colors.footerBg}        onChange={v => setColor('footerBg', v)}        onReset={() => resetColor('footerBg')} />
                  <PDColorRow label="Texto footer"  value={colors.footerTextColor} onChange={v => setColor('footerTextColor', v)} onReset={() => resetColor('footerTextColor')} />
                </PDColorSection>

                {Object.keys(colors).length > 0 && (
                  <button onClick={() => onUpdate({ colors: undefined })} style={{ marginTop: 4, width: '100%', padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border2}`, background: 'none', color: T.ink3, fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <RotateCcw size={11} /> Restablecer colores
                  </button>
                )}
              </>
            ) : (
              /* Upgrade prompt for Free users */
              <div style={{ padding: '14px', borderRadius: 10, background: '#FFFBF0', border: '1px solid #FDE68A', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 5 }}>
                  <Lock size={13} color="#d97706" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>Colores y Presets</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#92400e', background: '#FEF3C7', padding: '1.5px 6px', borderRadius: 4 }}>Pro</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: T.ink2, lineHeight: 1.4 }}>
                  Personaliza colores, presets y el estilo visual completo del bloque.
                </p>
                <button onClick={() => setUpgradeOpen(true)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>
                  Actualizar a Pro
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}

// ─── Add block trigger (opens catalog panel) ─────────────────────────────────
// ─── Main export ──────────────────────────────────────────────────────────────
export default function SortableBlockList({
  blocks, theme, plan = 'free',
  onUpdateBlock, onUpdateBlockStyle, onToggleVisibility, onDelete, onDuplicate, onMove, onAdd,
}: Props) {
  const { t } = useTranslation()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // ── Inline selector state ──
  const [isAdding, setIsAdding]         = useState(false)
  const [q, setQ]                       = useState('')
  const [filter, setFilter]             = useState<'todos' | 'free' | 'pro' | 'soon'>('todos')
  const [lastAddedId, setLastAddedId]   = useState<string | null>(null)
  const [upgradeOpen, setUpgradeOpen]   = useState(false)
  // ── Popover state (hover-only, no pinned) ──
  const [activeEntry, setActiveEntry]   = useState<CatalogEntry | null>(null)
  const [popTop, setPopTop]             = useState(0)
  const [popLeft, setPopLeft]           = useState(302)
  const leaveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef      = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const selectorRef   = useRef<HTMLDivElement>(null)
  const prevCountRef  = useRef(blocks.length)

  // Highlight + scroll when new block is added
  useEffect(() => {
    if (blocks.length > prevCountRef.current) {
      const newBlock = blocks[blocks.length - 1]
      if (newBlock) {
        setLastAddedId(newBlock.id)
        // Scroll the blocks area to the bottom so new block is visible
        requestAnimationFrame(() => {
          scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
          // find the newly added item
          const el = scrollAreaRef.current?.querySelector(`[data-block-id="${newBlock.id}"]`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
        const t = setTimeout(() => setLastAddedId(null), 1200)
        prevCountRef.current = blocks.length
        return () => clearTimeout(t)
      }
    }
    prevCountRef.current = blocks.length
  }, [blocks])

  // When selector opens, scroll down so it's visible
  useEffect(() => {
    if (isAdding) {
      requestAnimationFrame(() => {
        selectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    }
  }, [isAdding])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const from = blocks.findIndex(b => b.id === active.id)
      const to   = blocks.findIndex(b => b.id === over.id)
      if (from !== -1 && to !== -1) onMove(from, to)
    }
  }

  // ── Popover helpers (hover-only, no pinned state) ──
  function scheduleClose() {
    leaveTimer.current = setTimeout(() => setActiveEntry(null), 140)
  }
  function cancelClose() { if (leaveTimer.current) clearTimeout(leaveTimer.current) }

  function handleCardHover(entry: CatalogEntry, el: HTMLElement) {
    cancelClose()
    const r = el.getBoundingClientRect()
    // Anchor popover to the right edge of the panel column (viewport-relative)
    const panelRight = panelRef.current?.getBoundingClientRect().right ?? r.right
    setPopTop(r.top)
    setPopLeft(panelRight + 14)
    setActiveEntry(entry)
  }
  function closePopover() { cancelClose(); setActiveEntry(null) }

  function closeSelector() {
    setIsAdding(false); setQ(''); setFilter('todos')
    closePopover()
  }

  function handleAdd(type: LandingBlock['type'], data: LandingBlock['data']) {
    onAdd(type, data)
    closeSelector()
  }

  const filteredCatalog = BLOCKS_CATALOG.filter(b =>
    (filter === 'todos' || b.tag === filter) &&
    b.label.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      <style>{`@keyframes blkPopIn { from { opacity:0; transform:translateY(5px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
      <div ref={panelRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Bloques · {blocks.length}
          </span>
        </div>

        {/* ── Existing blocks (DnD) ── */}
        <div
          ref={scrollAreaRef}
          style={{
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flex: isAdding ? '0 0 auto' : '1 1 auto',
            maxHeight: isAdding ? 'clamp(110px, 30vh, 240px)' : 'none',
            padding: '10px 10px 2px',
          }}
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block, idx) => (
                <div key={block.id} data-block-id={block.id}>
                  <SortableItem
                    block={block} theme={theme}
                    idx={idx}
                    plan={plan}
                    highlighted={lastAddedId === block.id}
                    onUpdateBlock={onUpdateBlock}
                    onUpdateBlockStyle={onUpdateBlockStyle}
                    onToggleVisibility={onToggleVisibility}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
          {blocks.length === 0 && !isAdding && (
            <div style={{ padding: 24, textAlign: 'center', color: T.ink3, fontSize: 12 }}>Sin bloques. Añade uno abajo.</div>
          )}
        </div>

        {/* ── Inline block selector ── */}
        {isAdding ? (
          <div ref={selectorRef} style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', borderTop: '2px solid #ede7fd', overflow: 'hidden', background: '#fefbff' }}>

            {/* Selector header + search */}
            <div style={{ padding: '10px 12px 6px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '.06em' }}>{t('block.addBlock')}</span>
                <button onClick={closeSelector}
                  style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 3, borderRadius: 6 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f2f3f5'; (e.currentTarget as HTMLButtonElement).style.color = '#5b5566' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                <input
                  value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Buscar bloque..."
                  autoFocus
                  style={{ width: '100%', border: '1px solid rgba(123,97,255,0.18)', borderRadius: 9, padding: '7px 10px 7px 30px', fontSize: 12, outline: 'none', background: '#fff', color: '#171717', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#c4a9f4'}
                  onBlur={e => e.target.style.borderColor = 'rgba(123,97,255,0.18)'}
                />
              </div>
            </div>

            {/* Filter pills */}
            <div style={{ padding: '0 12px 8px', display: 'flex', gap: 5, flexShrink: 0 }}>
              {(['todos', 'free', 'pro', 'soon'] as const).map(k => (
                <button key={k} onClick={() => setFilter(k)} style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: filter === k ? '#7c3aed' : '#f3f4f6',
                  color: filter === k ? '#fff' : '#374151',
                  transition: 'all .12s',
                }}>
                  {k === 'todos' ? 'Todos' : k === 'free' ? 'Free' : k === 'pro' ? 'Pro' : 'Próxim.'}
                </button>
              ))}
            </div>

            {/* Block cards — scrollable */}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 10px 48px' }}>
              {filteredCatalog.map(entry => (
                <InlineBlockCard
                  key={entry.type}
                  entry={entry}
                  plan={plan}
                  isActive={activeEntry?.type === entry.type}
                  onAdd={handleAdd}
                  onUpgrade={() => setUpgradeOpen(true)}
                  onHover={handleCardHover}
                  onLeave={scheduleClose}
                />
              ))}
              {filteredCatalog.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Sin resultados</div>
              )}
            </div>
          </div>
        ) : (
          /* ── Add button ── */
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
            <button
              onClick={() => setIsAdding(true)}
              style={{ width: '100%', padding: '10px 0', borderRadius: 999, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .12s, border-color .12s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f3effe'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4a9f4' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = T.border2 }}
            >
              <Plus size={15} strokeWidth={2.2} /> {t('block.addBlock')}
            </button>
          </div>
        )}
      </div>

      <UpgradeProModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Bloque premium"
        description="Este bloque está disponible en el plan Pro. Actualiza para añadir bloques premium a tus páginas."
      />

      {/* Popover flotante — position:fixed, anclado al right edge del panel */}
      {isAdding && activeEntry && (
        <BlockPreviewPopover
          key={activeEntry.type}
          entry={activeEntry}
          top={popTop}
          left={popLeft}
          onClose={closePopover}
          onAdd={handleAdd}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          plan={plan}
          onUpgrade={() => { closePopover(); setUpgradeOpen(true) }}
        />
      )}
    </>
  )
}
