'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isValidUsername } from '@/lib/utils'
import { getPublicPageDisplay, getPublicHostname } from '@/lib/urls'

type Step = 1 | 2

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [usernameError, setUsernameError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (!username) { setUsernameStatus('idle'); return }
    const { valid, error } = isValidUsername(username)
    if (!valid) {
      setUsernameStatus('invalid')
      setUsernameError(error!)
      return
    }

    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()
      setUsernameStatus(data ? 'taken' : 'available')
    }, 450)

    return () => clearTimeout(timer)
  }, [username])

  async function handleFinish() {
    if (!userId || usernameStatus !== 'available') return
    setLoading(true)

    const supabase = createClient()

    // Save username to profile
    await supabase
      .from('profiles')
      .update({ username, onboarding_completed: true })
      .eq('user_id', userId)

    // Create first blank page
    const { data: page } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        username,
        type: 'trust',
        status: 'draft',
        title: 'Mi primera página',
        settings: {},
      })
      .select()
      .single()

    router.push(`/dashboard/editor/${page?.id ?? 'new'}`)
    router.refresh()
  }

  const urlPreview = getPublicPageDisplay(username || 'tumarca')

  return (
    <div className="reg-page">
      <div className="reg-wrap">
        <div className="reg-logo">
          <a href="/" className="tb-logo" style={{ fontSize: 18, textDecoration: 'none' }}>
            <img className="tb-logo-img" style={{ width: 44, height: 44 }} src="/assets/tokproof-isotipo.png" alt="Tokproof" />
            Tokproof
          </a>
        </div>

        {/* Step dots */}
        <div className="reg-steps">
          <div className={`reg-step-dot ${step > 1 ? 'done' : 'active'}`}>{step > 1 ? '✓' : '1'}</div>
          <div className={`reg-step-line ${step > 1 ? 'done' : ''}`} />
          <div className={`reg-step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {step === 1 && (
          <div className="reg-card">
            <h1 className="reg-card-title">Elige tu <span className="gt">@username</span></h1>
            <p className="reg-card-sub">Esta será tu URL pública de Tokproof. Podrás compartirla en tu bio de TikTok.</p>

            <div className="fg">
              <label className="fl">Tu username público</label>
              <div style={{ display: 'flex' }}>
                <span style={{ padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: 'var(--r) 0 0 var(--r)', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {getPublicHostname()}/@
                </span>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    className="fi"
                    type="text"
                    placeholder="tumarca"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    style={{ borderRadius: '0 var(--r) var(--r) 0', paddingRight: 90 }}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {usernameStatus === 'available' && (
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>✓ Disponible</span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>✕ No disponible</span>
                  )}
                </div>
              </div>

              <div className="ub-preview" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
                <span style={{ fontSize: 14 }}>🔗</span>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{urlPreview}</span>
                {usernameStatus === 'available' && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '2px 8px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 99, color: 'var(--success)' }}>
                    disponible
                  </span>
                )}
              </div>
              {usernameStatus === 'invalid' && <span className="fh" style={{ color: 'var(--danger)' }}>{usernameError}</span>}
              <span className="fh" style={{ marginTop: 6 }}>Solo letras, números, guiones y guion bajo. Mínimo 3 caracteres.</span>
            </div>

            <div className="fi-tip" style={{ marginBottom: 20 }}>
              <span className="fi-tip-ico">💡</span>
              <span>Usa el nombre de tu marca o tu @usuario de TikTok. Ej: <strong style={{ color: 'var(--text)' }}>@glowskin</strong>, <strong style={{ color: 'var(--text)' }}>@kikedrops</strong></span>
            </div>

            <button
              className="btn btn-primary btn-full"
              disabled={usernameStatus !== 'available'}
              onClick={() => setStep(2)}
            >
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="reg-card">
            <h1 className="reg-card-title">¡Todo listo, <span className="gt">@{username}</span>!</h1>
            <p className="reg-card-sub">Tu URL pública es <strong style={{ color: 'var(--spurple)' }}>{getPublicPageDisplay(username)}</strong>. Ahora crea tu primera trust page.</p>

            <div style={{ display: 'grid', gap: 12, margin: '20px 0' }}>
              <div style={{ background: 'var(--bg)', border: '1px solid rgba(255,45,117,.18)', borderRadius: 'var(--r-xl)', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🛡</span>
                <div>
                  <div style={{ fontWeight: 800, marginBottom: 3 }}>Trust Page</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>1 producto · reviews · CTA directo a Shopify. Ideal para TikTok Shop.</div>
                </div>
              </div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, opacity: .6 }}>
                <span style={{ fontSize: 24 }}>🔗</span>
                <div>
                  <div style={{ fontWeight: 800, marginBottom: 3 }}>Simple Page</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>Múltiples links · Linktree premium para creadores.</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)} style={{ flexShrink: 0 }}>← Atrás</button>
              <button className="btn btn-primary btn-full" onClick={handleFinish} disabled={loading}>
                {loading ? 'Creando...' : 'Empezar a crear →'}
              </button>
            </div>

            <p style={{ fontSize: 11, color: 'var(--muted2)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
              Al continuar aceptas los <a href="/terms" style={{ color: 'var(--spurple)' }}>Términos</a> y la <a href="/privacy" style={{ color: 'var(--spurple)' }}>Privacidad</a> de Tokproof.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
