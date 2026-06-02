'use client'

import { useState, useEffect, useMemo } from 'react'
import type { LandingBlock, LandingTheme, PartnerDiscountsData, PartnerDiscount, PDColors } from '@/types/landing'
import { resolveBlockStyle, type ResolvedStyle } from '@/lib/blockStyle'

// ─── Demo defaults ─────────────────────────────────────────────────────────
const DEFAULT_DISCOUNTS: PartnerDiscount[] = [
  { id: 'pd1', brandName: 'Gymshark',  storeUrl: 'https://gymshark.com',  logoUrl: '', description: 'En toda la tienda. No acumulable con otras ofertas.', discountText: '15% OFF', code: 'GYM15',  buttonText: 'Ver oferta', buttonUrl: 'https://gymshark.com',  isPopular: true,  enabled: true },
  { id: 'pd2', brandName: 'LSKD',      storeUrl: 'https://lskd.co',       logoUrl: '', description: 'En pedidos superiores a $100.',                      discountText: '20% OFF', code: 'LSKD20', buttonText: 'Ver oferta', buttonUrl: 'https://lskd.co',       isPopular: false, enabled: true },
  { id: 'pd3', brandName: 'Alo Yoga',  storeUrl: 'https://aloyoga.com',   logoUrl: '', description: 'En toda la tienda.',                                  discountText: '10% OFF', code: 'ALO10',  buttonText: 'Ver oferta', buttonUrl: 'https://aloyoga.com',   isPopular: false, enabled: true },
]

const DEFAULTS: PartnerDiscountsData = {
  title: 'Descuentos de nuestros partners',
  subtitle: 'Ahorra en tus marcas favoritas con códigos exclusivos. 🎁',
  badgeText: '♦ Ofertas exclusivas',
  footerText: 'Nuevas ofertas cada semana',
  layout: 'compact',
  showLogos: true,
  showDescriptions: false,
  showCopyButton: true,
  showExternalButton: true,
  showFooterText: true,
  discounts: DEFAULT_DISCOUNTS,
}

// ─── Shadow map ─────────────────────────────────────────────────────────────
const SHADOW: Record<string, string> = {
  none:   'none',
  soft:   '0 1px 4px rgba(0,0,0,0.08)',
  medium: '0 3px 10px rgba(0,0,0,0.14)',
}

// ─── Build resolved color tokens ────────────────────────────────────────────
function buildC(colors: PDColors | undefined, acc: string, rs: ResolvedStyle) {
  const c = colors ?? {}
  return {
    sectionBg:    c.sectionBg        ?? rs.bg,
    title:        c.titleColor       ?? rs.text,
    subtitle:     c.subtitleColor    ?? rs.textSecondary,
    badgeBg:      c.badgeBg          ?? `${acc}18`,
    badgeText:    c.badgeText        ?? acc,
    cardBg:       c.cardBg           ?? 'rgba(255,255,255,0.07)',
    cardBorder:   c.cardBorder       ?? 'rgba(255,255,255,0.10)',
    brand:        c.brandColor       ?? rs.text,
    description:  c.descriptionColor ?? rs.textSecondary,
    discountBg:   c.discountBg       ?? `${acc}20`,
    discountText: c.discountText     ?? acc,
    codeBg:       c.codeBg           ?? 'rgba(255,255,255,0.07)',
    codeText:     c.codeText         ?? rs.text,
    copyBg:       c.copyBg           ?? 'rgba(255,255,255,0.07)',
    copyText:     c.copyText         ?? rs.textSecondary,
    ctaBg:        c.ctaBg            ?? rs.text,
    ctaText:      c.ctaText          ?? rs.bg,
    footerBg:     c.footerBg         ?? `${acc}18`,
    footerText:   c.footerTextColor  ?? acc,
  }
}
type C = ReturnType<typeof buildC>

// ─── Helpers ─────────────────────────────────────────────────────────────────
function extractDomain(url: string): string {
  if (!url) return ''
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch { return '' }
}

// ─── Logo: uploaded → Clearbit → Google Favicon → initials ──────────────────
function PartnerLogo({ discount, C: colors, size = 44, radius = 9 }: {
  discount: PartnerDiscount; C: C; size?: number; radius?: number
}) {
  const [srcIdx, setSrcIdx] = useState(0)
  const domain = useMemo(() => extractDomain(discount.storeUrl), [discount.storeUrl])

  const sources = useMemo(() => {
    const list: string[] = []
    if (discount.logoUrl) list.push(discount.logoUrl)
    if (domain) {
      list.push(`https://logo.clearbit.com/${domain}`)
      list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
    }
    return list
  }, [discount.logoUrl, domain])

  useEffect(() => { setSrcIdx(0) }, [sources])

  const src = sources[srcIdx]
  const initials = discount.brandName.split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'

  const boxStyle: React.CSSProperties = {
    width: size, height: size, borderRadius: radius, flexShrink: 0,
    background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  }

  if (!src) {
    return (
      <div style={boxStyle}>
        <span style={{ fontSize: Math.round(size * 0.28), fontWeight: 700, color: colors.brand }}>{initials}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt={discount.brandName}
      onError={() => setSrcIdx(i => i + 1)}
      style={{ ...boxStyle, objectFit: 'contain' }}
    />
  )
}

// ─── Copy button ─────────────────────────────────────────────────────────────
function CopyBtn({ code, C: colors }: { code: string; C: C }) {
  const [copied, setCopied] = useState(false)
  function handleCopy(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copiado ✓' : 'Copiar código'}
      style={{
        width: 28, height: 28, borderRadius: 7, cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: copied ? '#dcfce7' : colors.copyBg,
        border: `1px solid ${copied ? '#86efac' : colors.cardBorder}`,
        transition: 'all .15s',
      }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12.5l4.5 4.5L19 6.5"/>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.copyText} strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  )
}

// ─── Chip helpers ─────────────────────────────────────────────────────────────
function DiscountChip({ text, C: colors, rs }: { text: string; C: C; rs: ResolvedStyle }) {
  return (
    <span style={{ fontSize: rs.sub, fontWeight: 700, color: colors.discountText, background: colors.discountBg, padding: '3px 9px', borderRadius: 6, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  )
}
function CodeChip({ code, C: colors, rs }: { code: string; C: C; rs: ResolvedStyle }) {
  return (
    <span style={{ fontSize: rs.sub, fontWeight: 700, color: colors.codeText, background: colors.codeBg, border: `1.5px solid ${colors.cardBorder}`, padding: '3px 10px', borderRadius: 6, letterSpacing: '.05em', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
      {code}
    </span>
  )
}

// ─── Compact card — entire card is a link (CTA) ───────────────────────────────
function CompactCard({ dc, d, rs, C: colors, shadow }: {
  dc: PartnerDiscount; d: PartnerDiscountsData; rs: ResolvedStyle; C: C; shadow: string
}) {
  const href = dc.buttonUrl || dc.storeUrl || '#'
  return (
    <a
      href={href}
      target={href !== '#' ? '_blank' : undefined}
      rel="noopener noreferrer"
      style={{ display: 'block', textDecoration: 'none', borderRadius: rs.cardR }}
    >
      <div style={{
        borderRadius: rs.cardR, background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: shadow, padding: `${rs.gap + 2}px ${rs.gap + 4}px`,
        cursor: 'pointer', transition: 'opacity .15s',
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {d.showLogos && <PartnerLogo discount={dc} C={colors} size={44} radius={9} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Row 1: Brand + Popular */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: rs.body + 1, fontWeight: 700, color: colors.brand, lineHeight: 1 }}>
                {dc.brandName}
              </span>
              {dc.isPopular && (
                <span style={{ fontSize: 9.5, fontWeight: 700, color: colors.badgeText, background: colors.badgeBg, padding: '2px 7px', borderRadius: 999, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                  ♦ Popular
                </span>
              )}
            </div>
            {/* Row 2: Chips + Ver oferta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {dc.discountText && <DiscountChip text={dc.discountText} C={colors} rs={rs} />}
              {dc.code && <CodeChip code={dc.code} C={colors} rs={rs} />}
              {d.showCopyButton && dc.code && <CopyBtn code={dc.code} C={colors} />}
              <span style={{ marginLeft: 'auto', fontSize: rs.sub, fontWeight: 700, color: colors.ctaBg, whiteSpace: 'nowrap', flexShrink: 0 }}>
                Ver oferta →
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}

// ─── Detailed card ─────────────────────────────────────────────────────────────
function DetailedCard({ dc, d, rs, C: colors, shadow }: {
  dc: PartnerDiscount; d: PartnerDiscountsData; rs: ResolvedStyle; C: C; shadow: string
}) {
  return (
    <div style={{
      borderRadius: rs.cardR, background: colors.cardBg,
      border: `1px solid ${colors.cardBorder}`, boxShadow: shadow,
      padding: `${rs.gap + 4}px ${rs.gap + 4}px`,
    }}>
      {/* Logo (left) + right column: brand, description, chips */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: rs.gap + 2 }}>
        {d.showLogos && <PartnerLogo discount={dc} C={colors} size={62} radius={12} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Brand + Popular */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: rs.body + 2, fontWeight: 700, color: colors.brand, lineHeight: 1.2 }}>
              {dc.brandName}
            </span>
            {dc.isPopular && (
              <span style={{ fontSize: 9.5, fontWeight: 700, color: colors.badgeText, background: colors.badgeBg, padding: '2px 7px', borderRadius: 999, lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                ♦ Popular
              </span>
            )}
          </div>
          {/* Description — always visible in detailed layout */}
          {dc.description && (
            <p style={{ margin: '0 0 8px', fontSize: rs.sub, color: colors.description, lineHeight: 1.45 }}>
              {dc.description}
            </p>
          )}
          {/* Chips — inside right column, close to logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            {dc.discountText && <DiscountChip text={dc.discountText} C={colors} rs={rs} />}
            {dc.code && <CodeChip code={dc.code} C={colors} rs={rs} />}
            {d.showCopyButton && dc.code && <CopyBtn code={dc.code} C={colors} />}
          </div>
        </div>
      </div>

      {/* CTA button */}
      {d.showExternalButton && (
        <a
          href={dc.buttonUrl || dc.storeUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '11px 0', borderRadius: rs.btnR,
            background: colors.ctaBg, color: colors.ctaText,
            fontSize: rs.body, fontWeight: 700, textDecoration: 'none', letterSpacing: '-.01em',
          }}
        >
          {dc.buttonText || 'Ver oferta'}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      )}
    </div>
  )
}

// ─── Main block ───────────────────────────────────────────────────────────────
interface Props { block: LandingBlock; theme: LandingTheme }

export default function PartnerDiscountsBlock({ block, theme }: Props) {
  const d    = { ...DEFAULTS, ...(block.data as unknown as Partial<PartnerDiscountsData>) }
  const rs   = resolveBlockStyle(block, theme)
  const acc  = d.colors?.badgeText || d.accentColor || rs.accent
  const C    = buildC(d.colors, acc, rs)
  const shadow  = SHADOW[d.shadowIntensity ?? 'soft']
  const detailed = d.layout === 'detailed'
  const visible  = (Array.isArray(d.discounts) ? d.discounts : DEFAULT_DISCOUNTS).filter(dc => dc.enabled)
  const titleParts = (d.title || DEFAULTS.title).split('partners')

  return (
    <div
      id={d.customAnchorId || undefined}
      style={{
        background: C.sectionBg, padding: rs.pad, fontFamily: rs.fontFamily,
        marginTop:    d.marginTop    ? `${d.marginTop}px`    : undefined,
        marginBottom: d.marginBottom ? `${d.marginBottom}px` : undefined,
      }}
    >
      {/* Badge */}
      {d.badgeText && (
        <div style={{ marginBottom: rs.gap }}>
          <span style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 700, color: C.badgeText, background: C.badgeBg, padding: '4px 12px', borderRadius: 999 }}>
            {d.badgeText}
          </span>
        </div>
      )}

      {/* Title: "partners" highlighted */}
      <h2 style={{ margin: `0 0 ${rs.gap}px`, fontSize: rs.h2 + 2, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.02em', color: C.title }}>
        {titleParts.map((part, i) =>
          i < titleParts.length - 1
            ? <span key={i}>{part}<span style={{ color: C.badgeText }}>{`partners`}</span></span>
            : <span key={i}>{part}</span>
        )}
      </h2>

      {/* Subtitle */}
      {d.subtitle && (
        <p style={{ margin: `0 0 ${rs.gap + 6}px`, fontSize: rs.sub, color: C.subtitle, lineHeight: 1.45 }}>
          {d.subtitle}
        </p>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: rs.gap }}>
        {visible.map(dc =>
          detailed
            ? <DetailedCard key={dc.id} dc={dc} d={d} rs={rs} C={C} shadow={shadow} />
            : <CompactCard  key={dc.id} dc={dc} d={d} rs={rs} C={C} shadow={shadow} />
        )}
      </div>

      {/* Footer */}
      {d.showFooterText && d.footerText && (
        detailed ? (
          <div style={{ marginTop: rs.gap + 4, padding: `${rs.gap}px ${rs.gap + 4}px`, borderRadius: rs.cardR, background: C.footerBg, textAlign: 'center' }}>
            <div style={{ fontSize: rs.body, fontWeight: 700, color: C.footerText }}>{d.footerText}</div>
            <div style={{ fontSize: rs.sub, color: C.subtitle, marginTop: 3 }}>Síguenos para no perderte ninguna.</div>
          </div>
        ) : (
          <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: rs.gap + 2, padding: `${rs.gap + 1}px ${rs.gap + 4}px`, borderRadius: rs.cardR, background: C.footerBg, textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>🏷️</span>
              <span style={{ fontSize: rs.body, fontWeight: 600, color: C.footerText }}>{d.footerText}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.footerText} strokeWidth="2.2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        )
      )}
    </div>
  )
}
