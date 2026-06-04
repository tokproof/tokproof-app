'use client'

import { getSessionId } from '@/lib/session'
import type { LandingBlock, LandingTheme, LinkListData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme; pageId?: string }

export default function LinkListBlock({ block, theme, pageId }: Props) {
  const d  = block.data as unknown as LinkListData
  const rs = resolveBlockStyle(block, theme)

  function trackClick(linkId: string, url: string) {
    if (!pageId) return
    // keepalive ensures the request survives page navigation
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        eventType: 'link_click',
        sessionId: getSessionId(),
        metadata: { linkId, destinationUrl: url },
      }),
      keepalive: true,
    }).catch(() => {})
  }

  return (
    <div style={{ background: rs.bg, padding: rs.pad, color: rs.text, fontFamily: rs.fontFamily }}>
      {d.title && (
        <h2 style={{ fontSize: rs.h2, fontWeight: 800, marginBottom: rs.gap + 4, color: rs.text, textAlign: rs.align }}>
          {d.title}
        </h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: rs.gap }}>
        {(d.links ?? []).filter(l => l.visible !== false).map((link, i) => {
          const url = link.url?.trim()

          if (url) {
            return (
              <a
                key={link.id ?? i}
                href={url}
                onClick={() => trackClick(link.id ?? String(i), url)}
                style={{
                  padding: '12px 16px', borderRadius: rs.btnR,
                  background: rs.btnBg,
                  fontSize: rs.body + 1, fontWeight: 600, color: rs.buttonText,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textDecoration: 'none', cursor: 'pointer',
                }}
              >
                <span>{link.label || 'Enlace'}</span>
                <span style={{ fontSize: 16, opacity: .6 }}>→</span>
              </a>
            )
          }

          // No URL — render as disabled-looking div
          return (
            <div
              key={link.id ?? i}
              style={{
                padding: '12px 16px', borderRadius: rs.btnR,
                background: rs.btnBg, opacity: 0.5,
                fontSize: rs.body + 1, fontWeight: 600, color: rs.buttonText,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'default',
              }}
            >
              <span>{link.label || 'Enlace'}</span>
              <span style={{ fontSize: 16, opacity: .6 }}>→</span>
            </div>
          )
        })}
        {(d.links ?? []).length === 0 && (
          <div style={{ padding: '12px 16px', borderRadius: rs.cardR, background: rs.innerBg, border: rs.cardBorder, fontSize: rs.body, color: rs.textSecondary, textAlign: 'center' }}>
            Añade enlaces en el editor
          </div>
        )}
      </div>
    </div>
  )
}
