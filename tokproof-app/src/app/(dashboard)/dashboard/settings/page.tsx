'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ display_name: displayName }).eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <div className="db-hero">
        <div className="db-hero-top">
          <div>
            <h1 className="db-title"><span className="gt">Settings</span></h1>
            <p className="db-sub">Gestiona tu cuenta y preferencias.</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Profile */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px 24px', marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Perfil público</h2>
          <form onSubmit={handleSave}>
            <div className="fg">
              <label className="fl">Nombre o marca</label>
              <input className="fi" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tu nombre de marca" />
            </div>
            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi" type="email" value={email} disabled style={{ opacity: .6 }} />
              <span className="fh">El email no se puede cambiar desde aquí.</span>
            </div>
            <div className="fg">
              <label className="fl">Username público</label>
              <input className="fi" type="text" value={`@${profile?.username ?? ''}`} disabled style={{ opacity: .6 }} />
              <span className="fh">tokproof.app/@{profile?.username ?? ''}</span>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div style={{ background: 'var(--card)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 'var(--r-xl)', padding: '24px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: 'var(--danger)' }}>Zona de peligro</h2>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Eliminar tu cuenta borrará permanentemente todos tus datos, páginas y analytics. Esta acción no se puede deshacer.
          </p>
          <button className="btn btn-danger btn-sm" onClick={() => alert('Contacta support@tokproof.app para eliminar tu cuenta.')}>
            Eliminar cuenta
          </button>
        </div>
      </div>
      <div style={{ height: 52 }} />
    </>
  )
}
