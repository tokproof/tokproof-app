/**
 * Safe Exit System — utilities for detecting TikTok WebView and
 * helping users navigate to external URLs with minimal friction.
 *
 * Design rules:
 * - No automatic redirects
 * - No cloaking / iframes / aggressive popups
 * - All navigation is user-initiated
 * - All analytics are fire-and-forget
 */

// ─── Detection ───────────────────────────────────────────────────────────────

/** Returns true if the page is running inside TikTok's in-app browser. */
export function isTikTokWebView(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  const referrer = document.referrer

  // Known TikTok / ByteDance WebView UA markers (case-insensitive)
  const uaMatch = /TikTok|musical_ly|BytedanceWebview|ByteLocale|com\.zhiliaoapp/i.test(ua)
  // TikTok sets document.referrer to tiktok.com when navigating from the app
  const refMatch = /tiktok\.com/i.test(referrer)

  return uaMatch || refMatch
}

export type Platform = 'ios' | 'android' | 'other'

/** Detects the underlying OS platform. */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type OpenResult = 'attempted' | 'blocked'

/**
 * Tries to open `url` in an external browser.
 * Returns 'blocked' only when we can immediately detect failure (e.g. iOS
 * window.open returns null). Otherwise returns 'attempted' — the caller
 * should use a visibilitychange listener to verify success.
 *
 * Never fires automatically; must be called from a user-initiated event handler.
 */
export function tryOpenExternal(url: string, platform: Platform): OpenResult {
  if (platform === 'android') {
    // Experimental: intent URL tells Android to open in Chrome.
    // If TikTok's WebView intercepts it, falls through to browser_fallback_url.
    const fallback = encodeURIComponent(url)
    const intentUrl =
      `intent:${url}#Intent;scheme=https;` +
      `package=com.android.chrome;` +
      `S.browser_fallback_url=${fallback};end`
    try {
      // location.href for intent:// — does not trigger "automatic redirect"
      // in the TikTok policy sense because this only runs on user click.
      location.href = intentUrl
      return 'attempted'
    } catch {
      // Intent blocked — try window.open as first fallback
      const w = window.open(url, '_blank')
      if (w) return 'attempted'
      // Last resort: navigate current page (user already clicked)
      location.href = url
      return 'attempted'
    }
  }

  // iOS / other: try window.open — TikTok may block it
  try {
    const w = window.open(url, '_blank')
    if (w) return 'attempted'
  } catch {
    // swallow
  }

  // window.open blocked → return blocked so caller can show instructions
  return 'blocked'
}

// ─── Clipboard ───────────────────────────────────────────────────────────────

/** Copies text to clipboard. Returns true on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback for older WebViews
    const el = document.createElement('input')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

// ─── Analytics (fire-and-forget) ─────────────────────────────────────────────

export type SafeExitEvent =
  | 'webview_detected'
  | 'external_open_attempt'
  | 'external_open_failed'
  | 'copy_link'
  | 'instructions_viewed'
  | 'shopify_click'

/**
 * Sends a safe-exit analytics event. Never throws, never blocks the UI.
 * `pageId` may be 'demo' — the API will return 404 and the error is swallowed.
 */
export function trackSafeExitEvent(pageId: string, event: SafeExitEvent): void {
  if (typeof window === 'undefined') return
  const sessionId = localStorage.getItem('tp_sid') ?? undefined
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageId,
      eventType: event,
      sessionId,
      metadata: { referer: document.referrer },
    }),
  }).catch(() => {})
}
