'use client'

import { getSessionId } from '@/lib/session'
import type { LandingBlock, LandingTheme, CTAData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme; pageId?: string }

export default function CTABlock({ block, theme, pageId }: Props) {
  const d  = block.data as unknown as CTAData
  const rs = resolveBlockStyle(block, theme)

  function handleClick() {
    const url = d.url?.trim()

    // DEBUG: temporary log — remove after analytics confirmed working
    console.log('[tracker] sending cta_click', { pageId, url, endpoint: '/api/track' })

    // Fire analytics with keepalive — request survives page navigation
    if (pageId) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          eventType: 'cta_click',
          sessionId: getSessionId(),
          metadata: { destinationUrl: url ?? '' },
        }),
        keepalive: true,
      })
        .then(async res => {
          const json = await res.json().catch(() => ({}))
          if (!res.ok) {
            console.error('[tracker] cta_click FAILED', { status: res.status, body: json })
          } else {
            console.log('[tracker] cta_click OK', json)
          }
        })
        .catch(err => console.error('[tracker] cta_click fetch error:', err))
    } else {
      console.warn('[tracker] cta_click: no pageId — event NOT sent')
    }

    if (!url) {
      console.warn('[CTABlock] No destination URL configured for this CTA')
      return
    }

    window.location.href = url
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
