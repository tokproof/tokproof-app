'use client'

import { getSessionId } from '@/lib/session'
import type { LandingBlock, LandingTheme, CTAData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme; pageId?: string; rescueUrl?: string }

export default function CTABlock({ block, theme, pageId, rescueUrl }: Props) {
  const d  = block.data as unknown as CTAData
  const rs = resolveBlockStyle(block, theme)

  function handleClick() {
    const directUrl = d.url?.trim()
    // When rescue is active, always route through /@slug/go regardless of individual URL
    const destination = rescueUrl ?? directUrl

    if (pageId) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          eventType: 'cta_click',
          sessionId: getSessionId(),
          metadata: { destinationUrl: directUrl ?? '' },
        }),
        keepalive: true,
      }).catch(() => {})
    }

    if (!destination) return
    window.location.href = destination
  }

  const btnStyle: React.CSSProperties =
    d.style === 'outline'
      ? { background: 'transparent', color: rs.accent, border: `2px solid ${rs.accent}` }
      : { background: rs.btnBg, color: rs.buttonText, border: 'none', boxShadow: `0 10px 28px ${rs.accent}44` }

  return (
    <div style={{ background: rs.bg, padding: rs.pad, textAlign: 'center', fontFamily: rs.fontFamily }}>
      <button
        onClick={handleClick}
        style={{
          width: '100%', padding: '14px 20px', borderRadius: rs.btnR,
          fontSize: rs.body + 2, fontWeight: 800, cursor: 'pointer',
          letterSpacing: '-0.01em', lineHeight: 1.3,
          ...btnStyle,
        }}
      >
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
