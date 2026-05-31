'use client'

import type { KpiItem, FunnelItem, Country, Device, TrafficSource, ChartSeries, PageRow } from './data'
import {
  KPI_DATA, FUNNEL_DATA, COUNTRIES, DEVICES, SOURCES,
  CHART_DAYS, CHART_SERIES, CHART_MAX, TABLE_HEADERS, TABLE_ROWS,
} from './data'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:     '#F4F5F8',
  card:   '#FFFFFF',
  line:   '#ECEDF1',
  lineSoft: '#F1F2F5',
  ink:    '#15161C',
  ink2:   '#3A3C46',
  muted:  '#8B90A0',
  muted2: '#A9AEBC',
  pink:   '#F62E8E',
  purple: '#8B5CF6',
  violet: '#7C3AED',
  blue:   '#3B82F6',
  green:  '#16B368',
  red:    '#F43F6B',
  grad:   'linear-gradient(90deg,#FB2C7D 0%,#C13BD6 55%,#7C3AED 100%)',
}

const TINT: Record<string, { bg: string; color: string }> = {
  purple: { bg: '#EFE9FD', color: '#8B5CF6' },
  pink:   { bg: '#FCE6F0', color: '#EC2C7C' },
  blue:   { bg: '#E6EEFD', color: '#3B82F6' },
  green:  { bg: '#E1F5EA', color: '#16B368' },
}

// ─── Sparkline generator (matches HTML exactly) ───────────────────────────────
function sparkPoints(seed: number, w: number, h: number): string {
  const n = 14
  let v = 0.5, r = seed
  const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280 }
  const pts: number[] = []
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.45) * 0.34
    v = Math.max(0.12, Math.min(0.9, v))
    pts.push(v)
  }
  return pts
    .map((p, i) => `${((i / (n - 1)) * w).toFixed(1)},${(h - p * h * 0.8 - h * 0.1).toFixed(1)}`)
    .join(' ')
}

// ─── Shared SVG icons ─────────────────────────────────────────────────────────
const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted2}
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="11" x2="12" y2="16"/>
    <line x1="12" y1="8" x2="12" y2="8"/>
  </svg>
)
const ChevDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.muted2}
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>
  </svg>
)
const DotsV = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.muted2}
    strokeWidth="1.9" strokeLinecap="round">
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
const ArrowUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.green}
    strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="6"/>
    <polyline points="6 12 12 6 18 12"/>
  </svg>
)

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, ...style }}>
    {children}
  </div>
)

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const t = TINT[item.tint]
  return (
    <Card style={{ padding: '16px 15px 15px', display: 'flex', flexDirection: 'column', minHeight: 212 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: t.bg, color: t.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: item.icoPath }} />
        </div>
        <InfoIcon />
      </div>
      <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 500, marginTop: 13,
        lineHeight: 1.35, minHeight: 34 }}>{item.label}</div>
      <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
        {item.val}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5,
        fontWeight: 700, color: C.green, marginTop: 9 }}>
        <ArrowUp />
        {item.delta}
      </div>
      <div style={{ fontSize: 11, color: C.muted2, marginTop: 2 }}>vs días anteriores</div>
      <svg viewBox="0 0 90 38" preserveAspectRatio="none"
        style={{ marginTop: 'auto', width: '100%', height: 38 }}>
        <polyline
          points={sparkPoints(index * 37 + 11, 90, 38)}
          fill="none" stroke={item.sparkColor} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Card>
  )
}

// ─── Funnel Section ───────────────────────────────────────────────────────────
function FunnelSection() {
  return (
    <Card style={{ marginTop: 22, padding: '22px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Embudo TikTok Rescue <InfoIcon />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F7F5FD',
          border: '1px solid #ECE7FA', color: C.violet, borderRadius: 10,
          padding: '8px 13px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 2-2.8 2.5-2.8 2.5"/>
            <line x1="12" y1="17" x2="12" y2="17"/>
          </svg>
          ¿Cómo funciona?
        </button>
      </div>

      {/* Funnel cards */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        {FUNNEL_DATA.map((item, i) => (
          <FunnelItemCard key={item.label} item={item} isLast={i === FUNNEL_DATA.length - 1} />
        ))}
      </div>

      {/* Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(90deg,#F6F1FD,#FBF4F8)', borderRadius: 13,
        padding: '14px 18px', marginTop: 18, fontSize: 13.5, color: C.ink2 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 3px 8px rgba(20,20,40,.06)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.purple}
            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>
          </svg>
        </span>
        <div><b>72.8%</b> de los usuarios que hacen clic en TikTok logran llegar a tu contenido en un navegador externo.</div>
      </div>
    </Card>
  )
}

function FunnelItemCard({ item, isLast }: { item: FunnelItem; isLast: boolean }) {
  return (
    <>
      <div style={{ flex: 1, borderRadius: 16, padding: '20px 16px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        position: 'relative', overflow: 'hidden', minHeight: 150, background: item.bg }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(20,20,40,.07)', marginBottom: 14 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            dangerouslySetInnerHTML={{ __html: item.icoSvg }} />
        </div>
        <div style={{ fontSize: 13, color: C.ink2, fontWeight: 500 }}>{item.label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em',
          marginTop: 3, color: C.ink }}>{item.val}</div>
        <div style={{ height: 6, width: '100%', borderRadius: 6, marginTop: 18,
          background: item.barGrad }} />
      </div>
      {!isLast && (
        <div style={{ flexShrink: 0, width: 96, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{item.drop}</span>
          <FunnelArrow />
        </div>
      )}
    </>
  )
}

// ─── Triple Row ────────────────────────────────────────────────────────────────
function TripleRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 22 }}>
      <TopCountries />
      <DevicesDonut />
      <TrafficSources />
    </div>
  )
}

function ColCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <Card style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
        {title} <InfoIcon />
      </div>
      {children}
    </Card>
  )
}

function TopCountries() {
  return (
    <ColCard title="Top países">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, margin: '16px 0 4px' }}>
        {COUNTRIES.map((c: Country) => (
          <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '22px 86px 1fr 34px',
            alignItems: 'center', gap: 11 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink2 }}>{c.name}</span>
            <div style={{ height: 7, background: '#F0F1F4', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 6, background: C.grad,
                width: `${Math.round((c.pct / 34) * 100)}%` }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'right', color: C.ink }}>{c.pct}%</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button style={{ width: '100%', border: 'none', borderRadius: 11, padding: 11,
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          background: '#FDEAF2', color: '#E0348F' }}>
          Ver todos los países
        </button>
      </div>
    </ColCard>
  )
}

function DevicesDonut() {
  return (
    <ColCard title="Dispositivos">
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '10px 0 4px', flex: 1 }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
          <svg viewBox="0 0 42 42" width="148" height="148">
            <defs>
              <linearGradient id="dseg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FB2C7D"/>
                <stop offset="1" stopColor="#8B5CF6"/>
              </linearGradient>
            </defs>
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EDEFF3" strokeWidth="6.2"/>
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="url(#dseg1)" strokeWidth="6.2"
              strokeDasharray="72 28" strokeDashoffset="25" strokeLinecap="round"/>
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#7C3AED" strokeWidth="6.2"
              strokeDasharray="24 76" strokeDashoffset="-48" strokeLinecap="round"/>
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#3B82F6" strokeWidth="6.2"
              strokeDasharray="4 96" strokeDashoffset="-73" strokeLinecap="round"/>
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
        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {DEVICES.map((d: Device) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 9,
              fontSize: 13.5, fontWeight: 600, color: C.ink2 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%',
                background: d.color, flexShrink: 0 }} />
              {d.name}
              <span style={{ marginLeft: 'auto', fontWeight: 700, color: C.ink }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button style={{ width: '100%', border: 'none', borderRadius: 11, padding: 11,
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          background: '#F2EEFB', color: C.violet }}>
          Ver todos los dispositivos
        </button>
      </div>
    </ColCard>
  )
}

function TrafficSources() {
  return (
    <ColCard title="Fuentes de tráfico">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, margin: '16px 0 4px' }}>
        {SOURCES.map((s: TrafficSource) => (
          <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '22px 86px 1fr 34px',
            alignItems: 'center', gap: 11 }}>
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
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button style={{ width: '100%', border: 'none', borderRadius: 11, padding: 11,
          fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          background: '#F2EEFB', color: C.violet }}>
          Ver todas las fuentes
        </button>
      </div>
    </ColCard>
  )
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
function PerformanceChart() {
  const W = 1000, H = 300
  const padL = 42, padR = 18, padT = 14, padB = 40
  const n = CHART_DAYS.length
  const cx = (i: number) => padL + (i / (n - 1)) * (W - padL - padR)
  const cy = (v: number) => padT + (1 - v / CHART_MAX) * (H - padT - padB)

  const gridLines = Array.from({ length: 6 }, (_, g) => {
    const gv = g * 2
    const gy = cy(gv)
    return (
      <g key={g}>
        <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#F0F1F4" strokeWidth="1"/>
        <text x={padL - 12} y={gy + 4} textAnchor="end" fontSize="12"
          fill="#A9AEBC" fontFamily="Inter">
          {gv === 0 ? '0' : `${gv}K`}
        </text>
      </g>
    )
  })

  return (
    <Card style={{ marginTop: 22, padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Evolución del rendimiento <InfoIcon />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
          border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 13px',
          fontSize: 13, fontWeight: 600, color: C.ink2, cursor: 'pointer', fontFamily: 'inherit' }}>
          Diario <ChevDown />
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 22, marginBottom: 6 }}>
        {CHART_SERIES.map((s: ChartSeries) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 13, fontWeight: 600, color: C.ink2 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <div style={{ width: '100%', height: 300, marginTop: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
          preserveAspectRatio="xMidYMid meet">
          {gridLines}
          {/* X labels */}
          {CHART_DAYS.map((d, i) => (
            <text key={d} x={cx(i)} y={H - 14} textAnchor="middle"
              fontSize="12" fill="#A9AEBC" fontFamily="Inter">{d}</text>
          ))}
          {/* Series */}
          {CHART_SERIES.map((s: ChartSeries) => {
            const pts = s.data.map((v, i) => `${cx(i)},${cy(v)}`).join(' ')
            return (
              <g key={s.color}>
                <polyline points={pts} fill="none" stroke={s.color}
                  strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
                {s.data.map((v, i) => (
                  <circle key={i} cx={cx(i)} cy={cy(v)} r="4"
                    fill="#fff" stroke={s.color} strokeWidth="2.2"/>
                ))}
              </g>
            )
          })}
        </svg>
      </div>
    </Card>
  )
}

// ─── Pages Table ──────────────────────────────────────────────────────────────
function PagesTable() {
  return (
    <Card style={{ marginTop: 22, padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Rendimiento por página <InfoIcon />
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {TABLE_HEADERS.map((h, i) => (
                <th key={h} style={{ fontSize: 11.5, fontWeight: 600, color: C.muted,
                  textAlign: i === 0 ? 'left' : 'right', padding: '0 0 14px',
                  whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row: PageRow) => (
              <tr key={row.name} style={{ cursor: 'pointer' }}>
                <td style={{ padding: '13px 0', borderTop: `1px solid ${C.lineSoft}`,
                  fontSize: 13.5, fontWeight: 600, color: C.ink, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: row.gradient }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{row.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginTop: 2 }}>{row.url}</div>
                    </div>
                  </div>
                </td>
                {row.cols.map((v, i) => (
                  <td key={i} style={{ padding: '13px 0', borderTop: `1px solid ${C.lineSoft}`,
                    fontSize: 13.5, fontWeight: 600, color: C.ink, textAlign: 'right',
                    whiteSpace: 'nowrap' }}>
                    {v}
                  </td>
                ))}
                <td style={{ padding: '13px 0', borderTop: `1px solid ${C.lineSoft}`,
                  textAlign: 'right' }}>
                  <DotsV />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: 'center', padding: 16, marginTop: 6,
        background: '#F7F5FD', borderRadius: 12, color: C.violet,
        fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
        Ver todas las páginas
      </div>
    </Card>
  )
}

// ─── Filters bar ──────────────────────────────────────────────────────────────
function Filters() {
  const calIco = '<rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" fill="none" stroke-width="1.9"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="1.9"/><line x1="8" y1="2" x2="8" y2="5" stroke="currentColor" stroke-width="1.9"/><line x1="16" y1="2" x2="16" y2="5" stroke="currentColor" stroke-width="1.9"/>'
  const folderIco = '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" fill="none" stroke-width="1.9"/>'
  const globeIco = '<circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" stroke-width="1.9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" fill="none" stroke-width="1.9"/>'
  const dlIco = '<path d="M12 3v12" stroke="currentColor" fill="none" stroke-width="1.9" stroke-linecap="round"/><polyline points="7 11 12 16 17 11" stroke="currentColor" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20h14" stroke="currentColor" fill="none" stroke-width="1.9" stroke-linecap="round"/>'

  const btn = (ico: string, label: string, isExport = false) => (
    <button style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff',
      border: `1px solid ${C.line}`, borderRadius: 12, padding: '11px 14px',
      fontSize: 13.5, fontWeight: 600, color: isExport ? C.ink : C.ink2,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s',
      marginLeft: isExport ? 'auto' : undefined }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        style={{ color: isExport ? C.purple : C.muted, flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: ico }} />
      {label}
      {!isExport && <ChevDown />}
    </button>
  )

  return (
    <div style={{ display: 'flex', gap: 12, margin: '24px 0 18px', flexWrap: 'wrap' }}>
      {btn(calIco, 'Últimos 7 días')}
      {btn(folderIco, 'Todas las páginas')}
      {btn(folderIco, 'Todas las páginas')}
      {btn(globeIco, 'Todas las fuentes')}
      {btn(dlIco, 'Exportar CSV', true)}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  return (
    <div style={{ padding: '30px 34px 40px', maxWidth: 1130, background: C.bg,
      minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', color: C.ink }}>
        Analytics
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted2}
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="11" x2="12" y2="16"/>
          <line x1="12" y1="8" x2="12" y2="8"/>
        </svg>
      </div>
      <div style={{ color: C.muted, fontSize: 14.5, marginTop: 6 }}>
        Mide el rendimiento de tus enlaces y optimiza tus resultados.
      </div>

      <Filters />

      {/* KPI Grid — 7 cols → 4 cols on medium screens */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 13,
      }} className="kpi-analytics-grid">
        {KPI_DATA.map((item, i) => (
          <KpiCard key={item.label} item={item} index={i} />
        ))}
      </div>

      <FunnelSection />
      <TripleRow />
      <PerformanceChart />
      <PagesTable />

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 26, color: C.muted2, fontSize: 12.5 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green}
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>
          <polyline points="9 12 11.5 14.5 16 9.5"/>
        </svg>
        Los datos se actualizan cada 15 minutos. Todas las métricas están en hora local.
      </div>
    </div>
  )
}
