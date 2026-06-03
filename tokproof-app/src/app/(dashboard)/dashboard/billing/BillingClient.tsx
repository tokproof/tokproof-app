'use client'

import Link from 'next/link'
import { FREE_FEATURES, PRO_FEATURES, COMPARISON } from './data'
import type { ComparisonRow } from './data'
import { useTranslation } from '@/lib/i18n'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#FBFAFD',
  card:     '#FFFFFF',
  line:     '#ECEDF1',
  lineSoft: '#F1EEF6',
  ink:      '#1B1726',
  ink2:     '#494456',
  muted:    '#938EA3',
  muted2:   '#B4AFC2',
  pink:     '#F62E8E',
  purple:   '#8B5CF6',
  violet:   '#7C3AED',
  green:    '#13A866',
  grad:     'linear-gradient(90deg,#FB2C7D 0%,#C13BD6 55%,#7C3AED 100%)',
}

// ─── Shared icons ─────────────────────────────────────────────────────────────
const CheckIcon = ({ green }: { green?: boolean }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
    style={{ stroke: green ? C.green : '#3A3550', strokeWidth: 3, display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="5 12 10 17 19 7"/>
  </svg>
)

const CheckCircle = ({ pink }: { pink?: boolean }) => (
  <span style={{ width: 21, height: 21, borderRadius: '50%', flexShrink: 0,
    background: pink ? C.pink : '#9F6BF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
      style={{ stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
      <polyline points="5 12 10 17 19 7"/>
    </svg>
  </span>
)

// ─── Free illustration ────────────────────────────────────────────────────────
function FreeIllo() {
  return (
    <div style={{ position: 'absolute', right: -6, top: 74, width: 230, height: 300, pointerEvents: 'none' }}>
      <span style={{ position: 'absolute', left: 18, top: -2, fontSize: 16, color: '#F7A8CE' }}>✦</span>
      <span style={{ position: 'absolute', left: 6, top: 150, fontSize: 22, color: '#F7A8CE' }}>✦</span>

      {/* Glass panel */}
      <div style={{ position: 'absolute', left: 30, top: 18, width: 182, height: 206, borderRadius: 14,
        background: 'linear-gradient(150deg,rgba(255,255,255,.85),rgba(255,255,255,.45))',
        border: '1px solid rgba(255,255,255,.9)', backdropFilter: 'blur(4px)' }} />

      {/* Browser bar */}
      <div style={{ position: 'absolute', left: 30, top: 18, width: 182, height: 26,
        background: 'linear-gradient(90deg,#FBD7E8,#F6D2F0)', borderRadius: '14px 14px 0 0',
        display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 12 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: .8 }} />
        ))}
      </div>

      {/* URL strip */}
      <div style={{ position: 'absolute', left: 46, top: 78, width: 150, height: 30, background: '#fff',
        borderRadius: 9, boxShadow: '0 6px 14px rgba(200,90,160,.18)',
        display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 11,
        fontSize: 11, color: '#9a6a8c', fontWeight: 600 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E0348F"
          strokeWidth="2" strokeLinecap="round">
          <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/>
          <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/>
        </svg>
        tokproof.app/@tuusuario
      </div>

      {/* Shield icon */}
      <div style={{ position: 'absolute', left: 78, top: 130, width: 62, height: 62, borderRadius: 18,
        background: 'linear-gradient(150deg,#FB2C7D,#C13BD6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 14px 26px rgba(220,60,150,.4)' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" fill="#fff" opacity=".25"/>
          <path d="M12 6.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1L5 9.8l3.1-.4z" fill="#fff"/>
        </svg>
      </div>
    </div>
  )
}

// ─── Pro illustration ─────────────────────────────────────────────────────────
function ProIllo() {
  return (
    <div style={{ position: 'absolute', right: 6, top: 48, width: 300, height: 260, pointerEvents: 'none' }}>
      <span style={{ position: 'absolute', left: 250, top: 0, color: '#C9A8F4', fontSize: 16 }}>✦</span>

      {/* Glass panel */}
      <div style={{ position: 'absolute', right: 74, top: 6, width: 184, height: 130, borderRadius: 16,
        background: 'linear-gradient(150deg,rgba(255,255,255,.85),rgba(255,255,255,.45))',
        border: '1px solid rgba(255,255,255,.9)', backdropFilter: 'blur(4px)' }} />

      {/* Shield card */}
      <div style={{ position: 'absolute', right: 92, top: 24, width: 34, height: 42, borderRadius: 9,
        background: 'linear-gradient(150deg,#A78BFA,#7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" fill="#fff" opacity=".3"/>
          <path d="M12 6.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1L5 9.8l3.1-.4z" fill="#fff"/>
        </svg>
      </div>

      {/* Purple bars */}
      <div style={{ position: 'absolute', right: 74, top: 78, width: 56, height: 8, borderRadius: 5,
        background: 'rgba(167,139,250,.45)' }} />
      <div style={{ position: 'absolute', right: 74, top: 94, width: 90, height: 8, borderRadius: 5,
        background: 'rgba(167,139,250,.3)' }} />

      {/* Chart line */}
      <svg style={{ position: 'absolute', right: 74, top: 50, width: 110, height: 80 }} viewBox="0 0 110 80">
        <polyline points="4 60 28 42 52 50 80 18 106 30" fill="none" stroke="#8B5CF6"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
      </svg>

      {/* Globe */}
      <div style={{ position: 'absolute', right: 34, top: 96, width: 70, height: 70, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%,#C4B5FD,#8B5CF6)',
        boxShadow: '0 16px 30px rgba(124,58,237,.35)' }} />
      <svg style={{ position: 'absolute', right: 34, top: 96, width: 70, height: 70 }} viewBox="0 0 70 70">
        <circle cx="35" cy="35" r="34" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.3"/>
        <ellipse cx="35" cy="35" rx="34" ry="14" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.3"/>
        <line x1="1" y1="35" x2="69" y2="35" stroke="rgba(255,255,255,.5)" strokeWidth="1.3"/>
      </svg>
    </div>
  )
}

// ─── Comparison cell ──────────────────────────────────────────────────────────
function Cell({ value, isPro, proGreen }: { value: string; isPro: boolean; proGreen: boolean }) {
  if (value === 'check')
    return <CheckIcon green={isPro && proGreen} />
  if (value === 'dash')
    return <span style={{ color: C.muted2 }}>—</span>
  return (
    <span style={{ color: isPro && proGreen ? C.green : C.ink2, fontWeight: isPro ? 600 : 500 }}>
      {value}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  isFree:   boolean
  username: string | null
}

export default function BillingClient({ isFree, username }: Props) {
  const { t } = useTranslation()
  return (
    <div style={{
      padding: '40px 48px 36px',
      maxWidth: 1290,
      background: 'linear-gradient(180deg,#FCF4F8 0%,#FBFAFD 220px)',
      minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 33, fontWeight: 800, letterSpacing: '-0.03em', color: C.ink }}>
            Plan &amp;{' '}
            <span style={{
              background: 'linear-gradient(90deg,#FB2C7D,#C13BD6)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>
              Billing
            </span>
          </div>
          <div style={{ color: C.muted, fontSize: 15, marginTop: 8 }}>
            {t('billing.subtitle')}
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card,
          border: `1px solid ${C.line}`, borderRadius: 12, padding: '11px 16px',
          fontSize: 13.5, fontWeight: 600, color: C.ink2, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted}
            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 2-2.8 2.5-2.8 2.5"/>
            <line x1="12" y1="17" x2="12" y2="17"/>
          </svg>
          ¿Tienes dudas?
        </button>
      </div>

      {/* ── Plan cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginTop: 30 }}
        className="billing-plans-grid">

        {/* FREE card */}
        <div style={{ position: 'relative', background: C.card, border: `1px solid ${C.line}`,
          borderRadius: 24, padding: '30px 30px 32px', overflow: 'hidden' }}>
          <FreeIllo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: C.ink }}>Free</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 9,
              color: '#E0348F', background: '#FCE4EF' }}>Plan actual</span>
          </div>
          <div style={{ fontSize: 50, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 18,
            lineHeight: 1, color: C.ink }}>
            $0
          </div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>Para siempre gratis</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 22, position: 'relative', zIndex: 2 }}>
            {FREE_FEATURES.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 11,
                fontSize: 14.5, color: C.ink2, fontWeight: 500 }}>
                <CheckCircle pink />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* PRO card */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '30px 30px 32px',
          background: 'linear-gradient(165deg,#FBF7FF 0%,#FCFAFE 60%)',
          border: '1px solid #E9DEFB', boxShadow: '0 18px 50px rgba(124,58,237,.10)' }}>
          <ProIllo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: C.violet }}>Pro</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 9,
              color: C.violet, background: '#EEE5FC' }}>POPULAR</span>
          </div>

          {/* Subtitle */}
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 10, lineHeight: 1.5, maxWidth: 240 }}>
            Todo lo necesario para escalar tu tráfico de TikTok.
          </div>

          {/* Price — more prominent */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-end', gap: 4, lineHeight: 1 }}>
            <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.04em', color: C.ink }}>$19</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: C.violet, marginBottom: 8 }}>/mes</span>
          </div>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 8, display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            o $15/mes facturado anualmente{' '}
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 9,
              color: C.violet, background: '#EEE6FB', whiteSpace: 'nowrap' }}>
              Ahorra 21%
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 22,
            position: 'relative', zIndex: 2 }}>
            {PRO_FEATURES.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 11,
                fontSize: 14.5, color: C.ink2, fontWeight: 500 }}>
                <CheckCircle />
                {f.label}
              </div>
            ))}
          </div>
          <button
            style={{ position: 'relative', zIndex: 2, marginTop: 26, width: '100%', border: 'none',
              borderRadius: 15, padding: 16, fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              background: 'linear-gradient(90deg,#F62E8E 0%,#B23BD2 60%,#7C3AED 100%)',
              boxShadow: '0 12px 26px rgba(180,60,180,.32)' }}>
            ⬆ Upgrade a Pro →
          </button>
        </div>
      </div>

      {/* ── Lower section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 30, marginTop: 46, alignItems: 'start' }}
        className="billing-lower-grid">

        {/* Left: comparison table */}
        <div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 18, color: C.ink }}>
            Comparativa completa
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0,
            background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={{ fontSize: 13.5, fontWeight: 700, color: C.ink2, background: '#FAF8FC',
                  padding: '18px 22px', textAlign: 'left', borderBottom: `1px solid ${C.line}` }}>
                  Funcionalidad
                </th>
                <th style={{ fontSize: 13.5, fontWeight: 700, color: C.ink2, background: '#FAF8FC',
                  padding: '18px 22px', textAlign: 'center', borderBottom: `1px solid ${C.line}` }}>
                  Free
                </th>
                <th style={{ fontSize: 13.5, fontWeight: 700, background: '#FAF8FC',
                  padding: '18px 22px', textAlign: 'center', borderBottom: `1px solid ${C.line}`,
                  color: C.violet }}>
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row: ComparisonRow, i) => (
                <tr key={row.label}>
                  <td style={{ fontSize: 14, fontWeight: 500, color: C.ink, padding: '16px 22px',
                    textAlign: 'left',
                    borderBottom: i < COMPARISON.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                    {row.label}
                  </td>
                  <td style={{ fontSize: 14, padding: '16px 22px', textAlign: 'center',
                    borderBottom: i < COMPARISON.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                    <Cell value={row.free} isPro={false} proGreen={row.proGreen} />
                  </td>
                  <td style={{ fontSize: 14, fontWeight: 600, padding: '16px 22px', textAlign: 'center',
                    borderBottom: i < COMPARISON.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                    <Cell value={row.pro} isPro={true} proGreen={row.proGreen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div>
          {/* Billing summary */}
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18,
            padding: 22, marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: C.ink }}>
              Resumen de facturación
            </h3>
            {/* Plan row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
              <div>
                <div style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>Plan actual</div>
                <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginTop: 2 }}>
                  <b style={{ color: C.ink, fontSize: 15, fontWeight: 800 }}>$0</b> /mes
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 9,
                color: '#E0348F', background: '#FCE4EF' }}>Free</span>
            </div>
            {/* Próximo cargo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
              <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>Próximo cargo</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Nunca</span>
            </div>
            {/* Método de pago */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0' }}>
              <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>Método de pago</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.muted2 }}>—</span>
            </div>
          </div>

          {/* Billing history */}
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18,
            padding: 22, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 6 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: '#F3EEFB', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C.purple}
                  strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
                  <polyline points="14 2 14 6 19 6"/>
                  <line x1="8.5" y1="12" x2="15" y2="12"/>
                  <line x1="8.5" y1="16" x2="13" y2="16"/>
                </svg>
              </span>
              <h3 style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: C.ink }}>
                Historial de facturación
              </h3>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Aún no tienes pagos</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginTop: 2 }}>
              Cuando actualices a Pro verás tu historial aquí.
            </div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16,
              background: '#F6F1FD', border: '1px solid #E8DEFA', color: C.violet,
              borderRadius: 11, padding: '10px 15px', fontFamily: 'inherit', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>
              </svg>
              Ver planes Pro
            </button>
          </div>

          {/* Support */}
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>¿Necesitas algo más?</h3>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginTop: 2 }}>
              Escríbenos y te ayudamos en lo que necesites.
            </div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16,
              background: '#F6F1FD', border: '1px solid #E8DEFA', color: C.violet,
              borderRadius: 11, padding: '10px 15px', fontFamily: 'inherit', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14v-2a8 8 0 0 1 16 0v2"/>
                <path d="M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2z"/>
                <path d="M20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2z"/>
                <path d="M18 16v1a3 3 0 0 1-3 3h-3"/>
              </svg>
              Contactar soporte
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 34, color: C.muted2, fontSize: 13 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="9" rx="2"/>
          <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
        </svg>
        Puedes cambiar o cancelar tu plan cuando quieras.
      </div>
    </div>
  )
}
