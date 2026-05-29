import type { LandingBlock, LandingTheme, HeroProductData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function HeroProductBlock({ block, theme }: Props) {
  const d  = block.data as unknown as HeroProductData
  const rs = resolveBlockStyle(block, theme)

  return (
    <div style={{ background: rs.bg, padding: rs.pad, color: rs.text, fontFamily: rs.fontFamily }}>
      {/* Image */}
      <div style={{
        width: '100%', aspectRatio: '16/9', borderRadius: rs.cardR, marginBottom: rs.gap + 4,
        background: rs.innerBg, border: rs.cardBorder,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        overflow: 'hidden',
      }}>
        {d.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <span style={{ fontSize: 28 }}>🖼️</span>
            <span style={{ fontSize: rs.sub, color: rs.textSecondary, fontWeight: 500 }}>Imagen del producto</span>
          </>
        )}
      </div>

      {/* Badge */}
      {d.showBadge && d.badgeText && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: rs.gap }}>
          <span style={{
            fontSize: rs.sub, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
            background: rs.innerBg, color: rs.accent, letterSpacing: '.02em',
            border: rs.cardBorder,
          }}>{d.badgeText}</span>
        </div>
      )}

      {/* Headline */}
      <h1 style={{
        fontSize: rs.h1, fontWeight: 800, lineHeight: 1.25, marginBottom: rs.gap,
        letterSpacing: '-0.02em', color: rs.text, textAlign: rs.align,
      }}>{d.headline || 'Tu headline aquí'}</h1>

      {/* Subheadline */}
      {d.subheadline && (
        <p style={{ fontSize: rs.body + 1, color: rs.textSecondary, lineHeight: 1.55, marginBottom: rs.gap, textAlign: rs.align }}>
          {d.subheadline}
        </p>
      )}

      {/* Description */}
      {d.description && (
        <p style={{ fontSize: rs.body, color: rs.textSecondary, lineHeight: 1.5, marginBottom: rs.gap, textAlign: rs.align }}>
          {d.description}
        </p>
      )}

      {/* Rating */}
      {d.showRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, justifyContent: rs.align === 'center' ? 'center' : 'flex-start' }}>
          <span style={{ color: '#FFD700', fontSize: rs.body + 1 }}>★★★★★</span>
          <span style={{ fontSize: rs.sub, color: rs.textSecondary, fontWeight: 600 }}>{d.rating} · +2.4K reseñas</span>
        </div>
      )}

      {/* Quick CTA */}
      <div style={{ marginTop: rs.gap + 8, padding: '11px 16px', borderRadius: rs.btnR, background: rs.grad, textAlign: 'center', fontSize: rs.body + 1, fontWeight: 700, color: rs.buttonText }}>
        🛒 Ver producto oficial
      </div>
    </div>
  )
}
