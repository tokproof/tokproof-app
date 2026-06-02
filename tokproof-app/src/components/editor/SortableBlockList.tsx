'use client'

import { useState } from 'react'
import type { Plan } from '@/lib/plans'
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Eye, EyeOff, Copy, Trash2, ChevronDown, Plus, RotateCcw,
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

// ─── Block icons ──────────────────────────────────────────────────────────────
const BLOCK_ICONS: Record<string, string> = {
  hero_product: '🏷️', benefits: '✨', tiktok_comments: '💬',
  reviews: '⭐', faq: '❓', cta: '🛒', link_list: '🔗',
  profile_header: '👤', social_links: '📱', product_grid: '📦',
  trust_badges: '🛡️', comparison: '⚖️', urgency_offer: '🔥', footer_legal: '📋',
}

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
      { type: 'product_grid',  label: 'Product Grid',       isPremium: true,  defaultData: { title: 'Nuestros productos', subtitle: '', products: [{ id: `p_${Date.now()}`, imageUrl: '', title: 'Producto 1', price: '29.99€', compareAtPrice: '', url: '', badge: 'Nuevo', description: '' }] } },
      { type: 'trust_badges',  label: 'Trust Badges',       isPremium: true,  defaultData: { badges: [{ id: 'tb1', icon: 'shipping', title: 'Envío gratis', description: 'En pedidos +20€', enabled: true }, { id: 'tb2', icon: 'secure', title: 'Pago seguro', description: 'SSL 256 bits', enabled: true }, { id: 'tb3', icon: 'guarantee', title: 'Garantía 30d', description: 'Sin preguntas', enabled: true }, { id: 'tb4', icon: 'returns', title: 'Devoluciones', description: 'Fáciles y gratis', enabled: true }] } },
      { type: 'comparison',    label: 'Comparativa',        isPremium: true,  defaultData: { title: 'Por qué elegirnos', leftTitle: 'Otros', rightTitle: 'Nosotros', rows: [{ id: 'cr1', label: 'Calidad', leftValue: 'Media', rightValue: 'Premium', winner: 'right' }, { id: 'cr2', label: 'Precio', leftValue: 'Caro', rightValue: 'Justo', winner: 'right' }, { id: 'cr3', label: 'Soporte', leftValue: 'Limitado', rightValue: '24/7', winner: 'right' }] } },
      { type: 'urgency_offer', label: 'Urgencia / Oferta',  isPremium: true,  defaultData: { title: '¡Oferta limitada!', description: 'Solo por tiempo limitado.', badgeText: '🔥 Agotándose', countdownEnabled: false, countdownText: 'Quedan 2 horas', ctaText: '🛒 Aprovechar oferta', ctaUrl: '' } },
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
  onOpenCatalog?: () => void
}

// ─── Sortable item ────────────────────────────────────────────────────────────
function SortableItem({
  block, theme,
  onUpdateBlock, onUpdateBlockStyle, onToggleVisibility, onDelete, onDuplicate,
}: {
  block: LandingBlock; theme: LandingTheme
  onUpdateBlock: (id: string, data: Partial<LandingBlock['data']>) => void
  onUpdateBlockStyle: (id: string, style: Partial<BlockStyle>) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState<'content' | 'design'>('content')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? 0.45 : 1, zIndex: isDragging ? 100 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={dragStyle}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 12px 8px 6px', borderBottom: `1px solid ${T.border}`,
        background: expanded ? T.bg : T.card, opacity: block.visible ? 1 : 0.45,
      }}>
        <button {...attributes} {...listeners}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', padding: '2px 4px', background: 'none', border: 'none', color: T.ink3, flexShrink: 0, display: 'flex', touchAction: 'none' }}>
          <GripVertical size={15} />
        </button>
        <button onClick={() => setExpanded(e => !e)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0 }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>{BLOCK_ICONS[block.type] ?? '▪️'}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{block.label}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <IconBtn title={block.visible ? 'Ocultar' : 'Mostrar'} onClick={() => onToggleVisibility(block.id)}>
            {block.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </IconBtn>
          <IconBtn title="Duplicar" onClick={() => onDuplicate(block.id)} disabled={!!block.locked}>
            <Copy size={13} />
          </IconBtn>
          <IconBtn title="Eliminar" onClick={() => onDelete(block.id)} disabled={!!block.locked} danger>
            <Trash2 size={13} />
          </IconBtn>
          <ChevronDown size={13} color={T.ink3}
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => setExpanded(e => !e)} />
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.card }}>
            {(['content', 'design'] as const).map(key => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 11.5, fontWeight: 600,
                color: tab === key ? T.pink : T.ink3,
                borderBottom: tab === key ? `2px solid ${T.pink}` : '2px solid transparent',
              }}>
                {key === 'content' ? 'Contenido' : 'Diseño'}
              </button>
            ))}
          </div>
          <div style={{ padding: '12px 14px 16px' }}>
            {tab === 'content'
              ? <BlockEditor block={block} onUpdate={(data) => onUpdateBlock(block.id, data)} />
              : <DesignEditor block={block} theme={theme} onUpdateStyle={(patch) => onUpdateBlockStyle(block.id, patch)} />
            }
          </div>
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
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <input type="color" value={value.startsWith('#') ? value : '#1F1F22'} onChange={e => onChange(e.target.value)}
        style={{ width: 26, height: 26, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 11.5, fontWeight: 500, color: T.ink2 }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: T.ink3, fontFamily: 'monospace', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value.toUpperCase()}</span>
      {overridden && (
        <button onClick={onReset} title="Usar tema" style={{ width: 18, height: 18, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink3 }}>
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
      <ToggleSection label="Personalizar colores" enabled={colorsOn} onToggle={v => onUpdateStyle({ customColorsEnabled: v })} pro>
        <ColRow label="Fondo del bloque"  value={s.backgroundColor ?? theme.backgroundColor} overridden={!!s.backgroundColor}  onChange={v => onUpdateStyle({ backgroundColor: v })}  onReset={() => onUpdateStyle({ backgroundColor: undefined })} />
        <ColRow label="Texto"             value={s.textColor ?? theme.textColor}              overridden={!!s.textColor}         onChange={v => onUpdateStyle({ textColor: v })}         onReset={() => onUpdateStyle({ textColor: undefined })} />
        <ColRow label="Acento / botón"    value={s.accentColor ?? theme.primaryColor}         overridden={!!s.accentColor}       onChange={v => onUpdateStyle({ accentColor: v })}       onReset={() => onUpdateStyle({ accentColor: undefined })} />
        <ColRow label="Fondo elementos"   value={s.elementBackgroundColor ?? '#1F1F22'}        overridden={!!s.elementBackgroundColor} onChange={v => onUpdateStyle({ elementBackgroundColor: v })} onReset={() => onUpdateStyle({ elementBackgroundColor: undefined })} />
        <ColRow label="Borde elementos"   value={s.borderColor ?? '#2A2A2E'}                  overridden={!!s.borderColor}       onChange={v => onUpdateStyle({ borderColor: v })}       onReset={() => onUpdateStyle({ borderColor: undefined })} />
        {sub('Efecto cristal')}
        <PillGroup
          options={[{ key: 'none', label: 'Ninguno' }, { key: 'soft', label: 'Suave' }, { key: 'medium', label: 'Medio' }, { key: 'strong', label: 'Fuerte' }]}
          value={s.glassIntensity}
          onChange={v => onUpdateStyle({ glassIntensity: v as BlockStyle['glassIntensity'] })}
        />
      </ToggleSection>

      {/* Typography section */}
      <ToggleSection label="Personalizar tipografía" enabled={fontOn} onToggle={v => onUpdateStyle({ customFontEnabled: v })} pro>
        <FG mb={8}>
          <div style={{ display: 'flex', gap: 6 }}>
            <FSel value={s.fontFamily ?? theme.fontFamily} onChange={e => onUpdateStyle({ fontFamily: e.target.value })} style={{ flex: 1 }}>
              {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </FSel>
            {s.fontFamily && <button onClick={() => onUpdateStyle({ fontFamily: undefined })} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border2}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink3, flexShrink: 0 }}><RotateCcw size={11} /></button>}
          </div>
        </FG>
        {sub('Tamaño')}
        <PillGroup options={[{ key: 'small', label: 'Pequeño' }, { key: 'medium', label: 'Medio' }, { key: 'large', label: 'Grande' }]} value={s.fontSize} onChange={v => onUpdateStyle({ fontSize: v })} />
        {sub('Alineación')}
        <PillGroup options={[{ key: 'left', label: 'Izquierda' }, { key: 'center', label: 'Centro' }]} value={s.textAlign} onChange={v => onUpdateStyle({ textAlign: v })} />
      </ToggleSection>

      {/* Border & spacing section */}
      <ToggleSection label="Bordes y espaciado" enabled={borderOn} onToggle={v => onUpdateStyle({ customBorderEnabled: v })} pro>
        {sub('Bordes')}
        <PillGroup options={[{ key: 'square', label: 'Cuadrado' }, { key: 'soft', label: 'Suave' }, { key: 'medium', label: 'Medio' }, { key: 'round', label: 'Redondo' }]} value={s.borderRadius} onChange={v => onUpdateStyle({ borderRadius: v })} />
        {sub('Espaciado')}
        <PillGroup options={[{ key: 'compact', label: 'Compacto' }, { key: 'normal', label: 'Normal' }, { key: 'airy', label: 'Amplio' }]} value={s.spacing} onChange={v => onUpdateStyle({ spacing: v })} />
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
          <RotateCcw size={11} />Restablecer al tema
        </button>
      )}
    </div>
  )
}

// ─── Block content editor router ──────────────────────────────────────────────
function BlockEditor({ block, onUpdate }: {
  block: LandingBlock; onUpdate: (data: Partial<LandingBlock['data']>) => void
}) {
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
    case 'urgency_offer':  return <UrgencyOfferEditor  block={block} onUpdate={onUpdate} />
    case 'footer_legal':   return <FooterLegalEditor   block={block} onUpdate={onUpdate} />
    default:
      return <p style={{ fontSize: 11, color: T.ink3, fontStyle: 'italic' }}>Editor próximamente.</p>
  }
}

// ─── Hero editor ──────────────────────────────────────────────────────────────
function HeroEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
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
      <FG><FL>Headline principal</FL><FI value={d.headline} onChange={e => onUpdate({ headline: e.target.value })} /></FG>
      <FG><FL>Subheadline</FL><FI value={d.subheadline} onChange={e => onUpdate({ subheadline: e.target.value })} /></FG>
      <FG><FL>Descripción</FL><FTA value={d.description} onChange={e => onUpdate({ description: e.target.value })} /></FG>

      {/* ── Media section ── */}
      <div style={{ marginTop: 4, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
        <FL>Imagen o vídeo principal</FL>

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
            { key: 'extract', label: 'Extraer' },
            { key: 'image',   label: 'Imagen'  },
            { key: 'video',   label: 'Vídeo'   },
            { key: 'url',     label: 'URL'      },
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
              {extracting ? 'Extrayendo...' : 'Extraer imagen'}
            </button>
          </div>
        )}

        {mediaTab === 'image' && (
          <label style={{ display: 'block', padding: '10px', borderRadius: 8, border: `1.5px dashed ${T.border2}`, textAlign: 'center', cursor: 'pointer', fontSize: 11.5, color: T.ink2 }}>
            📷 Seleccionar imagen
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'image')} />
          </label>
        )}

        {mediaTab === 'video' && (
          <label style={{ display: 'block', padding: '10px', borderRadius: 8, border: `1.5px dashed ${T.border2}`, textAlign: 'center', cursor: 'pointer', fontSize: 11.5, color: T.ink2 }}>
            🎬 Seleccionar vídeo
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
            Eliminar media
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <FG style={{ flex: 1, marginBottom: 0 }}><FL>Badge</FL><FI value={d.badgeText} onChange={e => onUpdate({ badgeText: e.target.value })} /></FG>
        <FG style={{ flex: 1, marginBottom: 0 }}><FL>Rating</FL><FI value={d.rating} onChange={e => onUpdate({ rating: e.target.value })} /></FG>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.ink2, cursor: 'pointer' }}>
          <input type="checkbox" checked={d.showBadge} onChange={e => onUpdate({ showBadge: e.target.checked })} /> Mostrar badge
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.ink2, cursor: 'pointer' }}>
          <input type="checkbox" checked={d.showRating} onChange={e => onUpdate({ showRating: e.target.checked })} /> Mostrar rating
        </label>
      </div>
    </>
  )
}

// ─── Benefits editor ──────────────────────────────────────────────────────────
function BenefitsEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as BenefitsData
  const upd = (i: number, patch: Partial<BenefitItem>) => { const items = [...d.items]; items[i] = { ...items[i], ...patch }; onUpdate({ items }) }
  return (
    <>
      <FG><FL>Título</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.items.map((item, i) => (
        <div key={i} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={item.icon} onChange={e => upd(i, { icon: e.target.value })} style={{ width: 44, textAlign: 'center', flexShrink: 0 }} />
            <FI value={item.title} onChange={e => upd(i, { title: e.target.value })} placeholder="Título" style={{ flex: 1 }} />
            <DelBtn onClick={() => onUpdate({ items: d.items.filter((_, j) => j !== i) })} />
          </div>
          <FTA value={item.description} onChange={e => upd(i, { description: e.target.value })} placeholder="Descripción" style={{ minHeight: 40 }} />
        </div>
      ))}
      <AddBtn onClick={() => onUpdate({ items: [...d.items, { icon: '⭐', title: 'Beneficio', description: '' }] })} label="Añadir beneficio" />
    </>
  )
}

// ─── LinkList editor ──────────────────────────────────────────────────────────
function LinkListEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as LinkListData
  const upd = (i: number, patch: Partial<LinkItem>) => { const links = [...d.links]; links[i] = { ...links[i], ...patch }; onUpdate({ links }) }
  return (
    <>
      <FG><FL>Título</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.links.map((link, i) => (
        <div key={link.id ?? i} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <FG mb={6}><FI value={link.label} onChange={e => upd(i, { label: e.target.value })} placeholder="Texto del botón" /></FG>
          <div style={{ display: 'flex', gap: 6 }}>
            <FI value={link.url} onChange={e => upd(i, { url: e.target.value })} placeholder="https://..." style={{ flex: 1 }} />
            <DelBtn onClick={() => onUpdate({ links: d.links.filter((_, j) => j !== i) })} />
          </div>
        </div>
      ))}
      <AddBtn onClick={() => onUpdate({ links: [...d.links, { id: `link_${Date.now()}`, label: 'Nuevo link', url: '', visible: true }] })} label="Añadir link" />
    </>
  )
}

// ─── FAQ editor ───────────────────────────────────────────────────────────────
function FAQEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as FAQData
  const upd = (i: number, patch: Partial<FaqItem>) => { const items = [...d.items]; items[i] = { ...items[i], ...patch }; onUpdate({ items }) }
  return (
    <>
      <FG><FL>Título</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.items.map((item, i) => (
        <div key={item.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <FG mb={6}><FI value={item.question} onChange={e => upd(i, { question: e.target.value })} placeholder="Pregunta" /></FG>
          <div style={{ display: 'flex', gap: 6 }}>
            <FTA value={item.answer} onChange={e => upd(i, { answer: e.target.value })} placeholder="Respuesta" style={{ flex: 1, minHeight: 40 }} />
            <DelBtn onClick={() => onUpdate({ items: d.items.filter((_, j) => j !== i) })} />
          </div>
        </div>
      ))}
      <AddBtn onClick={() => onUpdate({ items: [...d.items, { id: `faq_${Date.now()}`, question: 'Nueva pregunta', answer: 'Respuesta.' }] })} label="Añadir pregunta" />
    </>
  )
}

// ─── CTA editor ───────────────────────────────────────────────────────────────
function CTAEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as CTAData
  return (
    <>
      <FG><FL>Texto del botón</FL><FI value={d.text} onChange={e => onUpdate({ text: e.target.value })} /></FG>
      <FG><FL>Microcopy</FL><FI value={d.subtext} onChange={e => onUpdate({ subtext: e.target.value })} /></FG>
      <FG><FL>URL de destino</FL><FI type="url" value={d.url} placeholder="https://..." onChange={e => onUpdate({ url: e.target.value })} /></FG>
      <FG mb={0}><FL>Estilo</FL>
        <FSel value={d.style} onChange={e => onUpdate({ style: e.target.value as CTAData['style'] })}>
          <option value="gradient">Degradado</option>
          <option value="solid">Sólido</option>
          <option value="outline">Outline</option>
        </FSel>
      </FG>
    </>
  )
}

// ─── Profile Header editor ────────────────────────────────────────────────────
function ProfileHeaderEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as ProfileHeaderData
  return (
    <>
      <FG><FL>Nombre</FL><FI value={d.displayName} onChange={e => onUpdate({ displayName: e.target.value })} /></FG>
      <FG><FL>@usuario</FL><FI value={d.username} onChange={e => onUpdate({ username: e.target.value })} /></FG>
      <FG><FL>Bio</FL><FTA value={d.bio} onChange={e => onUpdate({ bio: e.target.value })} style={{ minHeight: 48 }} /></FG>
      <FG><FL>URL del avatar</FL><FI type="url" value={d.avatarUrl} placeholder="https://..." onChange={e => onUpdate({ avatarUrl: e.target.value })} /></FG>
      <FG><FL>Ubicación (opcional)</FL><FI value={d.location ?? ''} placeholder="Ciudad, País" onChange={e => onUpdate({ location: e.target.value })} /></FG>
      <FG mb={0}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: T.ink2 }}>
          <input type="checkbox" checked={d.verifiedBadge} onChange={e => onUpdate({ verifiedBadge: e.target.checked })} />
          Mostrar badge verificado
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
              Activo
            </label>
            <DelBtn onClick={() => onUpdate({ links: d.links.filter((_, j) => j !== i) })} />
          </div>
          <FI value={link.url} onChange={e => upd(i, { url: e.target.value })} placeholder="https://..." />
          <FI value={link.label ?? ''} onChange={e => upd(i, { label: e.target.value })} placeholder="Texto personalizado (opcional)" style={{ marginTop: 6 }} />
        </div>
      ))}
      <AddBtn
        onClick={() => onUpdate({ links: [...d.links, { id: `sl_${Date.now()}`, platform: 'website', url: '', enabled: true }] })}
        label="Añadir red social"
      />
    </>
  )
}

// ─── Product Grid editor ──────────────────────────────────────────────────────
function ProductGridEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as ProductGridData
  const upd = (i: number, patch: Partial<ProductItem>) => { const products = [...d.products]; products[i] = { ...products[i], ...patch }; onUpdate({ products }) }
  return (
    <>
      <FG><FL>Título</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      <FG><FL>Subtítulo (opcional)</FL><FI value={d.subtitle ?? ''} onChange={e => onUpdate({ subtitle: e.target.value })} /></FG>
      {d.products.map((p, i) => (
        <div key={p.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.ink3 }}>Producto {i + 1}</span>
            <DelBtn onClick={() => onUpdate({ products: d.products.filter((_, j) => j !== i) })} />
          </div>
          <FG mb={6}><FI value={p.title} onChange={e => upd(i, { title: e.target.value })} placeholder="Nombre del producto" /></FG>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={p.price ?? ''} onChange={e => upd(i, { price: e.target.value })} placeholder="Precio (ej. 29€)" style={{ flex: 1 }} />
            <FI value={p.compareAtPrice ?? ''} onChange={e => upd(i, { compareAtPrice: e.target.value })} placeholder="Precio antes" style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={p.badge ?? ''} onChange={e => upd(i, { badge: e.target.value })} placeholder="Badge (ej. Nuevo)" style={{ flex: 1 }} />
          </div>
          <FI value={p.url} onChange={e => upd(i, { url: e.target.value })} placeholder="URL del producto" />
        </div>
      ))}
      <AddBtn
        onClick={() => onUpdate({ products: [...d.products, { id: `p_${Date.now()}`, imageUrl: '', title: 'Nuevo producto', price: '', compareAtPrice: '', url: '', badge: '', description: '' }] })}
        label="Añadir producto"
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
              <input type="checkbox" checked={badge.enabled} onChange={e => upd(i, { enabled: e.target.checked })} />Visible
            </label>
            <DelBtn onClick={() => onUpdate({ badges: d.badges.filter((_, j) => j !== i) })} />
          </div>
          <FG mb={6}><FI value={badge.title} onChange={e => upd(i, { title: e.target.value })} placeholder="Título" /></FG>
          <FI value={badge.description ?? ''} onChange={e => upd(i, { description: e.target.value })} placeholder="Descripción corta (opcional)" />
        </div>
      ))}
      <AddBtn
        onClick={() => onUpdate({ badges: [...d.badges, { id: `tb_${Date.now()}`, icon: 'verified', title: 'Nuevo badge', enabled: true }] })}
        label="Añadir badge"
      />
    </>
  )
}

// ─── Comparison editor ────────────────────────────────────────────────────────
function ComparisonEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as ComparisonData
  const upd = (i: number, patch: Partial<ComparisonRow>) => { const rows = [...d.rows]; rows[i] = { ...rows[i], ...patch }; onUpdate({ rows }) }
  return (
    <>
      <FG><FL>Título</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      <div style={{ display: 'flex', gap: 8 }}>
        <FG style={{ flex: 1, marginBottom: 10 }}><FL>Columna izquierda</FL><FI value={d.leftTitle} onChange={e => onUpdate({ leftTitle: e.target.value })} placeholder="Otros" /></FG>
        <FG style={{ flex: 1, marginBottom: 10 }}><FL>Columna derecha</FL><FI value={d.rightTitle} onChange={e => onUpdate({ rightTitle: e.target.value })} placeholder="Nosotros" /></FG>
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
        label="Añadir fila"
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

// ─── Add block trigger (opens catalog panel) ─────────────────────────────────
function AddBlockTrigger({ onOpenCatalog }: { onOpenCatalog?: () => void }) {
  return (
    <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
      <button
        onClick={onOpenCatalog}
        style={{ width: '100%', padding: '10px 0', borderRadius: 999, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .12s, border-color .12s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f3effe'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4a9f4' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = T.border2 }}
      >
        <Plus size={15} strokeWidth={2.2} /> Añadir bloque
      </button>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SortableBlockList({
  blocks, theme, plan = 'free',
  onUpdateBlock, onUpdateBlockStyle, onToggleVisibility, onDelete, onDuplicate, onMove, onAdd, onOpenCatalog,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const from = blocks.findIndex(b => b.id === active.id)
      const to   = blocks.findIndex(b => b.id === over.id)
      if (from !== -1 && to !== -1) onMove(from, to)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Bloques · {blocks.length}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map(block => (
              <SortableItem
                key={block.id} block={block} theme={theme}
                onUpdateBlock={onUpdateBlock}
                onUpdateBlockStyle={onUpdateBlockStyle}
                onToggleVisibility={onToggleVisibility}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </SortableContext>
        </DndContext>
        {blocks.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: T.ink3, fontSize: 12 }}>Sin bloques. Añade uno abajo.</div>
        )}
      </div>

      <AddBlockTrigger onOpenCatalog={onOpenCatalog} />
    </div>
  )
}
