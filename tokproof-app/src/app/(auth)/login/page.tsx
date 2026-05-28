'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    console.log('[login] attempting signIn for', email)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('[login] response:', { session: !!data?.session, error: error?.message })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    console.log('[login] session ok, redirecting to', next)
    router.refresh()
    router.push(next)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${next}` },
    })
  }

  return (
    <div className="reg-card">
      <h1 className="reg-card-title">Bienvenido de vuelta</h1>
      <p className="reg-card-sub">Inicia sesión en tu cuenta Tokproof.</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#EF4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="fg">
          <label className="fl">Email</label>
          <input className="fi" type="email" placeholder="hola@tumarca.com" value={email}
            onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="fg" style={{ marginBottom: 24 }}>
          <label className="fl">Contraseña</label>
          <input className="fi" type="password" placeholder="Tu contraseña" value={password}
            onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>

        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
        </button>

        <div className="reg-or"><span>o</span></div>
        <button className="btn btn-secondary btn-full" type="button" onClick={handleGoogle} style={{ gap: 8 }}>
          <span style={{ fontSize: 16 }}>G</span> Continuar con Google
        </button>
      </form>

      <p className="reg-login-link">
        ¿No tienes cuenta? <Link href="/signup">Crear cuenta gratis</Link>
      </p>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 10 }}>¿Quieres ver el producto sin cuenta?</p>
        <Link href="/demo" className="btn btn-ghost btn-full" style={{ fontSize: 13 }}>
          Ver demo del dashboard →
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="reg-page">
      <div className="reg-wrap">
        <div className="reg-logo">
          <Link href="/" className="tb-logo" style={{ fontSize: 18, textDecoration: 'none' }}>
            <img className="tb-logo-img" style={{ width: 44, height: 44 }} src="/assets/tokproof-logo.png" alt="Tokproof" />
            Tokproof
          </Link>
        </div>
        <Suspense fallback={<div className="reg-card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
