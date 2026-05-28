'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, BarChart3, ShieldCheck, LayoutGrid,
  CreditCard, Settings, HelpCircle, LogOut, ArrowRight, Crown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const NAV_MAIN = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home, exact: true },
  { href: '/dashboard/analytics', label: 'Analytics', Icon: BarChart3, exact: false },
  { href: '/dashboard/safe-link', label: 'TikTok Rescue', Icon: ShieldCheck, exact: false, pro: true },
  { href: '/dashboard/templates', label: 'Templates', Icon: LayoutGrid, exact: false },
]

const NAV_ACCOUNT = [
  { href: '/dashboard/billing', label: 'Billing', Icon: CreditCard, exact: false, showBadge: true },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings, exact: false },
  { href: '/dashboard/faq', label: 'Help', Icon: HelpCircle, exact: false },
]

interface AppShellProps {
  children: React.ReactNode
  profile: Profile | null
}

export default function AppShell({ children, profile }: AppShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

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

  return (
    <div className="app-shell">

      {/* ── Sidebar ── */}
      <nav className={`nav-sidebar${mobileOpen ? ' open' : ''}`}>

        {/* Brand */}
        <Link href="/dashboard" className="nav-logo" onClick={() => setMobileOpen(false)}>
          <div className="nav-logo-mark">
            <ShieldCheck size={18} color="white" strokeWidth={2} />
          </div>
          <span>Tokproof</span>
        </Link>

        {/* Main nav */}
        <div className="nav-section">
          {NAV_MAIN.map(({ href, label, Icon, exact, pro }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item${isActive(href, exact) ? ' active' : ''}`}
            >
              <span className="nav-item-ico"><Icon size={20} strokeWidth={1.8} /></span>
              <span>{label}</span>
              {pro && <span className="nav-item-badge">PRO</span>}
            </Link>
          ))}
        </div>

        {/* Account nav */}
        <div className="nav-section">
          <div className="nav-section-label">Cuenta</div>
          {NAV_ACCOUNT.map(({ href, label, Icon, exact, showBadge }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item${isActive(href, exact) ? ' active' : ''}`}
            >
              <span className="nav-item-ico"><Icon size={20} strokeWidth={1.8} /></span>
              <span>{label}</span>
              {showBadge && (
                <span className="nav-item-badge" style={!isFree ? { background: 'linear-gradient(135deg,#F647A9,#7B61FF)', color: 'white' } : {}}>
                  {isFree ? 'Free' : 'Pro'}
                </span>
              )}
            </Link>
          ))}
          <button className="nav-item nav-item-logout" onClick={handleLogout}>
            <span className="nav-item-ico"><LogOut size={20} strokeWidth={1.8} /></span>
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Profile card */}
        <div className="nav-footer">
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
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 99, backdropFilter: 'blur(3px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── App body ── */}
      <div className="app-body">
        <div className="app-topbar" style={{ display: 'none' }} id="mobile-topbar">
          <button className="nav-mobile-toggle" onClick={() => setMobileOpen(v => !v)}>☰</button>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>
            <div className="nav-logo-mark" style={{ width: 24, height: 24 }}>T</div>
            Tokproof
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
