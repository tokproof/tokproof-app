'use client'

import { useEffect, useRef, useState } from 'react'
import { detectWebView } from '@/lib/webview-detection'
import { getSessionId } from '@/lib/session'
import BrowserExitGuide from './BrowserExitGuide'

interface DirectExitClientProps {
  pageId: string
  destinationUrl: string
  delay: number       // kept in signature for API compat; ignored when in external browser
  guideText?: string
  brandName?: string
}

// Fire-and-forget analytics — never blocks navigation.
// Uses sendBeacon when available (survives page unload), falls back to fetch.
function track(eventType: string, pageId: string) {
  const sessionId = getSessionId()
  const body = JSON.stringify({ pageId, eventType, sessionId })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
  } else {
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => {})
  }
}

export default function DirectExitClient({ pageId, destinationUrl, guideText }: DirectExitClientProps) {
  const [phase, setPhase] = useState<'detecting' | 'webview'>('detecting')
  const tracked = useRef(false)

  useEffect(() => {
    // Guard against React Strict Mode double-invoke in development.
    if (tracked.current) return
    tracked.current = true

    const info = detectWebView()

    track('direct_exit_view', pageId)

    if (info.isTikTokWebView) {
      track('direct_exit_webview_detected', pageId)
      setPhase('webview')
    } else {
      track('direct_exit_browser_detected', pageId)
      track('direct_exit_redirected', pageId)
      window.location.href = destinationUrl
    }
  }, [pageId, destinationUrl])

  if (phase === 'detecting') {
    // Shown only for the split-second before JS runs (SSR flash) or while in TikTok.
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="beg-spinner" />
      </div>
    )
  }

  // webview — show the full animated Exit Guide
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
