'use client'

import { useEffect, useState } from 'react'
import { detectWebView } from '@/lib/webview-detection'
import BrowserExitGuide from './BrowserExitGuide'

interface DirectExitClientProps {
  pageId: string
  destinationUrl: string
  delay: number
  guideText?: string
  brandName?: string
}

export default function DirectExitClient({ pageId, destinationUrl, delay, guideText }: DirectExitClientProps) {
  const [phase, setPhase] = useState<'detecting' | 'webview' | 'redirecting'>('detecting')

  useEffect(() => {
    const info = detectWebView()

    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, eventType: 'direct_exit_view', userAgent: navigator.userAgent, referrer: document.referrer }),
    }).catch(() => {})

    if (info.isTikTokWebView) {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, eventType: 'direct_exit_webview_detected', userAgent: navigator.userAgent }),
      }).catch(() => {})
      setPhase('webview')
    } else {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, eventType: 'direct_exit_browser_detected', userAgent: navigator.userAgent }),
      }).catch(() => {})
      setPhase('redirecting')
      const timer = setTimeout(() => {
        fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId, eventType: 'direct_exit_redirected', userAgent: navigator.userAgent }),
        }).catch(() => {})
        window.location.href = destinationUrl
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [pageId, destinationUrl, delay])

  if (phase === 'detecting') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
        <div className="beg-spinner" />
      </div>
    )
  }

  if (phase === 'webview') {
    return (
      <div className="tp-dark-page">
        <BrowserExitGuide
          destinationUrl={destinationUrl}
          pageId={pageId}
          guideText={guideText}
        />
      </div>
    )
  }

  // redirecting
  return (
    <div className="tp-dark-page" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 20, fontFamily: 'inherit' }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🛍</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>Abriendo producto oficial…</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Te estamos llevando a la tienda.</div>
      </div>
      <div className="beg-spinner" />
      <a href={destinationUrl} style={{ fontSize: 12, color: 'var(--spurple)', marginTop: 8 }}>¿No redirige? Toca aquí</a>
    </div>
  )
}
