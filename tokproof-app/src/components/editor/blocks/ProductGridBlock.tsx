import type { LandingBlock, LandingTheme, ProductGridData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function ProductGridBlock({ block, theme }: Props) {
  const d  = block.data as unknown as ProductGridData
  const rs = resolveBlockStyle(block, theme)

  return (
    <div style={{ background: rs.bg, padding: rs.pad, fontFamily: rs.fontFamily }}>
      {d.title && (
        <h2 style={{ fontSize: rs.h2, fontWeight: 800, color: rs.text, marginBottom: d.subtitle ? 4 : rs.gap, textAlign: rs.align }}>{d.title}</h2>
      )}
      {d.subtitle && (
        <p style={{ fontSize: rs.body, color: 'rgba(255,255,255,0.55)', marginBottom: rs.gap, textAlign: rs.align }}>{d.subtitle}</p>
      )}

      {(d.products ?? []).length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', borderRadius: rs.cardR, border: '1px dashed rgba(255,255,255,0.12)', fontSize: rs.body, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
          Añade productos en el editor
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: rs.gap }}>
          {d.products.map(p => (
            <div key={p.id} style={{
              borderRadius: rs.cardR, overflow: 'hidden',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Image */}
              <div style={{
                aspectRatio: '1/1', background: 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 28 }}>🛍️</span>
                )}
                {p.badge && (
                  <span style={{
                    position: 'absolute', top: 6, left: 6,
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: rs.accent, color: '#fff',
                  }}>{p.badge}</span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '8px 10px 10px' }}>
                <div style={{ fontSize: rs.body, fontWeight: 700, color: rs.text, lineHeight: 1.3, marginBottom: 4 }}>{p.title}</div>
                {(p.price || p.compareAtPrice) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.price && <span style={{ fontSize: rs.body + 1, fontWeight: 800, color: rs.accent }}>{p.price}</span>}
                    {p.compareAtPrice && <span style={{ fontSize: rs.sub, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>{p.compareAtPrice}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
