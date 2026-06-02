'use client'

import { useState } from 'react'
import type { LandingBlock, LandingTheme, PartnerDiscountsData, PartnerDiscount } from '@/types/landing'
import { resolveBlockStyle, type ResolvedStyle } from '@/lib/blockStyle'

// ─── Demo defaults ────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractDomain(url: string): string {
  if (!url) return ''
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch { return '' }
}

// ─── Logo: Clearbit from storeUrl → uploaded logoUrl → initials ───────────────
function PartnerLogo({ discount, size = 44, radius = 9 }: {
  discount: PartnerDiscount; size?: number; radius?: number
}) {
  const [failed, setFailed] = useState(false)
  const domain = extractDomain(discount.storeUrl)
  // Priority: manual logoUrl (Pro upload) → Clearbit favicon → initials
  const src = discount.logoUrl || (domain ? `https://logo.clearbit.com/${domain}` : '')
  const initials = discount.brandName.split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'

  return src && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={discount.brandName}
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: radius, objectFit: 'contain', flexShrink: 0,
        background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)',
      }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.14)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.28), fontWeight: 700, color: 'rgba(255,255,255,0.65)',
    }}>
      {initials}
    </div>
  )
}

// ─── Copy code button ─────────────────────────────────────────────────────────
function CopyBtn({ code, acc }: { code: string; acc: string }) {
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
        background: copied ? `${acc}22` : 'rgba(255,255,255,0.07)',
        border: `1px solid ${copied ? acc + '55' : 'rgba(255,255,255,0.16)'}`,
        transition: 'all .15s',
      }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={acc} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12.5l4.5 4.5L19 6.5"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      )}
    </button>
  )
}

// ─── Chevron right icon ───────────────────────────────────────────────────────
function Chevron({ color = 'rgba(255,255,255,0.30)' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

// ─── Compact card ─────────────────────────────────────────────────────────────
function CompactCard({ dc, d, rs, acc }: { dc: PartnerDiscount; d: PartnerDiscountsData; rs: ResolvedStyle; acc: string }) {
  const cardBg = 'rgba(255,255,255,0.07)'
  return (
    <div style={{
      borderRadius: rs.cardR, background: cardBg,
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
      padding: `${rs.gap + 2}px ${rs.gap + 4}px`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {d.showLogos && <PartnerLogo discount={dc} size={44} radius={9} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: Brand + Popular */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: rs.body + 1, fontWeight: 700, color: rs.text, lineHeight: 1 }}>{dc.brandName}</span>
            {dc.isPopular && (
              <span style={{ fontSize: 9.5, fontWeight: 700, color: acc, background: `${acc}20`, padding: '2px 7px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 3, lineHeight: 1.4 }}>
                ♦ Popular
              </span>
            )}
          </div>
          {/* Row 2: Discount + Code + Copy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {dc.discountText && (
              <span style={{ fontSize: rs.sub, fontWeight: 700, color: acc, background: `${acc}20`, padding: '3px 9px', borderRadius: 6, lineHeight: 1.3 }}>
                {dc.discountText}
              </span>
            )}
            {dc.code && (
              <span style={{ fontSize: rs.sub, fontWeight: 700, color: rs.text, background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: 6, letterSpacing: '.05em', lineHeight: 1.3 }}>
                {dc.code}
              </span>
            )}
            {d.showCopyButton && dc.code && <CopyBtn code={dc.code} acc={acc} />}
          </div>
        </div>
        <Chevron />
      </div>
    </div>
  )
}

// ─── Detailed card ────────────────────────────────────────────────────────────
function DetailedCard({ dc, d, rs, acc }: { dc: PartnerDiscount; d: PartnerDiscountsData; rs: ResolvedStyle; acc: string }) {
  const cardBg = 'rgba(255,255,255,0.07)'
  return (
    <div style={{
      borderRadius: rs.cardR, background: cardBg,
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
      padding: `${rs.gap + 4}px ${rs.gap + 4}px`,
    }}>
      {/* Header: logo + brand + popular */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: rs.gap + 2 }}>
        {d.showLogos && <PartnerLogo discount={dc} size={58} radius={11} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: rs.body + 2, fontWeight: 700, color: rs.text, lineHeight: 1.2 }}>{dc.brandName}</span>
            {dc.isPopular && (
              <span style={{ fontSize: 9.5, fontWeight: 700, color: acc, background: `${acc}20`, padding: '2px 7px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                ♦ Popular
              </span>
            )}
          </div>
          {d.showDescriptions && dc.description && (
            <p style={{ margin: 0, fontSize: rs.sub, color: rs.textSecondary, lineHeight: 1.45 }}>{dc.description}</p>
          )}
        </div>
      </div>

      {/* Chips row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: rs.gap + 2 }}>
        {dc.discountText && (
          <span style={{ fontSize: rs.sub, fontWeight: 700, color: acc, background: `${acc}20`, padding: '4px 10px', borderRadius: 7, lineHeight: 1.3 }}>
            {dc.discountText}
          </span>
        )}
        {dc.code && (
          <span style={{ fontSize: rs.sub, fontWeight: 700, color: rs.text, background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: 7, letterSpacing: '.05em', lineHeight: 1.3 }}>
            {dc.code}
          </span>
        )}
        {d.showCopyButton && dc.code && <CopyBtn code={dc.code} acc={acc} />}
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
            background: rs.text, color: rs.bg,
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
  const d = { ...DEFAULTS, ...(block.data as unknown as Partial<PartnerDiscountsData>) }
  const rs  = resolveBlockStyle(block, theme)
  const acc = d.accentColor ?? rs.accent
  const detailed = d.layout === 'detailed'
  const visible  = (Array.isArray(d.discounts) ? d.discounts : DEFAULT_DISCOUNTS).filter(dc => dc.enabled)
  const titleParts = (d.title || DEFAULTS.title).split('partners')

  return (
    <div
      id={d.customAnchorId || undefined}
      style={{
        background: rs.bg, padding: rs.pad, fontFamily: rs.fontFamily,
        marginTop:    d.marginTop    ? `${d.marginTop}px`    : undefined,
        marginBottom: d.marginBottom ? `${d.marginBottom}px` : undefined,
      }}
    >
      {/* ── Badge ── */}
      {d.badgeText && (
        <div style={{ marginBottom: rs.gap }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: acc }}>{d.badgeText}</span>
        </div>
      )}

      {/* ── Title: "partners" word highlighted ── */}
      <h2 style={{ margin: `0 0 ${rs.gap}px`, fontSize: rs.h2 + 2, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-.02em', color: rs.text }}>
        {titleParts.map((part, i) =>
          i < titleParts.length - 1
            ? <span key={i}>{part}<span style={{ color: acc }}>partners</span></span>
            : <span key={i}>{part}</span>
        )}
      </h2>

      {/* ── Subtitle ── */}
      {d.subtitle && (
        <p style={{ margin: `0 0 ${rs.gap + 6}px`, fontSize: rs.sub, color: rs.textSecondary, lineHeight: 1.45 }}>
          {d.subtitle}
        </p>
      )}

      {/* ── Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: rs.gap }}>
        {visible.map(dc =>
          detailed
            ? <DetailedCard key={dc.id} dc={dc} d={d} rs={rs} acc={acc} />
            : <CompactCard  key={dc.id} dc={dc} d={d} rs={rs} acc={acc} />
        )}
      </div>

      {/* ── Footer ── */}
      {d.showFooterText && d.footerText && (
        detailed ? (
          <div style={{ marginTop: rs.gap + 4, padding: `${rs.gap}px ${rs.gap + 4}px`, borderRadius: rs.cardR, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', textAlign: 'center' }}>
            <div style={{ fontSize: rs.body, fontWeight: 700, color: rs.text, marginBottom: 3 }}>{d.footerText}</div>
            <div style={{ fontSize: rs.sub, color: rs.textSecondary }}>Síguenos para no perderte ninguna.</div>
          </div>
        ) : (
          <a href="#" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: rs.gap + 2, padding: `${rs.gap + 1}px ${rs.gap + 4}px`, borderRadius: rs.cardR, background: `${acc}18`, textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>🏷️</span>
              <span style={{ fontSize: rs.body, fontWeight: 600, color: acc }}>{d.footerText}</span>
            </div>
            <Chevron color={acc} />
          </a>
        )
      )}
    </div>
  )
}
