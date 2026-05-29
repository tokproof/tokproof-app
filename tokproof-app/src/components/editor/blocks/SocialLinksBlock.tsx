import type { LandingBlock, LandingTheme, SocialLinksData, SocialPlatform } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

const PLATFORM: Record<SocialPlatform, { label: string; emoji: string; color: string }> = {
  tiktok:    { label: 'TikTok',    emoji: '🎵', color: '#010101' },
  instagram: { label: 'Instagram', emoji: '📷', color: '#E1306C' },
  youtube:   { label: 'YouTube',   emoji: '▶️', color: '#FF0000' },
  website:   { label: 'Website',   emoji: '🌐', color: '#6B7280' },
  email:     { label: 'Email',     emoji: '✉️', color: '#10B981' },
  whatsapp:  { label: 'WhatsApp',  emoji: '💬', color: '#25D366' },
  x:         { label: 'X',         emoji: '✖️', color: '#000000' },
  linkedin:  { label: 'LinkedIn',  emoji: '💼', color: '#0077B5' },
}

interface Props { block: LandingBlock; theme: LandingTheme }

export default function SocialLinksBlock({ block, theme }: Props) {
  const d  = block.data as unknown as SocialLinksData
  const rs = resolveBlockStyle(block, theme)

  const active = (d.links ?? []).filter(l => l.enabled)

  if (active.length === 0) {
    return (
      <div style={{ background: rs.bg, padding: rs.pad, fontFamily: rs.fontFamily, textAlign: 'center' }}>
        <div style={{ fontSize: rs.body, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
          Añade redes sociales en el editor
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: rs.bg, padding: rs.pad, fontFamily: rs.fontFamily }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: rs.gap }}>
        {active.map(link => {
          const p = PLATFORM[link.platform]
          return (
            <div key={link.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: rs.btnR,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.10)',
              flex: '1 1 calc(50% - 8px)', minWidth: 110,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{p.emoji}</span>
              <span style={{ fontSize: rs.body + 1, fontWeight: 600, color: rs.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {link.label || p.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
