'use client'

import { useState, useEffect, useRef } from 'react'
import {
  isTikTokWebView,
  detectPlatform,
  tryOpenExternal,
  copyToClipboard,
  trackSafeExitEvent,
  type Platform,
} from '@/lib/safe-exit'

interface SafeExitBannerProps {
  /** Destination URL (Shopify product page). */
  shopifyUrl: string
  /** Page ID for analytics. */
  pageId: string
  /** Brand gradient colors for the CTA. */
  brandColor?: string
  accentColor?: string
  /** CTA label. */
  ctaText?: string
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  platform: Platform
  shopifyUrl: string
  pageId: string
  onClose: () => void
}

function SafeExitModal({ platform, shopifyUrl, pageId, onClose }: ModalProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyToClipboard(shopifyUrl)
    if (ok) {
      trackSafeExitEvent(pageId, 'copy_link')
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const isIOS = platform === 'ios'

  return (
    <div className="se-overlay" onClick={onClose}>
      <div className="se-modal" onClick={e => e.stopPropagation()}>
        <button className="se-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="se-modal-ico">🌐</div>
        <h3 className="se-modal-title">Abre en tu navegador</h3>
        <p className="se-modal-sub">
          Tokproof te ayuda a abrir la tienda de la forma más compatible posible.
        </p>

        <div className="se-instructions">
          {isIOS ? (
            <>
              <div className="se-step">
                <span className="se-step-num">1</span>
                <span>Pulsa los <strong>3 puntos</strong> arriba a la derecha</span>
              </div>
              <div className="se-step">
                <span className="se-step-num">2</span>
                <span>Selecciona <strong>Abrir en navegador</strong></span>
              </div>
              <div className="se-step">
                <span className="se-step-num">3</span>
                <span>O pega el enlace directamente en Safari</span>
              </div>
            </>
          ) : (
            <>
              <div className="se-step">
                <span className="se-step-num">1</span>
                <span>Pulsa los <strong>3 puntos</strong> o el icono <strong>···</strong> arriba</span>
              </div>
              <div className="se-step">
                <span className="se-step-num">2</span>
                <span>Selecciona <strong>Abrir en Chrome</strong> o el navegador que prefieras</span>
              </div>
              <div className="se-step">
                <span className="se-step-num">3</span>
                <span>O copia el enlace y pégalo en la barra de dirección</span>
              </div>
            </>
          )}
        </div>

        <button className="se-copy-btn" onClick={handleCopy}>
          {copied ? '✓ Enlace copiado' : '📋 Copiar enlace del producto'}
        </button>
        {copied && (
          <p className="se-copy-hint">Pégalo en Safari o Chrome para continuar.</p>
        )}
      </div>
    </div>
  )
}

// ─── Banner ───────────────────────────────────────────────────────────────────

export default function SafeExitBanner({
  shopifyUrl,
  pageId,
  brandColor = '#FF2D75',
  accentColor = '#7C3AED',
  ctaText = 'Ver producto oficial',
}: SafeExitBannerProps) {
  const [isWebView, setIsWebView] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')
  const [showModal, setShowModal] = useState(false)
  const [openState, setOpenState] = useState<'idle' | 'trying' | 'done' | 'failed'>('idle')
  const [copied, setCopied] = useState(false)
  const visibilityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect WebView on mount (client only)
  useEffect(() => {
    const webView = isTikTokWebView()
    const plt = detectPlatform()
    setPlatform(plt)
    if (webView) {
      setIsWebView(true)
      trackSafeExitEvent(pageId, 'webview_detected')
    }
  }, [pageId])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (visibilityTimer.current) clearTimeout(visibilityTimer.current)
    }
  }, [])

  function handleOpenInBrowser() {
    trackSafeExitEvent(pageId, 'external_open_attempt')
    setOpenState('trying')

    const result = tryOpenExternal(shopifyUrl, platform)

    if (result === 'blocked') {
      // Immediate failure (e.g. iOS window.open returned null)
      trackSafeExitEvent(pageId, 'external_open_failed')
      setOpenState('failed')
      setShowModal(true)
      return
    }

    // 'attempted' — watch for page visibility change as success signal
    const onHide = () => {
      // Page became hidden: user left to external browser
      if (visibilityTimer.current) clearTimeout(visibilityTimer.current)
      setOpenState('done')
    }

    document.addEventListener('visibilitychange', function handler() {
      if (document.hidden) {
        document.removeEventListener('visibilitychange', handler)
        onHide()
      }
    })

    // If page is still visible after 2s → probably failed or stayed in WebView
    visibilityTimer.current = setTimeout(() => {
      if (!document.hidden) {
        trackSafeExitEvent(pageId, 'external_open_failed')
        setOpenState('failed')
        // On Android: the intent may have navigated the WebView to Shopify —
        // only show the modal if we're clearly still on this page.
        if (platform !== 'android') {
          setShowModal(true)
        }
      }
    }, 2000)
  }

  async function handleCopyLink() {
    const ok = await copyToClipboard(shopifyUrl)
    if (ok) {
      trackSafeExitEvent(pageId, 'copy_link')
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  function handleInstructions() {
    trackSafeExitEvent(pageId, 'instructions_viewed')
    setShowModal(true)
  }

  function handleDirectCTA() {
    trackSafeExitEvent(pageId, 'shopify_click')
  }

  // Not in TikTok WebView → render normal CTA only
  if (!isWebView) {
    return (
      <a
        href={shopifyUrl}
        className="pt-cta"
        style={{ background: `linear-gradient(135deg, ${brandColor}, ${accentColor})` }}
        onClick={handleDirectCTA}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ctaText}
      </a>
    )
  }

  // In TikTok WebView → show banner + CTA
  return (
    <>
      {showModal && (
        <SafeExitModal
          platform={platform}
          shopifyUrl={shopifyUrl}
          pageId={pageId}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Safe Exit Banner */}
      <div className="se-banner">
        <div className="se-banner-head">
          <span className="se-banner-ico">🌐</span>
          <div>
            <p className="se-banner-title">
              Para completar la compra sin bloqueos, abre esta página en tu navegador.
            </p>
            <p className="se-banner-sub">
              Tokproof te ayuda a abrir la tienda de la forma más compatible posible.
            </p>
          </div>
        </div>

        {/* iOS: show instructions inline, no "try open" button */}
        {platform === 'ios' ? (
          <div className="se-ios-hint">
            <span className="se-ios-ico">👆</span>
            Pulsa los 3 puntos arriba a la derecha → <strong>Abrir en navegador</strong>
          </div>
        ) : (
          <button
            className="se-open-btn"
            onClick={handleOpenInBrowser}
            disabled={openState === 'trying' || openState === 'done'}
          >
            {openState === 'trying' && '⏳ Intentando abrir...'}
            {openState === 'done' && '✓ Abriendo en navegador'}
            {(openState === 'idle' || openState === 'failed') && '🌐 Intentar abrir en navegador'}
          </button>
        )}

        {openState === 'failed' && platform !== 'android' && (
          <p className="se-fail-hint">
            No se pudo abrir automáticamente. Usa &ldquo;Copiar enlace&rdquo; y pégalo en tu navegador.
          </p>
        )}

        <div className="se-banner-btns">
          <button className="se-btn-copy" onClick={handleCopyLink}>
            {copied ? '✓ Copiado' : '📋 Copiar enlace'}
          </button>
          <button className="se-btn-instructions" onClick={handleInstructions}>
            Ver instrucciones
          </button>
        </div>

        {copied && (
          <p className="se-copy-hint-inline">Enlace copiado. Pégalo en Safari o Chrome.</p>
        )}
      </div>

      {/* Main CTA — always visible */}
      <a
        href={shopifyUrl}
        className="pt-cta"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, ${accentColor})`,
          opacity: 0.85,
        }}
        onClick={handleDirectCTA}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ctaText}
      </a>
    </>
  )
}
