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
  cardLine:  '#f0e7ee',
  softLine:  '#ecdfe8',
  pink:      '#ec3b8e',
  pinkGrad:  'linear-gradient(135deg,#fb47a0 0%,#e0359a 60%,#d62f8f 100%)',
  purpGrad:  'linear-gradient(135deg,#a78bfa 0%,#8b6ff0 100%)',
  greenGrad: 'linear-gradient(135deg,#4ade80 0%,#16a34a 100%)',
  green:     '#19c37d',
}

// ─── Phone mockup previews ──────────────────────────────────────────────────────
function PhoneMockup({ type }: { type: PreviewType }) {
  const base: React.CSSProperties = {
    width: 158, flexShrink: 0, borderRadius: 22, border: '5px solid #14161d',
    background: '#fff', overflow: 'hidden', fontSize: 8.5,
    fontFamily: T.font, position: 'relative',
  }

  const previews: Record<PreviewType, React.ReactNode> = {
    links: (
      <div style={{ ...base, background: '#0f0f14', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 7, minHeight: 220 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#fb47a0,#a78bfa)', margin: '0 auto 6px' }} />
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.85)', width: '60%', margin: '0 auto' }} />
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.3)', width: '45%', margin: '0 auto 6px' }} />
        {['rgba(255,255,255,.12)', 'rgba(255,255,255,.10)', 'rgba(255,255,255,.08)'].map((bg, i) => (
          <div key={i} style={{ height: 26, borderRadius: 8, background: bg, border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,255,255,.3)' }} />
            <div style={{ height: 5, width: '55%', borderRadius: 3, background: 'rgba(255,255,255,.5)' }} />
          </div>
        ))}
      </div>
    ),
    shop: (
      <div style={{ ...base, background: '#fff', minHeight: 220, padding: '10px 8px' }}>
        <div style={{ height: 7, width: '50%', borderRadius: 3, background: '#1e2433', margin: '0 auto 8px', fontWeight: 800 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[T.pinkGrad, 'linear-gradient(135deg,#a78bfa,#8b6ff0)', 'linear-gradient(135deg,#19c37d,#0ea5e9)', 'linear-gradient(135deg,#fb47a0,#e0359a)'].map((g, i) => (
            <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #f0e7ee' }}>
              <div style={{ height: 48, background: g }} />
              <div style={{ padding: '4px 5px' }}>
                <div style={{ height: 5, borderRadius: 2, background: '#1e2433', width: '70%', marginBottom: 3 }} />
                <div style={{ height: 4, borderRadius: 2, background: '#7b8194', width: '45%' }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ margin: '8px 0 0', height: 20, borderRadius: 6, background: T.pinkGrad }} />
      </div>
    ),
    product: (
      <div style={{ ...base, background: '#0f0f14', minHeight: 220, overflow: 'hidden' }}>
        <div style={{ height: 120, background: 'linear-gradient(160deg,#2a0f1e,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: T.pinkGrad, boxShadow: '0 8px 20px rgba(236,59,142,.4)' }} />
        </div>
        <div style={{ padding: '10px 10px 8px' }}>
          <div style={{ height: 7, borderRadius: 3, background: 'rgba(255,255,255,.9)', width: '75%', marginBottom: 4 }} />
          <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,.4)', width: '55%', marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {['rgba(255,255,255,.1)', 'rgba(255,255,255,.1)', 'rgba(255,255,255,.1)'].map((bg, i) => (
              <div key={i} style={{ flex: 1, height: 16, borderRadius: 4, background: bg, border: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '60%', height: 3, borderRadius: 2, background: 'rgba(255,255,255,.5)' }} />
              </div>
            ))}
          </div>
          <div style={{ height: 22, borderRadius: 7, background: T.pinkGrad, boxShadow: '0 4px 10px rgba(236,59,142,.5)' }} />
        </div>
      </div>
    ),
    profile: (
      <div style={{ ...base, background: 'linear-gradient(160deg,#fbeef5,#f4ecfa)', padding: '14px 10px', minHeight: 220, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.pinkGrad, margin: '0 auto', border: '2px solid #fff', boxShadow: '0 4px 10px rgba(236,59,142,.35)' }} />
        <div style={{ height: 7, borderRadius: 3, background: '#1e2433', width: '55%', margin: '0 auto' }} />
        <div style={{ height: 5, borderRadius: 2, background: '#7b8194', width: '40%', margin: '0 auto 4px' }} />
        {[T.pinkGrad, 'linear-gradient(135deg,#a78bfa,#8b6ff0)', 'rgba(0,0,0,.06)'].map((bg, i) => (
          <div key={i} style={{ height: 22, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,.6)' }} />
            <div style={{ height: 4, width: '45%', borderRadius: 2, background: i === 2 ? '#7b8194' : 'rgba(255,255,255,.8)' }} />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4 }}>
          {['#ec3b8e', '#a78bfa', '#19c37d', '#fb8500'].map(c => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 5, background: c }} />
          ))}
        </div>
      </div>
    ),
    'links-dark': (
      <div style={{ ...base, background: '#0f0f14', padding: '14px 10px', minHeight: 220 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#fb47a0,#a78bfa)', margin: '0 auto 5px', border: '1.5px solid rgba(255,255,255,.2)' }} />
        <div style={{ height: 7, borderRadius: 3, background: 'rgba(255,255,255,.9)', width: '50%', margin: '0 auto 3px' }} />
        <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,.35)', width: '65%', margin: '0 auto 10px' }} />
        {[T.pinkGrad, 'linear-gradient(135deg,#a78bfa,#8b6ff0)', 'rgba(255,255,255,.08)', 'rgba(255,255,255,.06)'].map((bg, i) => (
          <div key={i} style={{ height: 24, borderRadius: 8, background: bg, marginBottom: 5, border: i > 1 ? '1px solid rgba(255,255,255,.1)' : 'none', display: 'flex', alignItems: 'center', paddingLeft: 9, gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: i > 1 ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.5)' }} />
            <div style={{ height: 4, width: '45%', borderRadius: 2, background: i > 1 ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.85)' }} />
          </div>
        ))}
      </div>
    ),
    creator: (
      <div style={{ ...base, background: '#0f0f14', minHeight: 220 }}>
        <div style={{ height: 100, background: 'linear-gradient(160deg,#1a0f2e,#0d1a2a)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid rgba(255,255,255,.8)', marginLeft: 2 }} />
          </div>
          <div style={{ position: 'absolute', bottom: 6, left: 8, display: 'flex', gap: 4 }}>
            {['#ec3b8e', '#a78bfa', '#19c37d'].map(c => (
              <div key={c} style={{ width: 14, height: 14, borderRadius: 4, background: c }} />
            ))}
          </div>
        </div>
        <div style={{ padding: '8px 10px' }}>
          <div style={{ height: 6, borderRadius: 2, background: 'rgba(255,255,255,.85)', width: '65%', marginBottom: 4 }} />
          <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,.35)', width: '50%', marginBottom: 8 }} />
          <div style={{ height: 22, borderRadius: 7, background: T.pinkGrad }} />
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
      fontSize: 10, fontWeight: 800, letterSpacing: '.05em',
      padding: '3px 8px', borderRadius: 6,
      background: meta.bg, color: meta.text,
      textTransform: 'uppercase',
    }}>
      {meta.label}
    </span>
  )
}

// ─── Template card ──────────────────────────────────────────────────────────────
function TemplateCard({ tmpl, onUse, loading }: {
  tmpl: Template; onUse: (t: Template) => void; loading: boolean
}) {
  const catMeta = CATEGORY_META[tmpl.category]
  const btnGrad = tmpl.btnVariant === 'pink' ? T.pinkGrad
                : tmpl.btnVariant === 'purple' ? T.purpGrad
                : T.greenGrad
  const btnShadow = tmpl.btnVariant === 'pink'
    ? '0 10px 22px -8px rgba(224,53,154,.65)'
    : tmpl.btnVariant === 'green'
    ? '0 10px 22px -8px rgba(22,163,74,.45)'
    : '0 10px 22px -8px rgba(139,111,240,.55)'
  const checkBg = tmpl.checkColor === 'green' ? T.green : T.pink

  return (
    <div style={{
      position: 'relative',
      background: '#fff',
      border: `1px solid ${tmpl.featured ? '#f6dcec' : T.cardLine}`,
      borderRadius: 18, padding: 18,
      boxShadow: tmpl.featured
        ? '0 26px 50px -20px rgba(190,60,140,.45)'
        : '0 14px 34px -22px rgba(60,30,60,.4)',
      display: 'flex', gap: 16, alignItems: 'flex-start',
      transition: 'transform .18s, box-shadow .18s',
      fontFamily: T.font,
    }} className="tmpl-hover-card">

      {/* Coming soon overlay */}
      {tmpl.comingSoon && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: 'rgba(255,255,255,.86)', backdropFilter: 'blur(3px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
          zIndex: 2,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: '#f5f3ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🔒</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>Próximamente</span>
          <span style={{ fontSize: 12, color: T.muted, textAlign: 'center', maxWidth: 130, lineHeight: 1.4 }}>
            En desarrollo para Tokproof Pro
          </span>
        </div>
      )}

      {/* Phone mockup */}
      <div style={{ marginTop: tmpl.featured ? -26 : 0, flexShrink: 0 }}>
        <PhoneMockup type={tmpl.previewType} />
      </div>

      {/* Info panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Category + badge row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
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
        <h3 style={{ fontSize: 18.5, fontWeight: 800, letterSpacing: '-.02em',
          lineHeight: 1.15, color: T.ink, marginTop: 10 }}>
          {tmpl.title}
        </h3>

        {/* Description */}
        <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.5, fontWeight: 500,
          marginTop: 9 }}>
          {tmpl.description}
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 16 }}>
          {tmpl.features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{
                width: 19, height: 19, borderRadius: 6, background: checkBg,
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 12 10 17 19 7"/>
                </svg>
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: '#3f4453' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!tmpl.comingSoon ? (
          <button
            onClick={() => onUse(tmpl)}
            disabled={loading}
            style={{
              marginTop: 'auto', paddingTop: 20, width: '100%', border: 'none',
              borderRadius: 12, padding: 13, fontFamily: T.font,
              fontSize: 14, fontWeight: 700, color: '#fff', cursor: loading ? 'wait' : 'pointer',
              background: loading ? '#ccc' : btnGrad,
              boxShadow: loading ? 'none' : btnShadow,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'filter .15s',
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
            marginTop: 'auto', paddingTop: 20, width: '100%',
            border: `1px solid ${T.line}`, borderRadius: 12, padding: 13,
            fontFamily: T.font, fontSize: 14, fontWeight: 700, color: T.muted,
            cursor: 'not-allowed', background: '#fafafa',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Disponible pronto
          </button>
        )}
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
  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>⭐</span>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.09em', color: T.pink, textTransform: 'uppercase' }}>
          Destacadas
        </span>
        <div style={{ flex: 1, height: 1, background: T.cardLine }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 22 }}
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
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>{meta.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.09em', color: meta.text, textTransform: 'uppercase' }}>
          {meta.label}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
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
    <div style={{
      padding: '30px 40px 38px',
      background: `radial-gradient(1200px 500px at 80% -5%,#f7e6f5 0%,transparent 55%),
                   linear-gradient(160deg,#fbeef5 0%,#f4ecfa 100%)`,
      minHeight: '100%',
      fontFamily: T.font,
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 33, fontWeight: 800, letterSpacing: '-.03em', color: T.ink, fontFamily: T.font }}>
            Templates
          </h1>
          <p style={{ fontSize: 15, fontWeight: 500, color: T.muted, marginTop: 6 }}>
            Empieza con un diseño probado y personalízalo en minutos.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 13, paddingTop: 4 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            background: '#fff', border: `1px solid ${T.softLine}`, borderRadius: 13,
            padding: '13px 22px', fontSize: 14.5, fontWeight: 700, color: '#3a4051',
            cursor: 'pointer', fontFamily: T.font,
            boxShadow: '0 4px 12px -6px rgba(0,0,0,.08)',
            transition: 'background .15s',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
            </svg>
            Ver ejemplos
          </button>

          <button
            onClick={() => router.push('/dashboard/editor/new')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              border: 'none', borderRadius: 13, padding: '13px 22px',
              fontSize: 14.5, fontWeight: 700, color: '#fff', cursor: 'pointer',
              background: T.pinkGrad, fontFamily: T.font,
              boxShadow: '0 12px 24px -10px rgba(224,53,154,.7)',
              transition: 'filter .15s',
            }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva plantilla
          </button>
        </div>
      </div>

      {/* ── Search bar — future-ready ── */}
      <div style={{ marginTop: 22, position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input
          type="text"
          disabled
          placeholder="Buscar templates... (próximamente)"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '13px 16px 13px 44px',
            background: 'rgba(255,255,255,.7)',
            border: `1px solid ${T.line}`,
            borderRadius: 13, fontSize: 14.5, fontFamily: T.font,
            color: T.ink, outline: 'none', cursor: 'not-allowed', opacity: 0.6,
          }}
        />
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 11, margin: '20px 0 32px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const isActive = active === f.key
          const catMeta  = f.key !== 'all' ? CATEGORY_META[f.key as Category] : null
          return (
            <button key={f.key} onClick={() => setActive(f.key)}
              style={{
                border: isActive ? 'none' : `1px solid ${T.softLine}`,
                borderRadius: 11, padding: '11px 20px',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: T.font, transition: 'all .15s',
                background: isActive ? (catMeta?.gradient ?? T.pinkGrad) : '#fff',
                color: isActive ? '#fff' : '#5d6376',
                boxShadow: isActive ? '0 10px 20px -9px rgba(100,60,160,.4)' : 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {f.key !== 'all' && catMeta && (
                <span style={{ fontSize: 15 }}>{catMeta.icon}</span>
              )}
              {f.label}
              <span style={{
                fontSize: 11, fontWeight: 800,
                background: isActive ? 'rgba(255,255,255,.25)' : T.line,
                color: isActive ? '#fff' : T.muted,
                borderRadius: 5, padding: '1px 6px',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}
          className="tmpl-grid">
          {TEMPLATES.filter(t => t.category === active).map(t => (
            <TemplateCard key={t.id} tmpl={t} onUse={handleUse} loading={loading === t.id} />
          ))}
        </div>
      )}

      {/* ── Bottom banner ── */}
      <div style={{
        marginTop: 24,
        background: 'linear-gradient(100deg,#fde7f1 0%,#f6e8fa 100%)',
        border: '1px solid #f6dcec', borderRadius: 18, padding: '22px 28px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: '#fff', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(236,59,142,.15)', fontSize: 18,
        }}>
          ✦
        </div>
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: T.ink }}>
            ¿No encuentras lo que buscas?
          </div>
          <div style={{ fontSize: 13.5, color: T.muted, marginTop: 3 }}>
            Crea tu template desde cero con nuestro editor visual.
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/editor/new')}
          style={{
            marginLeft: 'auto', flexShrink: 0, background: '#fff',
            border: '1px solid #f6cfe3', borderRadius: 12, padding: '13px 22px',
            fontSize: 14, fontWeight: 800, color: T.pink, cursor: 'pointer',
            fontFamily: T.font, transition: 'background .15s', whiteSpace: 'nowrap',
          }}>
          Crear desde cero
        </button>
      </div>
    </div>
  )
}
