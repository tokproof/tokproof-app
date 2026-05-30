import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDashboardAnalytics, getPageStats, formatAnalytics, formatPageStats } from '@/lib/analytics'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pages } = await supabase
    .from('pages')
    .select('id, title, product_name, status')
    .eq('user_id', user.id)

  const pageList = pages ?? []
  const pageIds  = pageList.map(p => p.id)

  const [dashAnalytics, rawPageStats] = await Promise.all([
    getDashboardAnalytics(user.id),
    getPageStats(pageIds),
  ])

  const a  = formatAnalytics(dashAnalytics)
  const ps = formatPageStats(rawPageStats)

  return (
    <>
      <div className="db-hero">
        <div className="db-hero-top">
          <div>
            <h1 className="db-title"><span className="gt">Analytics</span></h1>
            <p className="db-sub">Métricas de tus trust pages en tiempo real.</p>
          </div>
          <div className="db-actions">
            <select className="fi" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
              <option>Este mes</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="db-stats">
        <div className="db-stat"><div className="db-stat-lbl">Visitantes únicos</div><div className="db-stat-val">{a.views}</div></div>
        <div className="db-stat"><div className="db-stat-lbl">CTA clicks</div><div className="db-stat-val v-pink">{a.clicks}</div></div>
        <div className="db-stat"><div className="db-stat-lbl">CTR</div><div className="db-stat-val v-pink">{a.ctr}</div></div>
        <div className="db-stat"><div className="db-stat-lbl">Fuente #1</div><div className="db-stat-val v-purple">—</div></div>
        <div className="db-stat"><div className="db-stat-lbl">Conversiones est.</div><div className="db-stat-val v-success">{a.rescues}</div></div>
      </div>

      {/* Per-page table */}
      <div className="db-sec-hd">
        <h2>Por página</h2>
        <span className="db-count">{pageList.length}</span>
      </div>

      {pageList.length > 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Página','Estado','Vistas','Clicks','CTR','Shopify clicks'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageList.map(page => {
                const stat = ps[page.id]
                return (
                  <tr key={page.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      <Link href={`/dashboard/editor/${page.id}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                        {page.title ?? page.product_name ?? 'Sin título'}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`sdot ${page.status === 'published' ? 'sdot-on' : 'sdot-off'}`} style={page.status !== 'published' ? { color: 'var(--muted)' } : {}}>
                        {page.status === 'published' ? 'Activo' : 'Borrador'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted2)' }}>{stat?.views ?? '0'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted2)' }}>{stat?.clicks ?? '0'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted2)' }}>{stat?.ctr ?? '0%'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted2)' }}>—</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Sin datos todavía</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Publica una página para empezar a recibir analytics.</p>
          <Link href="/dashboard" className="btn btn-primary">Ir al Dashboard →</Link>
        </div>
      )}
      <div style={{ height: 52 }} />
    </>
  )
}
