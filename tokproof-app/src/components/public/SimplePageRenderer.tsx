'use client'

import { useEffect } from 'react'
import type { FullPage } from '@/types'
import SafeExitBanner from './SafeExitBanner'

interface Props {
  data: FullPage
  preview?: boolean
}

export default function SimplePageRenderer({ data, preview = false }: Props) {
  const { page, buttons } = data
  const s = page.settings
  const brandColor = s.brand_color ?? '#FF2D75'

  useEffect(() => {
    if (preview) return
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId: page.id, eventType: 'page_view', metadata: { referer: document.referrer } }),
    }).catch(() => {})
  }, [page.id, preview])

  function trackClick(buttonId: string) {
    if (!preview) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: page.id, eventType: 'link_click', metadata: { buttonId } }),
      }).catch(() => {})
    }
  }

  const ICON_MAP: Record<string, string> = {
    whatsapp: '💬', shopify: '🛍', instagram: '📸', tiktok: '🎵', youtube: '▶', email: '✉', link: '🔗',
  }

  return (
    <div className="tp-dark-page" style={{ minHeight: '100vh', background: s.bg_color ?? '#0F0F10', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 48px', fontFamily: 'inherit' }}>

      {/* Avatar */}
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${brandColor}, #7C3AED)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 12, overflow: 'hidden', flexShrink: 0 }}>
        {s.avatar_url
          ? <img src={s.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (page.brand_name ?? '?').charAt(0)}
      </div>

      {/* Name + bio */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>{page.brand_name ?? page.title}</h1>
        {s.bio && <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 280 }}>{s.bio}</p>}
      </div>

      {/* Links */}
      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {buttons.filter(b => b.is_visible).map(btn => {
          // Shopify buttons get the Safe Exit System; others are plain links
          if (btn.type === 'shopify' && btn.url && !preview) {
            return (
              <div key={btn.id}>
                <SafeExitBanner
                  shopifyUrl={btn.url}
                  pageId={page.id}
                  brandColor={brandColor}
                  ctaText={btn.label}
                />
              </div>
            )
          }
          return (
            <a
              key={btn.id}
              href={btn.url ?? '#'}
              onClick={() => trackClick(btn.id)}
              target={btn.type === 'shopify' ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '14px 20px', background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 14, fontSize: 14, fontWeight: 700, color: 'var(--text)',
                textDecoration: 'none', transition: 'border-color .15s, background .15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{btn.icon ?? ICON_MAP[btn.type] ?? '🔗'}</span>
              {btn.label}
            </a>
          )
        })}

        {buttons.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '24px 0' }}>
            {preview ? 'Añade botones desde el editor →' : 'Próximamente...'}
          </div>
        )}
      </div>

      {/* Legal */}
      {s.legal_text && (
        <div style={{ marginTop: 32, fontSize: 10, color: 'var(--muted2)', textAlign: 'center', lineHeight: 1.6, maxWidth: 300 }}>
          {s.legal_text}
        </div>
      )}

      {/* Tokproof branding */}
      <div className="pt-brand-footer" style={{ marginTop: 24 }}>
        Creado con <a href="https://tokproof.app" target="_blank" rel="noopener noreferrer" style={{ color: brandColor, fontWeight: 800, textDecoration: 'none' }}>Tokproof</a>
      </div>
    </div>
  )
}
