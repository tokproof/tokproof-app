'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, ExternalLink, Globe, AlertTriangle, Bell, Lock, Sliders, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getPublicPageUrl, getPublicPageDisplay } from '@/lib/urls'
import { useTranslation, LANG_OPTIONS, type Lang } from '@/lib/i18n'
import { getImageCount, IMAGE_LIMITS } from '@/lib/imageUpload'
import type { Profile } from '@/types'

// ─── local types ────────────────────────────────────────────────────────────

interface Prefs {
  language: Lang
  country: string
  timezone: string
  dateFormat: string
}

interface Notifs {
  important: boolean
  product: boolean
  news: boolean
}

// ─── sub-components (inline, no separate files needed) ──────────────────────

function SectionIcon({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

function PanelHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 22 }}>
      {children}
    </div>
  )
}

function SelectRow({ label, value, onChange, options, mobile }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  mobile?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: mobile ? 6 : 14, marginBottom: 15 }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{label}</span>
      <div style={{ position: 'relative', flexShrink: 0, width: mobile ? '100%' : 188 }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none', WebkitAppearance: 'none',
            width: '100%', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 30px 10px 13px',
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
            color: 'var(--text)', background: 'var(--card)', cursor: 'pointer',
          }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted2)' }}>
          ▾
        </span>
      </div>
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 22, height: 22, borderRadius: 7, cursor: 'pointer', flexShrink: 0,
        background: on ? 'var(--grad)' : '#fff',
        border: on ? 'none' : '1.5px solid var(--border)',
        display: 'grid', placeItems: 'center',
        boxShadow: on ? '0 4px 10px -4px rgba(124,58,237,.5)' : 'none',
        transition: 'all .15s',
      }}
    >
      {on && <Check size={13} color="#fff" strokeWidth={3} />}
    </div>
  )
}

// ─── main component ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t, lang, setLang } = useTranslation()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const [prefs, setPrefs] = useState<Prefs>({
    language: lang,
    country: 'us',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
  })
  const [prefSaved, setPrefSaved] = useState(false)

  const [notifs, setNotifs] = useState<Notifs>({
    important: true,
    product: true,
    news: true,
  })
  const [notifSaved, setNotifSaved] = useState(false)
  const [imageCount, setImageCount] = useState<number | null>(null)
  const [isMobile, setIsMobile]   = useState(false)
  const [isTablet, setIsTablet]   = useState(false)

  // Keep prefs.language in sync when lang changes externally
  useEffect(() => {
    setPrefs(p => ({ ...p, language: lang }))
  }, [lang])

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w < 1024)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase.from('profiles').select('*').eq('user_id', data.user.id).single()
        .then(({ data: p }) => {
          if (!p) return
          setProfile(p as Profile)
          setDisplayName(p.display_name ?? '')
          setEmail(p.email ?? data.user!.email ?? '')
          // Load image upload count
          getImageCount(data.user!.id).then(setImageCount)
        })
    })
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ display_name: displayName }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleCopy() {
    const url = getPublicPageUrl(profile?.username ?? '')
    navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  function handleSavePrefs() {
    // Apply language change to global context
    setLang(prefs.language)
    setPrefSaved(true)
    setTimeout(() => setPrefSaved(false), 2000)
  }

  function handleSaveNotifs() {
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2000)
  }

  const toggleNotif = useCallback((key: keyof Notifs) => {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const username = profile?.username ?? ''
  const initials = (profile?.display_name ?? profile?.email ?? 'U').charAt(0).toUpperCase()
  const publicDisplay = username ? getPublicPageDisplay(username) : 'tokproof.app/@username'
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // ── card + panel shared styles ─────────────────────────────────────────
  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-xl)',
    boxShadow: 'var(--shadow-card)',
  }
  const panel: React.CSSProperties = { ...card, padding: isMobile ? '18px 16px 22px' : isTablet ? '18px 20px 24px' : '24px 26px 28px' }

  const outlineBtn: React.CSSProperties = {
    background: '#fff', border: '1px solid var(--border)',
    color: 'var(--purple)', fontFamily: 'inherit', fontWeight: 700,
    fontSize: 13.5, padding: '10px 16px', borderRadius: 11,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'background .15s',
  }

  const notifRows = [
    { key: 'important' as const, title: t('settings.notifications.important.title'), desc: t('settings.notifications.important.desc') },
    { key: 'product'   as const, title: t('settings.notifications.product.title'),   desc: t('settings.notifications.product.desc') },
    { key: 'news'      as const, title: t('settings.notifications.news.title'),       desc: t('settings.notifications.news.desc') },
  ]

  return (
    <>
      {/* Page header */}
      <div className="db-hero">
        <div className="db-hero-top">
          <div>
            <h1 className="db-title">{t('settings.title')}</h1>
            <p className="db-sub">{t('settings.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* ── Profile card ─────────────────────────────────────────────────── */}
      <div style={{ ...card, display: 'flex', flexDirection: isMobile ? 'column' : 'row', padding: isMobile ? '20px 16px' : '30px 34px', gap: 0, marginBottom: 24 }}>

        {/* Avatar column */}
        <div style={{
          flexShrink: 0, width: isMobile ? '100%' : 200, display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          paddingRight: isMobile ? 0 : 30,
          paddingBottom: isMobile ? 20 : 0,
          marginBottom: isMobile ? 4 : 0,
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          borderBottom: isMobile ? '1px solid var(--border)' : 'none',
        }}>
          {profile?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.avatar_url}
              alt="Avatar"
              style={{ width: 118, height: 118, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 0 0 1px var(--border)' }}
            />
          ) : (
            <div style={{
              width: 118, height: 118, borderRadius: '50%',
              background: 'linear-gradient(160deg,#efe6fb,#e3d4f7)',
              border: '3px solid #fff', boxShadow: '0 0 0 1px #ece6f6',
              display: 'grid', placeItems: 'center',
              fontWeight: 800, fontSize: 44, color: 'var(--purple)',
            }}>
              {initials}
            </div>
          )}
          <button style={{ ...outlineBtn, marginTop: 18 }}>{t('settings.profile.changePhoto')}</button>
          <span style={{ color: 'var(--muted2)', fontSize: 12, marginTop: 11 }}>{t('settings.profile.photoHint')}</span>
        </div>

        {/* Fields grid */}
        <form onSubmit={handleSaveProfile} style={{
          flex: 1, display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '14px 0' : '22px 40px',
          paddingLeft: isMobile ? 0 : 34,
          paddingTop: isMobile ? 20 : 0,
        }}>
          {/* Display name */}
          <div>
            <label className="fl">{t('settings.profile.nameOrBrand')}</label>
            <input
              className="fi"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t('settings.profile.namePlaceholder')}
            />
          </div>

          {/* Username */}
          <div>
            <label className="fl">{t('settings.profile.publicUsername')}</label>
            <input className="fi" type="text" value={username ? `@${username}` : ''} disabled style={{ opacity: .6 }} />
            <span className="fh">{publicDisplay}</span>
          </div>

          {/* Email */}
          <div>
            <label className="fl">{t('settings.profile.email')}</label>
            <input className="fi" type="email" value={email} disabled style={{ opacity: .6 }} />
            <span className="fh">{t('settings.profile.emailHint')}</span>
          </div>

          {/* Public URL */}
          <div>
            <label className="fl">{t('settings.profile.publicUrl')}</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid var(--border)', borderRadius: 11,
              padding: '10px 12px 10px 15px', background: '#fcfcfd',
            }}>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {publicDisplay}
              </span>
              <button type="button" onClick={handleCopy} style={{ ...outlineBtn, fontSize: 12.5, padding: '7px 10px', flexShrink: 0 }}>
                <Copy size={13} strokeWidth={2} />
                {copied ? t('settings.profile.copied') : t('settings.profile.copyUrl')}
              </button>
              {username && (
                <a
                  href={getPublicPageUrl(username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...outlineBtn, fontSize: 12.5, padding: '7px 10px', flexShrink: 0, textDecoration: 'none' }}
                >
                  <ExternalLink size={13} strokeWidth={2} />
                  {t('settings.profile.viewProfile')}
                </a>
              )}
            </div>
          </div>

          {/* Save button */}
          <div style={{ gridColumn: isMobile ? 'auto' : 1, marginTop: 2 }}>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ padding: '12px 26px', fontSize: 14 }}>
              {saving ? t('settings.profile.saving') : saved ? t('settings.profile.saved') : t('settings.profile.saveChanges')}
            </button>
          </div>
        </form>
      </div>

      {/* ── 3-column middle row ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 16 : 24, marginBottom: isMobile ? 16 : 24 }}>

        {/* Preferencias */}
        <div style={panel}>
          <PanelHead>
            <SectionIcon color="#6366f1" bg="#e8eafe">
              <Sliders size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>{t('settings.prefs.title')}</h3>
          </PanelHead>

          <SelectRow mobile={isMobile}
            label={t('settings.prefs.language')}
            value={prefs.language}
            onChange={v => setPrefs(p => ({ ...p, language: v as Lang }))}
            options={LANG_OPTIONS}
          />
          <SelectRow mobile={isMobile}
            label={t('settings.prefs.country')}
            value={prefs.country}
            onChange={v => setPrefs(p => ({ ...p, country: v }))}
            options={[
              { value: 'us', label: 'United States' },
              { value: 'es', label: 'España' },
              { value: 'mx', label: 'México' },
              { value: 'ar', label: 'Argentina' },
              { value: 'fr', label: 'France' },
              { value: 'br', label: 'Brasil' },
            ]}
          />
          <SelectRow mobile={isMobile}
            label={t('settings.prefs.timezone')}
            value={prefs.timezone}
            onChange={v => setPrefs(p => ({ ...p, timezone: v }))}
            options={[
              { value: 'America/New_York', label: 'America/New_York' },
              { value: 'America/Chicago', label: 'America/Chicago' },
              { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
              { value: 'Europe/Madrid', label: 'Europe/Madrid' },
              { value: 'America/Mexico_City', label: 'America/Mexico_City' },
              { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo' },
              { value: 'Europe/Paris', label: 'Europe/Paris' },
            ]}
          />
          <SelectRow mobile={isMobile}
            label={t('settings.prefs.dateFormat')}
            value={prefs.dateFormat}
            onChange={v => setPrefs(p => ({ ...p, dateFormat: v }))}
            options={[{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }]}
          />

          {/* Image usage counter */}
          {imageCount !== null && profile && (() => {
            const plan = profile.plan === 'pro' ? 'pro' : 'free'
            const limits = IMAGE_LIMITS[plan]
            const pct = Math.min(100, Math.round((imageCount / limits.maxImages) * 100))
            const isNear = pct >= 80
            const isFull = imageCount >= limits.maxImages
            return (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Image uploads</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isFull ? 'var(--danger)' : isNear ? '#D97706' : 'var(--muted)' }}>
                    {imageCount} / {limits.maxImages === Infinity ? '∞' : limits.maxImages}
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999, transition: 'width .3s',
                    width: `${pct}%`,
                    background: isFull ? 'var(--danger)' : isNear ? '#F59E0B' : 'linear-gradient(135deg,#F647A9,#7B61FF)',
                  }} />
                </div>
                {isFull && plan === 'free' && (
                  <p style={{ fontSize: 10.5, color: 'var(--danger)', marginTop: 5, lineHeight: 1.4 }}>
                    Limit reached. <a href="/dashboard/billing" style={{ color: 'var(--purple)', fontWeight: 700 }}>Upgrade to Pro</a> for 100 images.
                  </p>
                )}
              </div>
            )
          })()}

          <button onClick={handleSavePrefs} style={{ ...outlineBtn, marginTop: 8, width: '100%', justifyContent: 'center' }}>
            {prefSaved ? t('settings.prefs.saved') : t('settings.prefs.save')}
          </button>
        </div>

        {/* Seguridad */}
        <div style={panel}>
          <PanelHead>
            <SectionIcon color="var(--purple)" bg="rgba(124,58,237,.1)">
              <Lock size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>{t('settings.security.title')}</h3>
          </PanelHead>

          {/* Password row */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 10 : 14, marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 7 }}>{t('settings.security.password')}</div>
              <div style={{ letterSpacing: 3, color: 'var(--muted2)', fontSize: 15 }}>••••••••••••</div>
            </div>
            <button
              onClick={() => alert('Contact support@tokproof.app to change your password.')}
              style={{ ...outlineBtn, flexShrink: 0 }}
            >
              {t('settings.security.changePassword')}
            </button>
          </div>

          {/* Last access */}
          <div style={{ paddingTop: 15, borderTop: '1px solid var(--border)', marginBottom: 15 }}>
            <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, marginBottom: 7 }}>{t('settings.security.lastAccess')}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0, display: 'inline-block' }} />
              {t('settings.security.notAvailable')}
            </div>
          </div>

          {/* Account created */}
          <div style={{ paddingTop: 15, borderTop: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, marginBottom: 7 }}>{t('settings.security.accountCreated')}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              {createdAt ?? t('settings.security.notAvailable')}
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div style={panel}>
          <PanelHead>
            <SectionIcon color="var(--pink)" bg="rgba(236,72,153,.1)">
              <Bell size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>{t('settings.notifications.title')}</h3>
          </PanelHead>

          {notifRows.map(({ key, title, desc }) => (
            <div key={key} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              <Toggle on={notifs[key]} onToggle={() => toggleNotif(key)} />
              <div>
                <b style={{ fontWeight: 700, fontSize: 14, display: 'block' }}>{title}</b>
                <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 3, lineHeight: 1.4 }}>{desc}</p>
              </div>
            </div>
          ))}

          <button onClick={handleSaveNotifs} style={{ ...outlineBtn, marginTop: 4, width: '100%', justifyContent: 'center' }}>
            {notifSaved ? t('settings.notifications.saved') : t('settings.notifications.save')}
          </button>
        </div>
      </div>

      {/* ── 2-column bottom row ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: (isMobile || isTablet) ? '1fr' : '1.55fr 1fr', gap: isMobile ? 16 : 24, marginBottom: 52 }}>

        {/* Dominio personalizado */}
        <div style={panel}>
          <PanelHead>
            <SectionIcon color="var(--purple)" bg="rgba(124,58,237,.08)">
              <Globe size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>{t('settings.domain.title')}</h3>
          </PanelHead>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18, lineHeight: 1.5, marginTop: -14 }}>
            {t('settings.domain.desc')}
          </p>
          <div style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 12 : 14,
            border: '1px solid var(--border)', background: 'var(--bg)',
            borderRadius: 13, padding: isMobile ? '14px' : '16px 18px',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, flexShrink: 0,
              background: 'var(--card2)', display: 'grid', placeItems: 'center', color: 'var(--muted2)',
            }}>
              <Globe size={22} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <b style={{ fontWeight: 700, fontSize: 14 }}>{t('settings.domain.notConnected')}</b>
              <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 2 }}>{t('settings.domain.notConnectedDesc')}</p>
            </div>
            <button
              style={{ ...outlineBtn, marginLeft: isMobile ? 0 : 'auto', flexShrink: 0, color: 'var(--text)' }}
              onClick={() => alert('Custom domain feature coming soon.')}
            >
              {t('settings.domain.configure')}
            </button>
          </div>
        </div>

        {/* Zona de peligro */}
        <div style={{ ...panel, borderColor: 'rgba(239,68,68,.2)' }}>
          <PanelHead>
            <SectionIcon color="var(--danger)" bg="rgba(239,68,68,.1)">
              <AlertTriangle size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--danger)' }}>{t('settings.danger.title')}</h3>
          </PanelHead>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: isMobile ? 12 : 18 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--danger)', marginBottom: 7 }}>{t('settings.danger.deleteAccount')}</div>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, maxWidth: 280 }}>
                {t('settings.danger.deleteDesc')}
              </p>
            </div>
            <button
              className="btn btn-danger btn-sm"
              style={{ flexShrink: 0, alignSelf: 'center' }}
              onClick={() => alert('Contact support@tokproof.app to delete your account.')}
            >
              {t('settings.danger.deleteAccount')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
