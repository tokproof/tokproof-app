'use client'

import type { LandingBlock, LandingTheme, BenefitIconsRowData } from '@/types/landing'

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_ITEMS = [
  { id: 'bir1', enabled: true, icon: '✨', title: 'Brightens Skin',          description: 'Boosts radiance and evens tone'      },
  { id: 'bir2', enabled: true, icon: '💧', title: 'Deep Hydration',           description: 'Locks in moisture all day long'      },
  { id: 'bir3', enabled: true, icon: '🌿', title: 'Natural Ingredients',      description: 'Clean, vegan and cruelty-free'       },
  { id: 'bir4', enabled: true, icon: '🛡️', title: 'Dermatologist Tested',    description: 'Safe for all skin types'             },
]

// ─── Maps ─────────────────────────────────────────────────────────────────────
const SHADOW_MAP: Record<string, string> = {
  none:   'none',
  soft:   '0 2px 12px rgba(0,0,0,0.08)',
  medium: '0 5px 20px rgba(0,0,0,0.15)',
}
const RADIUS_MAP: Record<string, number> = { square: 8, soft: 14, medium: 18, round: 999 }
const SPACING_PY: Record<string, number>  = { compact: 16, normal: 28, airy: 44 }
const SPACING_GAP: Record<string, number> = { compact: 10, normal: 16, airy: 24 }

// ─── Main block ───────────────────────────────────────────────────────────────
export default function BenefitIconsRowBlock({ block, theme }: { block: LandingBlock; theme: LandingTheme }) {
  const d  = block.data as Partial<BenefitIconsRowData>
  const s  = block.style ?? {}
  const items = (d.items ?? DEFAULT_ITEMS).filter(i => i.enabled !== false)

  // ── Color resolution: block.style → theme → hard default ──
  const sectionBg  = s.backgroundColor       ?? theme.backgroundColor         ?? '#0B0B12'
  const titleClr   = s.textColor             ?? theme.textColor               ?? '#ffffff'
  const iconBg     = s.elementBackgroundColor ?? 'rgba(255,255,255,0.08)'
  const dividerClr = s.borderColor           ?? 'rgba(255,255,255,0.12)'

  const radius    = RADIUS_MAP[s.borderRadius ?? 'soft'] ?? 14
  const shadow    = SHADOW_MAP[d.itemShadow   ?? 'none'] ?? 'none'
  const py        = SPACING_PY[s.spacing     ?? 'normal'] ?? 28
  const gap       = SPACING_GAP[s.spacing    ?? 'normal'] ?? 16

  const layout     = d.layout     ?? 'row'
  const showTitle  = d.showTitle  ?? true
  const showSub    = d.showSubtitle && !!(d.subtitle)
  const showDiv    = d.showDividers ?? false

  // ── Unique class name scoped to block ID ──
  const uid = `bir${block.id.replace(/\W/g, '').slice(0, 12)}`
  const colCount = layout === 'grid' ? 2 : Math.min(items.length, 4)

  if (items.length === 0) return null

  return (
    <section style={{ background: sectionBg, paddingTop: py, paddingBottom: py, width: '100%' }}>
      {/* ── Responsive grid CSS ── */}
      <style>{`
        .${uid}{display:grid;grid-template-columns:repeat(${colCount},1fr);gap:${gap}px;padding:0 20px}
        @media(max-width:599px){.${uid}{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:340px){.${uid}{grid-template-columns:1fr}}
      `}</style>

      {/* ── Section header ── */}
      {showTitle && (d.title ?? '') && (
        <div style={{ textAlign: 'center', paddingLeft: 20, paddingRight: 20, marginBottom: showSub ? 6 : 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: titleClr, letterSpacing: '-0.02em' }}>
            {d.title}
          </h2>
        </div>
      )}
      {showSub && (
        <p style={{ margin: '0 0 20px', textAlign: 'center', paddingLeft: 20, paddingRight: 20, fontSize: 14, color: titleClr, opacity: 0.7, lineHeight: 1.5 }}>
          {d.subtitle}
        </p>
      )}

      {/* ── Items grid ── */}
      <div className={uid}>
        {items.map((item, idx) => (
          <div key={item.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
            padding: '12px 10px',
            position: 'relative',
            borderRight: showDiv && layout === 'row' && idx < items.length - 1
              ? `1px solid ${dividerClr}` : 'none',
          }}>
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: radius,
              background: iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, lineHeight: 1,
              marginBottom: 10,
              boxShadow: shadow,
              flexShrink: 0,
            }}>
              {item.icon}
            </div>
            {/* Title */}
            <div style={{ fontSize: 13, fontWeight: 700, color: titleClr, marginBottom: 4, lineHeight: 1.3 }}>
              {item.title}
            </div>
            {/* Description */}
            <div style={{ fontSize: 12, color: titleClr, opacity: 0.65, lineHeight: 1.45 }}>
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
