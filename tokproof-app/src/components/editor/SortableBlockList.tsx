'use client'

import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Eye, EyeOff, Copy, Trash2, ChevronDown, Plus, RotateCcw,
} from 'lucide-react'
import type {
  LandingBlock, LandingTheme, BlockStyle,
  HeroProductData, BenefitsData, BenefitItem,
  LinkListData, LinkItem,
  FAQData, FaqItem,
  CTAData,
} from '@/types/landing'
import { FONT_OPTIONS } from '@/lib/blockStyle'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  pink: '#F647A9', purple: '#7B61FF',
  ink: '#171717', ink2: '#6B7280', ink3: '#9CA3AF',
  border: 'rgba(123,97,255,0.10)', border2: 'rgba(123,97,255,0.16)',
  softPink2: '#FFE3F1', card: '#FFFFFF', bg: '#FEFBFF',
} as const

// ─── Block icons ──────────────────────────────────────────────────────────────
const BLOCK_ICONS: Record<string, string> = {
  hero_product: '🏷️', benefits: '✨', tiktok_comments: '💬',
  reviews: '⭐', faq: '❓', cta: '🛒', link_list: '🔗',
  profile_header: '👤', product_grid: '📦', trust_badges: '🛡️',
}

// ─── Available blocks to add ──────────────────────────────────────────────────
const ADD_BLOCKS: Array<{ type: LandingBlock['type']; label: string; defaultData: LandingBlock['data'] }> = [
  { type: 'hero_product', label: 'Hero del producto',   defaultData: { headline: 'Nuevo titular', subheadline: '', description: '', imageUrl: '', badgeText: '★ 4.9/5', showBadge: true, showRating: true, rating: '4.9' } },
  { type: 'benefits',     label: 'Beneficios',          defaultData: { title: 'Por qué elegirlo', items: [{ icon: '✨', title: 'Beneficio 1', description: 'Descripción.' }] } },
  { type: 'faq',          label: 'Preguntas frecuentes', defaultData: { title: 'FAQ', items: [{ id: 'faq_new', question: '¿Pregunta?', answer: 'Respuesta.' }] } },
  { type: 'cta',          label: 'Botón CTA',           defaultData: { text: '🛒 Comprar ahora', subtext: '', url: '', style: 'gradient' } },
  { type: 'link_list',    label: 'Lista de links',       defaultData: { title: 'Links', links: [{ id: 'link_new', label: 'Mi link', url: '', visible: true }] } },
]

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  blocks: LandingBlock[]
  theme: LandingTheme
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
  block, theme,
  onUpdateBlock, onUpdateBlockStyle, onToggleVisibility, onDelete, onDuplicate,
}: {
  block: LandingBlock
  theme: LandingTheme
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
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 100 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={dragStyle}>
      {/* ── Header row ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 12px 8px 6px',
        borderBottom: `1px solid ${T.border}`,
        background: expanded ? T.bg : T.card,
        opacity: block.visible ? 1 : 0.45,
      }}>
        <button
          {...attributes} {...listeners}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', padding: '2px 4px', background: 'none', border: 'none', color: T.ink3, flexShrink: 0, display: 'flex', touchAction: 'none' }}
        >
          <GripVertical size={15} />
        </button>

        <button
          onClick={() => setExpanded(e => !e)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0 }}
        >
          <span style={{ fontSize: 15, flexShrink: 0 }}>{BLOCK_ICONS[block.type] ?? '▪️'}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {block.label}
          </span>
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
          <ChevronDown
            size={13} color={T.ink3}
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => setExpanded(e => !e)}
          />
        </div>
      </div>

      {/* ── Expanded section ───────────────────────────────────────── */}
      {expanded && (
        <div style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.card }}>
            {([['content', 'Contenido'], ['design', 'Diseño']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '7px 0', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 11.5, fontWeight: 600,
                  color: tab === key ? T.pink : T.ink3,
                  borderBottom: tab === key ? `2px solid ${T.pink}` : '2px solid transparent',
                  transition: 'color .15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
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
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: danger ? '#EF4444' : T.ink3, opacity: disabled ? 0.3 : 1,
    }}>
      {children}
    </button>
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
  return (
    <input {...props} style={{
      width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12,
      border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none',
      ...props.style,
    }} />
  )
}
function FTA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} style={{
      width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12,
      border: `1px solid ${T.border2}`, background: T.card, color: T.ink,
      outline: 'none', resize: 'vertical', minHeight: 52,
      ...props.style,
    }} />
  )
}
function FSel(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{
      width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12,
      border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none',
      ...props.style,
    }} />
  )
}

// ─── Pill group ───────────────────────────────────────────────────────────────
function PillGroup<T extends string>({ options, value, onChange }: {
  options: Array<{ key: T; label: string }>
  value: T | undefined
  onChange: (v: T | undefined) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o.key
        return (
          <button
            key={o.key}
            onClick={() => onChange(active ? undefined : o.key)}
            style={{
              padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${active ? T.pink : T.border2}`,
              background: active ? T.softPink2 : T.card,
              color: active ? T.pink : T.ink2,
              transition: 'all .12s',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Color row ────────────────────────────────────────────────────────────────
function ColRow({ label, value, effective, overridden, onChange, onReset }: {
  label: string; value: string; effective: string; overridden: boolean
  onChange: (v: string) => void; onReset: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: 26, height: 26, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 11.5, fontWeight: 500, color: T.ink2 }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: T.ink3, fontFamily: 'monospace' }}>{effective.toUpperCase()}</span>
      {overridden && (
        <button onClick={onReset} title="Usar valor del tema" style={{ width: 18, height: 18, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink3 }}>
          <RotateCcw size={10} />
        </button>
      )}
    </div>
  )
}

// ─── Design editor ────────────────────────────────────────────────────────────
function DesignEditor({ block, theme, onUpdateStyle }: {
  block: LandingBlock; theme: LandingTheme
  onUpdateStyle: (patch: Partial<BlockStyle>) => void
}) {
  const s = block.style ?? {}

  const secLabel = (text: string) => (
    <div style={{ fontSize: 10, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, marginTop: 14 }}>
      {text}
    </div>
  )

  return (
    <div>
      {/* Colors */}
      {secLabel('Colores')}
      <ColRow
        label="Fondo" value={s.backgroundColor ?? theme.backgroundColor} effective={s.backgroundColor ?? theme.backgroundColor}
        overridden={!!s.backgroundColor}
        onChange={v => onUpdateStyle({ backgroundColor: v })}
        onReset={() => onUpdateStyle({ backgroundColor: undefined })}
      />
      <ColRow
        label="Texto" value={s.textColor ?? theme.textColor} effective={s.textColor ?? theme.textColor}
        overridden={!!s.textColor}
        onChange={v => onUpdateStyle({ textColor: v })}
        onReset={() => onUpdateStyle({ textColor: undefined })}
      />
      <ColRow
        label="Acento / botón" value={s.accentColor ?? theme.primaryColor} effective={s.accentColor ?? theme.primaryColor}
        overridden={!!s.accentColor}
        onChange={v => onUpdateStyle({ accentColor: v })}
        onReset={() => onUpdateStyle({ accentColor: undefined })}
      />

      {/* Font */}
      {secLabel('Tipografía')}
      <FG mb={0}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <FSel value={s.fontFamily ?? theme.fontFamily} onChange={e => onUpdateStyle({ fontFamily: e.target.value })} style={{ flex: 1 }}>
            {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
          </FSel>
          {s.fontFamily && (
            <button onClick={() => onUpdateStyle({ fontFamily: undefined })} title="Usar tema" style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border2}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink3, flexShrink: 0 }}>
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </FG>

      {/* Font size */}
      {secLabel('Tamaño de texto')}
      <PillGroup
        options={[{ key: 'small', label: 'Pequeño' }, { key: 'medium', label: 'Medio' }, { key: 'large', label: 'Grande' }]}
        value={s.fontSize}
        onChange={v => onUpdateStyle({ fontSize: v })}
      />

      {/* Text align */}
      {secLabel('Alineación')}
      <PillGroup
        options={[{ key: 'left', label: 'Izquierda' }, { key: 'center', label: 'Centro' }]}
        value={s.textAlign}
        onChange={v => onUpdateStyle({ textAlign: v })}
      />

      {/* Border radius */}
      {secLabel('Bordes')}
      <PillGroup
        options={[{ key: 'square', label: 'Cuadrado' }, { key: 'soft', label: 'Suave' }, { key: 'medium', label: 'Medio' }, { key: 'round', label: 'Redondo' }]}
        value={s.borderRadius}
        onChange={v => onUpdateStyle({ borderRadius: v })}
      />

      {/* Spacing */}
      {secLabel('Espaciado')}
      <PillGroup
        options={[{ key: 'compact', label: 'Compacto' }, { key: 'normal', label: 'Normal' }, { key: 'airy', label: 'Amplio' }]}
        value={s.spacing}
        onChange={v => onUpdateStyle({ spacing: v })}
      />

      {/* Reset all */}
      {Object.keys(s).length > 0 && (
        <button
          onClick={() => onUpdateStyle({ backgroundColor: undefined, textColor: undefined, accentColor: undefined, fontFamily: undefined, fontSize: undefined, textAlign: undefined, borderRadius: undefined, spacing: undefined })}
          style={{ marginTop: 14, width: '100%', padding: '7px 0', borderRadius: 8, border: `1px solid ${T.border2}`, background: 'none', color: T.ink3, fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
        >
          <RotateCcw size={11} />Restablecer al tema
        </button>
      )}
    </div>
  )
}

// ─── Block content editors ────────────────────────────────────────────────────
function BlockEditor({ block, onUpdate }: {
  block: LandingBlock; onUpdate: (data: Partial<LandingBlock['data']>) => void
}) {
  switch (block.type) {
    case 'hero_product': return <HeroEditor block={block} onUpdate={onUpdate} />
    case 'benefits':     return <BenefitsEditor block={block} onUpdate={onUpdate} />
    case 'link_list':    return <LinkListEditor block={block} onUpdate={onUpdate} />
    case 'faq':          return <FAQEditor block={block} onUpdate={onUpdate} />
    case 'cta':          return <CTAEditor block={block} onUpdate={onUpdate} />
    default:
      return <p style={{ fontSize: 11, color: T.ink3, fontStyle: 'italic' }}>Editor próximamente para este bloque.</p>
  }
}

// ─── Hero editor ──────────────────────────────────────────────────────────────
function HeroEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as HeroProductData
  return (
    <>
      <FG><FL>Headline principal</FL><FI value={d.headline} onChange={e => onUpdate({ headline: e.target.value })} /></FG>
      <FG><FL>Subheadline</FL><FI value={d.subheadline} onChange={e => onUpdate({ subheadline: e.target.value })} /></FG>
      <FG><FL>Descripción</FL><FTA value={d.description} onChange={e => onUpdate({ description: e.target.value })} /></FG>
      <FG><FL>URL de imagen</FL><FI type="url" value={d.imageUrl} placeholder="https://..." onChange={e => onUpdate({ imageUrl: e.target.value })} /></FG>
      <div style={{ display: 'flex', gap: 8 }}>
        <FG style={{ flex: 1, marginBottom: 0 }}><FL>Badge</FL><FI value={d.badgeText} onChange={e => onUpdate({ badgeText: e.target.value })} /></FG>
        <FG style={{ flex: 1, marginBottom: 0 }}><FL>Rating</FL><FI value={d.rating} onChange={e => onUpdate({ rating: e.target.value })} /></FG>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.ink2, cursor: 'pointer' }}>
          <input type="checkbox" checked={d.showBadge} onChange={e => onUpdate({ showBadge: e.target.checked })} />
          Mostrar badge
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.ink2, cursor: 'pointer' }}>
          <input type="checkbox" checked={d.showRating} onChange={e => onUpdate({ showRating: e.target.checked })} />
          Mostrar rating
        </label>
      </div>
    </>
  )
}

// ─── Benefits editor ──────────────────────────────────────────────────────────
function BenefitsEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as BenefitsData

  function updateItem(i: number, patch: Partial<BenefitItem>) {
    const items = [...d.items]; items[i] = { ...items[i], ...patch }; onUpdate({ items })
  }
  function addItem() {
    onUpdate({ items: [...d.items, { icon: '⭐', title: 'Beneficio', description: 'Descripción.' }] })
  }
  function removeItem(i: number) { onUpdate({ items: d.items.filter((_, j) => j !== i) }) }

  return (
    <>
      <FG><FL>Título de sección</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.items.map((item, i) => (
        <div key={i} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={item.icon} onChange={e => updateItem(i, { icon: e.target.value })} style={{ width: 44, textAlign: 'center', flexShrink: 0 }} />
            <FI value={item.title} onChange={e => updateItem(i, { title: e.target.value })} placeholder="Título" style={{ flex: 1 }} />
            <button onClick={() => removeItem(i)} style={{ width: 30, height: 32, borderRadius: 7, border: `1px solid rgba(239,68,68,.2)`, background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={12} />
            </button>
          </div>
          <FTA value={item.description} onChange={e => updateItem(i, { description: e.target.value })} placeholder="Descripción" style={{ minHeight: 40 }} />
        </div>
      ))}
      <button onClick={addItem} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <Plus size={13} />Añadir beneficio
      </button>
    </>
  )
}

// ─── LinkList editor ──────────────────────────────────────────────────────────
function LinkListEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as LinkListData

  function updateLink(i: number, patch: Partial<LinkItem>) {
    const links = [...d.links]; links[i] = { ...links[i], ...patch }; onUpdate({ links })
  }
  function addLink() {
    onUpdate({ links: [...d.links, { id: `link_${Date.now()}`, label: 'Nuevo link', url: '', visible: true }] })
  }
  function removeLink(i: number) { onUpdate({ links: d.links.filter((_, j) => j !== i) }) }

  return (
    <>
      <FG><FL>Título de sección</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.links.map((link, i) => (
        <div key={link.id ?? i} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <FG mb={6}><FI value={link.label} onChange={e => updateLink(i, { label: e.target.value })} placeholder="Texto del botón" /></FG>
          <div style={{ display: 'flex', gap: 6 }}>
            <FI value={link.url} onChange={e => updateLink(i, { url: e.target.value })} placeholder="https://..." style={{ flex: 1 }} />
            <button onClick={() => removeLink(i)} style={{ width: 30, height: 32, borderRadius: 7, border: `1px solid rgba(239,68,68,.2)`, background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={addLink} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <Plus size={13} />Añadir link
      </button>
    </>
  )
}

// ─── FAQ editor ───────────────────────────────────────────────────────────────
function FAQEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as FAQData

  function updateItem(i: number, patch: Partial<FaqItem>) {
    const items = [...d.items]; items[i] = { ...items[i], ...patch }; onUpdate({ items })
  }
  function addItem() {
    onUpdate({ items: [...d.items, { id: `faq_${Date.now()}`, question: 'Nueva pregunta', answer: 'Respuesta aquí.' }] })
  }
  function removeItem(i: number) { onUpdate({ items: d.items.filter((_, j) => j !== i) }) }

  return (
    <>
      <FG><FL>Título de sección</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.items.map((item, i) => (
        <div key={item.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <FG mb={6}><FI value={item.question} onChange={e => updateItem(i, { question: e.target.value })} placeholder="Pregunta" /></FG>
          <div style={{ display: 'flex', gap: 6 }}>
            <FTA value={item.answer} onChange={e => updateItem(i, { answer: e.target.value })} placeholder="Respuesta" style={{ flex: 1, minHeight: 40 }} />
            <button onClick={() => removeItem(i)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid rgba(239,68,68,.2)`, background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={addItem} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <Plus size={13} />Añadir pregunta
      </button>
    </>
  )
}

// ─── CTA editor ───────────────────────────────────────────────────────────────
function CTAEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as CTAData
  return (
    <>
      <FG><FL>Texto del botón</FL><FI value={d.text} onChange={e => onUpdate({ text: e.target.value })} /></FG>
      <FG><FL>Microcopy bajo el botón</FL><FI value={d.subtext} onChange={e => onUpdate({ subtext: e.target.value })} /></FG>
      <FG><FL>URL de destino</FL><FI type="url" value={d.url} placeholder="https://tu-tienda.com/producto" onChange={e => onUpdate({ url: e.target.value })} /></FG>
      <FG mb={0}><FL>Estilo del botón</FL>
        <FSel value={d.style} onChange={e => onUpdate({ style: e.target.value as CTAData['style'] })}>
          <option value="gradient">Degradado (recomendado)</option>
          <option value="solid">Sólido</option>
          <option value="outline">Outline</option>
        </FSel>
      </FG>
    </>
  )
}

// ─── Add block picker ─────────────────────────────────────────────────────────
function AddBlockPicker({ onAdd }: { onAdd: (type: LandingBlock['type'], data: LandingBlock['data']) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
      {open && (
        <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ADD_BLOCKS.map(b => (
            <button key={b.type} onClick={() => { onAdd(b.type, b.defaultData); setOpen(false) }}
              style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.card, color: T.ink, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{BLOCK_ICONS[b.type]}</span>{b.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '9px 0', borderRadius: 999, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Plus size={14} />{open ? 'Cancelar' : 'Añadir bloque'}
      </button>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SortableBlockList({
  blocks, theme,
  onUpdateBlock, onUpdateBlockStyle, onToggleVisibility, onDelete, onDuplicate, onMove, onAdd,
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
                key={block.id}
                block={block}
                theme={theme}
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

      <AddBlockPicker onAdd={onAdd} />
    </div>
  )
}
