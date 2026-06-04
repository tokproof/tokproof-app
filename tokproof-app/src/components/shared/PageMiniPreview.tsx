'use client'

import type { Page } from '@/types'
import type { LandingConfig, LandingBlock } from '@/types/landing'

// ─── Derives a lightweight visual preview from landingConfig ──────────────────
// Zero extra API calls — all data already present in page.settings
// Falls back gracefully when config is not yet saved

function isBright(hex: string): boolean {
  try {
    const c = hex.replace('#', '')
    if (c.length < 6) return false
    const r = parseInt(c.slice(0, 2), 16)
    const g = parseInt(c.slice(2, 4), 16)
    const b = parseInt(c.slice(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 140
  } catch { return false }
}

export default function PageMiniPreview({ page }: { page: Page }) {
  // ── Extract landingConfig ──────────────────────────────────────────────────
  const cfg = (page.settings?._landingConfig) as LandingConfig | undefined | null
  const theme  = cfg?.theme
  const blocks = (cfg?.blocks ?? []) as LandingBlock[]

  // ── Resolve image: hero media → page settings ──────────────────────────────
  const heroBlock = blocks.find(b => b.type === 'hero_product')
  const heroData  = heroBlock?.data as Record<string, unknown> | undefined
  const heroMedia = (heroData?.media as Record<string, unknown> | undefined)
  const imageUrl  =
    (heroMedia?.url as string | undefined) ||
    (heroData?.imageUrl as string | undefined) ||
    (page.settings.media_url as string | undefined) ||
    (page.settings.avatar_url as string | undefined) ||
    null

  // ── Resolve colors ─────────────────────────────────────────────────────────
  const bgColor  = theme?.backgroundColor ?? '#0F0F10'
  const primary  = theme?.primaryColor    ?? '#F647A9'
  const textClr  = theme?.textColor       ?? '#ffffff'
  const cardBg   = theme?.cardBackgroundColor ?? undefined

  // Gradient background support
  const bgGrad = theme?.backgroundMode === 'gradient' && theme.gradientFrom && theme.gradientTo
    ? `linear-gradient(180deg,${theme.gradientFrom} 0%,${theme.gradientTo} 100%)`
    : bgColor

  const bright = isBright(bgColor)
  const barText   = bright ? 'rgba(0,0,0,0.7)'  : 'rgba(255,255,255,0.85)'
  const barTextMd = bright ? 'rgba(0,0,0,0.4)'  : 'rgba(255,255,255,0.45)'
  const cardBgClr = cardBg ?? (bright ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)')

  // ── No config yet: fall back to type-based gradient ────────────────────────
  if (!cfg) {
    const type = page.type ?? 'trust'
    const fallback = type === 'simple'
      ? 'linear-gradient(170deg,#D9E8FF,#C7D7FF)'
      : 'linear-gradient(170deg,#FFD9F0,#E4D7FF)'
    return (
      <div style={{ width: '100%', height: '100%', background: fallback, display: 'flex', flexDirection: 'column', padding: '6px 5px', gap: 3 }}>
        <div style={{ height: 4, borderRadius: 3, background: 'rgba(123,97,255,.3)' }} />
        <div style={{ height: 4, borderRadius: 3, background: 'rgba(123,97,255,.2)', width: '55%' }} />
        <div style={{ flex: 1, borderRadius: 5, background: 'rgba(255,255,255,.6)', marginTop: 3 }} />
        <div style={{ height: 7, borderRadius: 3, background: 'rgba(123,97,255,.4)' }} />
      </div>
    )
  }

  // ── Has config: render real preview ────────────────────────────────────────
  const hasBenefits = blocks.some(b => b.type === 'benefits' || b.type === 'benefit_icons_row')
  const hasCTA      = blocks.some(b => b.type === 'cta')
  const ctaData     = blocks.find(b => b.type === 'cta')?.data as Record<string, unknown> | undefined
  const btnColor    = theme?.buttonColor ?? theme?.buttonGradientFrom ?? primary

  return (
    <div style={{ width: '100%', height: '100%', background: bgGrad, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {imageUrl ? (
        <>
          {/* Image takes top 48% */}
          <div style={{ flex: '0 0 48%', overflow: 'hidden', position: 'relative', background: cardBgClr }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {/* Primary color accent overlay at top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: primary, opacity: 0.8 }} />
          </div>

          {/* Content below image */}
          <div style={{ flex: 1, padding: '4px 5px 5px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <div style={{ height: 4, borderRadius: 2, background: barText, width: '85%' }} />
            <div style={{ height: 3, borderRadius: 2, background: barTextMd, width: '60%' }} />
            <div style={{ flex: 1 }} />
            {(hasCTA || true) && (
              <div style={{ height: 7, borderRadius: 3, background: btnColor, opacity: 0.9 }} />
            )}
          </div>
        </>
      ) : (
        /* No image: full structured content bars */
        <div style={{ flex: 1, padding: '6px 5px 5px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Primary accent (badge / top section) */}
          <div style={{ height: 3, borderRadius: 2, background: primary, opacity: 0.75, width: '40%', marginBottom: 1 }} />
          {/* Hero title bars */}
          <div style={{ height: 4.5, borderRadius: 2, background: barText, width: '90%' }} />
          <div style={{ height: 3.5, borderRadius: 2, background: barText, width: '70%' }} />
          <div style={{ height: 3, borderRadius: 2, background: barTextMd, width: '55%' }} />

          {/* Content card: benefits or content block */}
          {hasBenefits ? (
            <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ flex: 1, height: 14, borderRadius: 3, background: cardBgClr, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: primary, opacity: 0.7 }} />
                  <div style={{ height: 2, width: '70%', borderRadius: 1, background: barText, opacity: 0.5 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 5, flex: '0 0 16px', borderRadius: 4, background: cardBgClr }} />
          )}

          <div style={{ flex: 1 }} />

          {/* CTA button */}
          <div style={{ height: 8, borderRadius: 3, background: btnColor, opacity: 0.88 }} />
        </div>
      )}
    </div>
  )
}
