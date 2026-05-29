import type { LandingBlock, LandingTheme, HeroProductData } from '@/types/landing'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function HeroProductBlock({ block, theme }: Props) {
  const d = block.data as unknown as HeroProductData
  const grad = `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`

  return (
    <div style={{ background: theme.backgroundColor, padding: '20px 18px 24px', color: theme.textColor }}>
      {/* Image placeholder */}
      <div style={{
        width: '100%', aspectRatio: '16/9', borderRadius: 14, marginBottom: 14,
        background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.12)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        overflow: 'hidden',
      }}>
        {d.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <span style={{ fontSize: 28 }}>🖼️</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Imagen del producto</span>
          </>
        )}
      </div>

      {/* Badge */}
      {d.showBadge && d.badgeText && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.1)', color: '#FFD700', letterSpacing: '.02em',
          }}>{d.badgeText}</span>
        </div>
      )}

      {/* Headline */}
      <h1 style={{
        fontSize: 20, fontWeight: 800, lineHeight: 1.25, marginBottom: 8,
        letterSpacing: '-0.02em', color: theme.textColor,
      }}>{d.headline || 'Tu headline aquí'}</h1>

      {/* Subheadline */}
      {d.subheadline && (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginBottom: 10 }}>
          {d.subheadline}
        </p>
      )}

      {/* Description */}
      {d.description && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 12 }}>
          {d.description}
        </p>
      )}

      {/* Rating */}
      {d.showRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ color: '#FFD700', fontSize: 13 }}>★★★★★</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{d.rating} · +2.4K reseñas</span>
        </div>
      )}

      {/* Quick CTA teaser */}
      <div style={{ marginTop: 18, padding: '11px 16px', borderRadius: 12, background: grad, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
        🛒 Ver producto oficial
      </div>
    </div>
  )
}
