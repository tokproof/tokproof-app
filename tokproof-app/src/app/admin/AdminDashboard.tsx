'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Users, UserPlus, Crown, TrendingUp, FileText,
  Search, Download, ChevronDown, Copy, ExternalLink,
  LogIn, ArrowUpRight, X, Check,
} from 'lucide-react'
import type { AdminUserRow } from '@/app/api/admin/users/route'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  pageBg:     '#f2f1f6',
  card:       '#fff',
  ink:        '#1d2230',
  muted:      '#8b90a0',
  soft:       '#aab0bf',
  line:       '#eeedf3',
  line2:      '#ecebf1',
  hairline:   '#f0eff4',
  hairline2:  '#f3f2f7',
  pink:       '#ec3b8e',
  purple:     '#8b5cf6',
  purpleAcc:  '#a855f7',
  green:      '#19b877',
  amber:      '#e8930c',
  activeNav:  '#fcdcec',
  purpleTint: '#f1ecfd',
  pinkTint:   '#fde6f1',
  sideGrad:   'linear-gradient(190deg,#fef0f7 0%,#ffffff 28%)',
} as const

// ─── Utilities ────────────────────────────────────────────────────────────────
function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const s = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (s < 120)    return 'Hace unos min'
  if (s < 3600)   return `Hace ${Math.floor(s / 60)} min`
  if (s < 7200)   return 'Hace 1 hora'
  if (s < 86400)  return `Hace ${Math.floor(s / 3600)} horas`
  if (s < 172800) return 'Hace 1 día'
  if (s < 604800) return `Hace ${Math.floor(s / 86400)} días`
  return fmtDate(dateStr)
}

function isActiveUser(lastSignIn: string | null): boolean {
  if (!lastSignIn) return false
  return Date.now() - new Date(lastSignIn).getTime() < 3 * 86400 * 1000
}

const GRADS = [
  'linear-gradient(135deg,#ec3b8e,#a855f7)',
  'linear-gradient(135deg,#a78bfa,#60a5fa)',
  'linear-gradient(135deg,#6ee7b7,#3b82f6)',
  'linear-gradient(135deg,#fcd34d,#f97316)',
  'linear-gradient(135deg,#f9a8d4,#ec4899)',
]
function avatarGrad(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return GRADS[h % GRADS.length]
}

function exportCSV(rows: AdminUserRow[]) {
  const headers = ['Nombre', 'Email', 'Plan', 'Páginas', 'Quick Exits', 'Registrado', 'Último acceso']
  const data = rows.map(u => [
    u.displayName ?? '',
    u.email,
    u.plan,
    String(u.pageCount),
    String(u.quickExitCount),
    fmtDate(u.createdAt),
    u.lastSignInAt ? fmtDate(u.lastSignInAt) : '—',
  ])
  const csv = [headers, ...data]
    .map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'tokproof-usuarios.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ─── Plan badge ───────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: string }) {
  const isPro = plan === 'pro'
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 7,
      background: isPro ? C.purpleTint : '#f1f2f5',
      color: isPro ? C.purple : C.muted,
    }}>
      {isPro ? 'PRO' : 'FREE'}
    </span>
  )
}

// ─── User detail types ────────────────────────────────────────────────────────
interface UserDetail {
  id: string
  email: string
  createdAt: string
  lastSignInAt: string | null
  profile: Record<string, unknown> | null
  pages: Array<{
    id: string
    title: string | null
    product_name: string | null
    status: string
    type: string
    username: string | null
    created_at: string
    published_at: string | null
  }>
  analytics30d: { views: number; clicks: number }
}

// ─── Right-side detail drawer ─────────────────────────────────────────────────
function UserDrawer({
  userId, users, onClose, onPlanChange,
}: {
  userId: string
  users: AdminUserRow[]
  onClose: () => void
  onPlanChange: (id: string, plan: string) => void
}) {
  const [detail,      setDetail]      = useState<UserDetail | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [activityTab, setActivityTab] = useState<'pages' | 'quickExits' | 'links'>('pages')
  const [planSaving,  setPlanSaving]  = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [toast,       setToast]       = useState<string | null>(null)

  const userRow = users.find(u => u.id === userId)

  useEffect(() => {
    setLoading(true)
    setDetail(null)
    fetch(`/api/admin/users/${userId}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function changePlan(plan: 'free' | 'pro') {
    if ((userRow?.plan ?? 'free') === plan) return
    if (!confirm(`¿Cambiar plan a ${plan.toUpperCase()}?`)) return
    setPlanSaving(true)
    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    setPlanSaving(false)
    if (res.ok) { onPlanChange(userId, plan); showToast(`Plan cambiado a ${plan.toUpperCase()} ✓`) }
    else showToast('Error al cambiar el plan')
  }

  function copyId() {
    navigator.clipboard?.writeText(userId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const name    = userRow?.displayName ?? userRow?.email ?? ''
  const initial = name.charAt(0).toUpperCase()
  const grad    = avatarGrad(userId)
  const plan    = userRow?.plan ?? 'free'
  const active  = isActiveUser(userRow?.lastSignInAt ?? null)
  const allPages = detail?.pages ?? []

  const activityPages =
    activityTab === 'pages'      ? allPages :
    activityTab === 'links'      ? allPages.filter(p => p.type === 'simple') :
    /* quickExits */               allPages.filter((_, i) => i < userRow?.quickExitCount! && userRow?.quickExitCount)

  const PAGE_COLORS = ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>

      {/* Inline toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: C.ink, color: '#fff',
          padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 8px 24px rgba(0,0,0,.2)',
        }}>
          {toast}
        </div>
      )}

      {/* ── Card 1: User detail ── */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16.5, fontWeight: 800, color: C.ink }}>Detalle del usuario</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#f4f3f7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
            <X size={13} />
          </button>
        </div>

        {/* Avatar + name block */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 4 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: grad, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{name}</span>
              <PlanBadge plan={plan} />
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userRow?.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a7adba' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                ID: {userId.slice(0, 18)}…
              </span>
              <button onClick={copyId} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: copied ? C.green : C.soft, flexShrink: 0 }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Detail rows */}
        {[
          { label: 'Miembro desde',   value: fmtDate(userRow?.createdAt),                    dot: false },
          { label: 'Último acceso',   value: timeAgo(userRow?.lastSignInAt ?? null),          dot: true  },
          { label: 'Plan actual',     value: null,                                            badge: <PlanBadge plan={plan} /> },
          { label: 'Páginas creadas', value: String(userRow?.pageCount ?? 0),                 dot: false },
          { label: 'Quick Exits',     value: String(userRow?.quickExitCount ?? 0),            dot: false },
          { label: 'Vistas 30d',      value: detail ? String(detail.analytics30d.views) : '…', dot: false },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderTop: `1px solid #f2f1f6`, fontSize: 13.5 }}>
            <span style={{ color: C.muted, fontWeight: 600 }}>{row.label}</span>
            <span style={{ fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
              {row.dot && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? C.green : '#cfd3dc', flexShrink: 0, display: 'inline-block' }} />
              )}
              {'badge' in row ? row.badge : row.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Card 2: Quick actions ── */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, marginBottom: 14 }}>Acciones rápidas</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <button
            onClick={() => changePlan('free')} disabled={planSaving || plan === 'free'}
            style={{ padding: 12, borderRadius: 11, border: 'none', cursor: plan === 'free' ? 'default' : 'pointer', background: plan === 'free' ? '#f1f2f5' : C.purpleTint, color: plan === 'free' ? C.muted : C.purple, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: planSaving ? .7 : 1, fontFamily: 'inherit' }}>
            <UserPlus size={14} /> Cambiar a Free
          </button>
          <button
            onClick={() => changePlan('pro')} disabled={planSaving || plan === 'pro'}
            style={{ padding: 12, borderRadius: 11, border: 'none', cursor: plan === 'pro' ? 'default' : 'pointer', background: plan === 'pro' ? '#f1f2f5' : C.pinkTint, color: plan === 'pro' ? C.muted : C.pink, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: planSaving ? .7 : 1, fontFamily: 'inherit' }}>
            <Crown size={14} /> Cambiar a Pro
          </button>
        </div>

        {([
          { label: 'Entrar como usuario',        icon: <LogIn size={15} />,        onClick: () => { navigator.clipboard?.writeText(userRow?.email ?? ''); showToast('Email copiado al portapapeles') } },
          { label: 'Ver dashboard del usuario',  icon: <ExternalLink size={15} />, onClick: () => { userRow?.username ? window.open(`/u/${userRow.username}`, '_blank') : showToast('Sin página pública') } },
        ] as const).map(btn => (
          <button key={btn.label} onClick={btn.onClick}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 11, border: `1px solid ${C.line2}`, background: C.card, color: '#4a4f5e', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: 8, fontFamily: 'inherit' }}>
            <span style={{ color: C.muted }}>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* ── Card 3: Recent activity ── */}
      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, marginBottom: 14 }}>Actividad reciente</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 20, borderBottom: `1px solid ${C.hairline}`, marginBottom: 14 }}>
          {([
            { key: 'pages' as const,      label: 'Páginas'     },
            { key: 'quickExits' as const, label: 'Quick Exits' },
            { key: 'links' as const,      label: 'Links'       },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setActivityTab(tab.key)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', color: activityTab === tab.key ? C.purple : '#a7adba', borderBottom: activityTab === tab.key ? `2px solid ${C.purple}` : '2px solid transparent', marginBottom: -1 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '12px 0', textAlign: 'center', color: C.muted, fontSize: 13 }}>Cargando…</div>
        ) : activityPages.length === 0 ? (
          <div style={{ padding: '12px 0', color: C.muted, fontSize: 13 }}>Sin actividad</div>
        ) : (
          activityPages.slice(0, 4).map((page, idx) => (
            <div key={page.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: `1px solid #f6f5f9` }}>
              <div style={{ width: 18, height: 18, borderRadius: 6, background: PAGE_COLORS[idx % PAGE_COLORS.length], flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {page.title ?? page.product_name ?? 'Sin título'}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: '#f4f3f7', color: '#a7adba' }}>
                  {page.type === 'trust' ? 'Trust Page' : page.type === 'simple' ? 'Simple Page' : page.type}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 7, flexShrink: 0, background: page.status === 'published' ? '#e4f6ee' : '#fdf0dc', color: page.status === 'published' ? C.green : C.amber }}>
                {page.status === 'published' ? 'Publicada' : 'Borrador'}
              </span>
            </div>
          ))
        )}

        {allPages.length > 0 && (
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', color: C.purple, fontSize: 13.5, fontWeight: 700, padding: 0, fontFamily: 'inherit' }}>
            Ver todas las páginas ({allPages.length}) <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  'Overview', 'Usuarios', 'Planes', 'Páginas',
  'Quick Exits', 'Analytics', 'Soporte', 'Configuración',
]

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  initialUsers: AdminUserRow[]
  adminEmail:   string
}

const PAGE_SIZE = 10

export default function AdminDashboard({ initialUsers, adminEmail }: Props) {
  const [users,          setUsers]          = useState<AdminUserRow[]>(initialUsers)
  const [query,          setQuery]          = useState('')
  const [planFilter,     setPlanFilter]     = useState<'all' | 'pro' | 'free'>('all')
  const [dateFilter,     setDateFilter]     = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [page,           setPage]           = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const adminInitial = (adminEmail || 'A').charAt(0).toUpperCase()
  const adminName    = adminEmail.split('@')[0] || 'Admin'

  // ── Filtering ──
  const filtered = useMemo(() => {
    let r = users
    if (query.trim()) {
      const q = query.toLowerCase()
      r = r.filter(u =>
        u.email.toLowerCase().includes(q) ||
        (u.displayName ?? '').toLowerCase().includes(q) ||
        (u.username ?? '').toLowerCase().includes(q)
      )
    }
    if (planFilter !== 'all') r = r.filter(u => u.plan === planFilter)
    if (dateFilter !== 'all') {
      const days   = parseInt(dateFilter)
      const cutoff = new Date(Date.now() - days * 86400 * 1000)
      r = r.filter(u => new Date(u.createdAt) >= cutoff)
    }
    return r
  }, [users, query, planFilter, dateFilter])

  // Reset page on filter change
  const total      = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Pagination items ──
  function getPagination(): (number | '…')[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3)              return [1, 2, 3, '…', totalPages]
    if (page >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', page - 1, page, page + 1, '…', totalPages]
  }

  // ── KPI stats ──
  const stats = useMemo(() => {
    const pro   = users.filter(u => u.plan === 'pro').length
    const free  = users.filter(u => u.plan !== 'pro').length
    const pages = users.reduce((s, u) => s + u.pageCount, 0)
    return { total: users.length, free, pro, mrr: pro * 19, pages }
  }, [users])

  const STAT_DATA = [
    { label: 'Usuarios totales', value: stats.total,      delta: '+12%', chipBg: '#f1ecfd', icon: <Users size={21} strokeWidth={2} color="#8b5cf6" /> },
    { label: 'Usuarios Free',    value: stats.free,       delta: '+9%',  chipBg: '#e9f1fe', icon: <UserPlus size={21} strokeWidth={2} color="#3b82f6" /> },
    { label: 'Usuarios Pro',     value: stats.pro,        delta: '+33%', chipBg: '#fde6f1', icon: <Crown size={21} strokeWidth={2} color="#ec3b8e" /> },
    { label: 'MRR',              value: `$${stats.mrr}`,  delta: '+18%', chipBg: '#e4f6ee', icon: <TrendingUp size={21} strokeWidth={2} color="#19b877" /> },
    { label: 'Páginas creadas',  value: stats.pages,      delta: '+15%', chipBg: '#fdf0dc', icon: <FileText size={21} strokeWidth={2} color="#e8930c" /> },
  ]

  function updatePlan(userId: string, plan: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif" }}>

      {/* ══════ SIDEBAR ══════ */}
      <aside style={{ width: 230, flexShrink: 0, height: '100vh', overflowY: 'auto', background: C.sideGrad, borderRight: `1px solid ${C.line2}`, padding: '24px 16px 18px', display: 'flex', flexDirection: 'column' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 4px' }}>
          <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.03em', color: C.ink }}>
            Tok<span style={{ color: C.pink }}>proof</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.08em', padding: '3px 7px', borderRadius: 6, background: '#f1e6fc', color: C.purpleAcc }}>
            ADMIN
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = item === 'Usuarios'
            return (
              <button key={item}
                style={{ display: 'flex', alignItems: 'center', padding: '11px 12px', borderRadius: 11, border: 'none', cursor: active ? 'default' : 'pointer', textAlign: 'left', background: active ? C.activeNav : 'transparent', color: active ? C.pink : '#5d6376', fontWeight: active ? 700 : 600, fontSize: 14, fontFamily: 'inherit', width: '100%' }}>
                {item}
              </button>
            )
          })}
        </nav>

        {/* Quick actions card */}
        <div style={{ marginTop: 'auto', background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '15px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 10 }}>Acciones rápidas</div>
          {[
            { label: 'Entrar como usuario',      fn: () => {} },
            { label: 'Ver Analytics globales',   fn: () => {} },
            { label: 'Exportar usuarios',        fn: () => exportCSV(filtered) },
          ].map(item => (
            <button key={item.label} onClick={item.fn}
              style={{ display: 'block', width: '100%', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#5d6376', fontFamily: 'inherit' }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* User chip */}
        <div style={{ background: C.card, border: `1px solid ${C.line2}`, borderRadius: 14, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#b14ce6,#8b5cf6)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
            {adminInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminName}</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Admin</div>
          </div>
          <ChevronDown size={14} color={C.muted} />
        </div>
      </aside>

      {/* ══════ CONTENT ══════ */}
      <div style={{ flex: 1, overflowY: 'auto', background: C.pageBg, padding: '24px 30px 30px' }}>

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.03em', color: C.ink, margin: 0 }}>Usuarios</h1>
            <p style={{ fontSize: 14, fontWeight: 500, color: C.muted, margin: '5px 0 0' }}>
              Gestiona todos los usuarios de Tokproof.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={17} color={C.muted} style={{ position: 'absolute', left: 12, pointerEvents: 'none' }} />
              <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
                placeholder="Buscar usuario..."
                style={{ width: 280, padding: '11px 48px 11px 38px', borderRadius: 11, border: `1px solid #e9e9ef`, background: C.card, fontSize: 13.5, color: C.ink, outline: 'none', fontFamily: 'inherit' }} />
              <kbd style={{ position: 'absolute', right: 10, fontSize: 12, fontWeight: 600, color: C.muted, background: '#f3f3f7', padding: '1px 6px', borderRadius: 6, pointerEvents: 'none' }}>⌘K</kbd>
            </div>
            {/* Impersonate button */}
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 11, border: '1.5px solid #e4d6f5', background: C.card, color: C.purple, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <LogIn size={15} /> Entrar como usuario
            </button>
            {/* User chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#b14ce6,#8b5cf6)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                {adminInitial}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{adminName}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Admin</div>
              </div>
              <ChevronDown size={14} color={C.muted} />
            </div>
          </div>
        </div>

        {/* Body: main + side */}
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>

          {/* ── Main column ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Stats card */}
            <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.line}`, boxShadow: '0 18px 40px -28px rgba(40,30,60,.4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', padding: '22px 8px' }}>
                {STAT_DATA.map((s, i) => (
                  <div key={s.label} style={{ padding: '0 18px', borderLeft: i > 0 ? `1px solid ${C.hairline}` : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: s.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: C.muted }}>{s.label}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.02em', color: C.ink, margin: '3px 0 9px' }}>{s.value}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.green }}>↗ {s.delta}</span>
                      <span style={{ fontSize: 12, color: C.muted }}>vs mes anterior</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table card */}
            <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.line}`, padding: '22px 24px 8px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 16 }}>Todos los usuarios</div>

              {/* Tools row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={15} color={C.muted} style={{ position: 'absolute', left: 12, pointerEvents: 'none' }} />
                  <input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }}
                    placeholder="Buscar por email, nombre o ID..."
                    style={{ width: 300, padding: '11px 14px 11px 36px', borderRadius: 10, border: `1px solid #e9e9ef`, background: C.card, fontSize: 13.5, color: C.ink, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <select value={planFilter} onChange={e => { setPlanFilter(e.target.value as 'all'|'pro'|'free'); setPage(1) }}
                  style={{ padding: '11px 14px', borderRadius: 10, border: `1px solid #e9e9ef`, background: C.card, fontSize: 13.5, fontWeight: 600, color: '#4a4f5e', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <option value="all">Todos los planes</option>
                  <option value="pro">Pro</option>
                  <option value="free">Free</option>
                </select>
                <select value={dateFilter} onChange={e => { setDateFilter(e.target.value as 'all'|'7d'|'30d'|'90d'); setPage(1) }}
                  style={{ padding: '11px 14px', borderRadius: 10, border: `1px solid #e9e9ef`, background: C.card, fontSize: 13.5, fontWeight: 600, color: '#4a4f5e', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <option value="all">Todas las fechas</option>
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                </select>
                <button onClick={() => exportCSV(filtered)}
                  style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 10, border: `1px solid #e9e9ef`, background: C.card, color: '#4a4f5e', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Download size={16} color={C.muted} /> Exportar CSV
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {[
                        { h: 'Usuario',       w: '30%' },
                        { h: 'Plan',          w: 'auto' },
                        { h: 'Páginas',       w: 'auto' },
                        { h: 'Quick Exits',   w: 'auto' },
                        { h: 'Registro',      w: 'auto' },
                        { h: 'Último acceso', w: 'auto' },
                        { h: 'Acciones',      w: 'auto' },
                      ].map(({ h, w }, i) => (
                        <th key={h} style={{ padding: '10px 8px', textAlign: i === 6 ? 'right' : 'left', fontSize: 12.5, fontWeight: 700, color: '#9aa0b0', borderBottom: `1px solid ${C.hairline}`, whiteSpace: 'nowrap', width: w }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: C.muted, fontSize: 14 }}>
                          No se encontraron usuarios
                        </td>
                      </tr>
                    ) : paged.map((u, i) => {
                      const sel    = u.id === selectedUserId
                      const active = isActiveUser(u.lastSignInAt)
                      return (
                        <tr key={u.id}
                          style={{ borderBottom: i < paged.length - 1 ? `1px solid ${C.hairline2}` : 'none', background: sel ? '#fdf9ff' : 'transparent', transition: 'background .1s' }}
                          onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLTableRowElement).style.background = '#faf9fc' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = sel ? '#fdf9ff' : 'transparent' }}
                        >
                          {/* User */}
                          <td style={{ padding: '14px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: avatarGrad(u.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                                {(u.displayName ?? u.email).charAt(0).toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                                  {u.displayName ?? u.email}
                                </div>
                                {u.displayName && (
                                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                                    {u.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Plan */}
                          <td style={{ padding: '14px 8px' }}><PlanBadge plan={u.plan} /></td>
                          {/* Pages */}
                          <td style={{ padding: '14px 8px', fontWeight: 700, color: '#3a3f4e', fontSize: 13.5 }}>{u.pageCount}</td>
                          {/* Quick exits */}
                          <td style={{ padding: '14px 8px', fontWeight: 700, color: '#3a3f4e', fontSize: 13.5 }}>{u.quickExitCount}</td>
                          {/* Registered */}
                          <td style={{ padding: '14px 8px', fontWeight: 700, color: '#3a3f4e', fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                          {/* Last access */}
                          <td style={{ padding: '14px 8px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? C.green : '#cfd3dc', flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#5a5f6e' }}>{timeAgo(u.lastSignInAt)}</span>
                            </div>
                          </td>
                          {/* Actions */}
                          <td style={{ padding: '14px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                              <button
                                onClick={() => setSelectedUserId(sel ? null : u.id)}
                                style={{ padding: '7px 16px', borderRadius: 9, border: `1px solid #e7e7ee`, background: sel ? C.purpleTint : C.card, color: sel ? C.purple : '#4a4f5e', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Ver
                              </button>
                              <button
                                onClick={() => setSelectedUserId(u.id)}
                                style={{ padding: '7px 16px', borderRadius: 9, border: `1px solid #e7e7ee`, background: C.card, color: C.pink, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderTop: `1px solid ${C.hairline}` }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>
                  Mostrando {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total} usuarios
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ minWidth: 34, height: 34, borderRadius: 9, border: `1px solid #e9e9ef`, background: C.card, cursor: page === 1 ? 'default' : 'pointer', color: C.ink, fontSize: 14, fontWeight: 700, opacity: page === 1 ? .4 : 1 }}>
                    ‹
                  </button>
                  {getPagination().map((p, i) => (
                    p === '…' ? (
                      <span key={`e${i}`} style={{ minWidth: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: C.muted }}>…</span>
                    ) : (
                      <button key={`p${p}`} onClick={() => setPage(p as number)}
                        style={{ minWidth: 34, height: 34, borderRadius: 9, border: `1px solid ${p === page ? '#dcd0f7' : '#e9e9ef'}`, background: p === page ? C.purpleTint : C.card, color: p === page ? C.purple : C.ink, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        {p}
                      </button>
                    )
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ minWidth: 34, height: 34, borderRadius: 9, border: `1px solid #e9e9ef`, background: C.card, cursor: page === totalPages ? 'default' : 'pointer', color: C.ink, fontSize: 14, fontWeight: 700, opacity: page === totalPages ? .4 : 1 }}>
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right rail ── */}
          {selectedUserId && (
            <div style={{ width: 332, flexShrink: 0 }}>
              <UserDrawer
                userId={selectedUserId}
                users={users}
                onClose={() => setSelectedUserId(null)}
                onPlanChange={updatePlan}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
