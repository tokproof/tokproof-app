'use client'

import { useState } from 'react'

interface BrowserExitGuideProps {
  destinationUrl: string
  pageId: string
  guideText?: string
  language?: 'es' | 'en'
  onClose?: () => void
}

const TEXTS = {
  es: {
    copyLink:       'Copiar enlace',
    openInBrowser:  'Abrir en el navegador',
    title:          'Para abrir esta página',
    tapAndChoose:   'y elige',
    tapThe:         'toca los',
    or:             'o',
    linkCopied:     'Enlace copiado ✓',
  },
  en: {
    copyLink:       'Copy link',
    openInBrowser:  'Open in browser',
    title:          'To open this page',
    tapAndChoose:   'and choose',
    tapThe:         'tap the',
    or:             'or',
    linkCopied:     'Link copied ✓',
  },
} as const

/* ── Inline SVGs ──────────────────────────────────────────────────────── */
const IC_COPY    = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
const IC_COMPASS = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="currentColor" fillOpacity=".2"/></svg>
const IC_HAND    = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11V6a2 2 0 0 1 4 0v5"/><path d="M13 9a2 2 0 0 1 4 0v3"/><path d="M17 10a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-1l-3-3a2 2 0 0 1 3-3l2 2"/></svg>
const IC_CHECK   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>

export default function BrowserExitGuide({ destinationUrl, pageId, language = 'es', onClose }: BrowserExitGuideProps) {
  const t = TEXTS[language]
  const [copied,    setCopied]    = useState(false)
  const [copyHover, setCopyHover] = useState(false)

  function trackEvent(type: string) {
    const sessionId = localStorage.getItem('tp_sid') ?? undefined
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId, eventType: type, sessionId }),
    }).catch(() => {})
  }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(destinationUrl) } catch {}
    setCopied(true)
    trackEvent('exit_copy_link')
    setTimeout(() => setCopied(false), 2500)
  }

  function handleClose() {
    trackEvent('exit_guide_closed')
    if (onClose) onClose()
  }

  /* Copy button background / border / color — derived state */
  const copyBg     = copied ? 'rgba(255,79,216,.2)'       : copyHover ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.05)'
  const copyBorder = copied ? 'rgba(255,79,216,.45)'      : 'rgba(255,255,255,.12)'
  const copyColor  = copied ? '#FF4FD8'                   : copyHover ? '#fff' : 'rgba(255,255,255,.72)'

  return (
    <>
      {/* ── Keyframes ──────────────────────────────────────────────────── */}
      <style>{`
        /* Arrow — loop 5s, visible at ~0.2s, fully drawn at ~1.3s */
        @keyframes beg-arrow {
          0%       { stroke-dashoffset:600; opacity:0; }
          4%       { opacity:1; }
          26%      { stroke-dashoffset:0; opacity:1; }
          86%      { stroke-dashoffset:0; opacity:1; }
          94%,100% { stroke-dashoffset:0; opacity:0; }
        }
        /* Cursor */
        @keyframes beg-cursor {
          0%,2%    { opacity:0; transform:translateY(10px) scale(.85); }
          8%,86%   { opacity:1; transform:translateY(0) scale(1); }
          94%,100% { opacity:0; transform:translateY(-6px) scale(.95); }
        }
        /* Popup — no translateX needed (centered by flex parent) */
        @keyframes beg-popup {
          0%,10%   { opacity:0; transform:scale(.85) translateY(-6px); }
          18%,86%  { opacity:1; transform:scale(1) translateY(0); }
          94%,100% { opacity:0; transform:scale(.95) translateY(-4px); }
        }
        /* Hand tap */
        @keyframes beg-hand {
          0%   { opacity:0; transform:translate(28px,34px) scale(.3); }
          18%  { opacity:1; transform:translate(20px,24px) scale(.55); }
          52%  { opacity:1; transform:translate(0,0) scale(1); }
          62%  { opacity:1; transform:translate(-2px,-2px) scale(1.12); }
          72%  { opacity:1; transform:translate(2px,4px) scale(.88); }
          82%  { opacity:1; transform:translate(0,0) scale(1); }
          100% { opacity:0; transform:translate(0,0) scale(1); }
        }
        /* Ripple ring on tap */
        @keyframes beg-ring {
          0%,68%   { opacity:0; transform:scale(.3); }
          72%      { opacity:.9; transform:scale(.5); }
          84%,100% { opacity:0; transform:scale(2.4); }
        }
        /* Sparkle */
        @keyframes beg-twinkle {
          0%,100% { opacity:0; transform:scale(.5); }
          50%     { opacity:.8; transform:scale(1); }
        }
        .beg-aline {
          stroke-dasharray:600; stroke-dashoffset:600;
          animation: beg-arrow 5s cubic-bezier(.5,0,.2,1) infinite;
          filter: drop-shadow(0 0 6px rgba(255,79,216,.55));
        }
        .beg-cursor {
          opacity:0;
          animation: beg-cursor 5s cubic-bezier(.55,.05,.25,1) infinite;
        }
        .beg-popup {
          opacity:0; transform-origin:top center;
          animation: beg-popup 5s cubic-bezier(.5,.1,.2,1) infinite;
        }
        .beg-hand {
          opacity:0; transform-origin:30% 0%;
          animation: beg-hand 2.2s cubic-bezier(.5,.1,.2,1) infinite;
        }
        .beg-hand::after {
          content:""; position:absolute; left:8px; top:10px;
          width:14px; height:14px; border-radius:50%; border:2px solid #fff;
          opacity:0;
          animation: beg-ring 2.2s cubic-bezier(.3,.7,.4,1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .beg-aline  { animation:none!important; stroke-dashoffset:0; opacity:1; }
          .beg-cursor { animation:none!important; opacity:1; transform:none; }
          .beg-popup  { animation:none!important; opacity:1; transform:none; }
          .beg-hand   { animation:none!important; opacity:1; transform:translate(0,0) scale(1); }
          .beg-hand::after { animation:none!important; opacity:0; }
        }
      `}</style>

      {/* ── Overlay ────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2147483646,
        fontFamily: "-apple-system,'Inter',system-ui,sans-serif",
        WebkitFontSmoothing: 'antialiased',
        pointerEvents: 'none',
      }}>

        {/* Dim */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(8,4,18,.40)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }} />

        {/* Sparkles */}
        {[
          { l: '18%', t: '24%', d: '.4s' },
          { l: '80%', t: '18%', d: '1.2s' },
          { l: '84%', t: '54%', d: '2.1s' },
          { l: '14%', t: '64%', d: '.8s' },
        ].map((s, i) => (
          <span key={i} style={{
            position: 'absolute', left: s.l, top: s.t,
            width: 3, height: 3, borderRadius: '50%', background: '#fff',
            opacity: 0, animationDelay: s.d,
            animation: 'beg-twinkle 4s ease-in-out infinite',
          }} />
        ))}

        {/* Arrow SVG — z-index 5, sits below the stack */}
        <svg
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 5,
          }}
          viewBox="0 0 360 740"
          preserveAspectRatio="none"
        >
          <path
            className="beg-aline"
            d="M 220 300 C 300 250, 332 150, 325 14 l -15 21 l 15 -21 l 14 21"
            stroke="white" strokeWidth="2.4" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>

        {/* ── Centered flex stack — z-index 6 ──────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 6,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 28px',
        }}>

          {/* 1. Cursor ⋯ */}
          <div className="beg-cursor" style={{
            width: 68, height: 68, borderRadius: '50%',
            background: '#fff', display: 'grid', placeItems: 'center', color: '#0E0B17',
            boxShadow: '0 12px 40px rgba(255,79,216,.45), 0 0 0 8px rgba(255,255,255,.08)',
            flexShrink: 0,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.9"/>
              <circle cx="12" cy="12" r="1.9"/>
              <circle cx="19" cy="12" r="1.9"/>
            </svg>
          </div>

          {/* 2. Popup menu — 14px gap */}
          <div className="beg-popup" style={{
            marginTop: 14, flexShrink: 0,
            width: 188,
            background: 'rgba(28,22,42,.96)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 14, boxShadow: '0 20px 50px rgba(0,0,0,.5)',
            overflow: 'hidden', position: 'relative',
          }}>
            {/* Caret */}
            <div style={{
              position: 'absolute', top: -6, left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 10, height: 10, background: 'rgba(28,22,42,.96)',
              borderLeft: '1px solid rgba(255,255,255,.08)',
              borderTop: '1px solid rgba(255,255,255,.08)',
            }} />
            {/* Item 1: Copy link */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 13px', fontSize: 12.5,
              color: 'rgba(255,255,255,.78)', fontWeight: 500,
              borderBottom: '1px solid rgba(255,255,255,.05)',
            }}>
              <span style={{ color: 'rgba(255,255,255,.5)', display: 'flex' }}>{IC_COPY}</span>
              {t.copyLink}
            </div>
            {/* Item 2: Open in browser (highlight) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 13px', fontSize: 12.5,
              color: '#fff', fontWeight: 500,
              background: 'linear-gradient(90deg,rgba(255,79,216,.22),rgba(123,97,255,.22))',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                background: 'linear-gradient(180deg,#FF4FD8,#7B61FF)',
              }} />
              <span style={{ color: '#fff', display: 'flex' }}>{IC_COMPASS}</span>
              {t.openInBrowser}
              {/* Tap hand */}
              <span className="beg-hand" style={{
                position: 'absolute', top: 14, left: 30, color: '#fff',
                filter: 'drop-shadow(0 4px 12px rgba(255,79,216,.7))',
                pointerEvents: 'none',
              }}>
                {IC_HAND}
              </span>
            </div>
          </div>

          {/* 3. Caption — always visible, 34px gap */}
          <div style={{ marginTop: 34, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              {t.title}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.78)', marginTop: 12, lineHeight: 1.6 }}>
              {t.tapThe}{' '}
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
              {' '}{t.tapAndChoose}
              <br />
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '3px 10px', borderRadius: 999, marginTop: 6,
                background: 'linear-gradient(135deg,rgba(255,79,216,.22),rgba(123,97,255,.22))',
                border: '1px solid rgba(255,79,216,.35)',
                color: '#fff', fontWeight: 600,
              }}>
                {t.openInBrowser}
              </span>
            </div>
          </div>

          {/* 4. Divider — 30px gap */}
          <div style={{
            marginTop: 30,
            display: 'flex', alignItems: 'center', gap: 12,
            width: 150,
            color: 'rgba(255,255,255,.42)', fontSize: 12, fontWeight: 500,
          }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.14)' }} />
            {t.or}
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.14)' }} />
          </div>

          {/* 5. Copy button — secondary pill, 22px gap, pointer-events auto */}
          <button
            onClick={handleCopy}
            onMouseEnter={() => setCopyHover(true)}
            onMouseLeave={() => setCopyHover(false)}
            style={{
              marginTop: 22,
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 16px',
              background: copyBg,
              border: `1px solid ${copyBorder}`,
              borderRadius: 999,
              color: copyColor,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
              transition: 'background .15s ease, border-color .15s ease, color .15s ease',
              pointerEvents: 'auto',
            }}
          >
            {copied ? IC_CHECK : IC_COPY}
            {copied ? t.linkCopied : t.copyLink}
          </button>

        </div>{/* /stack */}

        {/* Branding — bottom of overlay, always visible */}
        <div style={{
          position: 'absolute', bottom: 16, left: 0, right: 0, zIndex: 7,
          textAlign: 'center', pointerEvents: 'auto',
        }}>
          <a href="https://tokproof.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textDecoration: 'none', fontWeight: 500, letterSpacing: '.01em' }}>
            Powered by <span style={{ fontWeight: 700, color: 'rgba(255,255,255,.6)' }}>Tokproof</span>
          </a>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 20, right: 20, zIndex: 7,
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
