'use client'

import { useState } from 'react'
import { detectWebView } from '@/lib/webview-detection'

interface BrowserExitGuideProps {
  destinationUrl: string
  pageId: string
  guideText?: string
  onClose?: () => void
}

/* ── Inline SVGs (stroke-only, matches handoff reference exactly) ─────── */
const IC_COPY    = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
const IC_COMPASS = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="currentColor" fillOpacity=".2"/></svg>
const IC_HAND    = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11V6a2 2 0 0 1 4 0v5"/><path d="M13 9a2 2 0 0 1 4 0v3"/><path d="M17 10a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-1l-3-3a2 2 0 0 1 3-3l2 2"/></svg>
const IC_LINK    = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const IC_CHECK   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IC_ARROW   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>

export default function BrowserExitGuide({ destinationUrl, pageId, onClose }: BrowserExitGuideProps) {
  const [copied, setCopied]         = useState(false)
  const [stillInTikTok, setStill]   = useState(false)

  function trackEvent(type: string) {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, eventType: type, userAgent: navigator.userAgent }),
    }).catch(() => {})
  }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(destinationUrl) } catch {}
    setCopied(true)
    trackEvent('exit_copy_link')
    setTimeout(() => setCopied(false), 2500)
  }

  function handleContinue() {
    trackEvent('exit_manual_continue')
    const info = detectWebView()
    if (!info.isTikTokWebView) {
      trackEvent('exit_redirected')
      window.location.href = destinationUrl
    } else {
      trackEvent('exit_still_in_webview')
      setStill(true)
      setTimeout(() => setStill(false), 5000)
    }
  }

  function handleClose() {
    trackEvent('exit_guide_closed')
    if (onClose) onClose()
  }

  return (
    <>
      {/* ── Keyframe animations (injected once) ───────────────────────── */}
      <style>{`
        @keyframes beg-arrow {
          0%,8%  { stroke-dashoffset:600; opacity:0 }
          14%    { opacity:1 }
          62%    { stroke-dashoffset:0; opacity:1 }
          82%    { opacity:1 }
          90%,100%{ opacity:0; stroke-dashoffset:0 }
        }
        @keyframes beg-cursor {
          0%,6%   { opacity:0; transform:translateY(14px) scale(.85) }
          14%,80% { opacity:1; transform:translateY(0) scale(1) }
          88%,100%{ opacity:0; transform:translateY(-6px) scale(.95) }
        }
        @keyframes beg-popup {
          0%,18%  { opacity:0; transform:translateX(-50%) scale(.8) translateY(-8px) }
          26%,80% { opacity:1; transform:translateX(-50%) scale(1) translateY(0) }
          88%,100%{ opacity:0; transform:translateX(-50%) scale(.95) translateY(-4px) }
        }
        @keyframes beg-cap {
          0%,10%  { opacity:0; transform:translateY(8px) }
          18%,84% { opacity:1; transform:translateY(0) }
          92%,100%{ opacity:0; transform:translateY(-4px) }
        }
        @keyframes beg-hand {
          0%   { opacity:0; transform:translate(28px,36px) scale(.3) }
          18%  { opacity:1; transform:translate(20px,26px) scale(.55) }
          52%  { opacity:1; transform:translate(0,0) scale(1) }
          62%  { opacity:1; transform:translate(-2px,-2px) scale(1.12) }
          72%  { opacity:1; transform:translate(2px,4px) scale(.88) }
          82%  { opacity:1; transform:translate(0,0) scale(1) }
          100% { opacity:0; transform:translate(0,0) scale(1) }
        }
        @keyframes beg-ring {
          0%,68%{ opacity:0; transform:scale(.3) }
          72%   { opacity:.9; transform:scale(.5) }
          84%,100%{ opacity:0; transform:scale(2.4) }
        }
        @keyframes beg-twinkle {
          0%,100%{ opacity:0; transform:scale(.5) }
          50%    { opacity:.8; transform:scale(1) }
        }
        @media (prefers-reduced-motion: reduce) {
          .beg-aline, .beg-hand, .beg-sp { animation: none !important; }
          .beg-cursor  { animation: none !important; opacity:1; transform: translateY(0) scale(1); }
          .beg-popup   { animation: none !important; opacity:1; transform: translateX(-50%) scale(1) translateY(0); }
          .beg-caption { animation: none !important; opacity:1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Overlay container ─────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2147483646,
        fontFamily: "-apple-system,'Inter',system-ui,sans-serif",
        WebkitFontSmoothing: 'antialiased',
        pointerEvents: 'none',
      }}>

        {/* Dim */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(8,4,18,.85)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }} />

        {/* Sparkles */}
        {[
          { l: '18%', t: '30%', d: '.4s' },
          { l: '78%', t: '18%', d: '1.2s' },
          { l: '82%', t: '60%', d: '2.1s' },
          { l: '14%', t: '72%', d: '.8s' },
        ].map((s, i) => (
          <span key={i} className="beg-sp" style={{
            position: 'absolute', left: s.l, top: s.t,
            width: 3, height: 3, borderRadius: '50%', background: '#fff',
            opacity: 0, animationDelay: s.d,
            animation: 'beg-twinkle 4s ease-in-out infinite',
          }} />
        ))}

        {/* Arrow SVG */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 360 740"
          preserveAspectRatio="none"
        >
          <path
            className="beg-aline"
            d="M 195 500 C 290 450, 330 240, 325 14 l -16 22 l 16 -22 l 14 22"
            stroke="white"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={600}
            strokeDashoffset={600}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(255,79,216,.55))',
              animation: 'beg-arrow 6.5s cubic-bezier(.6,.05,.2,1) infinite',
            }}
          />
        </svg>

        {/* Cursor circle — ⋯ */}
        <div className="beg-cursor" style={{
          position: 'absolute',
          width: 70, height: 70, borderRadius: '50%',
          background: '#fff', display: 'grid', placeItems: 'center', color: '#0E0B17',
          boxShadow: '0 12px 40px rgba(255,79,216,.45), 0 0 0 8px rgba(255,255,255,.08)',
          left: 'calc(50% - 35px)', top: '54%',
          opacity: 0,
          animation: 'beg-cursor 6.5s cubic-bezier(.55,.05,.25,1) infinite',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.9"/>
            <circle cx="12" cy="12" r="1.9"/>
            <circle cx="19" cy="12" r="1.9"/>
          </svg>
        </div>

        {/* Popup menu */}
        <div className="beg-popup" style={{
          position: 'absolute',
          top: 'calc(54% + 78px)',
          left: '50%',
          transform: 'translateX(-50%) scale(.8) translateY(-8px)',
          transformOrigin: 'top center',
          width: 178,
          background: 'rgba(28,22,42,.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 14,
          boxShadow: '0 20px 50px rgba(0,0,0,.5)',
          overflow: 'hidden',
          opacity: 0,
          animation: 'beg-popup 6.5s cubic-bezier(.5,.1,.2,1) infinite',
        }}>
          {/* Popup caret */}
          <div style={{
            position: 'absolute', top: -6, left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 10, height: 10,
            background: 'rgba(28,22,42,.96)',
            borderLeft: '1px solid rgba(255,255,255,.08)',
            borderTop: '1px solid rgba(255,255,255,.08)',
          }} />
          {/* Item 1: Copiar enlace */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 12px',
            fontSize: 12, color: 'rgba(255,255,255,.78)', fontWeight: 500,
            borderBottom: '1px solid rgba(255,255,255,.05)',
          }}>
            <span style={{ color: 'rgba(255,255,255,.5)', display: 'flex' }}>{IC_COPY}</span>
            Copiar enlace
          </div>
          {/* Item 2: Abrir en el navegador (highlight) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 12px',
            fontSize: 12, color: '#fff', fontWeight: 500,
            background: 'linear-gradient(90deg,rgba(255,79,216,.22),rgba(123,97,255,.22))',
            position: 'relative',
          }}>
            {/* Stripe */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
              background: 'linear-gradient(180deg,#FF4FD8,#7B61FF)',
            }} />
            <span style={{ color: '#fff', display: 'flex' }}>{IC_COMPASS}</span>
            Abrir en el navegador
            {/* Tap hand */}
            <span style={{
              position: 'absolute', top: 14, left: 28,
              color: '#fff',
              filter: 'drop-shadow(0 4px 12px rgba(255,79,216,.7))',
              opacity: 0,
              transformOrigin: '30% 0%',
              animation: 'beg-hand 2.4s cubic-bezier(.5,.1,.2,1) infinite',
              pointerEvents: 'none',
            }}>
              {IC_HAND}
            </span>
          </div>
        </div>

        {/* Caption */}
        <div className="beg-caption" style={{
          position: 'absolute',
          top: 'calc(54% + 78px + 90px + 12px)',
          left: 24, right: 24,
          textAlign: 'center',
          opacity: 0,
          animation: 'beg-cap 6.5s ease-out infinite',
        }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            Para abrir esta página
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.78)', marginTop: 12, lineHeight: 1.55 }}>
            toca los{' '}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '3px 9px', borderRadius: 999,
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
              color: '#fff', fontWeight: 700, margin: '0 2px', verticalAlign: '1px',
            }}>
              <i style={{ width:3, height:3, borderRadius:'50%', background:'#fff', display:'inline-block' }} />
              <i style={{ width:3, height:3, borderRadius:'50%', background:'#fff', display:'inline-block' }} />
              <i style={{ width:3, height:3, borderRadius:'50%', background:'#fff', display:'inline-block' }} />
            </span>
            {' '}y elige
            <br />
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 10px', borderRadius: 999, marginTop: 4,
              background: 'linear-gradient(135deg,rgba(255,79,216,.22),rgba(123,97,255,.22))',
              border: '1px solid rgba(255,79,216,.35)',
              color: '#fff', fontWeight: 600,
            }}>
              Abrir en el navegador
            </span>
          </div>
        </div>

        {/* ── Action buttons (pointer-events: auto) ───────────────────── */}
        <div style={{
          position: 'absolute', bottom: 28, left: 24, right: 24,
          display: 'flex', flexDirection: 'column', gap: 10,
          pointerEvents: 'auto',
        }}>
          {/* Copy link */}
          <button
            onClick={handleCopy}
            style={{
              width: '100%', padding: '13px 18px', borderRadius: 999,
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
              border: copied ? '1px solid rgba(255,79,216,.45)' : '1px solid rgba(255,255,255,.18)',
              background: copied ? 'rgba(255,79,216,.2)' : 'rgba(255,255,255,.1)',
              color: copied ? '#FF4FD8' : '#fff',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .18s ease, border-color .18s ease, color .18s ease',
            }}
          >
            {copied ? IC_CHECK : IC_LINK}
            {copied ? 'Enlace copiado ✓' : 'Copiar enlace'}
          </button>

          {/* Already in browser */}
          <button
            onClick={handleContinue}
            style={{
              width: '100%', padding: '13px 18px', borderRadius: 999,
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit', border: 'none',
              background: 'linear-gradient(135deg,#FF4FD8 0%,#7B61FF 100%)',
              color: '#fff', cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255,79,216,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Ya estoy en el navegador {IC_ARROW}
          </button>

          {/* Still-in-TikTok warning */}
          {stillInTikTok && (
            <div style={{
              marginTop: 4, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(255,79,216,.12)', border: '1px solid rgba(255,79,216,.3)',
              fontSize: 12, color: 'rgba(255,255,255,.88)', textAlign: 'center', lineHeight: 1.5,
            }}>
              Todavía estás dentro de TikTok. Toca los tres puntos arriba a la derecha y elige Abrir en navegador.
            </div>
          )}
        </div>

        {/* ── Close button ─────────────────────────────────────────────── */}
        {onClose && (
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.16)',
              color: 'rgba(255,255,255,.85)', cursor: 'pointer', pointerEvents: 'auto',
              display: 'grid', placeItems: 'center',
              fontSize: 18, lineHeight: 1, fontFamily: 'system-ui',
            }}
          >
            ×
          </button>
        )}

      </div>
    </>
  )
}
