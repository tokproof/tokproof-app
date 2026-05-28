import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const FEATURES = [
  { label: 'Páginas publicadas', free: '1', pro: 'Ilimitadas' },
  { label: 'URL pública', free: '✓', pro: '✓' },
  { label: 'Templates', free: '6', pro: '6+' },
  { label: 'Analytics básicos', free: '✓', pro: '✓' },
  { label: 'Analytics avanzados', free: '—', pro: '✓' },
  { label: 'A/B Testing', free: '—', pro: '✓' },
  { label: 'Dominio personalizado', free: '—', pro: '✓' },
  { label: 'Sin branding Tokproof', free: '—', pro: '✓' },
  { label: 'Safe Link Score', free: '✓', pro: '✓' },
  { label: 'Soporte prioritario', free: '—', pro: '✓' },
]

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, username')
    .eq('user_id', user.id)
    .single()

  const isFree = profile?.plan === 'free'

  return (
    <>
      <div className="db-hero">
        <div className="db-hero-top">
          <div>
            <h1 className="db-title">Plan & <span className="gt">Billing</span></h1>
            <p className="db-sub">Gestiona tu suscripción y compara planes.</p>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 36 }}>
        {/* Free */}
        <div style={{ background: 'var(--card)', border: `1px solid ${isFree ? 'rgba(255,45,117,.3)' : 'var(--border)'}`, borderRadius: 'var(--r-xl)', padding: '24px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 900 }}>Free</div>
            {isFree && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: 'rgba(255,45,117,.1)', border: '1px solid rgba(255,45,117,.2)', borderRadius: 99, color: 'var(--pink)' }}>Plan actual</span>}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>$0</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Para siempre gratis</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['1 página publicada','URL tokproof.app/@username','6 templates','Analytics básicos','Safe Link Score'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--success)' }}>✓</span>{f}
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div style={{ background: 'var(--card)', border: '1.5px solid rgba(168,85,247,.35)', borderRadius: 'var(--r-xl)', padding: '24px 22px', boxShadow: '0 0 40px rgba(168,85,247,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 900, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pro</div>
            <span className="badge-pro" style={{ fontSize: 9, padding: '2px 8px' }}>Popular</span>
            {!isFree && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 99, color: 'var(--spurple)' }}>Plan actual</span>}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>$19<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>/mes</span></div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>o $15/mes facturado anualmente</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {['Páginas ilimitadas','Analytics avanzados','A/B Testing','Dominio personalizado','Sin branding Tokproof','Soporte prioritario'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--success)' }}>✓</span>{f}
              </div>
            ))}
          </div>
          {isFree && (
            <button className="btn btn-primary btn-full">⬆ Upgrade a Pro →</button>
          )}
          {!isFree && (
            <button className="btn btn-ghost btn-full">Gestionar suscripción</button>
          )}
        </div>
      </div>

      {/* Feature comparison */}
      <div className="db-sec-hd" style={{ marginTop: 0 }}>
        <h2>Comparativa completa</h2>
      </div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>Funcionalidad</th>
              <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>Free</th>
              <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: 11, fontWeight: 800, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pro</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map(f => (
              <tr key={f.label} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 18px', color: 'var(--muted)' }}>{f.label}</td>
                <td style={{ padding: '12px 18px', textAlign: 'center', color: f.free === '—' ? 'var(--muted2)' : 'var(--text)', fontWeight: 600 }}>{f.free}</td>
                <td style={{ padding: '12px 18px', textAlign: 'center', color: f.pro === '—' ? 'var(--muted2)' : 'var(--success)', fontWeight: 600 }}>{f.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: 52 }} />
    </>
  )
}
