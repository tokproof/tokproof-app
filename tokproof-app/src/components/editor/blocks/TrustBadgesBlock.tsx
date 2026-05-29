import type { LandingBlock, LandingTheme, TrustBadgesData, TrustBadgeIcon } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

const BADGE_ICONS: Record<TrustBadgeIcon, string> = {
  shipping:  '🚚',
  secure:    '🔒',
  guarantee: '⭐',
  returns:   '↩️',
  support:   '🎧',
  verified:  '✅',
}

interface Props { block: LandingBlock; theme: LandingTheme }

export default function TrustBadgesBlock({ block, theme }: Props) {
  const d  = block.data as unknown as TrustBadgesData
  const rs = resolveBlockStyle(block, theme)

  const active = (d.badges ?? []).filter(b => b.enabled)

  return (
    <div style={{ background: rs.bg, padding: rs.pad, fontFamily: rs.fontFamily }}>
      {active.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: rs.body, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
          Añade badges en el editor
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: rs.gap, justifyContent: rs.align === 'center' ? 'center' : 'flex-start' }}>
          {active.map(badge => (
            <div key={badge.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '12px 10px', borderRadius: rs.cardR,
              background: rs.elementBg,
              border: rs.cardBorder,
              backdropFilter: rs.glassFilter,
              flex: '1 1 72px', textAlign: 'center', maxWidth: 100,
            }}>
              <span style={{ fontSize: 24, lineHeight: 1 }}>{BADGE_ICONS[badge.icon]}</span>
              <span style={{ fontSize: rs.sub, fontWeight: 700, color: rs.text, lineHeight: 1.3 }}>{badge.title}</span>
              {badge.description && (
                <span style={{ fontSize: rs.sub - 1, color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>{badge.description}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
