import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'

export const metadata = { title: 'Admin — Tokproof', robots: 'noindex, nofollow' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser()
  if (!user) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#F4F5F8', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ECEDF1',
        padding: '0 32px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo */}
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="admlg" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0" stopColor="#FB2C7D"/>
                <stop offset=".55" stopColor="#C13BD6"/>
                <stop offset="1" stopColor="#7C3AED"/>
              </linearGradient>
            </defs>
            <path d="M20 2.5 L33.6 10 V25 L20 32.5 L6.4 25 V10 Z" fill="url(#admlg)"/>
            <path d="M16 13.5h6.5a4 4 0 0 1 0 8H18v6" stroke="#fff" strokeWidth="2.6"
              fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#15161C' }}>Tokproof</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
            background: 'linear-gradient(90deg,#FB2C7D,#7C3AED)', color: '#fff',
            letterSpacing: '.04em' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 13, color: '#8B90A0' }}>{user.email}</span>
          <a href="/dashboard" style={{ fontSize: 13, fontWeight: 600,
            color: '#7C3AED', textDecoration: 'none' }}>
            ← Volver al Dashboard
          </a>
        </div>
      </div>
      <div style={{ padding: '32px 32px 48px', maxWidth: 1400, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  )
}
