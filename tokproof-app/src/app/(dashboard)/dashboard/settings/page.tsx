'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, ExternalLink, Globe, AlertTriangle, Bell, Lock, Sliders, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getPublicPageUrl, getPublicPageDisplay } from '@/lib/urls'
import type { Profile } from '@/types'

// ─── local types ────────────────────────────────────────────────────────────

interface Prefs {
  language: string
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

function SelectRow({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 15 }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{label}</span>
      <div style={{ position: 'relative', flexShrink: 0, width: 188 }}>
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const [prefs, setPrefs] = useState<Prefs>({
    language: 'es',
    country: 'es',
    timezone: 'Europe/Madrid',
    dateFormat: 'DD/MM/YYYY',
  })
  const [prefSaved, setPrefSaved] = useState(false)

  const [notifs, setNotifs] = useState<Notifs>({
    important: true,
    product: true,
    news: true,
  })
  const [notifSaved, setNotifSaved] = useState(false)

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
    ? new Date(profile.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // ── card + panel shared styles ─────────────────────────────────────────
  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-xl)',
    boxShadow: 'var(--shadow-card)',
  }
  const panel: React.CSSProperties = { ...card, padding: '24px 26px 28px' }

  const outlineBtn: React.CSSProperties = {
    background: '#fff', border: '1px solid var(--border)',
    color: 'var(--purple)', fontFamily: 'inherit', fontWeight: 700,
    fontSize: 13.5, padding: '10px 16px', borderRadius: 11,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
    transition: 'background .15s',
  }

  return (
    <>
      {/* Page header */}
      <div className="db-hero">
        <div className="db-hero-top">
          <div>
            <h1 className="db-title">Settings</h1>
            <p className="db-sub">Gestiona tu perfil y preferencias de cuenta.</p>
          </div>
        </div>
      </div>

      {/* ── Profile card ─────────────────────────────────────────────────── */}
      <div style={{ ...card, display: 'flex', padding: '30px 34px', gap: 0, marginBottom: 24 }}>

        {/* Avatar column */}
        <div style={{
          flexShrink: 0, width: 200, display: 'flex', flexDirection: 'column',
          alignItems: 'center', paddingRight: 30, borderRight: '1px solid var(--border)',
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
          <button style={{ ...outlineBtn, marginTop: 18 }}>Cambiar foto</button>
          <span style={{ color: 'var(--muted2)', fontSize: 12, marginTop: 11 }}>JPG, PNG. Máx. 2MB</span>
        </div>

        {/* Fields grid */}
        <form onSubmit={handleSaveProfile} style={{
          flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '22px 40px', paddingLeft: 34,
        }}>
          {/* Display name */}
          <div>
            <label className="fl">NOMBRE O MARCA</label>
            <input
              className="fi"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Tu nombre de marca"
            />
          </div>

          {/* Username */}
          <div>
            <label className="fl">USERNAME PÚBLICO</label>
            <input className="fi" type="text" value={username ? `@${username}` : ''} disabled style={{ opacity: .6 }} />
            <span className="fh">{publicDisplay}</span>
          </div>

          {/* Email */}
          <div>
            <label className="fl">EMAIL</label>
            <input className="fi" type="email" value={email} disabled style={{ opacity: .6 }} />
            <span className="fh">El email no se puede cambiar desde aquí.</span>
          </div>

          {/* Public URL */}
          <div>
            <label className="fl">URL PÚBLICA</label>
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
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              {username && (
                <a
                  href={getPublicPageUrl(username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...outlineBtn, fontSize: 12.5, padding: '7px 10px', flexShrink: 0, textDecoration: 'none' }}
                >
                  <ExternalLink size={13} strokeWidth={2} />
                  Ver perfil
                </a>
              )}
            </div>
          </div>

          {/* Save button */}
          <div style={{ gridColumn: 1, marginTop: 2 }}>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ padding: '12px 26px', fontSize: 14 }}>
              {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* ── 3-column middle row ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 24 }}>

        {/* Preferencias */}
        <div style={panel}>
          <PanelHead>
            <SectionIcon color="#6366f1" bg="#e8eafe">
              <Sliders size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>Preferencias</h3>
          </PanelHead>

          <SelectRow
            label="Idioma"
            value={prefs.language}
            onChange={v => setPrefs(p => ({ ...p, language: v }))}
            options={[{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }]}
          />
          <SelectRow
            label="País"
            value={prefs.country}
            onChange={v => setPrefs(p => ({ ...p, country: v }))}
            options={[{ value: 'es', label: 'España' }, { value: 'mx', label: 'México' }, { value: 'ar', label: 'Argentina' }]}
          />
          <SelectRow
            label="Zona horaria"
            value={prefs.timezone}
            onChange={v => setPrefs(p => ({ ...p, timezone: v }))}
            options={[{ value: 'Europe/Madrid', label: 'Europe/Madrid' }, { value: 'America/Mexico_City', label: 'America/Mexico_City' }]}
          />
          <SelectRow
            label="Formato de fecha"
            value={prefs.dateFormat}
            onChange={v => setPrefs(p => ({ ...p, dateFormat: v }))}
            options={[{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }]}
          />

          <button onClick={handleSavePrefs} style={{ ...outlineBtn, marginTop: 8, width: '100%', justifyContent: 'center' }}>
            {prefSaved ? '✓ Guardado' : 'Guardar preferencias'}
          </button>
        </div>

        {/* Seguridad */}
        <div style={panel}>
          <PanelHead>
            <SectionIcon color="var(--purple)" bg="rgba(124,58,237,.1)">
              <Lock size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>Seguridad</h3>
          </PanelHead>

          {/* Password row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 7 }}>Contraseña</div>
              <div style={{ letterSpacing: 3, color: 'var(--muted2)', fontSize: 15 }}>••••••••••••</div>
            </div>
            <button
              onClick={() => alert('Contacta support@tokproof.app para cambiar tu contraseña.')}
              style={{ ...outlineBtn, flexShrink: 0 }}
            >
              Cambiar contraseña
            </button>
          </div>

          {/* Last access */}
          <div style={{ paddingTop: 15, borderTop: '1px solid var(--border)', marginBottom: 15 }}>
            <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, marginBottom: 7 }}>Último acceso</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0, display: 'inline-block' }} />
              No disponible
            </div>
          </div>

          {/* Account created */}
          <div style={{ paddingTop: 15, borderTop: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, marginBottom: 7 }}>Cuenta creada</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
              {createdAt ?? 'No disponible'}
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div style={panel}>
          <PanelHead>
            <SectionIcon color="var(--pink)" bg="rgba(236,72,153,.1)">
              <Bell size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>Notificaciones</h3>
          </PanelHead>

          {([
            { key: 'important' as const, title: 'Emails importantes', desc: 'Recibe emails sobre tu cuenta y seguridad.' },
            { key: 'product'   as const, title: 'Actualizaciones de producto', desc: 'Novedades, mejoras y nuevas funciones.' },
            { key: 'news'      as const, title: 'Novedades y lanzamientos', desc: 'Consejos, guías y contenido exclusivo.' },
          ]).map(({ key, title, desc }) => (
            <div key={key} style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              <Toggle on={notifs[key]} onToggle={() => toggleNotif(key)} />
              <div>
                <b style={{ fontWeight: 700, fontSize: 14, display: 'block' }}>{title}</b>
                <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 3, lineHeight: 1.4 }}>{desc}</p>
              </div>
            </div>
          ))}

          <button onClick={handleSaveNotifs} style={{ ...outlineBtn, marginTop: 4, width: '100%', justifyContent: 'center' }}>
            {notifSaved ? '✓ Guardado' : 'Guardar notificaciones'}
          </button>
        </div>
      </div>

      {/* ── 2-column bottom row ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 24, marginBottom: 52 }}>

        {/* Dominio personalizado */}
        <div style={panel}>
          <PanelHead>
            <SectionIcon color="var(--purple)" bg="rgba(124,58,237,.08)">
              <Globe size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>Dominio personalizado</h3>
          </PanelHead>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18, lineHeight: 1.5, marginTop: -14 }}>
            Conecta tu propio dominio para darle una identidad única a tu perfil.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            border: '1px solid var(--border)', background: 'var(--bg)',
            borderRadius: 13, padding: '16px 18px',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: 'var(--card2)', display: 'grid', placeItems: 'center', color: 'var(--muted2)',
            }}>
              <Globe size={22} strokeWidth={1.8} />
            </div>
            <div>
              <b style={{ fontWeight: 700, fontSize: 14 }}>No conectado</b>
              <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 2 }}>Aún no tienes ningún dominio conectado.</p>
            </div>
            <button
              style={{ ...outlineBtn, marginLeft: 'auto', flexShrink: 0, color: 'var(--text)' }}
              onClick={() => alert('Funcionalidad de dominio personalizado próximamente.')}
            >
              Configurar dominio
            </button>
          </div>
        </div>

        {/* Zona de peligro */}
        <div style={{ ...panel, borderColor: 'rgba(239,68,68,.2)' }}>
          <PanelHead>
            <SectionIcon color="var(--danger)" bg="rgba(239,68,68,.1)">
              <AlertTriangle size={20} strokeWidth={1.9} />
            </SectionIcon>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--danger)' }}>Zona de peligro</h3>
          </PanelHead>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--danger)', marginBottom: 7 }}>Eliminar cuenta</div>
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, maxWidth: 280 }}>
                Esta acción eliminará permanentemente tu cuenta, páginas, analytics y toda tu información.
              </p>
            </div>
            <button
              className="btn btn-danger btn-sm"
              style={{ flexShrink: 0, alignSelf: 'center' }}
              onClick={() => alert('Contacta support@tokproof.app para eliminar tu cuenta.')}
            >
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
