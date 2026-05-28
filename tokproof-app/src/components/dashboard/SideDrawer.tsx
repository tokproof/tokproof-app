'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface SideDrawerProps {
  open: boolean
  onClose: () => void
  profile: Profile | null
}

const NAV = [
  { href: '/dashboard', icon: '▦', label: 'Dashboard', badge: null },
  { href: '/dashboard', icon: '🗂', label: 'Mis páginas', badge: null },
  { href: '/dashboard/analytics', icon: '📊', label: 'Analytics', badge: null },
  { href: '/dashboard/safe-link', icon: '🔍', label: 'Safe Link Score', badge: null },
  { href: '/dashboard/templates', icon: '🎨', label: 'Templates', badge: null },
]

const NAV_ACCOUNT = [
  { href: '/dashboard/billing', icon: '⚡', label: 'Plan & Billing', badge: true },
  { href: '/dashboard/faq', icon: '❓', label: 'FAQ & Ayuda', badge: null },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Settings', badge: null },
]

export default function SideDrawer({ open, onClose, profile }: SideDrawerProps) {
  const pathname = usePathname()
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const isFree = profile?.plan === 'free'
  const initials = (profile?.display_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div
      className={`sp-overlay ${open ? 'open' : ''}`}
      id="spOverlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <aside className="sp-panel">
        <button className="sp-close" onClick={onClose}>✕</button>

        <div className="sp-user">
          <div className="sp-user-av">{initials}</div>
          <div className="sp-user-name">{profile?.display_name ?? 'Usuario'}</div>
          <div className="sp-user-handle">{profile?.username ? `@${profile.username}` : ''}</div>
          <div className="sp-user-email">{profile?.email ?? ''}</div>
        </div>

        <nav className="sp-nav">
          <div className="sp-nav-section">Workspace</div>
          {NAV.map(item => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`sp-nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sp-nav-ico">{item.icon}</span>
              {item.label}
              {item.label === 'Mis páginas' && (
                <span className="sp-nav-badge-new">2</span>
              )}
            </Link>
          ))}

          <div className="sp-nav-section">Cuenta</div>
          {NAV_ACCOUNT.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sp-nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sp-nav-ico">{item.icon}</span>
              {item.label}
              {item.href === '/dashboard/billing' && (
                <span
                  className="sp-nav-badge"
                  style={!isFree ? { background: 'var(--grad)', color: '#fff', borderColor: 'transparent' } : {}}
                >
                  {isFree ? 'Free' : 'Pro'}
                </span>
              )}
            </Link>
          ))}

          <button
            className="sp-nav-item"
            style={{ opacity: .5, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            onClick={handleLogout}
          >
            <span className="sp-nav-ico" style={{ opacity: .6 }}>→</span>
            <span style={{ opacity: .6 }}>Cerrar sesión</span>
          </button>
        </nav>

        <div className="sp-foot">
          {isFree ? (
            <div className="sp-plan-box" id="spPlanBoxFree">
              <div className="sp-plan-top">
                <span className="sp-plan-label">Plan Free</span>
                <span style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(255,255,255,.06)', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--muted)', fontWeight: 800 }}>Free</span>
              </div>
              <div className="sp-plan-bar-wrap">
                <div className="sp-plan-bar-fill" style={{ width: '100%', background: 'linear-gradient(90deg,var(--pink),#ff6b6b)' }} />
              </div>
              <div className="sp-plan-pages">1 / 1 páginas publicadas</div>
              <Link href="/dashboard/billing" className="btn btn-primary btn-full btn-sm" style={{ marginTop: 10, fontSize: 11 }}>
                ⬆ Upgrade to Pro
              </Link>
            </div>
          ) : (
            <div className="sp-plan-box sp-plan-box-pro">
              <div className="sp-plan-top">
                <span className="sp-plan-label" style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Plan Pro</span>
                <span className="badge-pro" style={{ fontSize: 9, padding: '2px 8px' }}>Pro</span>
              </div>
              <div className="sp-plan-bar-wrap">
                <div className="sp-plan-bar-fill" style={{ width: '20%' }} />
              </div>
              <div className="sp-plan-pages">2 / ∞ páginas publicadas</div>
              <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, marginTop: 8 }}>✓ Plan Pro activo</div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
