'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { FullAnalytics, PageMeta } from '@/lib/analytics'
import { useTranslation } from '@/lib/i18n'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#F4F5F8',
  card:    '#FFFFFF',
  line:    '#ECEDF1',
  lineSoft:'#F1F2F5',
  ink:     '#15161C',
  ink2:    '#3A3C46',
  muted:   '#8B90A0',
  muted2:  '#A9AEBC',
  purple:  '#8B5CF6',
  violet:  '#7C3AED',
  blue:    '#3B82F6',
  green:   '#16B368',
  red:     '#F43F6B',
  grad:    'linear-gradient(90deg,#FB2C7D 0%,#C13BD6 55%,#7C3AED 100%)',
}

const TINT: Record<string, { bg: string; color: string }> = {
  purple: { bg: '#EFE9FD', color: '#8B5CF6' },
  pink:   { bg: '#FCE6F0', color: '#EC2C7C' },
  blue:   { bg: '#E6EEFD', color: '#3B82F6' },
  green:  { bg: '#E1F5EA', color: '#16B368' },
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────
const TIPS: Record<string, string> = {
  'Landing Views':       'Número total de visitas a tus páginas públicas.',
  'Visitantes únicos':   'Sesiones únicas detectadas en tus páginas.',
  'Clicks':              'Clicks registrados en botones, enlaces o redirecciones.',
  'CTR':                 'Porcentaje de visitantes que hicieron click.',
  'Rescue Rate':         'Porcentaje de usuarios que lograron salir del navegador interno y llegar al navegador externo.',
  'Exit Guide Views':    'Veces que se mostró la guía para abrir en navegador externo.',
  'Open Browser Clicks': 'Usuarios que pulsaron para abrir el navegador externo.',
  'Embudo TikTok Rescue':'Visualiza el flujo completo de tus usuarios: desde el click en TikTok hasta llegar a tu contenido.',
  'Evolución del rendimiento': 'Evolución diaria de visitas, clicks y aperturas de navegador en el periodo seleccionado.',
  'Rendimiento por página': 'Métricas individuales de cada página publicada en tu cuenta.',
  'Top países':          'Distribución geográfica de tus visitantes (basada en User-Agent).',
  'Dispositivos':        'Tipos de dispositivo detectados en tus visitas.',
  'Fuentes de tráfico':  'Origen del tráfico según el referrer HTTP.',
}

// ─── Number formatter ─────────────────────────────────────────────────────────
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function dropPct(from: number, to: number): string {
  if (!from) return '—'
  const d = Math.round(((from - to) / from) * 100)
  return d > 0 ? `-${d}%` : '+0%'
}

// ─── Sparkline generator ──────────────────────────────────────────────────────
function sparkPoints(seed: number, w: number, h: number): string {
  const n = 14; let v = 0.5, r = seed
  const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280 }
  const pts: number[] = []
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.45) * 0.34
    v = Math.max(0.12, Math.min(0.9, v))
    pts.push(v)
  }
  return pts.map((p, i) => `${((i / (n - 1)) * w).toFixed(1)},${(h - p * h * 0.8 - h * 0.1).toFixed(1)}`).join(' ')
}

// ─── Shared icons ─────────────────────────────────────────────────────────────
function InfoIcon({ tip }: { tip?: string }) {
  const [show, setShow] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted2}
        strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'help' }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12" y2="8"/>
      </svg>
      {show && tip && (
        <span style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          background: C.ink, color: '#fff', fontSize: 12, fontWeight: 500, lineHeight: 1.5,
          padding: '7px 11px', borderRadius: 9, whiteSpace: 'normal', maxWidth: 240,
          pointerEvents: 'none', zIndex: 99, boxShadow: '0 4px 16px rgba(0,0,0,.18)',
          textAlign: 'left',
        }}>{tip}</span>
      )}
    </span>
  )
}

const ChevDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted2}
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const ArrowUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.green}
    strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="6"/><polyline points="6 12 12 6 18 12"/>
  </svg>
)
const DotsV = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ cursor: 'pointer' }}>
    <circle cx="12" cy="5" r="1.4" fill={C.muted2}/>
    <circle cx="12" cy="12" r="1.4" fill={C.muted2}/>
    <circle cx="12" cy="19" r="1.4" fill={C.muted2}/>
  </svg>
)
const FunnelArrow = () => (
  <svg viewBox="0 0 72 14" width="72" height="14" style={{ color: '#C9CCD6' }}>
    <line x1="0" y1="7" x2="64" y2="7" stroke="currentColor" strokeWidth="2"/>
    <polyline points="58 2 66 7 58 12" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const Card = ({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) => (
  <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, ...style }} onClick={onClick}>
    {children}
  </div>
)

// ─── Coming Soon modal ────────────────────────────────────────────────────────
function ComingSoonModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', maxWidth: 360,
        width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.16)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔜</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: C.ink }}>{t('analytics.comingSoon')}</div>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
          {t('analytics.comingSoonDesc')}
        </p>
        <button onClick={onClose} style={{ marginTop: 20, padding: '11px 28px', background: C.grad,
          color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {t('analytics.understood')}
        </button>
      </div>
    </div>
  )
}

// ─── Inline PRO badge ─────────────────────────────────────────────────────────
const ProBadge = () => (
  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.04em', color: '#fff',
    background: C.grad, padding: '2px 7px', borderRadius: 6, flexShrink: 0, lineHeight: 1.6 }}>
    PRO
  </span>
)

// ─── Section blur overlay (funnel / chart) ────────────────────────────────────
function SectionBlurGate({ onUpgrade, children }: { onUpgrade: () => void; children?: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 18,
      background: 'rgba(255,255,255,.38)', backdropFilter: 'blur(2px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, zIndex: 10, cursor: 'pointer' }}
      onClick={onUpgrade}>
      {children}
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
const KPI_CONFIG = [
  { label: 'Landing Views',       tint: 'purple', sparkColor: '#8B5CF6', sparkSeed: 11,  icoPath: '<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>',     locked: false },
  { label: 'Visitantes únicos',   tint: 'purple', sparkColor: '#8B5CF6', sparkSeed: 48,  icoPath: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.2 3.2 0 0 1 0 6.3"/><path d="M21 20c0-2.5-1.4-4.6-3.5-5.4"/>', locked: false },
  { label: 'Clicks',              tint: 'pink',   sparkColor: '#F43F6B', sparkSeed: 85,  icoPath: '<path d="M5 4l6.5 15 2-6 6-2z"/>',                                                             locked: false },
  { label: 'CTR',                 tint: 'blue',   sparkColor: '#3B82F6', sparkSeed: 122, icoPath: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',  locked: false },
  { label: 'Rescue Rate',         tint: 'green',  sparkColor: '#16B368', sparkSeed: 159, icoPath: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',                                   locked: false },
  { label: 'Guías mostradas',     tint: 'purple', sparkColor: '#8B5CF6', sparkSeed: 196, icoPath: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>', locked: true },
  { label: 'Aperturas navegador', tint: 'pink',   sparkColor: '#F43F6B', sparkSeed: 233, icoPath: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',  locked: true },
]

function kpiValues(data: FullAnalytics) {
  return [
    fmtNum(data.views),
    fmtNum(data.uniqueVisitors),
    fmtNum(data.clicks),
    `${data.ctr}%`,
    // Rescue Rate: show '—' when no TikTok WebView guide views yet
    data.exitGuideViews === 0 ? '—' : `${data.rescueRate}%`,
    fmtNum(data.exitGuideViews),
    fmtNum(data.openBrowserClicks),
  ]
}

function KpiCard({ cfg, val, isPro, onUpgrade, isMobile }: {
  cfg: typeof KPI_CONFIG[0]; val: string; isPro: boolean; onUpgrade: () => void; isMobile?: boolean
}) {
  const { t } = useTranslation()
  const tint   = TINT[cfg.tint]
  const locked = cfg.locked && !isPro
  return (
    <Card style={{ padding: isMobile ? '12px 11px 12px' : '16px 15px 15px', display: 'flex', flexDirection: 'column',
      minHeight: isMobile ? 160 : 212, cursor: locked ? 'pointer' : 'default' }}
      onClick={locked ? onUpgrade : undefined}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: locked ? '#F0F1F4' : tint.bg, color: locked ? C.muted2 : tint.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: cfg.icoPath }} />
        </div>
        {locked
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <InfoIcon tip={t('analytics.availableInTokproofPro')} />
              <ProBadge />
            </span>
          : <InfoIcon tip={TIPS[cfg.label]} />
        }
      </div>

      {/* Label */}
      <div style={{ fontSize: isMobile ? 11 : 12.5, color: C.muted, fontWeight: 500, marginTop: isMobile ? 8 : 13,
        lineHeight: 1.35, minHeight: isMobile ? 26 : 34 }}>{cfg.label}</div>

      {locked ? (
        /* Locked state */
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
            <span style={{ fontSize: isMobile ? 13 : 16 }}>🔒</span>
            <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: C.violet }}>{t('analytics.availableInPro')}</span>
          </div>
          {!isMobile && (
            <a href="/dashboard/billing"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 11.5, color: C.violet, fontWeight: 600, textDecoration: 'none',
                opacity: .75, marginTop: 2 }}>
              {t('analytics.upgradeArrow')}
            </a>
          )}
        </div>
      ) : (
        /* Unlocked state */
        <>
          <div style={{ fontSize: isMobile ? 20 : 25, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>{val}</div>
          {!isMobile && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5,
                fontWeight: 700, color: C.green, marginTop: 9 }}>
                <ArrowUp /><span style={{ color: C.muted2, fontSize: 12 }}>—</span>
              </div>
              <div style={{ fontSize: 11, color: C.muted2, marginTop: 2 }}>{t('analytics.vsPreviousPeriod')}</div>
            </>
          )}
        </>
      )}

      {/* Sparkline */}
      <svg viewBox="0 0 90 38" preserveAspectRatio="none"
        style={{ marginTop: 'auto', width: '100%', height: 38, opacity: locked ? 0.18 : 1 }}>
        <polyline points={sparkPoints(cfg.sparkSeed, 90, 38)}
          fill="none" stroke={locked ? C.muted2 : cfg.sparkColor}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Card>
  )
}

// ─── Funnel ───────────────────────────────────────────────────────────────────
const FUNNEL_STATIC = [
  { label: 'TikTok Clicks',       bg: 'linear-gradient(180deg,#FFEAF3,#FFF5F9)', barGrad: 'linear-gradient(90deg,#FB2C7D,#F35BA6)',
    icoSvg: '<path d="M16.5 5.5c1 1.2 2.3 2 3.9 2.1v3c-1.6 0-3.1-.5-4.4-1.4v6.3a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 1 0 1.7 2.4V2.5h3.1c.1 1.1.5 2.1 1.3 3z" fill="#111"/>' },
  { label: 'Exit Guide Views',    bg: 'linear-gradient(180deg,#F0EBFC,#FAF8FE)', barGrad: 'linear-gradient(90deg,#8B5CF6,#A78BFA)',
    icoSvg: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="#8B5CF6" fill="none" stroke-width="2"/><polyline points="9 12 11.5 14.5 16 9.5" stroke="#8B5CF6" fill="none" stroke-width="2"/>' },
  { label: 'Aperturas navegador', bg: 'linear-gradient(180deg,#E9F1FE,#F7FAFE)', barGrad: 'linear-gradient(90deg,#3B82F6,#6AA4F8)',
    icoSvg: '<path d="M14 4h6v6" stroke="#3B82F6" fill="none" stroke-width="2"/><path d="M20 4l-9 9" stroke="#3B82F6" fill="none" stroke-width="2"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" stroke="#3B82F6" fill="none" stroke-width="2"/>' },
  { label: 'Landing Views',       bg: 'linear-gradient(180deg,#E4F7EC,#F6FCF8)', barGrad: 'linear-gradient(90deg,#16B368,#3FCE86)',
    icoSvg: '<circle cx="12" cy="12" r="9" stroke="#16B368" fill="none" stroke-width="2"/><polyline points="8.5 12 11 14.5 15.5 9.5" stroke="#16B368" fill="none" stroke-width="2"/>' },
]

function FunnelSection({ data, isPro, onUpgrade, isMobile }: { data: FullAnalytics; isPro: boolean; onUpgrade: () => void; isMobile?: boolean }) {
  const { t } = useTranslation()
  const vals = [data.funnelExitViews, data.funnelGuideViews, data.funnelBrowserDetected, data.funnelLandingViews]

  return (
    <Card style={{ marginTop: 22, padding: isMobile ? '16px 14px' : '22px 24px', position: 'relative' }}>
      {!isPro && (
        <SectionBlurGate onUpgrade={onUpgrade}>
          <div style={{ background: 'rgba(255,255,255,.9)', borderRadius: 16,
            padding: '16px 24px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(124,58,237,.15)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.violet, marginBottom: 8 }}>
              🔒 {t('analytics.proFeature')}
            </div>
            <a href="/dashboard/billing" onClick={e => e.stopPropagation()}
              style={{ display: 'inline-block', padding: '9px 22px', background: C.grad,
              color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              {t('analytics.upgradeAPro')}
            </a>
          </div>
        </SectionBlurGate>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
          {!isPro && <span style={{ fontSize: 16 }}>🔒</span>}
          {t('analytics.tiktokRescueFunnel')}
          {!isPro && <ProBadge />}
          <InfoIcon tip={!isPro ? t('analytics.availableInTokproofPro') : TIPS['Embudo TikTok Rescue']} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F7F5FD',
          border: '1px solid #ECE7FA', color: C.violet, borderRadius: 10,
          padding: '8px 13px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 2-2.8 2.5-2.8 2.5"/>
            <line x1="12" y1="17" x2="12" y2="17"/>
          </svg>
          {t('analytics.howItWorks')}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch', marginLeft: isMobile ? -14 : 0, marginRight: isMobile ? -14 : 0, paddingLeft: isMobile ? 14 : 0, paddingRight: isMobile ? 14 : 0 }}>
        {FUNNEL_STATIC.map((s, i) => (
          <span key={s.label} style={{ display: 'contents' }}>
            <div style={{ flex: isMobile ? '0 0 auto' : 1, width: isMobile ? 130 : undefined, borderRadius: 16, padding: isMobile ? '14px 10px 0' : '20px 16px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              position: 'relative', overflow: 'hidden', minHeight: isMobile ? 120 : 150, background: s.bg }}>
              <div style={{ width: 54, height: 54, borderRadius: 15, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(20,20,40,.07)', marginBottom: 14 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                  dangerouslySetInnerHTML={{ __html: s.icoSvg }} />
              </div>
              <div style={{ fontSize: 13, color: C.ink2, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 3, color: C.ink }}>
                {vals[i].toLocaleString('es')}
              </div>
              <div style={{ height: 6, width: '100%', borderRadius: 6, marginTop: 18, background: s.barGrad }} />
            </div>
            {i < FUNNEL_STATIC.length - 1 && (
              <div style={{ flexShrink: 0, width: isMobile ? 36 : 96, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>
                  {dropPct(vals[i], vals[i + 1])}
                </span>
                <FunnelArrow />
              </div>
            )}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(90deg,#F6F1FD,#FBF4F8)', borderRadius: 13,
        padding: isMobile ? '12px 14px' : '14px 18px', marginTop: 18, fontSize: isMobile ? 12.5 : 13.5, color: C.ink2 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 3px 8px rgba(20,20,40,.06)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.purple}
            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>
          </svg>
        </span>
        <div>
          <b>{data.funnelExitViews > 0
            ? `${Math.round((data.funnelBrowserDetected / data.funnelExitViews) * 100)}%`
            : '—'
          }</b>{' '}
          {t('analytics.usersReachContent')}
        </div>
      </div>
    </Card>
  )
}

// ─── Triple row ───────────────────────────────────────────────────────────────
function ColCard({ title, tip, children, footBtn, onFootClick, isPro, onUpgrade, isCountries }:
  { title: string; tip?: string; children: React.ReactNode; footBtn: string; onFootClick: () => void
    isPro?: boolean; onUpgrade?: () => void; isCountries?: boolean }) {
  const { t } = useTranslation()
  const locked = isPro === false
  return (
    <Card style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
        {locked && <span style={{ fontSize: 15 }}>🔒</span>}
        {title}
        {locked && <ProBadge />}
        <InfoIcon tip={locked ? t('analytics.availableInTokproofPro') : tip} />
      </div>

      {/* Content area — blurred when locked, clicking the whole card goes to billing */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {children}
        {locked && (
          <a href="/dashboard/billing" style={{ position: 'absolute', inset: 0, borderRadius: 10,
            backdropFilter: 'blur(3px)', background: 'rgba(255,255,255,.48)', zIndex: 10 }} />
        )}
      </div>

      {/* Footer: "Available in Pro" when locked, action button when unlocked */}
      <div style={{ paddingTop: 16 }}>
        {locked
          ? <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600,
              color: C.violet, padding: '10px 0', letterSpacing: '.01em' }}>
              {t('analytics.availableInTokproofPro')}
            </div>
          : <button onClick={onFootClick}
              style={{ width: '100%', border: 'none', borderRadius: 11, padding: 11,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: isCountries ? '#FDEAF2' : '#F2EEFB',
              color: isCountries ? '#E0348F' : C.violet }}>
              {footBtn}
            </button>
        }
      </div>
    </Card>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 0', color: C.muted2, fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
      {msg}
    </div>
  )
}

function TopCountries({ data, onMore, isPro, onUpgrade }: { data: FullAnalytics; onMore: () => void; isPro: boolean; onUpgrade: () => void }) {
  const { t } = useTranslation()
  return (
    <ColCard title={t('analytics.topCountries')} tip={TIPS['Top países']} footBtn={t('analytics.viewAllCountries')} onFootClick={onMore}
      isPro={isPro} onUpgrade={onUpgrade} isCountries>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, margin: '16px 0 4px', flex: 1 }}>
        {data.devices.length === 0
          ? <EmptyState msg={t('analytics.noCountryData')} />
          : (['🇲🇽 México', '🇪🇸 España', '🇦🇷 Argentina', '🇨🇱 Chile', '🇨🇴 Colombia'] as const).map(item => {
              const [flag, name] = item.split(' ')
              return (
                <div key={name} style={{ display: 'grid',
                  gridTemplateColumns: '22px 86px 1fr 34px', alignItems: 'center', gap: 11 }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{flag}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink2 }}>{name}</span>
                  <div style={{ height: 7, background: '#F0F1F4', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 6, background: C.grad, width: '50%' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: C.ink }}>—</span>
                </div>
              )
            })
        }
      </div>
    </ColCard>
  )
}

function DevicesDonut({ data, onMore, isPro, onUpgrade }: {
  data: FullAnalytics; onMore: () => void; isPro: boolean; onUpgrade: () => void
}) {
  const { t } = useTranslation()
  const devs   = data.devices
  const total  = devs.reduce((a, d) => a + d.pct, 0)
  const hasData = devs.length > 0 && total > 0

  const circumference = 2 * Math.PI * 15.9
  let offset = 25
  const segments = devs.map(d => {
    const dash = (d.pct / 100) * circumference
    const seg  = { dash, gap: circumference - dash, offset, color: d.color }
    offset -= dash
    return seg
  })

  return (
    <ColCard title={t('analytics.devices')} tip={TIPS['Dispositivos']} footBtn={t('analytics.viewAllDevices')} onFootClick={onMore}
      isPro={isPro} onUpgrade={onUpgrade}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '10px 0 4px', flex: 1 }}>
        <div style={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
          <svg viewBox="0 0 42 42" width="148" height="148">
            <defs>
              <linearGradient id="dseg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FB2C7D"/><stop offset="1" stopColor="#8B5CF6"/>
              </linearGradient>
            </defs>
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EDEFF3" strokeWidth="6.2"/>
            {hasData ? segments.map((seg, i) => (
              <circle key={i} cx="21" cy="21" r="15.9" fill="none"
                stroke={i === 0 ? 'url(#dseg1)' : seg.color}
                strokeWidth="6.2" strokeLinecap="round"
                strokeDasharray={`${seg.dash} ${seg.gap}`}
                strokeDashoffset={seg.offset}/>
            )) : null}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
              stroke="#B7BCC8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="3" width="10" height="18" rx="2.5"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {!hasData
            ? <EmptyState msg={t('analytics.noDeviceData')} />
            : devs.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 9,
                fontSize: 13.5, fontWeight: 600, color: C.ink2 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%',
                  background: d.color, flexShrink: 0 }} />
                {d.name}
                <span style={{ marginLeft: 'auto', fontWeight: 700, color: C.ink }}>{d.pct}%</span>
              </div>
            ))
          }
        </div>
      </div>
    </ColCard>
  )
}

function TrafficSources({ data, onMore, isPro, onUpgrade }: {
  data: FullAnalytics; onMore: () => void; isPro: boolean; onUpgrade: () => void
}) {
  const { t } = useTranslation()
  const maxWidth = data.sources.length > 0 ? Math.max(...data.sources.map(s => s.barWidth)) : 1
  return (
    <ColCard title={t('analytics.trafficSources')} tip={TIPS['Fuentes de tráfico']} footBtn={t('analytics.viewAllSources')} onFootClick={onMore}
      isPro={isPro} onUpgrade={onUpgrade}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, margin: '16px 0 4px', flex: 1 }}>
        {data.sources.length === 0
          ? <EmptyState msg={t('analytics.noSourceData')} />
          : data.sources.map(s => (
            <div key={s.name} style={{ display: 'grid',
              gridTemplateColumns: '24px 86px 1fr 34px', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: s.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  dangerouslySetInnerHTML={{ __html: s.iconSvg }} />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink2 }}>{s.name}</span>
              <div style={{ height: 7, background: '#F0F1F4', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 6, background: C.grad,
                  width: `${s.barWidth}%` }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: C.ink }}>{s.pct}%</span>
            </div>
          ))
        }
      </div>
    </ColCard>
  )
}

function TripleRow({ data, isPro, onMore, onUpgrade, isMobile, isTablet }: {
  data: FullAnalytics; isPro: boolean; onMore: () => void; onUpgrade: () => void; isMobile?: boolean; isTablet?: boolean
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr', gap: isMobile ? 14 : 18, marginTop: 22 }}>
      <TopCountries data={data} onMore={onMore} isPro={isPro} onUpgrade={onUpgrade} />
      <DevicesDonut data={data} onMore={onMore} isPro={isPro} onUpgrade={onUpgrade} />
      <TrafficSources data={data} onMore={onMore} isPro={isPro} onUpgrade={onUpgrade} />
    </div>
  )
}

// ─── Line chart ───────────────────────────────────────────────────────────────
const SERIES_META = [
  { color: '#F62E8E', label: 'Landing Views',        key: 'views'             as const },
  { color: '#8B5CF6', label: 'Clicks',               key: 'clicks'            as const },
  { color: '#3B82F6', label: 'Open Browser Clicks',  key: 'openBrowserClicks' as const },
]

function PerformanceChart({ data, isPro, onUpgrade, isMobile }: { data: FullAnalytics; isPro: boolean; onUpgrade: () => void; isMobile?: boolean }) {
  const { t } = useTranslation()
  const pts = data.timeSeries
  const W = 1000, H = isMobile ? 200 : 300, padL = isMobile ? 32 : 42, padR = 18, padT = 14, padB = isMobile ? 28 : 40
  const n = pts.length || 1
  const maxVal = Math.max(...pts.flatMap(p => [p.views, p.clicks, p.openBrowserClicks]), 4)
  const chartMax = Math.ceil(maxVal / 2) * 2 || 4
  const cx = (i: number) => padL + (i / Math.max(n - 1, 1)) * (W - padL - padR)
  const cy = (v: number) => padT + (1 - v / chartMax) * (H - padT - padB)

  return (
    <Card style={{ marginTop: 22, padding: isMobile ? '16px 14px' : '22px 24px', position: 'relative' }}>
      {!isPro && (
        <a href="/dashboard/billing" style={{ position: 'absolute', inset: 0, borderRadius: 18,
          background: 'rgba(255,255,255,.36)', backdropFilter: 'blur(2px)', zIndex: 10 }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
          {!isPro && <span style={{ fontSize: 16 }}>🔒</span>}
          {t('analytics.performanceEvolution')}
          {!isPro && <ProBadge />}
          <InfoIcon tip={!isPro ? t('analytics.availableInTokproofPro') : TIPS['Evolución del rendimiento']} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
          border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 13px',
          fontSize: 13, fontWeight: 600, color: C.ink2 }}>
          {t('analytics.daily')} <ChevDown />
        </div>
      </div>
      <div style={{ display: 'flex', gap: isMobile ? 10 : 22, marginBottom: 6, flexWrap: 'wrap' }}>
        {SERIES_META.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7,
            fontSize: isMobile ? 11 : 13, fontWeight: 600, color: C.ink2 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <div style={{ width: '100%', height: isMobile ? 200 : 300, marginTop: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines — always shown */}
          {Array.from({ length: 6 }, (_, g) => {
            const gv = g * (chartMax / 5)
            const gy = cy(gv)
            return (
              <g key={g}>
                <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#F0F1F4" strokeWidth="1"/>
                <text x={padL - 12} y={gy + 4} textAnchor="end" fontSize="12"
                  fill="#A9AEBC" fontFamily="Inter">
                  {Math.round(gv) === 0 ? '0' : `${Math.round(gv)}${gv >= 1000 ? 'K' : ''}`}
                </text>
              </g>
            )
          })}

          {pts.length === 0 ? (
            <>
              {/* Flat dashed baselines — visual placeholder */}
              {SERIES_META.map(s => (
                <line key={s.color}
                  x1={padL} y1={cy(0)} x2={W - padR} y2={cy(0)}
                  stroke={s.color} strokeWidth="2" strokeDasharray="8 8"
                  strokeLinecap="round" opacity="0.18" />
              ))}
              <text x={W / 2} y={H / 2 + 4} textAnchor="middle"
                fontSize="14" fill="#C9CCD6" fontFamily="Inter" fontWeight="500">
                {t('analytics.noDataPeriod')}
              </text>
            </>
          ) : (
            <>
              {pts.map((p, i) => (
                <text key={i} x={cx(i)} y={H - 14} textAnchor="middle"
                  fontSize="12" fill="#A9AEBC" fontFamily="Inter">{p.date}</text>
              ))}
              {SERIES_META.map(s => {
                const line = pts.map((p, i) => `${cx(i)},${cy(p[s.key])}`).join(' ')
                return (
                  <g key={s.color}>
                    <polyline points={line} fill="none" stroke={s.color}
                      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                    {pts.map((p, i) => (
                      <circle key={i} cx={cx(i)} cy={cy(p[s.key])} r="4"
                        fill="#fff" stroke={s.color} strokeWidth="2.2"/>
                    ))}
                  </g>
                )
              })}
            </>
          )}
        </svg>
      </div>
    </Card>
  )
}

// ─── Pages table ──────────────────────────────────────────────────────────────
const PAGE_GRADIENTS = [
  'linear-gradient(135deg,#F9A8C9,#C084FC)',
  'linear-gradient(135deg,#FCD34D,#FB923C)',
  'linear-gradient(135deg,#F472B6,#A78BFA)',
  'linear-gradient(135deg,#93C5FD,#C4B5FD)',
  'linear-gradient(135deg,#6EE7B7,#3B82F6)',
]

function PagesTable({ data, onMore, isMobile }: { data: FullAnalytics; onMore: () => void; isMobile?: boolean }) {
  const { t } = useTranslation()
  const headers = isMobile
    ? ['Page','Landing Views','Clicks','CTR']
    : ['Page','Landing Views','Unique visitors','Clicks','CTR','Rescue Rate','Guías mostradas','Aperturas navegador']
  return (
    <Card style={{ marginTop: 22, padding: isMobile ? '16px 14px' : '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
          {t('analytics.pagePerformance')} <InfoIcon tip={TIPS['Rendimiento por página']} />
        </div>
      </div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: isMobile ? 380 : 640, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={h} style={{ fontSize: 11.5, fontWeight: 600, color: C.muted,
                      textAlign: i === 0 ? 'left' : 'right', padding: '0 0 14px', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.pages.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} style={{
                      textAlign: 'center', padding: '28px 20px',
                      color: C.muted2, fontSize: 13, fontWeight: 500,
                      borderTop: `1px solid ${C.lineSoft}`,
                    }}>
                      Todavía no hay datos
                    </td>
                  </tr>
                ) : data.pages.map((row, idx) => (
                  <tr key={row.pageId} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '13px 0', borderTop: `1px solid ${C.lineSoft}`,
                      textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: PAGE_GRADIENTS[idx % PAGE_GRADIENTS.length] }} />
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{row.name}</div>
                          <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginTop: 2 }}>{row.url}</div>
                        </div>
                      </div>
                    </td>
                    {(isMobile
                      ? [fmtNum(row.landingViews), fmtNum(row.clicks), `${row.ctr}%`]
                      : [fmtNum(row.landingViews), fmtNum(row.uniqueVisitors), fmtNum(row.clicks), `${row.ctr}%`, `${row.rescueRate}%`, fmtNum(row.exitGuideViews), fmtNum(row.openBrowserClicks)]
                    ).map((v, i) => (
                      <td key={i} style={{ padding: '13px 0', borderTop: `1px solid ${C.lineSoft}`,
                        fontSize: 13.5, fontWeight: 600, color: C.ink, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {v}
                      </td>
                    ))}
                    <td style={{ padding: '13px 0', borderTop: `1px solid ${C.lineSoft}`, textAlign: 'right' }}>
                      <DotsV />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </div>
      <div onClick={onMore} style={{ textAlign: 'center', padding: 16, marginTop: 6,
        background: '#F7F5FD', borderRadius: 12, color: C.violet,
        fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
        {t('analytics.viewAllPages')}
      </div>
    </Card>
  )
}

// ─── No-data info banner ─────────────────────────────────────────────────────
function NoDataBanner() {
  const items = ['Visitas','Clics','CTR','Rendimiento por página','Embudo TikTok Rescue','Evolución temporal']
  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      background: 'linear-gradient(135deg,rgba(246,71,169,.04),rgba(123,97,255,.06))',
      border: '1px solid rgba(123,97,255,.12)',
      borderRadius: 14, padding: '14px 18px', marginBottom: 18,
    }}>
      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>📈</div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
          Tus analytics aparecerán automáticamente cuando empieces a recibir tráfico.
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
          Comparte tu enlace de Tokproof en TikTok, Instagram o cualquier red social y podrás ver:{' '}
          <span style={{ color: C.ink2, fontWeight: 500 }}>
            {items.join(' · ')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
interface Props {
  initialData: FullAnalytics
  pages:       PageMeta[]
  isPro:       boolean
}

export default function AnalyticsDashboard({ initialData, pages, isPro }: Props) {
  const router = useRouter()
  const { t } = useTranslation()

  const [w, setW] = useState(1200)
  useEffect(() => {
    const upd = () => setW(window.innerWidth)
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])
  const isMobile = w < 768
  const isTablet = w >= 768 && w < 1024

  const DATE_OPTIONS = [
    { label: t('analytics.today'),     days: 1  },
    { label: t('analytics.yesterday'), days: 2  },
    { label: t('analytics.last7Days'), days: 7  },
    { label: t('analytics.last30Days'), days: 30 },
    { label: t('analytics.thisMonth'), days: 30 },
  ]

  const [data,           setData]       = useState<FullAnalytics>(initialData)
  const [days,           setDays]       = useState(7)
  const [dateLabel,      setDateLabel]  = useState(t('analytics.last7Days'))
  const [selectedPageId, setPageId]     = useState<string | null>(null)
  const [pageLabel,      setPageLabel]  = useState(t('analytics.allPages'))
  const [loading,        setLoading]    = useState(false)
  const [showDateDrop,   setDateDrop]   = useState(false)
  const [showPageDrop,   setPageDrop]   = useState(false)
  const [modal,          setModal]      = useState<'soon' | null>(null)

  const load = useCallback(async (d: number, pid: string | null) => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ days: String(d) })
      if (pid) p.set('pageId', pid)
      const res = await fetch(`/api/analytics?${p}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  function selectDate(opt: typeof DATE_OPTIONS[0]) {
    setDays(opt.days); setDateLabel(opt.label); setDateDrop(false)
    load(opt.days, selectedPageId)
  }

  function selectPage(id: string | null, label: string) {
    setPageId(id); setPageLabel(label); setPageDrop(false)
    load(days, id)
  }

  function exportCSV() {
    if (!isPro) { router.push('/dashboard/billing'); return }
    const rows = [
      ['Fecha', 'Landing Views', 'Clicks', 'Open Browser Clicks'],
      ...data.timeSeries.map(p => [p.date, p.views, p.clicks, p.openBrowserClicks]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url; link.download = `tokproof-analytics-${days}d.csv`
    document.body.appendChild(link); link.click()
    document.body.removeChild(link); URL.revokeObjectURL(url)
  }

  const onUpgrade = () => router.push('/dashboard/billing')
  const onSoon    = () => setModal('soon')
  const kpiVals   = kpiValues(data)

  return (
    <div style={{ padding: isMobile ? '16px 14px 40px' : isTablet ? '20px 24px 40px' : '30px 34px 40px', maxWidth: 1130, background: C.bg,
      minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif",
      opacity: loading ? 0.65 : 1, transition: 'opacity .2s' }}>

      {/* Modals */}
      {modal === 'soon' && <ComingSoonModal onClose={() => setModal(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8,
        fontSize: isMobile ? 22 : 28, fontWeight: 800, letterSpacing: '-0.025em', color: C.ink }}>
        {t('analytics.title')} <InfoIcon tip="Panel de métricas de tus páginas Tokproof." />
      </div>
      <div style={{ color: C.muted, fontSize: isMobile ? 13 : 14.5, marginTop: 6 }}>
        {t('analytics.subtitle')}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: isMobile ? 8 : 12, margin: isMobile ? '16px 0 14px' : '24px 0 18px', flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch', position: 'relative', zIndex: 50, paddingBottom: isMobile ? 4 : 0 }}>

        {/* Date filter */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setDateDrop(v => !v); setPageDrop(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff',
              border: `1px solid ${C.line}`, borderRadius: 12, padding: '11px 14px',
              fontSize: 13.5, fontWeight: 600, color: C.ink2, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted}
              strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="2.5"/>
              <line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="16" y1="2" x2="16" y2="5"/>
            </svg>
            {dateLabel} <ChevDown />
          </button>
          {showDateDrop && (
            <div style={{ position: 'absolute', top: '110%', left: 0, background: '#fff',
              border: `1px solid ${C.line}`, borderRadius: 14, minWidth: 180,
              boxShadow: '0 8px 24px rgba(0,0,0,.08)', overflow: 'hidden' }}>
              {DATE_OPTIONS.map(opt => (
                <div key={opt.label} onClick={() => selectDate(opt)}
                  style={{ padding: '11px 16px', fontSize: 13.5, fontWeight: opt.label === dateLabel ? 700 : 500,
                    color: opt.label === dateLabel ? C.violet : C.ink2, cursor: 'pointer',
                    background: opt.label === dateLabel ? '#F3F0FD' : 'transparent' }}>
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Page filter */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setPageDrop(v => !v); setDateDrop(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff',
              border: `1px solid ${C.line}`, borderRadius: 12, padding: '11px 14px',
              fontSize: 13.5, fontWeight: 600, color: C.ink2, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted}
              strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            {pageLabel} <ChevDown />
          </button>
          {showPageDrop && (
            <div style={{ position: 'absolute', top: '110%', left: 0, background: '#fff',
              border: `1px solid ${C.line}`, borderRadius: 14, minWidth: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,.08)', overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
              <div onClick={() => selectPage(null, t('analytics.allPages'))}
                style={{ padding: '11px 16px', fontSize: 13.5, fontWeight: selectedPageId === null ? 700 : 500,
                  color: selectedPageId === null ? C.violet : C.ink2, cursor: 'pointer',
                  background: selectedPageId === null ? '#F3F0FD' : 'transparent' }}>
                Todas las páginas
              </div>
              {pages.map(p => (
                <div key={p.id} onClick={() => selectPage(p.id,
                    p.title ?? p.product_name ?? p.brand_name ?? p.username ?? p.id.slice(0,8))}
                  style={{ padding: '11px 16px', fontSize: 13.5,
                    fontWeight: selectedPageId === p.id ? 700 : 500,
                    color: selectedPageId === p.id ? C.violet : C.ink2, cursor: 'pointer',
                    background: selectedPageId === p.id ? '#F3F0FD' : 'transparent' }}>
                  {p.title ?? p.product_name ?? p.brand_name ?? p.username ?? p.id.slice(0, 8)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source filter — visual only */}
        <button onClick={onSoon}
          style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff',
            border: `1px solid ${C.line}`, borderRadius: 12, padding: '11px 14px',
            fontSize: 13.5, fontWeight: 600, color: C.ink2, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted}
            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>
          </svg>
          {t('analytics.allSources')} <ChevDown />
        </button>

        {/* CSV export */}
        <button onClick={exportCSV} style={{ marginLeft: isMobile ? 0 : 'auto', flexShrink: 0, display: 'flex', alignItems: 'center',
          gap: 9, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 12,
          padding: '11px 14px', fontSize: isMobile ? 12.5 : 13.5, fontWeight: 600, color: C.ink,
          cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={C.purple} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/>
            <path d="M5 20h14"/>
          </svg>
          {t('analytics.exportCSV')}
        </button>
      </div>

      {/* ── Info banner — only when no data yet ── */}
      {data.views === 0 && data.clicks === 0 && <NoDataBanner />}

      {/* KPI grid — always visible */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(4,1fr)' : 'repeat(7,1fr)', gap: isMobile ? 10 : 13 }}
        className="kpi-analytics-grid">
        {KPI_CONFIG.map((cfg, i) => (
          <KpiCard key={cfg.label} cfg={cfg} val={kpiVals[i]}
            isPro={isPro} onUpgrade={onUpgrade} isMobile={isMobile} />
        ))}
      </div>

      <FunnelSection  data={data} isPro={isPro} onUpgrade={onUpgrade} isMobile={isMobile} />
      <TripleRow      data={data} isPro={isPro} onMore={onSoon} onUpgrade={onUpgrade} isMobile={isMobile} isTablet={isTablet} />
      <PerformanceChart data={data} isPro={isPro} onUpgrade={onUpgrade} isMobile={isMobile} />
      <PagesTable     data={data} onMore={onSoon} isMobile={isMobile} />

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 26, color: C.muted2, fontSize: 12.5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green}
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>
          <polyline points="9 12 11.5 14.5 16 9.5"/>
        </svg>
        {t('analytics.dataUpdate')}
      </div>
    </div>
  )
}
