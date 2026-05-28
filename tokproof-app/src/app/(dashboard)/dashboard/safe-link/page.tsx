import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { computeSafeScore } from '@/lib/safe-score'

export default async function SafeLinkPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pages } = await supabase
    .from('pages')
    .select('id, title, product_name, shopify_url, settings, safe_score, status')
    .eq('user_id', user.id)

  const scores = (pages ?? []).map(page => {
    const result = computeSafeScore({
      shopify_url: page.shopify_url,
      settings: page.settings ?? {},
    })
    return { ...page, computed: result }
  })

  const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.computed.score, 0) / scores.length) : 0
  const circumference = 2 * Math.PI * 60
  const offset = circumference - (avg / 100) * circumference

  return (
    <>
      <div className="db-hero">
        <div className="db-hero-top">
          <div>
            <h1 className="db-title">Safe Link <span className="gt">Score</span></h1>
            <p className="db-sub">Analiza qué tan seguras y TikTok-friendly son tus páginas.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Score ring */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Score promedio</div>
          <svg viewBox="0 0 160 160" width="160" height="160">
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF2D75" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10" />
            <circle
              cx="80" cy="80" r="60" fill="none"
              stroke="url(#scoreGrad)" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset .6s ease' }}
            />
            <text x="80" y="86" textAnchor="middle" fill="white" fontSize="28" fontWeight="900">{avg}</text>
          </svg>
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 800, color: avg >= 80 ? 'var(--success)' : avg >= 50 ? 'var(--warn)' : 'var(--danger)' }}>
            {avg >= 80 ? '✓ Excellent' : avg >= 50 ? '⚠ Medium' : '✕ Risky'}
          </div>
        </div>

        {/* Per-page scores */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Score por página</div>
          {scores.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No tienes páginas todavía.</div>
          ) : (
            scores.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title ?? s.product_name ?? 'Sin título'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      width: `${s.computed.score}%`, height: '100%', borderRadius: 99,
                      background: s.computed.score >= 80 ? 'var(--success)' : s.computed.score >= 50 ? 'var(--warn)' : 'var(--danger)'
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 900, minWidth: 28, textAlign: 'right' }}>{s.computed.score}</span>
                  <Link href={`/dashboard/editor/${s.id}`} className="btn btn-ghost btn-xs">Mejorar →</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Checklist for first page */}
      {scores.length > 0 && (
        <div style={{ marginTop: 24, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Checklist — {scores[0].title ?? 'Página 1'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores[0].computed.checks.map(check => (
              <div key={check.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px',
                background: check.passed ? 'rgba(34,197,94,.05)' : 'rgba(239,68,68,.05)',
                border: `1px solid ${check.passed ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)'}`,
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0, color: check.passed ? 'var(--success)' : 'var(--danger)' }}>
                  {check.passed ? '✓' : '✕'}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{check.label}</div>
                  {check.warning && <div style={{ fontSize: 11, color: 'var(--warn)', marginTop: 2 }}>{check.warning}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ height: 52 }} />
    </>
  )
}
