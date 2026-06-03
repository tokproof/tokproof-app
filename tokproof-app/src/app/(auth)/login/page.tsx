'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'
  const { t } = useTranslation()

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
      <h1 className="reg-card-title">{t('login.title')}</h1>
      <p className="reg-card-sub">{t('login.subtitle')}</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#EF4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="fg">
          <label className="fl">{t('login.email')}</label>
          <input className="fi" type="email" placeholder="hola@tumarca.com" value={email}
            onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="fg" style={{ marginBottom: 24 }}>
          <label className="fl">{t('login.password')}</label>
          <input className="fi" type="password" placeholder={t('login.passwordPlaceholder')} value={password}
            onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>

        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
          {loading ? t('login.signingIn') : t('login.signIn')}
        </button>

        <div className="reg-or"><span>{t('login.or')}</span></div>
        <button className="btn btn-secondary btn-full" type="button" onClick={handleGoogle} style={{ gap: 8 }}>
          <span style={{ fontSize: 16 }}>G</span> {t('login.continueWithGoogle')}
        </button>
      </form>

      <p className="reg-login-link">
        {t('login.noAccount')} <Link href="/signup">{t('login.createFree')}</Link>
      </p>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 10 }}>{t('login.viewWithoutAccount')}</p>
        <Link href="/demo" className="btn btn-ghost btn-full" style={{ fontSize: 13 }}>
          {t('login.viewDemo')}
        </Link>
      </div>
    </div>
  )
}

function LoadingCard() {
  const { t } = useTranslation()
  return (
    <div className="reg-card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
      {t('login.loading')}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="reg-page">
      <div className="reg-wrap">
        <div className="reg-logo">
          <Link href="/" className="tb-logo" style={{ fontSize: 18, textDecoration: 'none' }}>
            <img className="tb-logo-img" style={{ width: 44, height: 44 }} src="/assets/tokproof-isotipo.png" alt="Tokproof" />
            Tokproof
          </Link>
        </div>
        <Suspense fallback={<LoadingCard />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
