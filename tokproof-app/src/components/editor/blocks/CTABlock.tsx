import type { LandingBlock, LandingTheme, CTAData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function CTABlock({ block, theme }: Props) {
  const d  = block.data as unknown as CTAData
  const rs = resolveBlockStyle(block, theme)

  const btnStyle: React.CSSProperties =
    d.style === 'gradient'
      ? { background: rs.grad, color: rs.buttonText, border: 'none', boxShadow: `0 10px 28px ${rs.accent}44` }
      : d.style === 'outline'
      ? { background: 'transparent', color: rs.accent, border: `2px solid ${rs.accent}` }
      : { background: rs.accent, color: rs.buttonText, border: 'none' }

  return (
    <div style={{ background: rs.bg, padding: rs.pad, textAlign: 'center', fontFamily: rs.fontFamily }}>
      <button style={{
        width: '100%', padding: '14px 20px', borderRadius: rs.btnR,
        fontSize: rs.body + 2, fontWeight: 800, cursor: 'pointer',
        letterSpacing: '-0.01em', lineHeight: 1.3,
        ...btnStyle,
      }}>
        {d.text || '🛒 Comprar ahora'}
      </button>
      {d.subtext && (
        <p style={{ marginTop: 8, fontSize: rs.sub, color: rs.textSecondary, fontWeight: 500 }}>
          {d.subtext}
        </p>
      )}
    </div>
  )
}
