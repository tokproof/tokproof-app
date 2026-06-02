'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    console.log('[signup] attempting signUp for', email)

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })

    console.log('[signup] response:', { user: data?.user?.id, session: !!data?.session, error: signupError?.message })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      // Email confirmation is disabled — session created immediately
      console.log('[signup] session created, redirecting to /onboarding')
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          email,
          display_name: name,
          plan: 'free',
          onboarding_completed: false,
        })
        console.log('[signup] profile insert:', profileError ? profileError.message : 'ok')
      }
      router.refresh()
      router.push('/onboarding')
      return
    }

    // Email confirmation is required — show "check email" screen
    console.log('[signup] no session — email confirmation required')
    setNeedsConfirmation(true)
    setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })
  }

  if (needsConfirmation) {
    return (
      <div className="reg-page">
        <div className="reg-wrap">
          <div className="reg-logo">
            <Link href="/" className="tb-logo" style={{ fontSize: 18, textDecoration: 'none' }}>
              <img className="tb-logo-img" style={{ width: 44, height: 44 }} src="/assets/tokproof-isotipo.png" alt="Tokproof" />
              Tokproof
            </Link>
          </div>
          <div className="reg-steps">
            <div className="reg-step-dot done">✓</div>
            <div className="reg-step-line done" />
            <div className="reg-step-dot active">2</div>
          </div>
          <div className="reg-card">
            <h1 className="reg-card-title">Confirma tu cuenta</h1>
            <p className="reg-card-sub">Revisa el email de <strong style={{ color: 'var(--text)' }}>{email}</strong> y haz clic en el enlace de confirmación.</p>
            <div style={{ textAlign: 'center', fontSize: 40, margin: '24px 0' }}>📬</div>
            <div className="fi-tip">
              <span className="fi-tip-ico">💡</span>
              <span>Si no ves el email, revisa tu carpeta de spam.</span>
            </div>
            <button className="btn btn-ghost btn-full" style={{ marginTop: 16 }} onClick={() => setNeedsConfirmation(false)}>
              ← Cambiar email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reg-page">
      <div className="reg-wrap">
        <div className="reg-logo">
          <Link href="/" className="tb-logo" style={{ fontSize: 18, textDecoration: 'none' }}>
            <img className="tb-logo-img" style={{ width: 44, height: 44 }} src="/assets/tokproof-isotipo.png" alt="Tokproof" />
            Tokproof
          </Link>
        </div>

        <div className="reg-steps">
          <div className="reg-step-dot active">1</div>
          <div className="reg-step-line" />
          <div className="reg-step-dot">2</div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#EF4444' }}>
            {error}
          </div>
        )}

        <div className="reg-card">
          <h1 className="reg-card-title">Crea tu cuenta</h1>
          <p className="reg-card-sub">Únete gratis. Sin tarjeta de crédito.</p>
          <form onSubmit={handleSignup}>
            <div className="fg">
              <label className="fl">Nombre completo <span className="fi-label-rec">Recomendado</span></label>
              <input className="fi" type="text" placeholder="Tu nombre o nombre de marca" value={name}
                onChange={e => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi" type="email" placeholder="hola@tumarca.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="fg" style={{ marginBottom: 24 }}>
              <label className="fl">Contraseña</label>
              <input className="fi" type="password" placeholder="Mínimo 8 caracteres" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              <span className="fh">Al menos 8 caracteres, preferiblemente con números.</span>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
            </button>
            <div className="reg-or"><span>o</span></div>
            <button className="btn btn-secondary btn-full" type="button" onClick={handleGoogle} style={{ gap: 8 }}>
              <span style={{ fontSize: 16 }}>G</span> Continuar con Google
            </button>
          </form>
          <p className="reg-login-link">¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  )
}
