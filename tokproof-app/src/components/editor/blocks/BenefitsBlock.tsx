import type { LandingBlock, LandingTheme, BenefitsData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function BenefitsBlock({ block, theme }: Props) {
  const d  = block.data as unknown as BenefitsData
  const rs = resolveBlockStyle(block, theme)

  return (
    <div style={{ background: rs.bg, padding: rs.pad, color: rs.text, fontFamily: rs.fontFamily }}>
      {d.title && (
        <h2 style={{ fontSize: rs.h2, fontWeight: 800, marginBottom: rs.gap + 4, letterSpacing: '-0.01em', color: rs.text, textAlign: rs.align }}>
          {d.title}
        </h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: rs.gap }}>
        {(d.items ?? []).map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px', borderRadius: rs.cardR,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: rs.body + 1, fontWeight: 700, color: rs.text, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: rs.body, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45 }}>{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
