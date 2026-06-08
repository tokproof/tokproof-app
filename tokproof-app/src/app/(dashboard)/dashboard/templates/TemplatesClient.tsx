'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  TEMPLATES, FILTERS, CATEGORY_META, BADGE_META, CATEGORY_ORDER,
} from './data'
import type { Template, FilterKey, PreviewType, Category, Badge } from './data'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  font:      "'Plus Jakarta Sans', system-ui, sans-serif",
  ink:       '#1e2433',
  muted:     '#7b8194',
  line:      '#eef0f4',
  cardLine:  '#ebe8f0',
  softLine:  '#e8e2ef',
  pink:      '#ec3b8e',
  pinkGrad:  'linear-gradient(135deg,#fb47a0 0%,#e0359a 60%,#d62f8f 100%)',
  purpGrad:  'linear-gradient(135deg,#a78bfa 0%,#8b6ff0 100%)',
  greenGrad: 'linear-gradient(135deg,#4ade80 0%,#16a34a 100%)',
  green:     '#19c37d',
}

// ─── Hover styles injected once ─────────────────────────────────────────────────
const hoverStyles = `
  .tmpl-hover-card {
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .tmpl-hover-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 28px 56px -16px rgba(60,30,80,.28) !important;
  }
  .tmpl-cta-btn:hover:not(:disabled) {
    filter: brightness(1.06);
  }
  .tmpl-ghost-btn:hover {
    background: rgba(236,59,142,.06) !important;
  }
  .tmpl-primary-btn:hover {
    filter: brightness(1.06);
  }
`

// ─── Phone mockup previews ──────────────────────────────────────────────────────
function PhoneMockup({ type }: { type: PreviewType }) {
  const base: React.CSSProperties = {
    width: 158,
    borderRadius: 22,
    border: '5px solid #14161d',
    background: '#fff',
    overflow: 'hidden',
    fontSize: 8.5,
    fontFamily: T.font,
    position: 'relative',
    flex: 1,
  }

  const previews: Record<PreviewType, React.ReactNode> = {
    links: (
      <div style={{ ...base, background: '#0f0f14', padding: '18px 10px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 300 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#fb47a0,#a78bfa)', margin: '0 auto 8px' }} />
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.85)', width: '60%', margin: '0 auto' }} />
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.3)', width: '45%', margin: '0 auto 8px' }} />
        {['rgba(255,255,255,.12)', 'rgba(255,255,255,.10)', 'rgba(255,255,255,.08)', 'rgba(255,255,255,.06)'].map((bg, i) => (
          <div key={i} style={{ height: 28, borderRadius: 9, background: bg, border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', paddingLeft: 10, gap: 7 }}>
            <div style={{ width: 13, height: 13, borderRadius: 4, background: 'rgba(255,255,255,.3)' }} />
            <div style={{ height: 5, width: '55%', borderRadius: 3, background: 'rgba(255,255,255,.5)' }} />
          </div>
        ))}
      </div>
    ),
    shop: (
      <div style={{ ...base, background: '#fff', minHeight: 300, padding: '12px 10px' }}>
        <div style={{ height: 7, width: '50%', borderRadius: 3, background: '#1e2433', margin: '0 auto 10px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          {[T.pinkGrad, 'linear-gradient(135deg,#a78bfa,#8b6ff0)', 'linear-gradient(135deg,#19c37d,#0ea5e9)', 'linear-gradient(135deg,#fb47a0,#e0359a)'].map((g, i) => (
            <div key={i} style={{ borderRadius: 9, overflow: 'hidden', border: '1px solid #f0e7ee' }}>
              <div style={{ height: 56, background: g }} />
              <div style={{ padding: '5px 6px' }}>
                <div style={{ height: 5, borderRadius: 2, background: '#1e2433', width: '70%', marginBottom: 3 }} />
                <div style={{ height: 4, borderRadius: 2, background: '#7b8194', width: '45%', marginBottom: 4 }} />
                <div style={{ height: 14, borderRadius: 4, background: T.pinkGrad }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ margin: '10px 0 0', height: 22, borderRadius: 7, background: T.pinkGrad }} />
      </div>
    ),
    product: (
      <div style={{ ...base, background: '#0f0f14', minHeight: 300, overflow: 'hidden' }}>
        <div style={{ height: 148, background: 'linear-gradient(160deg,#2a0f1e,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 68, height: 68, borderRadius: 16, background: T.pinkGrad, boxShadow: '0 10px 24px rgba(236,59,142,.5)' }} />
        </div>
        <div style={{ padding: '12px 12px 10px' }}>
          <div style={{ height: 7, borderRadius: 3, background: 'rgba(255,255,255,.9)', width: '75%', marginBottom: 5 }} />
          <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,.4)', width: '55%', marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: 1, height: 18, borderRadius: 5, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '60%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,.45)' }} />
              </div>
            ))}
          </div>
          <div style={{ height: 26, borderRadius: 8, background: T.pinkGrad, boxShadow: '0 4px 12px rgba(236,59,142,.5)' }} />
        </div>
      </div>
    ),
    profile: (
      <div style={{ ...base, background: 'linear-gradient(160deg,#fbeef5,#f4ecfa)', padding: '18px 10px', minHeight: 300, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.pinkGrad, margin: '0 auto', border: '2.5px solid #fff', boxShadow: '0 5px 12px rgba(236,59,142,.35)' }} />
        <div style={{ height: 7, borderRadius: 3, background: '#1e2433', width: '55%', margin: '0 auto' }} />
        <div style={{ height: 5, borderRadius: 2, background: '#7b8194', width: '40%', margin: '0 auto 6px' }} />
        {[T.pinkGrad, 'linear-gradient(135deg,#a78bfa,#8b6ff0)', 'rgba(0,0,0,.06)', 'rgba(0,0,0,.04)'].map((bg, i) => (
          <div key={i} style={{ height: 24, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', paddingLeft: 9, gap: 6 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: i < 2 ? 'rgba(255,255,255,.6)' : '#ddd' }} />
            <div style={{ height: 4, width: '45%', borderRadius: 2, background: i < 2 ? 'rgba(255,255,255,.8)' : '#ccc' }} />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 4 }}>
          {['#ec3b8e', '#a78bfa', '#19c37d', '#fb8500'].map(c => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: 6, background: c }} />
          ))}
        </div>
      </div>
    ),
    'links-dark': (
      <div style={{ ...base, background: '#0f0f14', padding: '18px 10px', minHeight: 300 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#fb47a0,#a78bfa)', margin: '0 auto 6px', border: '1.5px solid rgba(255,255,255,.2)' }} />
        <div style={{ height: 7, borderRadius: 3, background: 'rgba(255,255,255,.9)', width: '50%', margin: '0 auto 4px' }} />
        <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,.35)', width: '65%', margin: '0 auto 12px' }} />
        {[T.pinkGrad, 'linear-gradient(135deg,#a78bfa,#8b6ff0)', 'rgba(255,255,255,.09)', 'rgba(255,255,255,.07)'].map((bg, i) => (
          <div key={i} style={{ height: 26, borderRadius: 9, background: bg, marginBottom: 6, border: i > 1 ? '1px solid rgba(255,255,255,.1)' : 'none', display: 'flex', alignItems: 'center', paddingLeft: 10, gap: 7 }}>
            <div style={{ width: 11, height: 11, borderRadius: 3, background: i > 1 ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.5)' }} />
            <div style={{ height: 4, width: '45%', borderRadius: 2, background: i > 1 ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.85)' }} />
          </div>
        ))}
      </div>
    ),
    creator: (
      <div style={{ ...base, background: '#0f0f14', minHeight: 300 }}>
        <div style={{ height: 120, background: 'linear-gradient(160deg,#1a0f2e,#0d1a2a)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '9px solid rgba(255,255,255,.8)', marginLeft: 2 }} />
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', gap: 5 }}>
            {['#ec3b8e', '#a78bfa', '#19c37d'].map(c => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 5, background: c }} />
            ))}
          </div>
        </div>
        <div style={{ padding: '10px 12px' }}>
          <div style={{ height: 6, borderRadius: 2, background: 'rgba(255,255,255,.85)', width: '65%', marginBottom: 5 }} />
          <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,.35)', width: '50%', marginBottom: 10 }} />
          <div style={{ height: 26, borderRadius: 8, background: T.pinkGrad, marginBottom: 6 }} />
          <div style={{ height: 22, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)' }} />
        </div>
      </div>
    ),

    'conversion-max': (
      <div style={{ ...base, background: '#ffffff', minHeight: 300, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Hero: badge + title lines */}
        <div style={{ height: 4, background: 'linear-gradient(135deg,#7C3AED,#A855F7)', borderRadius: 3, width: '38%', marginBottom: 5 }} />
        <div style={{ height: 6, background: '#111', borderRadius: 3, width: '97%', marginBottom: 2 }} />
        <div style={{ height: 6, background: '#111', borderRadius: 3, width: '80%', marginBottom: 3 }} />
        <div style={{ height: 3.5, background: '#999', borderRadius: 2, width: '65%', marginBottom: 7 }} />

        {/* Urgency banner */}
        <div style={{ height: 14, background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 6, marginBottom: 5, display: 'flex', alignItems: 'center', padding: '0 6px', gap: 4 }}>
          <span style={{ fontSize: 7 }}>🔥</span>
          <div style={{ height: 3, background: '#F59E0B', borderRadius: 2, flex: 1 }} />
        </div>

        {/* Trust badges 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 6 }}>
          {['🚚','🔒','⭐','↩️'].map((ic, i) => (
            <div key={i} style={{ height: 13, background: '#F5F3FF', borderRadius: 4, border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <span style={{ fontSize: 6 }}>{ic}</span>
              <div style={{ height: 2.5, background: '#7C3AED', borderRadius: 1, width: '45%', opacity: 0.7 }} />
            </div>
          ))}
        </div>

        {/* TikTok comment cards (dark) */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 6, overflow: 'hidden' }}>
          {[{ a: '#7C3AED', t: 'WOW. No esperaba...' }, { a: '#FF2D55', t: 'Lo vi en TikTok...' }].map((c, i) => (
            <div key={i} style={{ flex: '0 0 47%', background: '#1a1a22', borderRadius: 7, padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.a, flexShrink: 0 }} />
                <div style={{ height: 2.5, background: 'rgba(255,255,255,0.75)', borderRadius: 1, flex: 1 }} />
              </div>
              <div style={{ height: 2.5, background: 'rgba(255,255,255,0.55)', borderRadius: 1, width: '92%' }} />
              <div style={{ height: 2.5, background: 'rgba(255,255,255,0.35)', borderRadius: 1, width: '68%' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#FF2D55' }} />
                <div style={{ height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1, width: 12 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Benefit icons row */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
          {['✨','💧','🛡️','⚡'].map((ic, i) => (
            <div key={i} style={{ flex: 1, height: 22, background: '#F5F3FF', borderRadius: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <span style={{ fontSize: 7 }}>{ic}</span>
              <div style={{ height: 2, background: '#7C3AED', borderRadius: 1, width: '70%', opacity: 0.65 }} />
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div style={{ height: 20, background: 'linear-gradient(135deg,#7C3AED,#A855F7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,.4)' }}>
          <div style={{ height: 3.5, background: 'rgba(255,255,255,0.9)', borderRadius: 2, width: '52%' }} />
        </div>
      </div>
    ),
  }

  return <>{previews[type]}</>
}

// ─── Badge chip ─────────────────────────────────────────────────────────────────
function BadgeChip({ badge }: { badge: Badge }) {
  const meta = BADGE_META[badge]
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, letterSpacing: '.05em',
      padding: '5px 12px', borderRadius: 7,
      background: meta.bg, color: meta.text,
      textTransform: 'uppercase',
      border: `1px solid ${meta.text}22`,
    }}>
      {meta.label}
    </span>
  )
}

// ─── Template card ──────────────────────────────────────────────────────────────
function TemplateCard({ tmpl, onUse, loading }: {
  tmpl: Template; onUse: (t: Template) => void; loading: boolean
}) {
  const catMeta  = CATEGORY_META[tmpl.category]
  const btnGrad  = tmpl.btnVariant === 'pink' ? T.pinkGrad
                 : tmpl.btnVariant === 'purple' ? T.purpGrad
                 : T.greenGrad
  const btnShadow = tmpl.btnVariant === 'pink'
    ? '0 10px 22px -8px rgba(224,53,154,.65)'
    : tmpl.btnVariant === 'green'
    ? '0 10px 22px -8px rgba(22,163,74,.45)'
    : '0 10px 22px -8px rgba(139,111,240,.55)'
  const checkBg = tmpl.checkColor === 'green' ? T.green : T.pink

  return (
    <div
      className="tmpl-hover-card"
      style={{
        position: 'relative',
        background: '#fff',
        border: `1px solid ${tmpl.featured ? '#f0d8ea' : T.cardLine}`,
        borderRadius: 20, padding: 18,
        boxShadow: tmpl.featured
          ? '0 20px 48px -16px rgba(190,60,140,.38)'
          : '0 8px 30px -10px rgba(60,30,80,.13)',
        display: 'flex', gap: 16, alignItems: 'stretch',
        fontFamily: T.font,
        minHeight: 380,
      }}>

      {/* Coming soon overlay */}
      {tmpl.comingSoon && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          background: 'rgba(251,249,252,.9)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          zIndex: 2,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg,#ece1fb,#f5f3ff)',
            border: '1px solid #ddd5f8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🔒</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.ink, marginBottom: 4 }}>
              {tmpl.title}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#8b5cf6', marginBottom: 8 }}>
              Próximamente
            </div>
            <div style={{ fontSize: 12, color: T.muted, maxWidth: 150, lineHeight: 1.5 }}>
              Disponible en futuras actualizaciones de Tokproof
            </div>
          </div>
        </div>
      )}

      {/* Phone mockup */}
      <div style={{
        marginTop: tmpl.featured ? -28 : 0,
        flexShrink: 0,
        display: 'flex',
        alignSelf: 'flex-start',
      }}>
        <PhoneMockup type={tmpl.previewType} />
      </div>

      {/* Info panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Category + badge row */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 800, letterSpacing: '.07em',
            padding: '4px 10px', borderRadius: 7,
            background: catMeta.bg, color: catMeta.text,
          }}>
            {catMeta.label.toUpperCase()}
          </span>
          {tmpl.badge && <BadgeChip badge={tmpl.badge} />}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 18, fontWeight: 800, letterSpacing: '-.02em',
          lineHeight: 1.2, color: T.ink, marginTop: 11,
        }}>
          {tmpl.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 13.5, color: T.muted, lineHeight: 1.55, fontWeight: 500,
          marginTop: 8,
        }}>
          {tmpl.description}
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {tmpl.features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{
                width: 20, height: 20, borderRadius: 7, background: checkBg,
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 12 10 17 19 7"/>
                </svg>
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#3f4453' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA — visually separated from features */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 20,
          borderTop: `1px solid ${T.line}`,
        }}>
          {!tmpl.comingSoon ? (
            <button
              className="tmpl-cta-btn"
              onClick={() => onUse(tmpl)}
              disabled={loading}
              style={{
                width: '100%', border: 'none',
                borderRadius: 12, padding: '13px 16px', fontFamily: T.font,
                fontSize: 14, fontWeight: 700, color: '#fff',
                cursor: loading ? 'wait' : 'pointer',
                background: loading ? '#d0cdd8' : btnGrad,
                boxShadow: loading ? 'none' : btnShadow,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              {loading ? 'Creando...' : 'Usar template'}
              {!loading && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="20" y2="12"/>
                  <polyline points="14 6 20 12 14 18"/>
                </svg>
              )}
            </button>
          ) : (
            <button disabled style={{
              width: '100%', border: `1px solid ${T.line}`,
              borderRadius: 12, padding: '13px 16px',
              fontFamily: T.font, fontSize: 13.5, fontWeight: 700, color: T.muted,
              cursor: 'not-allowed', background: '#faf9fc',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Disponible pronto
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Featured section ───────────────────────────────────────────────────────────
function FeaturedSection({ templates, onUse, loading }: {
  templates: Template[]
  onUse: (t: Template) => void
  loading: string | null
}) {
  if (templates.length === 0) return null
  const cols = templates.length === 1 ? '1fr' : 'repeat(2,1fr)'
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <span style={{ fontSize: 17 }}>⭐</span>
        <span style={{
          fontSize: 11.5, fontWeight: 800, letterSpacing: '.09em',
          color: T.pink, textTransform: 'uppercase',
        }}>
          Destacadas
        </span>
        <div style={{ flex: 1, height: 1, background: T.cardLine }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 22 }}
        className="tmpl-grid">
        {templates.map(t => (
          <TemplateCard key={t.id} tmpl={t} onUse={onUse} loading={loading === t.id} />
        ))}
      </div>
    </div>
  )
}

// ─── Category section ───────────────────────────────────────────────────────────
function CategorySection({ category, templates, onUse, loading }: {
  category: Category
  templates: Template[]
  onUse: (t: Template) => void
  loading: string | null
}) {
  if (templates.length === 0) return null
  const meta = CATEGORY_META[category]
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <span style={{ fontSize: 17 }}>{meta.icon}</span>
        <span style={{
          fontSize: 11.5, fontWeight: 800, letterSpacing: '.09em',
          color: meta.text, textTransform: 'uppercase',
        }}>
          {meta.label}
        </span>
        <span style={{
          fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 6,
          background: meta.bg, color: meta.text,
        }}>
          {templates.length}
        </span>
        <div style={{ flex: 1, height: 1, background: T.cardLine }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}
        className="tmpl-grid">
        {templates.map(t => (
          <TemplateCard key={t.id} tmpl={t} onUse={onUse} loading={loading === t.id} />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function TemplatesClient() {
  const router = useRouter()
  const [active,  setActive]  = useState<FilterKey>('all')
  const [loading, setLoading] = useState<string | null>(null)

  const counts: Record<FilterKey, number> = {
    all:       TEMPLATES.length,
    ecommerce: TEMPLATES.filter(t => t.category === 'ecommerce').length,
    creator:   TEMPLATES.filter(t => t.category === 'creator').length,
    fitness:   TEMPLATES.filter(t => t.category === 'fitness').length,
    affiliate: TEMPLATES.filter(t => t.category === 'affiliate').length,
  }

  async function handleUse(tmpl: Template) {
    if (loading) return
    setLoading(tmpl.id)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(null); return }

    const { data: profile } = await supabase
      .from('profiles').select('username').eq('user_id', user.id).single()

    const { data: page } = await supabase.from('pages').insert({
      user_id:  user.id,
      username: profile?.username,
      type:     tmpl.pageType === 'simple' ? 'simple' : 'trust',
      status:   'draft',
      title:    tmpl.title,
      settings: { _templateId: tmpl.id },
    }).select().single()

    if (page) router.push(`/dashboard/editor/${page.id}`)
    setLoading(null)
  }

  return (
    <>
      <style>{hoverStyles}</style>

      <div style={{
        padding: '32px 40px 48px',
        background: '#FBF9FC',
        minHeight: '100%',
        fontFamily: T.font,
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', color: T.ink, fontFamily: T.font }}>
              Templates
            </h1>
            <p style={{ fontSize: 15, fontWeight: 500, color: T.muted, marginTop: 5 }}>
              Empieza con un diseño probado y personalízalo en minutos.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            {/* Ghost: "Ver demos" */}
            <button
              className="tmpl-ghost-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fff', border: `1px solid ${T.softLine}`, borderRadius: 13,
                padding: '12px 22px', fontSize: 14, fontWeight: 700, color: '#4a4560',
                cursor: 'pointer', fontFamily: T.font,
                boxShadow: '0 2px 8px -4px rgba(0,0,0,.07)',
                transition: 'background .15s',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
              </svg>
              Ver demos
            </button>

            {/* Primary: "Nueva plantilla" */}
            <button
              className="tmpl-primary-btn"
              onClick={() => router.push('/dashboard/editor/new')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: 'none', borderRadius: 13, padding: '12px 22px',
                fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
                background: T.pinkGrad, fontFamily: T.font,
                boxShadow: '0 10px 24px -8px rgba(224,53,154,.65)',
                transition: 'filter .15s',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nueva plantilla
            </button>
          </div>
        </div>

        {/* ── Search bar — future-ready ── */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.muted}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            disabled
            placeholder="Buscar templates… (próximamente)"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 16px 12px 42px',
              background: '#fff', border: `1px solid ${T.line}`,
              borderRadius: 12, fontSize: 14, fontFamily: T.font,
              color: T.ink, outline: 'none', cursor: 'not-allowed', opacity: 0.55,
            }}
          />
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
          {FILTERS.map(f => {
            const isActive = active === f.key
            const catMeta  = f.key !== 'all' ? CATEGORY_META[f.key as Category] : null
            return (
              <button key={f.key} onClick={() => setActive(f.key)}
                style={{
                  border: isActive ? 'none' : `1px solid ${T.softLine}`,
                  borderRadius: 11, padding: '10px 20px',
                  fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                  fontFamily: T.font, transition: 'all .15s',
                  background: isActive ? (catMeta?.gradient ?? T.pinkGrad) : '#fff',
                  color: isActive ? '#fff' : '#5d6376',
                  boxShadow: isActive ? '0 8px 18px -8px rgba(100,60,160,.45)' : 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                {f.key !== 'all' && catMeta && (
                  <span style={{ fontSize: 14 }}>{catMeta.icon}</span>
                )}
                {f.label}
                <span style={{
                  fontSize: 10.5, fontWeight: 800,
                  background: isActive ? 'rgba(255,255,255,.3)' : T.line,
                  color: isActive ? '#fff' : T.muted,
                  borderRadius: 5, padding: '2px 7px',
                  lineHeight: 1.4,
                }}>
                  {counts[f.key]}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Content ── */}
        {active === 'all' ? (
          <>
            <FeaturedSection
              templates={TEMPLATES.filter(t => t.featured)}
              onUse={handleUse}
              loading={loading}
            />
            {CATEGORY_ORDER.map(cat => (
              <CategorySection
                key={cat}
                category={cat}
                templates={TEMPLATES.filter(t => t.category === cat)}
                onUse={handleUse}
                loading={loading}
              />
            ))}
          </>
        ) : (
          (() => {
            const filtered = TEMPLATES.filter(t => t.category === active)
            return filtered.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', padding: '72px 32px',
                background: 'linear-gradient(135deg,rgba(246,71,169,.03),rgba(123,97,255,.04))',
                border: '1px solid rgba(123,97,255,.1)', borderRadius: 20,
              }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg,rgba(246,71,169,.1),rgba(123,97,255,.12))',
                  border: '1.5px solid rgba(123,97,255,.14)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, boxShadow: '0 6px 20px rgba(123,97,255,.1)' }}>
                  <span style={{ fontSize: 36, lineHeight: 1 }}>🎨</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, letterSpacing: '-.02em', marginBottom: 10 }}>
                  More templates are coming
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, maxWidth: 340, margin: '0 0 24px' }}>
                  We&apos;re working on new layouts for this category.
                </p>
                <button
                  onClick={() => router.push('/dashboard/editor/new')}
                  style={{
                    padding: '11px 24px', borderRadius: 12, border: 'none',
                    background: T.pinkGrad, color: '#fff',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font,
                    boxShadow: '0 4px 14px rgba(246,71,169,.28)',
                    transition: 'transform .18s, filter .18s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.06)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ''; (e.currentTarget as HTMLButtonElement).style.transform = '' }}
                >
                  Start from blank page
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}
                className="tmpl-grid">
                {filtered.map(t => (
                  <TemplateCard key={t.id} tmpl={t} onUse={handleUse} loading={loading === t.id} />
                ))}
              </div>
            )
          })()
        )}

        {/* ── Bottom banner ── */}
        <div style={{
          marginTop: 32,
          background: '#fff',
          border: `1px solid ${T.cardLine}`,
          borderRadius: 20, padding: '28px 36px',
          display: 'flex', alignItems: 'center', gap: 20,
          boxShadow: '0 4px 20px -8px rgba(120,80,160,.1)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg,#fde7f1,#ede3fd)',
            border: `1px solid ${T.cardLine}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>
            ✦
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 4 }}>
              ¿No encuentras lo que buscas?
            </div>
            <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}>
              Crea tu propia plantilla desde cero con el editor visual de Tokproof.
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/editor/new')}
            className="tmpl-primary-btn"
            style={{
              marginLeft: 'auto', flexShrink: 0,
              background: T.pinkGrad, border: 'none',
              borderRadius: 13, padding: '14px 28px',
              fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
              fontFamily: T.font, transition: 'filter .15s',
              boxShadow: '0 10px 24px -8px rgba(224,53,154,.55)',
              whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
            Crear desde cero
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"/>
              <polyline points="14 6 20 12 14 18"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
