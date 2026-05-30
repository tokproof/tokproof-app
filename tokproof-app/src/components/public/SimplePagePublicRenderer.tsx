'use client'

import { useEffect } from 'react'
import type { LandingConfig, SimplePageConfig, SimplePagePlatform } from '@/types/landing'
import { getSessionId } from '@/lib/session'
import { getPageBackground, resolveBlockStyle } from '@/lib/blockStyle'
import type { LandingBlock } from '@/types/landing'

// ─── Platform icons ───────────────────────────────────────────────────────────
const PLATFORM_ICONS: Record<SimplePagePlatform, { label: string; emoji: string; color: string }> = {
  tiktok:    { label: 'TikTok',    emoji: '🎵', color: '#000' },
  instagram: { label: 'Instagram', emoji: '📸', color: '#E1306C' },
  youtube:   { label: 'YouTube',   emoji: '▶️', color: '#FF0000' },
  website:   { label: 'Web',       emoji: '🌐', color: '#3B82F6' },
  whatsapp:  { label: 'WhatsApp',  emoji: '💬', color: '#25D366' },
  email:     { label: 'Email',     emoji: '✉️', color: '#6B7280' },
  x:         { label: 'X',        emoji: '✕',  color: '#000'    },
  linkedin:  { label: 'LinkedIn',  emoji: '💼', color: '#0077B5' },
}

interface Props {
  config: LandingConfig
  /** When true, renders without <html> wrapper (used inside editor preview) */
  preview?: boolean
  pageId?: string
  slug?: string
}

export default function SimplePagePublicRenderer({ config, preview, pageId, slug }: Props) {
  const sp: SimplePageConfig = config.simplePage ?? {
    profile: { avatarUrl: '', displayName: 'Tu Nombre', username: 'tuusuario', bio: '', verifiedBadge: false },
    socialLinks: [],
    links: [],
    settings: { enableBrowserGuide: false, destinationMode: 'direct' },
  }

  // Use a dummy block to get resolved theme styles
  const dummyBlock: LandingBlock = { id: '_sp', type: 'link_list', label: '', visible: true, data: {} }
  const rs = resolveBlockStyle(dummyBlock, config.theme)
  const bg = getPageBackground(config.theme)

  const activeSocials = sp.socialLinks.filter(s => s.enabled && s.url)
  const activeLinks   = sp.links.filter(l => l.enabled)

  useEffect(() => {
    if (preview || !pageId || !slug) return
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        slug,
        eventType: 'page_view',
        sessionId: getSessionId(),
        metadata: { referer: document.referrer },
      }),
    }).catch(() => {})
  }, [pageId, slug, preview])

  function trackLinkClick(linkId: string, destinationUrl: string) {
    if (preview || !pageId) return
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        eventType: 'link_click',
        sessionId: getSessionId(),
        metadata: { linkId, destinationUrl },
      }),
    }).catch(() => {})
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      fontFamily: rs.fontFamily,
      color: rs.text,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 20px 40px',
    }}>

      {/* ── Avatar ── */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        overflow: 'hidden', marginBottom: 14,
        background: rs.elementBg,
        border: `3px solid ${rs.accent}`,
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
      }}>
        {sp.profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sp.profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : '👤'}
      </div>

      {/* ── Name + username ── */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
          <h1 style={{ fontSize: rs.h2, fontWeight: 800, color: rs.text, letterSpacing: '-0.02em', margin: 0 }}>
            {sp.profile.displayName || 'Tu Nombre'}
          </h1>
          {sp.profile.verifiedBadge && (
            <span style={{ fontSize: 16 }}>✅</span>
          )}
        </div>
        <div style={{ fontSize: rs.body, color: rs.textSecondary, fontWeight: 500 }}>
          @{sp.profile.username || 'tuusuario'}
        </div>
      </div>

      {/* ── Bio ── */}
      {sp.profile.bio && (
        <p style={{
          fontSize: rs.body, color: rs.textSecondary, lineHeight: 1.55,
          textAlign: 'center', maxWidth: 320, marginBottom: 16,
        }}>
          {sp.profile.bio}
        </p>
      )}

      {/* ── Social icons ── */}
      {activeSocials.length > 0 && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {activeSocials.map(social => {
            const info = PLATFORM_ICONS[social.platform]
            return (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: rs.elementBg, border: rs.cardBorder,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, textDecoration: 'none', flexShrink: 0,
                }}
                title={info.label}
              >
                {info.emoji}
              </a>
            )
          })}
        </div>
      )}

      {/* ── Links ── */}
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeLinks.length === 0 ? (
          <div style={{
            padding: '14px 20px', borderRadius: rs.btnR,
            background: rs.elementBg, border: rs.cardBorder,
            textAlign: 'center', fontSize: rs.body, color: rs.textSecondary, fontStyle: 'italic',
          }}>
            Añade links en el editor
          </div>
        ) : activeLinks.map(link => (
          <a
            key={link.id}
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackLinkClick(link.id, link.url || '')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px 20px', borderRadius: rs.btnR,
              background: rs.btnBg,
              color: rs.buttonText,
              textDecoration: 'none',
              fontSize: rs.body + 1, fontWeight: 700,
              boxShadow: `0 6px 18px ${rs.accent}30`,
              transition: 'transform .12s, box-shadow .12s',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            <span>{link.title || 'Enlace'}</span>
          </a>
        ))}
      </div>

      {/* ── Branding ── */}
      {config.settings?.showTokproofBranding !== false && (
        <div style={{ marginTop: 40, fontSize: rs.sub, color: rs.textSecondary, textAlign: 'center' }}>
          Creado con <span style={{ fontWeight: 700 }}>Tokproof</span>
        </div>
      )}
    </div>
  )
}
