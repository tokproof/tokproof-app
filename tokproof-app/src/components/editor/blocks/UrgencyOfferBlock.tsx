import type { LandingBlock, LandingTheme, UrgencyOfferData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function UrgencyOfferBlock({ block, theme }: Props) {
  const d  = block.data as unknown as UrgencyOfferData
  const rs = resolveBlockStyle(block, theme)

  return (
    <div style={{ background: rs.bg, padding: rs.pad, fontFamily: rs.fontFamily, textAlign: 'center' }}>
      {/* Badge */}
      {d.badgeText && (
        <div style={{ marginBottom: rs.gap }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 999,
            background: rs.grad, color: rs.buttonText, fontSize: rs.body, fontWeight: 700,
          }}>
            {d.badgeText}
          </span>
        </div>
      )}

      {/* Title */}
      <h2 style={{ fontSize: rs.h1, fontWeight: 800, color: rs.text, marginBottom: rs.gap, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
        {d.title || '¡Oferta limitada!'}
      </h2>

      {/* Description */}
      {d.description && (
        <p style={{ fontSize: rs.body + 1, color: rs.textSecondary, lineHeight: 1.55, marginBottom: rs.gap }}>
          {d.description}
        </p>
      )}

      {/* Countdown */}
      {d.countdownEnabled && d.countdownText && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: rs.gap,
          padding: '8px 16px', borderRadius: rs.cardR,
          background: rs.innerBg, border: rs.cardBorder,
          fontSize: rs.body, fontWeight: 600, color: rs.text,
        }}>
          ⏱️ {d.countdownText}
        </div>
      )}

      {/* CTA */}
      {d.ctaText && (
        <button style={{
          width: '100%', padding: '14px 20px', borderRadius: rs.btnR,
          background: rs.btnBg, color: rs.buttonText, border: 'none', cursor: 'pointer',
          fontSize: rs.body + 2, fontWeight: 800, letterSpacing: '-0.01em',
          boxShadow: `0 10px 28px ${rs.accent}44`,
        }}>
          {d.ctaText}
        </button>
      )}
    </div>
  )
}
