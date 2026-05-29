import type { LandingBlock, LandingTheme, BenefitsData } from '@/types/landing'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function BenefitsBlock({ block, theme }: Props) {
  const d = block.data as unknown as BenefitsData

  return (
    <div style={{ background: theme.backgroundColor, padding: '20px 18px', color: theme.textColor }}>
      {d.title && (
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, letterSpacing: '-0.01em', color: theme.textColor }}>
          {d.title}
        </h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(d.items ?? []).map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.textColor, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45 }}>{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
