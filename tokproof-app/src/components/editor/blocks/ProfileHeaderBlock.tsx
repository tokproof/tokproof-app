import type { LandingBlock, LandingTheme, ProfileHeaderData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function ProfileHeaderBlock({ block, theme }: Props) {
  const d  = block.data as unknown as ProfileHeaderData
  const rs = resolveBlockStyle(block, theme)

  return (
    <div style={{ background: rs.bg, padding: rs.pad, fontFamily: rs.fontFamily, textAlign: 'center' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: rs.gap }}>
        {d.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.avatarUrl} alt={d.displayName}
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${rs.accent}` }} />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: rs.grad, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, border: `2.5px solid ${rs.accent}`,
          }}>
            👤
          </div>
        )}
      </div>

      {/* Name + verified */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: rs.h2, fontWeight: 800, color: rs.text }}>{d.displayName || 'Tu Nombre'}</span>
        {d.verifiedBadge && (
          <span style={{
            width: 18, height: 18, borderRadius: '50%', background: rs.accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>✓</span>
        )}
      </div>

      {/* Username */}
      <div style={{ fontSize: rs.body, color: 'rgba(255,255,255,0.5)', marginBottom: d.bio ? rs.gap : 0 }}>
        @{d.username || 'usuario'}
      </div>

      {/* Bio */}
      {d.bio && (
        <p style={{ fontSize: rs.body, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, margin: `0 0 ${d.location ? rs.gap : 0}px` }}>
          {d.bio}
        </p>
      )}

      {/* Location */}
      {d.location && (
        <div style={{ fontSize: rs.sub, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span>📍</span> {d.location}
        </div>
      )}
    </div>
  )
}
