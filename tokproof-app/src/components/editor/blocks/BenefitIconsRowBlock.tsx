'use client'

import type { LandingBlock, LandingTheme, BenefitIconsRowData } from '@/types/landing'

const DEFAULT_ITEMS = [
  { id: 'bir1', enabled: true, icon: '✨', title: 'Brightens Skin',       description: 'Boosts radiance and evens tone'   },
  { id: 'bir2', enabled: true, icon: '💧', title: 'Deep Hydration',        description: 'Locks in moisture all day long'   },
  { id: 'bir3', enabled: true, icon: '🌿', title: 'Natural Ingredients',   description: 'Clean, vegan and cruelty-free'    },
  { id: 'bir4', enabled: true, icon: '🛡️', title: 'Dermatologist Tested', description: 'Safe for all skin types'          },
]

const SHADOW_MAP: Record<string, string> = {
  none:   'none',
  soft:   '0 2px 12px rgba(0,0,0,0.08)',
  medium: '0 5px 20px rgba(0,0,0,0.15)',
}
const RADIUS_MAP: Record<string, number>  = { square: 8, soft: 14, medium: 18, round: 999 }
const SPACING_PY: Record<string, number>  = { compact: 16, normal: 28, airy: 44 }
const SPACING_GAP: Record<string, number> = { compact: 10, normal: 16, airy: 24 }
// font-size scale for title / description
const FS_TITLE: Record<string, number> = { small: 12, medium: 13, large: 15 }
const FS_DESC:  Record<string, number> = { small: 10.5, medium: 12, large: 13.5 }

export default function BenefitIconsRowBlock({ block, theme }: { block: LandingBlock; theme: LandingTheme }) {
  const d = block.data as Partial<BenefitIconsRowData>
  const s = block.style ?? {}

  const items     = (d.items ?? DEFAULT_ITEMS).filter(i => i.enabled !== false)
  if (items.length === 0) return null

  // ── Colors: block.style → theme → hard default ──
  const sectionBg  = s.backgroundColor        ?? theme.backgroundColor   ?? '#0B0B12'
  const titleClr   = s.textColor              ?? theme.textColor         ?? '#ffffff'
  const iconBg     = s.elementBackgroundColor ?? 'rgba(255,255,255,0.08)'
  const dividerClr = s.borderColor            ?? 'rgba(255,255,255,0.12)'

  // ── Shape / spacing ──
  const radius  = RADIUS_MAP[s.borderRadius ?? 'soft'] ?? 14
  const shadow  = SHADOW_MAP[d.itemShadow   ?? 'none'] ?? 'none'
  const py      = SPACING_PY[s.spacing      ?? 'normal'] ?? 28
  const gap     = SPACING_GAP[s.spacing     ?? 'normal'] ?? 16

  // ── Typography ──
  const fontFamily = s.fontFamily ?? theme.fontFamily ?? 'inherit'
  const fs_key     = s.fontSize   ?? 'medium'
  const titleSize  = FS_TITLE[fs_key] ?? 13
  const descSize   = FS_DESC[fs_key]  ?? 12
  const textAlign  = (s.textAlign as React.CSSProperties['textAlign']) ?? 'center'

  const layout  = d.layout     ?? 'row'
  const showDiv = d.showDividers ?? false

  // ── Shared item card ──
  const cardStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign, padding: '12px 14px',
  }

  const renderItem = (item: typeof items[0], idx: number) => (
    <div key={item.id} style={{
      ...cardStyle,
      borderRight: showDiv && layout === 'row' && idx < items.length - 1
        ? `1px solid ${dividerClr}` : undefined,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: radius,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, lineHeight: 1, marginBottom: 10,
        boxShadow: shadow, flexShrink: 0,
      }}>
        {item.icon}
      </div>
      <div style={{ fontSize: titleSize, fontWeight: 700, color: titleClr, marginBottom: 4, lineHeight: 1.3, width: '100%' }}>
        {item.title}
      </div>
      <div style={{ fontSize: descSize, color: titleClr, opacity: 0.65, lineHeight: 1.5, width: '100%' }}>
        {item.description}
      </div>
    </div>
  )

  return (
    <section style={{ background: sectionBg, paddingTop: py, paddingBottom: py, width: '100%', fontFamily, overflow: 'hidden' }}>

      {/* Section header */}
      {(d.showTitle ?? true) && (d.title ?? '') && (
        <div style={{ textAlign: 'center', paddingLeft: 20, paddingRight: 20, marginBottom: (d.showSubtitle && d.subtitle) ? 6 : 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: titleClr, letterSpacing: '-0.02em', fontFamily }}>
            {d.title}
          </h2>
        </div>
      )}
      {(d.showSubtitle && d.subtitle) && (
        <p style={{ margin: '0 0 20px', textAlign: 'center', paddingLeft: 20, paddingRight: 20, fontSize: 14, color: titleClr, opacity: 0.7, lineHeight: 1.5, fontFamily }}>
          {d.subtitle}
        </p>
      )}

      {/* ── Row: horizontal scroll (no wrapping, no page scroll) ── */}
      {layout === 'row' && (
        <div
          className="bir-scroll"
          style={{
            display: 'flex',
            gap,
            overflowX: 'auto',
            paddingLeft: 20,
            paddingBottom: 4,
            scrollSnapType: 'x mandatory',
            scrollPaddingLeft: 20,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {items.map((item, idx) => (
            <div key={item.id} style={{
              ...cardStyle,
              minWidth: 160,
              flexShrink: 0,
              scrollSnapAlign: 'start',
              borderRight: showDiv && idx < items.length - 1 ? `1px solid ${dividerClr}` : undefined,
            }}>
              <div style={{ width: 52, height: 52, borderRadius: radius, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, lineHeight: 1, marginBottom: 10, boxShadow: shadow, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ fontSize: titleSize, fontWeight: 700, color: titleClr, marginBottom: 4, lineHeight: 1.3, width: '100%' }}>{item.title}</div>
              <div style={{ fontSize: descSize, color: titleClr, opacity: 0.65, lineHeight: 1.5, width: '100%' }}>{item.description}</div>
            </div>
          ))}
          {/* right spacer so last card has breathing room on iOS */}
          <div style={{ minWidth: 16, flexShrink: 0 }} />
        </div>
      )}

      {/* ── Grid: 2-col, no scroll ── */}
      {layout === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap,
          paddingLeft: 20, paddingRight: 20,
        }}>
          {items.map((item, idx) => renderItem(item, idx))}
        </div>
      )}

      <style>{`.bir-scroll::-webkit-scrollbar{display:none}.bir-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </section>
  )
}
