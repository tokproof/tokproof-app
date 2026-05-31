'use client'

import { useState, useMemo, useEffect } from 'react'
import type { AdminUserRow } from '@/app/api/admin/users/route'

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#F4F5F8', card: '#fff', line: '#ECEDF1',
  ink:    '#15161C', ink2: '#3A3C46', muted: '#8B90A0',
  pink:   '#F62E8E', violet: '#7C3AED',
  grad:   'linear-gradient(90deg,#FB2C7D 0%,#C13BD6 55%,#7C3AED 100%)',
  green:  '#13A866', red: '#EF4444',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const isPro = plan === 'pro'
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
      letterSpacing: '.02em',
      background: isPro ? C.grad : '#F0F1F4',
      color: isPro ? '#fff' : C.muted,
    }}>
      {isPro ? 'PRO' : 'Free'}
    </span>
  )
}

// ─── User detail modal ────────────────────────────────────────────────────────
interface UserDetail {
  id: string; email: string; createdAt: string; lastSignInAt: string | null
  profile: Record<string, unknown> | null
  pages: Array<{ id: string; title: string | null; product_name: string | null; status: string; type: string; username: string | null; created_at: string; published_at: string | null }>
  analytics30d: { views: number; clicks: number }
}

function UserDetailModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(3px)' }} onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 20, width: '90%', maxWidth: 680,
        maxHeight: '85vh', overflow: 'auto', padding: '28px 28px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,.16)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>Detalle del usuario</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: C.muted, lineHeight: 1 }}>✕</button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>Cargando...</div>
        )}

        {!loading && detail && (
          <>
            {/* Basic info */}
            <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                {[
                  ['Email',         detail.email],
                  ['User ID',       detail.id],
                  ['Plan',          (detail.profile?.plan as string) ?? 'free'],
                  ['Username',      (detail.profile?.username as string) ?? '—'],
                  ['Nombre',        (detail.profile?.display_name as string) ?? '—'],
                  ['Registrado',    fmt(detail.createdAt)],
                  ['Último acceso', detail.lastSignInAt ? fmt(detail.lastSignInAt) : '—'],
                  ['Vistas 30d',    String(detail.analytics30d.views)],
                  ['Clicks 30d',    String(detail.analytics30d.clicks)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '.05em', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink,
                      wordBreak: 'break-all' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Copiar email',   val: detail.email },
                { label: 'Copiar user_id', val: detail.id },
              ].map(a => (
                <button key={a.label} onClick={() => navigator.clipboard?.writeText(a.val)}
                  style={{ padding: '7px 14px', border: `1px solid ${C.line}`, borderRadius: 9,
                    background: C.card, fontSize: 12.5, fontWeight: 600, color: C.ink2, cursor: 'pointer',
                    fontFamily: 'inherit' }}>
                  📋 {a.label}
                </button>
              ))}
              {!!(detail.profile?.username) && (
                <a href={`/u/${String(detail.profile?.username)}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                    border: `1px solid ${C.line}`, borderRadius: 9, background: C.card,
                    fontSize: 12.5, fontWeight: 600, color: C.violet, textDecoration: 'none' }}>
                  🔗 Ver página pública
                </a>
              )}
            </div>

            {/* Pages */}
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 10 }}>
              Páginas ({detail.pages.length})
            </div>
            {detail.pages.length === 0
              ? <div style={{ fontSize: 13, color: C.muted, padding: '12px 0' }}>Sin páginas.</div>
              : detail.pages.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10, background: '#F9FAFB',
                  marginBottom: 6, gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>
                      {p.title ?? p.product_name ?? 'Sin título'}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                      {p.type} · {p.username ? `/@${p.username}` : p.id.slice(0,8)}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 7,
                    background: p.status === 'published' ? '#E1F3EA' : '#F0F1F4',
                    color: p.status === 'published' ? C.green : C.muted }}>
                    {p.status === 'published' ? 'Activo' : 'Borrador'}
                  </span>
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  )
}

// ─── Plan selector per row ────────────────────────────────────────────────────
function PlanCell({ userId, currentPlan, onSaved }: {
  userId: string; currentPlan: string; onSaved: (plan: string) => void
}) {
  const [plan,    setPlan]    = useState(currentPlan)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const changed = plan !== currentPlan

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); onSaved(plan); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <select value={plan} onChange={e => setPlan(e.target.value)}
        style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: '5px 10px',
          fontSize: 13, fontWeight: 600, color: C.ink, background: C.card,
          fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
      {changed && (
        <button onClick={save} disabled={saving}
          style={{ padding: '5px 12px', borderRadius: 8, border: 'none',
            background: C.grad, color: '#fff', fontSize: 12.5, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: saving ? .7 : 1 }}>
          {saving ? '...' : 'Guardar'}
        </button>
      )}
      {saved && <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✓</span>}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboard({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const [users,        setUsers]     = useState<AdminUserRow[]>(initialUsers)
  const [query,        setQuery]     = useState('')
  const [detailUserId, setDetail]    = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return users
    const q = query.toLowerCase()
    return users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.username ?? '').toLowerCase().includes(q) ||
      (u.displayName ?? '').toLowerCase().includes(q)
    )
  }, [users, query])

  const stats = useMemo(() => ({
    total:  users.length,
    pro:    users.filter(u => u.plan === 'pro').length,
    free:   users.filter(u => u.plan !== 'pro').length,
    pages:  users.reduce((s, u) => s + u.pageCount, 0),
  }), [users])

  function updatePlan(userId: string, plan: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u))
  }

  const STATS = [
    { label: 'Total usuarios', val: stats.total, color: C.violet },
    { label: 'Plan Pro',        val: stats.pro,   color: C.pink   },
    { label: 'Plan Free',       val: stats.free,  color: C.muted  },
    { label: 'Páginas totales', val: stats.pages, color: '#3B82F6' },
  ]

  return (
    <>
      {detailUserId && (
        <UserDetailModal userId={detailUserId} onClose={() => setDetail(null)} />
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.025em', color: C.ink }}>
          Panel de{' '}
          <span style={{ background: C.grad, WebkitBackgroundClip: 'text',
            backgroundClip: 'text', color: 'transparent' }}>administración</span>
        </div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>
          Gestiona usuarios y planes. Solo visible para admins.
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.line}`,
            borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14,
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', marginBottom: 16 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted}
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
        </svg>
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por email, slug o nombre..."
          style={{ border: 'none', outline: 'none', fontFamily: 'inherit',
            fontSize: 14.5, color: C.ink, width: '100%', background: 'none' }} />
        {query && (
          <button onClick={() => setQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: C.muted, fontSize: 18, lineHeight: 1 }}>✕</button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.line}`, background: '#FAFBFC' }}>
                {['Usuario','Plan','Páginas','Quick Exits','Registrado','Último acceso','Cambiar plan','Acciones'].map(h => (
                  <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, color: C.muted, textTransform: 'uppercase',
                    letterSpacing: '.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 16px',
                    color: C.muted, fontSize: 14 }}>
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
              {filtered.map((u, i) => (
                <tr key={u.id} style={{
                  borderBottom: i < filtered.length - 1 ? `1px solid #F1F2F5` : 'none',
                  transition: 'background .1s',
                }}>
                  {/* User cell */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#FBA4CE,#B98BF0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#fff' }}>
                        {(u.displayName ?? u.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: C.ink, maxWidth: 200,
                          overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.displayName ?? u.email}
                        </div>
                        {u.displayName && (
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 1,
                            maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {u.email}
                          </div>
                        )}
                        {u.username && (
                          <div style={{ fontSize: 11, color: C.violet, marginTop: 1 }}>
                            @{u.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Plan */}
                  <td style={{ padding: '14px 16px' }}><PlanBadge plan={u.plan} /></td>
                  {/* Páginas */}
                  <td style={{ padding: '14px 16px', color: C.ink2, fontWeight: 600 }}>
                    {u.pageCount}
                  </td>
                  {/* Quick exits */}
                  <td style={{ padding: '14px 16px', color: C.ink2, fontWeight: 600 }}>
                    {u.quickExitCount}
                  </td>
                  {/* Registrado */}
                  <td style={{ padding: '14px 16px', color: C.muted, whiteSpace: 'nowrap', fontSize: 12.5 }}>
                    {fmt(u.createdAt)}
                  </td>
                  {/* Último acceso */}
                  <td style={{ padding: '14px 16px', color: C.muted, whiteSpace: 'nowrap', fontSize: 12.5 }}>
                    {u.lastSignInAt ? fmt(u.lastSignInAt) : '—'}
                  </td>
                  {/* Cambiar plan */}
                  <td style={{ padding: '14px 16px' }}>
                    <PlanCell userId={u.id} currentPlan={u.plan}
                      onSaved={plan => updatePlan(u.id, plan)} />
                  </td>
                  {/* Acciones */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => setDetail(u.id)}
                        style={{ padding: '5px 12px', border: `1px solid ${C.line}`,
                          borderRadius: 8, background: C.card, fontSize: 12, fontWeight: 600,
                          color: C.ink2, cursor: 'pointer', fontFamily: 'inherit',
                          whiteSpace: 'nowrap' }}>
                        Ver detalles
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.line}`,
          fontSize: 12.5, color: C.muted, background: '#FAFBFC' }}>
          {filtered.length} de {users.length} usuarios
        </div>
      </div>
    </>
  )
}
