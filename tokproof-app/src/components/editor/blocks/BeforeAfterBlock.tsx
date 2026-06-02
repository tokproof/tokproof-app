'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { LandingBlock, LandingTheme, BeforeAfterData } from '@/types/landing'

const DEFAULT_DATA: BeforeAfterData = {
  title: 'Resultados que puedes ver',
  subtitle: 'Mira la diferencia real después de usar nuestro producto.',
  badgeText: 'Transformación real',
  mode: 'cards',
  beforeImageUrl: '',
  afterImageUrl: '',
  beforeLabel: 'Antes',
  afterLabel: 'Después',
  beforeDescription: 'Cabello seco, sin brillo y con frizz.',
  afterDescription: 'Cabello hidratado, brillante y saludable.',
  showBadge: true,
  showSubtitle: true,
  showDescriptions: true,
  showCTA: false,
  buttonText: 'Ver producto',
  buttonUrl: '',
  borderRadius: 'soft',
  shadowIntensity: 'soft',
}

const SHADOW_MAP: Record<string, string> = {
  none:   'none',
  soft:   '0 2px 12px rgba(0,0,0,0.10)',
  medium: '0 6px 24px rgba(0,0,0,0.18)',
}

const RADIUS_MAP: Record<string, number> = {
  square: 0, soft: 8, medium: 14, round: 20,
}

function resolveColors(d: BeforeAfterData, theme: LandingTheme) {
  const c = d.colors ?? {}
  const accent = theme.primaryColor ?? '#F647A9'
  return {
    bg:          c.backgroundColor       ?? theme.backgroundColor ?? '#ffffff',
    cardBg:      c.cardBackgroundColor   ?? (theme.cardBackgroundColor ?? '#f9fafb'),
    title:       c.titleColor            ?? theme.textColor ?? '#111111',
    subtitle:    c.subtitleColor         ?? (theme.secondaryTextColor ?? '#6b7280'),
    badgeBg:     c.badgeBackgroundColor  ?? `${accent}20`,
    badgeText:   c.badgeTextColor        ?? accent,
    labelBefore: c.labelBeforeBackground ?? '#ef4444',
    labelAfter:  c.labelAfterBackground  ?? accent,
    labelText:   c.labelTextColor        ?? '#ffffff',
    btnBg:       c.buttonBackgroundColor ?? (theme.buttonColor ?? accent),
    btnText:     c.buttonTextColor       ?? (theme.buttonTextColor ?? '#ffffff'),
  }
}

type C = ReturnType<typeof resolveColors>

function ImgPlaceholder({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: `${color}14` }}>
      <span style={{ fontSize: 30 }}>🖼️</span>
      <span style={{ fontSize: 11, fontWeight: 600, color, opacity: 0.7 }}>{label}</span>
    </div>
  )
}

function CardsView({ d, C, shadow, radius }: { d: BeforeAfterData; C: C; shadow: string; radius: number }) {
  const cards = [
    { imageUrl: d.beforeImageUrl, label: d.beforeLabel, desc: d.beforeDescription, labelBg: C.labelBefore },
    { imageUrl: d.afterImageUrl,  label: d.afterLabel,  desc: d.afterDescription,  labelBg: C.labelAfter  },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {cards.map(({ imageUrl, label, desc, labelBg }) => (
        <div key={label} style={{ borderRadius: radius, background: C.cardBg, boxShadow: shadow, overflow: 'hidden' }}>
          <div style={{ position: 'relative', paddingBottom: '100%', background: '#e5e7eb' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              {imageUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={imageUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <ImgPlaceholder label={label} color={labelBg} />
              }
            </div>
            <span style={{
              position: 'absolute', top: 8, left: 8, padding: '3px 10px', borderRadius: 999,
              background: labelBg, color: C.labelText, fontSize: 11, fontWeight: 700,
            }}>
              {label}
            </span>
          </div>
          {d.showDescriptions && desc && (
            <div style={{ padding: '10px 12px', fontSize: 12.5, color: C.subtitle, lineHeight: 1.45 }}>
              {desc}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function SliderView({ d, C, radius }: { d: BeforeAfterData; C: C; radius: number }) {
  const [pos, setPos] = useState(50)
  const containerRef  = useRef<HTMLDivElement>(null)
  const isDragging    = useRef(false)

  const update = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  const onMouseMove = useCallback((e: MouseEvent) => { if (isDragging.current) update(e.clientX) }, [update])
  const onMouseUp   = useCallback(() => { isDragging.current = false }, [])
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !e.touches[0]) return
    e.preventDefault()
    update(e.touches[0].clientX)
  }, [update])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [onMouseMove, onMouseUp, onTouchMove])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', borderRadius: radius, overflow: 'hidden',
        aspectRatio: '4/3', userSelect: 'none', cursor: 'ew-resize',
        background: '#e5e7eb', touchAction: 'pan-y',
      }}
      onMouseDown={e => { isDragging.current = true; update(e.clientX) }}
      onTouchStart={e => { isDragging.current = true; if (e.touches[0]) update(e.touches[0].clientX) }}
    >
      {/* After (bottom layer — full) */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {d.afterImageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={d.afterImageUrl} alt={d.afterLabel} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <ImgPlaceholder label={d.afterLabel} color={C.labelAfter} />
        }
      </div>

      {/* Before (clipped left side) */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {d.beforeImageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={d.beforeImageUrl} alt={d.beforeLabel} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ position: 'absolute', inset: 0 }}><ImgPlaceholder label={d.beforeLabel} color={C.labelBefore} /></div>
        }
      </div>

      {/* Divider line */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: `${pos}%`,
        transform: 'translateX(-50%)', width: 2,
        background: 'rgba(255,255,255,0.9)', pointerEvents: 'none',
      }} />

      {/* Handle */}
      <div style={{
        position: 'absolute', top: '50%', left: `${pos}%`,
        transform: 'translate(-50%, -50%)',
        width: 40, height: 40, borderRadius: '50%',
        background: '#ffffff', boxShadow: '0 2px 14px rgba(0,0,0,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 9, color: '#374151', lineHeight: 1 }}>◀</span>
        <span style={{ fontSize: 9, color: '#374151', lineHeight: 1 }}>▶</span>
      </div>

      {/* Labels */}
      <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 999, background: C.labelBefore, color: C.labelText, fontSize: 11, fontWeight: 700, pointerEvents: 'none' }}>
        {d.beforeLabel}
      </span>
      <span style={{ position: 'absolute', top: 10, right: 10, padding: '3px 10px', borderRadius: 999, background: C.labelAfter, color: C.labelText, fontSize: 11, fontWeight: 700, pointerEvents: 'none' }}>
        {d.afterLabel}
      </span>
    </div>
  )
}

export default function BeforeAfterBlock({ block, theme }: { block: LandingBlock; theme: LandingTheme }) {
  const raw = block.data as Partial<BeforeAfterData>
  const d: BeforeAfterData = { ...DEFAULT_DATA, ...raw }
  const C      = resolveColors(d, theme)
  const shadow = SHADOW_MAP[d.shadowIntensity ?? 'soft']
  const radius = RADIUS_MAP[d.borderRadius ?? 'soft']

  return (
    <div style={{ background: C.bg, padding: '28px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {d.showBadge && d.badgeText && (
          <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 999, background: C.badgeBg, color: C.badgeText, fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
            {d.badgeText}
          </div>
        )}
        {d.title && (
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.title, lineHeight: 1.2 }}>
            {d.title}
          </h2>
        )}
        {d.showSubtitle && d.subtitle && (
          <p style={{ margin: '6px 0 0', fontSize: 13, color: C.subtitle, lineHeight: 1.4 }}>
            {d.subtitle}
          </p>
        )}
      </div>

      {/* Cards or Slider */}
      {d.mode === 'cards'
        ? <CardsView d={d} C={C} shadow={shadow} radius={radius} />
        : <SliderView d={d} C={C} radius={radius} />
      }

      {/* CTA */}
      {d.showCTA && d.buttonText && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a
            href={d.buttonUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '12px 28px',
              borderRadius: radius || 10, background: C.btnBg, color: C.btnText,
              fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: shadow,
            }}
          >
            {d.buttonText}
          </a>
        </div>
      )}
    </div>
  )
}
