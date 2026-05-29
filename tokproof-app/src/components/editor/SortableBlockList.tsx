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
  GripVertical, Eye, EyeOff, Copy, Trash2, ChevronDown, Plus,
} from 'lucide-react'
import type {
  LandingBlock, LandingTheme,
  HeroProductData, BenefitsData, BenefitItem,
  LinkListData, LinkItem,
  FAQData, FaqItem,
  CTAData,
} from '@/types/landing'

// ─── Design tokens (matches editor) ──────────────────────────────────────────
const T = {
  pink: '#F647A9',
  purple: '#7B61FF',
  ink: '#171717',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
  border: 'rgba(123,97,255,0.10)',
  border2: 'rgba(123,97,255,0.16)',
  softPink2: '#FFE3F1',
  card: '#FFFFFF',
  bg: '#FEFBFF',
} as const

// ─── Block icon map ───────────────────────────────────────────────────────────
const BLOCK_ICONS: Record<string, string> = {
  hero_product: '🏷️',
  benefits: '✨',
  tiktok_comments: '💬',
  reviews: '⭐',
  faq: '❓',
  cta: '🛒',
  link_list: '🔗',
  profile_header: '👤',
  product_grid: '📦',
  trust_badges: '🛡️',
}

// ─── Available blocks to add ──────────────────────────────────────────────────
const ADD_BLOCKS: Array<{ type: LandingBlock['type']; label: string; defaultData: LandingBlock['data'] }> = [
  { type: 'hero_product', label: 'Hero del producto', defaultData: { headline: 'Nuevo titular', subheadline: '', description: '', imageUrl: '', badgeText: '★ 4.9/5', showBadge: true, showRating: true, rating: '4.9' } },
  { type: 'benefits', label: 'Beneficios', defaultData: { title: 'Por qué elegirlo', items: [{ icon: '✨', title: 'Beneficio 1', description: 'Descripción.' }] } },
  { type: 'faq', label: 'Preguntas frecuentes', defaultData: { title: 'FAQ', items: [{ id: 'faq_new', question: '¿Pregunta?', answer: 'Respuesta.' }] } },
  { type: 'cta', label: 'Botón CTA', defaultData: { text: '🛒 Comprar ahora', subtext: '', url: '', style: 'gradient' } },
  { type: 'link_list', label: 'Lista de links', defaultData: { title: 'Links', links: [{ id: 'link_new', label: 'Mi link', url: '', visible: true }] } },
]

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  blocks: LandingBlock[]
  theme: LandingTheme
  onUpdateBlock: (id: string, data: Partial<LandingBlock['data']>) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (from: number, to: number) => void
  onAdd: (type: LandingBlock['type'], defaultData: LandingBlock['data']) => void
}

// ─── Sortable item wrapper ────────────────────────────────────────────────────
function SortableItem({
  block, theme,
  onUpdateBlock, onToggleVisibility, onDelete, onDuplicate,
}: {
  block: LandingBlock
  theme: LandingTheme
  onUpdateBlock: (id: string, data: Partial<LandingBlock['data']>) => void
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: block.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 100 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style}>
      {/* ── Header row ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 12px 8px 6px',
        borderBottom: expanded ? `1px solid ${T.border}` : 'none',
        background: expanded ? T.bg : T.card,
        opacity: block.visible ? 1 : 0.45,
      }}>
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', padding: '2px 4px', background: 'none', border: 'none', color: T.ink3, flexShrink: 0, display: 'flex', touchAction: 'none' }}
        >
          <GripVertical size={15} />
        </button>

        {/* Icon + label */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0 }}
        >
          <span style={{ fontSize: 15, flexShrink: 0 }}>{BLOCK_ICONS[block.type] ?? '▪️'}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {block.label}
          </span>
        </button>

        {/* Actions */}
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

      {/* ── Editor form ─── */}
      {expanded && (
        <div style={{ padding: '12px 14px 16px', background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          <BlockEditor block={block} onUpdate={(data) => onUpdateBlock(block.id, data)} />
        </div>
      )}
    </div>
  )
}

// ─── Small icon button ────────────────────────────────────────────────────────
function IconBtn({ children, onClick, title, disabled, danger }: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 26, height: 26, borderRadius: 7, border: 'none', background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? '#EF4444' : T.ink3,
        opacity: disabled ? 0.3 : 1,
        transition: 'background .12s',
      }}
    >
      {children}
    </button>
  )
}

// ─── Form label ───────────────────────────────────────────────────────────────
function FL({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 4 }}>{children}</label>
}

// ─── Field group ──────────────────────────────────────────────────────────────
function FG({ children, mb = 10, style }: { children: React.ReactNode; mb?: number; style?: React.CSSProperties }) {
  return <div style={{ marginBottom: mb, ...style }}>{children}</div>
}

// ─── Input ────────────────────────────────────────────────────────────────────
function FI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12,
        border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none',
        ...props.style,
      }}
    />
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
function FTA(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12,
        border: `1px solid ${T.border2}`, background: T.card, color: T.ink,
        outline: 'none', resize: 'vertical', minHeight: 52,
        ...props.style,
      }}
    />
  )
}

// ─── Block-specific editors ───────────────────────────────────────────────────
function BlockEditor({ block, onUpdate }: {
  block: LandingBlock
  onUpdate: (data: Partial<LandingBlock['data']>) => void
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
        <FG style={{ flex: 1, marginBottom: 0 }}>
          <FL>Badge</FL>
          <FI value={d.badgeText} onChange={e => onUpdate({ badgeText: e.target.value })} />
        </FG>
        <FG style={{ flex: 1, marginBottom: 0 }}>
          <FL>Rating</FL>
          <FI value={d.rating} onChange={e => onUpdate({ rating: e.target.value })} />
        </FG>
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
    const items = [...d.items]
    items[i] = { ...items[i], ...patch }
    onUpdate({ items })
  }

  function addItem() {
    onUpdate({ items: [...d.items, { icon: '✨', title: 'Nuevo beneficio', description: '' }] })
  }

  function removeItem(i: number) {
    onUpdate({ items: d.items.filter((_, j) => j !== i) })
  }

  return (
    <>
      <FG><FL>Título de sección</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.items.map((item, i) => (
        <div key={i} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <FI value={item.icon} onChange={e => updateItem(i, { icon: e.target.value })} style={{ width: 42, textAlign: 'center', flexShrink: 0 }} placeholder="🌟" />
            <FI value={item.title} onChange={e => updateItem(i, { title: e.target.value })} placeholder="Título" />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <FI value={item.description} onChange={e => updateItem(i, { description: e.target.value })} placeholder="Descripción corta" style={{ flex: 1 }} />
            <button onClick={() => removeItem(i)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid rgba(239,68,68,.2)`, background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={12} />
            </button>
          </div>
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
    const links = [...d.links]
    links[i] = { ...links[i], ...patch }
    onUpdate({ links })
  }

  function addLink() {
    const id = `link_${Date.now()}`
    onUpdate({ links: [...d.links, { id, label: 'Nuevo enlace', url: '', visible: true }] })
  }

  function removeLink(i: number) {
    onUpdate({ links: d.links.filter((_, j) => j !== i) })
  }

  return (
    <>
      <FG><FL>Título</FL><FI value={d.title} onChange={e => onUpdate({ title: e.target.value })} /></FG>
      {d.links.map((link, i) => (
        <div key={link.id} style={{ padding: 10, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, marginBottom: 8 }}>
          <FG mb={6}><FI value={link.label} onChange={e => updateLink(i, { label: e.target.value })} placeholder="Etiqueta del enlace" /></FG>
          <div style={{ display: 'flex', gap: 6 }}>
            <FI value={link.url} type="url" onChange={e => updateLink(i, { url: e.target.value })} placeholder="https://..." style={{ flex: 1 }} />
            <button
              title={link.visible ? 'Ocultar' : 'Mostrar'}
              onClick={() => updateLink(i, { visible: !link.visible })}
              style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${T.border2}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.visible ? T.purple : T.ink3 }}
            >
              {link.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button onClick={() => removeLink(i)} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid rgba(239,68,68,.2)`, background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
      <button onClick={addLink} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <Plus size={13} />Añadir enlace
      </button>
    </>
  )
}

// ─── FAQ editor ───────────────────────────────────────────────────────────────
function FAQEditor({ block, onUpdate }: { block: LandingBlock; onUpdate: (d: Partial<LandingBlock['data']>) => void }) {
  const d = block.data as unknown as FAQData

  function updateItem(i: number, patch: Partial<FaqItem>) {
    const items = [...d.items]
    items[i] = { ...items[i], ...patch }
    onUpdate({ items })
  }

  function addItem() {
    const id = `faq_${Date.now()}`
    onUpdate({ items: [...d.items, { id, question: 'Nueva pregunta', answer: 'Respuesta aquí.' }] })
  }

  function removeItem(i: number) {
    onUpdate({ items: d.items.filter((_, j) => j !== i) })
  }

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
      <FG mb={0}><FL>Estilo</FL>
        <select value={d.style} onChange={e => onUpdate({ style: e.target.value as CTAData['style'] })} style={{ width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12, border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none' }}>
          <option value="gradient">Degradado (recomendado)</option>
          <option value="solid">Sólido</option>
          <option value="outline">Outline</option>
        </select>
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
            <button
              key={b.type}
              onClick={() => { onAdd(b.type, b.defaultData); setOpen(false) }}
              style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.card, color: T.ink, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span>{BLOCK_ICONS[b.type]}</span>{b.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '9px 0', borderRadius: 999, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
      >
        <Plus size={14} />{open ? 'Cancelar' : 'Añadir bloque'}
      </button>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SortableBlockList({
  blocks, theme,
  onUpdateBlock, onToggleVisibility, onDelete, onDuplicate, onMove, onAdd,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

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
      {/* Header */}
      <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Bloques · {blocks.length}
        </span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map(block => (
              <SortableItem
                key={block.id}
                block={block}
                theme={theme}
                onUpdateBlock={onUpdateBlock}
                onToggleVisibility={onToggleVisibility}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </SortableContext>
        </DndContext>
        {blocks.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: T.ink3, fontSize: 12 }}>
            Sin bloques. Añade uno abajo.
          </div>
        )}
      </div>

      {/* Add block */}
      <AddBlockPicker onAdd={onAdd} />
    </div>
  )
}
