/**
 * Skeleton primitives — server-renderable, no 'use client'.
 * Require the .sk / .sk-dark CSS classes from polish.css.
 */
import React from 'react'

// ─── Base block ───────────────────────────────────────────────────────────────

export function Sk({
  w, h, r, mb, mt, style, dark,
}: {
  w?: string | number
  h?: string | number
  r?: string | number
  mb?: number
  mt?: number
  style?: React.CSSProperties
  dark?: boolean
}) {
  return (
    <div
      className={dark ? 'sk-dark' : 'sk'}
      style={{
        width:        w  !== undefined ? (typeof w  === 'number' ? `${w}px`  : w)  : '100%',
        height:       h  !== undefined ? (typeof h  === 'number' ? `${h}px`  : h)  : '16px',
        borderRadius: r  !== undefined ? (typeof r  === 'number' ? `${r}px`  : r)  : undefined,
        marginBottom: mb ? `${mb}px` : undefined,
        marginTop:    mt ? `${mt}px` : undefined,
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

// ─── Page header: greeting + title + subtitle ─────────────────────────────────

export function SkPageHeader({ mb = 32 }: { mb?: number }) {
  return (
    <div style={{ marginBottom: mb }}>
      <Sk w={120} h={12} r={5} mb={10} style={{ opacity: .55 }} />
      <Sk w={260} h={26} r={7} mb={8} />
      <Sk w={340} h={14} r={5} />
    </div>
  )
}

// ─── Stat grid (db-stats style) ───────────────────────────────────────────────

export function SkStatGrid({ cols = 5 }: { cols?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
      marginBottom: 32,
    }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: '20px 20px 16px',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Sk w={22} h={22} r="50%" mb={12} style={{ opacity: .4 }} />
          <Sk w="55%" h={10} r={5} mb={10} />
          <Sk w="65%" h={24} r={6} mb={8} />
          <Sk w="40%" h={10} r={5} />
        </div>
      ))}
    </div>
  )
}

// ─── Landing/page card (lc style) ─────────────────────────────────────────────

export function SkPageCard() {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex' }}>
        {/* thumb col */}
        <div style={{
          width: 88, flexShrink: 0,
          background: 'var(--bg)',
          borderRight: '1px solid var(--border)',
          padding: '16px 10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sk w={58} h={92} r={12} />
        </div>
        {/* info col */}
        <div style={{ flex: 1, padding: '16px 18px 14px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center' }}>
            <Sk w={140} h={15} r={5} />
            <Sk w={52} h={18} r={99} style={{ opacity: .7 }} />
          </div>
          <Sk w="50%" h={12} r={5} mb={12} style={{ opacity: .6 }} />
          <div style={{ display: 'flex', gap: 18, marginBottom: 12 }}>
            <Sk w={44} h={36} r={6} />
            <Sk w={44} h={36} r={6} />
          </div>
          <Sk h={30} r={7} style={{ opacity: .5 }} />
        </div>
      </div>
      {/* footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '10px 16px',
        background: 'var(--bg)',
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <Sk w={76} h={28} r={7} />
        <Sk w={76} h={28} r={7} />
        <div style={{ marginLeft: 'auto' }}>
          <Sk w={32} h={28} r={7} style={{ opacity: .5 }} />
        </div>
      </div>
    </div>
  )
}

// ─── pm-* table (ecommerce / personal-brand) ──────────────────────────────────

export function SkPmTable({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* header row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        gap: 0,
      }}>
        {[220, 100, 90, 130, 140, 36].map((w, i) => (
          <div key={i} style={{ flex: i === 0 ? '2.2 0 0' : `0 0 ${w}px`, padding: '12px 12px 12px 0' }}>
            <Sk w={i === 0 ? 50 : 34} h={10} r={4} style={{ opacity: .45 }} />
          </div>
        ))}
      </div>
      {/* body rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          display: 'flex', alignItems: 'center',
          padding: '0 20px',
          borderBottom: r < rows - 1 ? '1px solid var(--border)' : 'none',
          gap: 0,
        }}>
          {/* page col */}
          <div style={{ flex: '2.2 0 0', padding: '14px 12px 14px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sk w={60} h={76} r={10} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Sk w="80%" h={13} r={5} />
              <Sk w="55%" h={10} r={4} />
              <Sk w="40%" h={9} r={4} style={{ opacity: .55 }} />
            </div>
          </div>
          {/* type col */}
          <div style={{ flex: '0 0 100px', padding: '14px 12px 14px 0' }}>
            <Sk w={72} h={22} r={6} />
          </div>
          {/* status col */}
          <div style={{ flex: '0 0 90px', padding: '14px 12px 14px 0' }}>
            <Sk w={64} h={22} r={99} />
          </div>
          {/* score col */}
          <div style={{ flex: '0 0 130px', padding: '14px 12px 14px 0' }}>
            <Sk w={48} h={48} r="50%" />
          </div>
          {/* date col */}
          <div style={{ flex: '0 0 140px', padding: '14px 12px 14px 0', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Sk w="70%" h={12} r={5} />
            <Sk w="55%" h={10} r={4} style={{ opacity: .6 }} />
          </div>
          {/* action col */}
          <div style={{ flex: '0 0 36px', padding: '14px 0 14px 0' }}>
            <Sk w={28} h={28} r={7} style={{ opacity: .4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Analytics KPI cards ──────────────────────────────────────────────────────

export function SkKpiGrid({ cols = 4 }: { cols?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
      marginBottom: 24,
    }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          padding: 20,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Sk w="45%" h={10} r={5} mb={10} style={{ opacity: .55 }} />
          <Sk w="60%" h={28} r={7} mb={8} />
          <Sk w="38%" h={10} r={5} />
        </div>
      ))}
    </div>
  )
}

// ─── Chart area ───────────────────────────────────────────────────────────────

export function SkChart({ h = 260 }: { h?: number }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '20px 24px',
      marginBottom: 24,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Sk w={140} h={16} r={6} />
        <Sk w={88} h={28} r={8} style={{ opacity: .6 }} />
      </div>
      <Sk h={h} r={10} style={{ opacity: .7 }} />
    </div>
  )
}

// ─── Phone preview (dark — editor) ────────────────────────────────────────────

export function SkPhonePreview() {
  return (
    <div style={{
      width: 375,
      height: 720,
      borderRadius: 40,
      border: '8px solid #1a1a1f',
      background: '#0a0a0f',
      boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 20px 60px rgba(0,0,0,.2)',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* notch */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 100, height: 24, background: '#1a1a1f',
        borderRadius: '0 0 16px 16px', zIndex: 10,
      }} />
      <div style={{ padding: '44px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Sk h={140} r={12} dark style={{ opacity: .55 }} />
        <Sk h={20} r={6} dark style={{ opacity: .35 }} />
        <Sk w="70%" h={16} r={6} dark style={{ opacity: .25 }} />
        <Sk h={12} r={6} dark style={{ opacity: .2, marginTop: 4 }} />
        <Sk h={46} r={10} dark style={{ opacity: .4, marginTop: 8 }} />
        <Sk h={46} r={10} dark style={{ opacity: .3 }} />
        <Sk h={46} r={10} dark style={{ opacity: .22 }} />
      </div>
    </div>
  )
}

// ─── Template card ────────────────────────────────────────────────────────────

export function SkTemplateCard() {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <Sk h={200} r={0} />
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Sk w="60%" h={15} r={6} />
          <Sk w={44} h={18} r={99} style={{ opacity: .7 }} />
        </div>
        <Sk w="80%" h={12} r={5} style={{ opacity: .7 }} />
        <Sk w="55%" h={12} r={5} style={{ opacity: .5 }} />
        <Sk h={34} r={8} mt={4} />
      </div>
    </div>
  )
}

// ─── Billing plan card ────────────────────────────────────────────────────────

export function SkBillingCard() {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      padding: '28px 24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      <Sk w={64} h={22} r={99} style={{ opacity: .7 }} />
      <Sk w="45%" h={36} r={8} />
      <Sk w="70%" h={12} r={5} style={{ opacity: .6 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sk w={16} h={16} r="50%" style={{ flexShrink: 0, opacity: .5 }} />
            <Sk h={12} r={5} style={{ opacity: .6 }} />
          </div>
        ))}
      </div>
      <Sk h={44} r={10} mt={8} />
    </div>
  )
}

// ─── Settings panel card ──────────────────────────────────────────────────────

export function SkSettingsPanel({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      padding: '24px 26px 28px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <Sk w={40} h={40} r={11} style={{ flexShrink: 0 }} />
        <Sk w={120} h={17} r={6} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Sk w="45%" h={13} r={5} />
            <Sk w={160} h={36} r={9} style={{ opacity: .7 }} />
          </div>
        ))}
      </div>
      <Sk h={36} r={9} mt={16} style={{ opacity: .6 }} />
    </div>
  )
}
