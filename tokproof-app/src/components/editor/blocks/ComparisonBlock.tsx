import type { LandingBlock, LandingTheme, ComparisonData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function ComparisonBlock({ block, theme }: Props) {
  const d  = block.data as unknown as ComparisonData
  const rs = resolveBlockStyle(block, theme)

  const cellBase: React.CSSProperties = {
    padding: '8px 10px', fontSize: rs.body, textAlign: 'center',
  }

  return (
    <div style={{ background: rs.bg, padding: rs.pad, fontFamily: rs.fontFamily }}>
      {d.title && (
        <h2 style={{ fontSize: rs.h2, fontWeight: 800, color: rs.text, marginBottom: rs.gap + 4, textAlign: rs.align }}>{d.title}</h2>
      )}

      <div style={{ borderRadius: rs.cardR, overflow: 'hidden', border: rs.cardBorder }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ ...cellBase, textAlign: 'left' }} />
          <div style={{ ...cellBase, fontWeight: 700, color: 'rgba(255,255,255,0.45)', fontSize: rs.sub }}>{d.leftTitle || 'Otros'}</div>
          <div style={{ ...cellBase, fontWeight: 700, color: rs.accent, fontSize: rs.sub }}>{d.rightTitle || 'Nosotros'}</div>
        </div>

        {/* Rows */}
        {(d.rows ?? []).map((row, i) => (
          <div key={row.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr',
            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.025)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ ...cellBase, textAlign: 'left', color: rs.text, fontWeight: 500 }}>{row.label}</div>
            <div style={{
              ...cellBase,
              color: row.winner === 'left' ? rs.accent : 'rgba(255,255,255,0.35)',
              fontWeight: row.winner === 'left' ? 700 : 400,
            }}>
              {row.winner === 'left' ? '✓ ' : ''}{row.leftValue}
            </div>
            <div style={{
              ...cellBase,
              color: row.winner === 'right' ? rs.accent : 'rgba(255,255,255,0.35)',
              fontWeight: row.winner === 'right' ? 700 : 400,
            }}>
              {row.winner === 'right' ? '✓ ' : ''}{row.rightValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
