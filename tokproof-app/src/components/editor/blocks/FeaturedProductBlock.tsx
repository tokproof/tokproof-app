import type { LandingBlock, LandingTheme, FeaturedProductData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

const DEFAULTS: FeaturedProductData = {
  imageUrl: '',
  badgeText: 'Más vendido 🔥',
  productName: 'Hair Growth Serum',
  description: 'Fórmula avanzada con ingredientes naturales para fortalecer el cabello desde la raíz.',
  rating: 4.9,
  reviewCount: '2.4K',
  price: '$29.99',
  compareAtPrice: '$39.99',
  discountText: '-25%',
  benefits: ['Estimula el crecimiento capilar', 'Ingredientes 100% naturales', 'Resultados visibles en 7 días'],
  buttonText: 'Ver producto',
  buttonUrl: '',
  showBadge: true,
  showRating: true,
  showReviews: true,
  showPrice: true,
  showCompareAtPrice: true,
  showDiscount: true,
  showBenefits: true,
  layout: 'card',
  colorTheme: 'light',
  accentColor: undefined,
  buttonStyle: 'filled',
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  return (
    <span style={{ letterSpacing: 1 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} style={{ color: i < full || (i === full && rating - full >= 0.5) ? '#f59e0b' : 'rgba(255,255,255,0.25)', fontSize: 11 }}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function FeaturedProductBlock({ block, theme }: Props) {
  const d   = { ...DEFAULTS, ...(block.data as unknown as Partial<FeaturedProductData>) }
  const rs  = resolveBlockStyle(block, theme)

  const minimal = d.layout === 'minimal'
  const dark    = d.colorTheme === 'dark'
  const outline = d.buttonStyle === 'outline'

  /* accent: block-level override → page accent → page primary */
  const acc = d.accentColor ?? rs.accent

  /* card colors — honour colorTheme override, else use page theme */
  const cardBg       = dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'
  const cardBorder   = dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.12)'
  const titleColor   = rs.text
  const subtitleColor = rs.textSecondary
  const mutedColor   = 'rgba(255,255,255,0.35)'

  const btnStyle: React.CSSProperties = outline
    ? { background: 'transparent', color: acc, border: `2px solid ${acc}` }
    : { background: acc, color: rs.buttonText, border: 'none', boxShadow: `0 8px 20px ${acc}44` }

  return (
    <div
      id={d.customAnchorId || undefined}
      style={{
        background: rs.bg,
        padding: rs.pad,
        fontFamily: rs.fontFamily,
        marginTop:    d.marginTop    ? `${d.marginTop}px`    : undefined,
        marginBottom: d.marginBottom ? `${d.marginBottom}px` : undefined,
      }}
    >
      <div style={{
        borderRadius: rs.cardR,
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        overflow: 'hidden',
        boxShadow: minimal ? 'none' : '0 8px 28px rgba(0,0,0,0.22)',
        backdropFilter: rs.glassFilter,
      }}>

        {/* ── Image (card layout only) ── */}
        {!minimal && (
          <div style={{
            position: 'relative',
            height: 176,
            background: d.imageUrl
              ? 'transparent'
              : 'linear-gradient(145deg,#fce4d6 0%,#f9c5b8 40%,#f0a496 70%,#e08880 100%)',
            overflow: 'hidden',
          }}>
            {d.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.imageUrl} alt={d.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,.22) 0%,transparent 55%)' }} />
                {/* decorative bottle placeholder */}
                <div style={{ position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)', width: 56, height: 104, background: 'linear-gradient(180deg,rgba(255,255,255,.55),rgba(240,150,120,.18))', borderRadius: '12px 12px 16px 16px', boxShadow: '0 8px 22px rgba(150,60,40,.28)' }}>
                  <div style={{ width: 20, height: 14, background: 'rgba(120,60,40,.45)', borderRadius: 3, margin: '-7px auto 0' }} />
                </div>
              </>
            )}

            {/* Badge overlay */}
            {d.showBadge && d.badgeText && (
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: rs.sub, fontWeight: 700, padding: '5px 11px', borderRadius: 999, letterSpacing: '-.01em' }}>
                {d.badgeText}
              </div>
            )}
          </div>
        )}

        <div style={{ padding: minimal ? `${rs.gap + 4}px ${rs.gap + 6}px` : `${rs.gap + 4}px ${rs.gap + 6}px ${rs.gap + 6}px` }}>

          {/* Badge (minimal) */}
          {minimal && d.showBadge && d.badgeText && (
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', color: subtitleColor, fontSize: rs.sub - 1, fontWeight: 700, padding: '3px 9px', borderRadius: 12, marginBottom: rs.gap }}>
              {d.badgeText}
            </div>
          )}

          {/* Rating */}
          {d.showRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: rs.gap }}>
              <Stars rating={Number(d.rating)} />
              <span style={{ fontSize: rs.sub, fontWeight: 700, color: titleColor }}>{d.rating}</span>
              {d.showReviews && (
                <span style={{ fontSize: rs.sub, color: mutedColor }}>({d.reviewCount} reseñas)</span>
              )}
            </div>
          )}

          {/* Product name */}
          <h3 style={{ margin: 0, fontSize: rs.h2 + 2, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.015em', color: titleColor, marginBottom: rs.gap - 2 }}>
            {d.productName}
          </h3>

          {/* Description */}
          <p style={{ margin: `0 0 ${rs.gap + 2}px`, fontSize: rs.sub, color: subtitleColor, lineHeight: 1.45 }}>
            {d.description}
          </p>

          {/* Benefits */}
          {d.showBenefits && d.benefits.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: rs.gap - 3, marginBottom: rs.gap + 4 }}>
              {d.benefits.filter(Boolean).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12.5l4.5 4.5L19 6.5" />
                  </svg>
                  <span style={{ fontSize: rs.sub, fontWeight: 600, color: titleColor }}>{b}</span>
                </div>
              ))}
            </div>
          )}

          {/* Price */}
          {d.showPrice && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: rs.gap + 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: rs.h2 + 4, fontWeight: 800, color: titleColor, letterSpacing: '-.02em' }}>
                {d.price}
              </span>
              {d.showCompareAtPrice && d.compareAtPrice && (
                <span style={{ fontSize: rs.body, color: mutedColor, textDecoration: 'line-through' }}>
                  {d.compareAtPrice}
                </span>
              )}
              {d.showDiscount && d.discountText && (
                <span style={{ fontSize: rs.sub, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: 6 }}>
                  {d.discountText}
                </span>
              )}
            </div>
          )}

          {/* CTA button */}
          <a
            href={d.buttonUrl || '#'}
            target={d.openInNewTab ? '_blank' : undefined}
            rel={d.openInNewTab ? 'noopener noreferrer' : undefined}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '13px', borderRadius: rs.btnR,
              fontSize: rs.body + 1, fontWeight: 700, textDecoration: 'none',
              cursor: 'pointer', letterSpacing: '-.01em',
              ...btnStyle,
            }}
          >
            {d.buttonText}
          </a>

        </div>
      </div>
    </div>
  )
}
