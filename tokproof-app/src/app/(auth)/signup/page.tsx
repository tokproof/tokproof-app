'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useTranslation()
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
            <h1 className="reg-card-title">{t('signup.confirmTitle')}</h1>
            <p className="reg-card-sub">
              {t('signup.confirmSub', { email })}
            </p>
            <div style={{ textAlign: 'center', fontSize: 40, margin: '24px 0' }}>📬</div>
            <div className="fi-tip">
              <span className="fi-tip-ico">💡</span>
              <span>{t('signup.spamTip')}</span>
            </div>
            <button className="btn btn-ghost btn-full" style={{ marginTop: 16 }} onClick={() => setNeedsConfirmation(false)}>
              {t('signup.changeEmail')}
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
          <h1 className="reg-card-title">{t('signup.title')}</h1>
          <p className="reg-card-sub">{t('signup.subtitle')}</p>
          <form onSubmit={handleSignup}>
            <div className="fg">
              <label className="fl">
                {t('signup.fullName')} <span className="fi-label-rec">{t('signup.recommended')}</span>
              </label>
              <input className="fi" type="text" placeholder={t('signup.namePlaceholder')} value={name}
                onChange={e => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="fg">
              <label className="fl">{t('signup.email')}</label>
              <input className="fi" type="email" placeholder="hola@tumarca.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="fg" style={{ marginBottom: 24 }}>
              <label className="fl">{t('signup.password')}</label>
              <input className="fi" type="password" placeholder={t('signup.passwordPlaceholder')} value={password}
                onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              <span className="fh">{t('signup.passwordHint')}</span>
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? t('signup.creating') : t('signup.createAccount')}
            </button>
            <div className="reg-or"><span>{t('signup.or')}</span></div>
            <button className="btn btn-secondary btn-full" type="button" onClick={handleGoogle} style={{ gap: 8 }}>
              <span style={{ fontSize: 16 }}>G</span> {t('signup.continueWithGoogle')}
            </button>
          </form>
          <p className="reg-login-link">
            {t('signup.haveAccount')} <Link href="/login">{t('signup.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
