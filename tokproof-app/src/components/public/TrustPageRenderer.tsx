'use client'

import { useEffect, useState } from 'react'
import type { FullPage } from '@/types'
import SafeExitBanner from './SafeExitBanner'
import BrowserExitGuide from './BrowserExitGuide'
import { detectWebView } from '@/lib/webview-detection'

interface Props {
  data: FullPage
  preview?: boolean
}

export default function TrustPageRenderer({ data, preview = false }: Props) {
  const { page, comments, reviews, faqs, logos } = data
  const s = page.settings
  const brandColor = s.brand_color ?? '#FF2D75'
  const accentColor = s.accent_color ?? '#7C3AED'
  const [showExitGuide, setShowExitGuide] = useState(false)
  const [isInTikTok, setIsInTikTok] = useState(false)

  useEffect(() => {
    setIsInTikTok(detectWebView().isTikTokWebView)
  }, [])

  useEffect(() => {
    if (preview) return
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId: page.id,
        eventType: 'page_view',
        metadata: { referer: document.referrer },
      }),
    }).catch(() => {})
  }, [page.id, preview])

  function trackShopifyClick() {
    if (!preview) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: page.id, eventType: 'shopify_click' }),
      }).catch(() => {})
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="pt-root tp-dark-page" style={{ background: s.bg_color ?? '#0F0F10', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* Media hero */}
      <div className="pt-media">
        {s.media_url ? (
          s.media_type === 'video' || s.media_url.includes('youtube') ? (
            <div style={{ aspectRatio: '9/16', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>▶</div>
          ) : (
            <img src={s.media_url} alt={page.product_name ?? ''} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', display: 'block' }} />
          )
        ) : (
          <div style={{ aspectRatio: '9/16', background: 'linear-gradient(180deg,#1a0a14,#0f0f10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'rgba(255,255,255,.15)' }}>🛍</div>
        )}

        {/* TikTok actions overlay */}
        <div className="pt-tktok-acts">
          <div className="pt-act">❤️<span>24.8K</span></div>
          <div className="pt-act">💬<span>1.2K</span></div>
          <div className="pt-act">↗️<span>Share</span></div>
          <div className="pt-act">⚫<span>🎵</span></div>
        </div>
      </div>

      {/* Info card */}
      <div className="pt-card">
        {/* Brand + rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="pt-brand">{page.brand_name ?? ''}</span>
          {avgRating && (
            <span style={{ fontSize: 12, fontWeight: 800, color: '#F59E0B' }}>★ {avgRating} ({reviews.length})</span>
          )}
        </div>

        <h1 className="pt-product">{page.product_name ?? s.headline ?? 'Producto'}</h1>

        {s.description && <p className="pt-desc">{s.description}</p>}

        {/* Price */}
        {s.price && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: brandColor }}>${s.price}</span>
            {s.original_price && (
              <span style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'line-through' }}>${s.original_price}</span>
            )}
          </div>
        )}

        {/* CTA */}
        {page.shopify_url && !preview && s.direct_exit_on_trust_cta && isInTikTok ? (
          <button
            className="pt-cta"
            style={{ background: `linear-gradient(135deg, ${brandColor}, ${accentColor})` }}
            onClick={() => {
              fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId: page.id, eventType: 'cta_click' }),
              }).catch(() => {})
              setShowExitGuide(true)
            }}
          >
            {s.cta_text ?? 'Ver producto oficial'}
          </button>
        ) : page.shopify_url && !preview ? (
          <SafeExitBanner
            shopifyUrl={page.shopify_url}
            pageId={page.id}
            brandColor={brandColor}
            accentColor={accentColor}
            ctaText={s.cta_text ?? 'Ver producto oficial'}
          />
        ) : null}
        {/* Preview fallback CTA (no WebView detection needed in editor) */}
        {page.shopify_url && preview && (
          <a
            href={page.shopify_url}
            className="pt-cta"
            style={{ background: `linear-gradient(135deg, ${brandColor}, ${accentColor})` }}
            onClick={trackShopifyClick}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.cta_text ?? 'Ver producto oficial'}
          </a>
        )}
        {s.cta_subtext && (
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{s.cta_subtext}</p>
        )}

        {/* Tags */}
        <div className="pt-tags">
          <span className="pt-tag">✅ Envío gratis</span>
          <span className="pt-tag">🔒 Pago seguro</span>
          <span className="pt-tag">↩ Devolución 30d</span>
        </div>
      </div>

      {/* Comments section */}
      {s.show_comments && comments.filter(c => c.is_visible).length > 0 && (
        <div className="pt-section">
          <h2 className="pt-sec-title">💬 Comentarios TikTok</h2>
          <div className="pt-comments">
            {comments.filter(c => c.is_visible).map(c => (
              <div key={c.id} className="pt-comment">
                <div className="pt-comment-av">{(c.name ?? 'U').charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{c.name}</span>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>@{c.username}</span>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5 }}>{c.text}</div>
                  {c.likes > 0 && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>❤️ {c.likes}</div>}
                  {c.brand_reply && (
                    <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(255,45,117,.08)', borderRadius: 8, fontSize: 12, borderLeft: '2px solid var(--pink)' }}>
                      <span style={{ fontWeight: 800 }}>{page.brand_name ?? 'Marca'}: </span>{c.brand_reply}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {s.show_reviews && reviews.filter(r => r.is_visible).length > 0 && (
        <div className="pt-section">
          <h2 className="pt-sec-title">⭐ Reviews verificadas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.filter(r => r.is_visible).map(r => (
              <div key={r.id} style={{ background: 'var(--card2)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{r.name}</span>
                  {r.verified && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 99, color: 'var(--success)' }}>Verificado</span>}
                  <span style={{ marginLeft: 'auto', color: '#F59E0B', fontSize: 12 }}>{'★'.repeat(r.rating)}</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--muted)' }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logos */}
      {s.show_logos && logos.filter(l => l.is_visible).length > 0 && (
        <div className="pt-section">
          <h2 className="pt-sec-title" style={{ textAlign: 'center' }}>Visto en</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {logos.filter(l => l.is_visible).map(l => (
              <div key={l.id} style={{ fontSize: 12, fontWeight: 800, padding: '6px 14px', background: 'rgba(255,255,255,.06)', borderRadius: 8, color: 'var(--muted)' }}>
                {l.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {s.show_faq && faqs.filter(f => f.is_visible).length > 0 && (
        <div className="pt-section">
          <h2 className="pt-sec-title">❓ Preguntas frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.filter(f => f.is_visible).map(f => (
              <details key={f.id} style={{ background: 'var(--card2)', borderRadius: 12 }}>
                <summary style={{ padding: '12px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
                  {f.question} <span>▾</span>
                </summary>
                <div style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Legal footer */}
      {s.legal_text && (
        <div style={{ padding: '20px 20px', textAlign: 'center', fontSize: 10, color: 'var(--muted2)', lineHeight: 1.6 }}>
          {s.legal_text}
        </div>
      )}

      {/* Tokproof branding */}
      <div className="pt-brand-footer">
        Creado con <a href="https://tokproof.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pink)', fontWeight: 800, textDecoration: 'none' }}>Tokproof</a>
      </div>

      {/* Sticky CTA */}
      {s.cta_sticky && page.shopify_url && !preview && s.direct_exit_on_trust_cta && isInTikTok ? (
        <div className="pt-sticky-cta">
          <button
            className="pt-cta"
            style={{ background: `linear-gradient(135deg, ${brandColor}, ${accentColor})`, margin: 0 }}
            onClick={() => {
              fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId: page.id, eventType: 'cta_click' }),
              }).catch(() => {})
              setShowExitGuide(true)
            }}
          >
            {s.cta_text ?? 'Ver producto oficial'}
          </button>
        </div>
      ) : s.cta_sticky && page.shopify_url ? (
        <div className="pt-sticky-cta">
          <a
            href={page.shopify_url}
            className="pt-cta"
            style={{ background: `linear-gradient(135deg, ${brandColor}, ${accentColor})`, margin: 0 }}
            onClick={trackShopifyClick}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.cta_text ?? 'Ver producto oficial'}
          </a>
        </div>
      ) : null}

      {/* BrowserExitGuide overlay — shown when CTA is tapped inside TikTok WebView */}
      {showExitGuide && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <BrowserExitGuide
            destinationUrl={s.direct_exit_url ?? page.shopify_url ?? ''}
            pageId={page.id}
            guideText={s.direct_exit_guide_text}
            onClose={() => setShowExitGuide(false)}
          />
        </div>
      )}
    </div>
  )
}
