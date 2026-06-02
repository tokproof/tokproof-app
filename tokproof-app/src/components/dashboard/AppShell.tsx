'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, BarChart3, LayoutGrid,
  CreditCard, Settings, HelpCircle, LogOut, ArrowRight, Crown,
  PanelLeftClose, PanelLeft, ShoppingBag, User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import TokproofLogo from '@/components/shared/TokproofLogo'

const NAV_MAIN = [
  { href: '/dashboard',                  label: 'Dashboard',      Icon: Home,        exact: true  },
  { href: '/dashboard/ecommerce',        label: 'E-commerce',     Icon: ShoppingBag, exact: false },
  { href: '/dashboard/personal-brand',   label: 'Marca Personal', Icon: User,        exact: false },
  { href: '/dashboard/analytics',        label: 'Analytics',      Icon: BarChart3,   exact: false },
  { href: '/dashboard/templates',        label: 'Templates',      Icon: LayoutGrid,  exact: false },
]

const NAV_ACCOUNT = [
  { href: '/dashboard/billing',  label: 'Billing',  Icon: CreditCard,  exact: false, showBadge: true },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings,    exact: false },
  { href: '/dashboard/faq',      label: 'Help',     Icon: HelpCircle,  exact: false },
]

interface AppShellProps {
  children: React.ReactNode
  profile: Profile | null
}

interface Tooltip {
  label: string
  y: number
}

export default function AppShell({ children, profile }: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nav-collapsed')
      if (saved === 'true') setCollapsed(true)
    } catch { /* localStorage unavailable */ }
  }, [])

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    setTooltip(null)
    try { localStorage.setItem('nav-collapsed', String(next)) } catch { /* ignore */ }
  }

  const initials = (profile?.display_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()
  const isFree = profile?.plan === 'free'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  function onNavEnter(e: React.MouseEvent<HTMLElement>, label: string) {
    if (!collapsed) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ label, y: rect.top + rect.height / 2 })
  }

  function onNavLeave() {
    setTooltip(null)
  }

  const sidebarClass = [
    'nav-sidebar',
    mobileOpen ? 'open' : '',
    collapsed ? 'collapsed' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="app-shell">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <nav className={sidebarClass}>

        {/* Logo row + collapse toggle */}
        <div className="nav-logo-row">
          <Link
            href="/dashboard"
            className="nav-logo"
            onClick={() => setMobileOpen(false)}
          >
            <TokproofLogo size="sm" />
            {!collapsed && <span>Tokproof</span>}
          </Link>

          <button
            className="nav-collapse-btn"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed
              ? <PanelLeft size={15} />
              : <PanelLeftClose size={15} />
            }
          </button>
        </div>

        {/* Main nav */}
        <div className="nav-section">
          {NAV_MAIN.map(({ href, label, Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={[
                'nav-item',
                isActive(href, exact) ? 'active' : '',
                collapsed ? 'nav-item-icon-only' : '',
              ].filter(Boolean).join(' ')}
              onMouseEnter={e => onNavEnter(e, label)}
              onMouseLeave={onNavLeave}
            >
              <span className="nav-item-ico"><Icon size={20} strokeWidth={1.8} /></span>
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </div>

        {/* Account nav */}
        <div className="nav-section">
          {!collapsed && <div className="nav-section-label">Cuenta</div>}
          {NAV_ACCOUNT.map(({ href, label, Icon, exact, showBadge }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={[
                'nav-item',
                isActive(href, exact) ? 'active' : '',
                collapsed ? 'nav-item-icon-only' : '',
              ].filter(Boolean).join(' ')}
              onMouseEnter={e => onNavEnter(e, label)}
              onMouseLeave={onNavLeave}
            >
              <span className="nav-item-ico"><Icon size={20} strokeWidth={1.8} /></span>
              {!collapsed && <span>{label}</span>}
              {!collapsed && showBadge && (
                <span
                  className="nav-item-badge"
                  style={!isFree ? { background: 'linear-gradient(135deg,#F647A9,#7B61FF)', color: 'white' } : {}}
                >
                  {isFree ? 'Free' : 'Pro'}
                </span>
              )}
            </Link>
          ))}
          <button
            className={['nav-item', 'nav-item-logout', collapsed ? 'nav-item-icon-only' : ''].filter(Boolean).join(' ')}
            onClick={handleLogout}
            onMouseEnter={e => onNavEnter(e, 'Cerrar sesión')}
            onMouseLeave={onNavLeave}
          >
            <span className="nav-item-ico"><LogOut size={20} strokeWidth={1.8} /></span>
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>

        {/* Footer */}
        <div className="nav-footer">
          {collapsed ? (
            <div className="nav-footer-compact">
              <div
                className="nav-user-av"
                onMouseEnter={e => onNavEnter(e, profile?.display_name ?? profile?.email ?? 'Usuario')}
                onMouseLeave={onNavLeave}
              >
                {initials}
              </div>
              {isFree && (
                <Link
                  href="/dashboard/billing"
                  className="nav-upgrade-icon"
                  title="Upgrade to Pro"
                >
                  <Crown size={13} />
                </Link>
              )}
            </div>
          ) : (
            <div className="nav-footer-card">
              <div className="nav-user">
                <div className="nav-user-av">{initials}</div>
                <div className="nav-user-info" style={{ flex: 1 }}>
                  <div className="nav-user-name">{profile?.display_name ?? profile?.email ?? 'Usuario'}</div>
                  <div className="nav-user-plan">{isFree ? 'Plan Free' : 'Plan Pro'}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: 7,
                  background: 'rgba(255,255,255,.22)',
                  display: 'grid', placeItems: 'center',
                  flexShrink: 0,
                }}>
                  <Crown size={12} color="white" />
                </div>
              </div>
              {isFree ? (
                <Link href="/dashboard/billing" className="nav-upgrade-btn">
                  Upgrade to Pro
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link href="/dashboard/settings" className="nav-profile-link">
                  Ver mi perfil
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Tooltip — rendered outside sidebar so it's never clipped */}
      {collapsed && tooltip && (
        <div
          style={{
            position: 'fixed',
            left: 82,
            top: tooltip.y,
            transform: 'translateY(-50%)',
            background: '#171717',
            color: '#fff',
            padding: '5px 11px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,.22)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.label}
        </div>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 99, backdropFilter: 'blur(3px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── App body ─────────────────────────────────────────────────────── */}
      <div className={`app-body${collapsed ? ' sidebar-collapsed' : ''}`}>
        <div className="app-topbar" style={{ display: 'none' }} id="mobile-topbar">
          <button className="nav-mobile-toggle" onClick={() => setMobileOpen(v => !v)}>☰</button>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>
            <TokproofLogo size="xs" />
            Tokproof
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
