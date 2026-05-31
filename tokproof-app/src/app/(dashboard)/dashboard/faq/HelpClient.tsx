'use client'

import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, FAQS, RESOURCES } from './data'
import type { Tint, FaqItem, Resource } from './data'

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
  violet:   '#7C3AED',
  grad:     'linear-gradient(90deg,#FB2C7D 0%,#C13BD6 55%,#7C3AED 100%)',
}

const TINT_BG:  Record<Tint, string> = {
  pink:   '#FCE3EE', purple: '#EEE6FB', blue:   '#E5EEFD',
  green:  '#E1F3EA', orange: '#FCEEDD', red:    '#FCE4E4',
}
const TINT_FG:  Record<Tint, string> = {
  pink:   '#EC2C7C', purple: '#8B5CF6', blue:   '#3B82F6',
  green:  '#13A866', orange: '#F0913B', red:    '#EF4444',
}

// ─── Shared icon renderer ─────────────────────────────────────────────────────
function Ico({ path, size = 18, color = 'currentColor' }: { path: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ stroke: color, strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: path }} />
  )
}

function TintBox({ tint, size, radius, children }: {
  tint: Tint; size: number; radius: number; children: React.ReactNode
}) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: TINT_BG[tint], color: TINT_FG[tint],
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </span>
  )
}

// ─── Category card ────────────────────────────────────────────────────────────
function CategoryGrid() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 20,
      padding: '26px 22px', marginTop: 22,
      display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}
      className="help-cat-grid">
      {CATEGORIES.map(cat => (
        <div key={cat.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', cursor: 'pointer', padding: 6 }} className="help-cat-item">
          <div style={{ width: 58, height: 58, borderRadius: 16, background: TINT_BG[cat.tint],
            color: TINT_FG[cat.tint], display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, transition: 'transform .15s' }} className="cat-ico">
            <Ico path={cat.icoPath} size={26} />
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{cat.title}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 5, lineHeight: 1.4 }}>{cat.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ─── FAQ accordion item ───────────────────────────────────────────────────────
function FaqRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [maxH, setMaxH] = useState('0px')

  useEffect(() => {
    if (isOpen && innerRef.current) {
      setMaxH(innerRef.current.scrollHeight + 'px')
    } else {
      setMaxH('0px')
    }
  }, [isOpen])

  return (
    <div style={{
      background: isOpen ? 'linear-gradient(180deg,#FFF6FB,#FFFFFF)' : C.card,
      border: `1px solid ${isOpen ? '#F6CFE2' : C.line}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: isOpen ? '0 8px 24px rgba(220,80,150,.08)' : 'none',
      transition: 'border-color .15s, box-shadow .15s',
    }}>
      {/* Question row */}
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 15,
        padding: '19px 20px', cursor: 'pointer' }}>
        <TintBox tint={item.tint} size={38} radius={11}>
          <Ico path={item.icoPath} size={18} />
        </TintBox>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.ink, flex: 1 }}>{item.q}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          style={{ color: isOpen ? '#E0348F' : C.muted2, flexShrink: 0, transition: 'transform .2s',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {/* Answer */}
      <div style={{ maxHeight: maxH, overflow: 'hidden', transition: 'max-height .25s ease' }}>
        <div ref={innerRef} style={{ padding: '0 20px 20px 73px', fontSize: 14,
          lineHeight: 1.6, color: C.ink2 }}>
          {item.a}
        </div>
      </div>
    </div>
  )
}

// ─── Right column cards ───────────────────────────────────────────────────────
function SupportCard() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18,
      padding: 22, marginBottom: 20, textAlign: 'center' }}>
      <div style={{ width: 62, height: 62, borderRadius: '50%',
        background: 'linear-gradient(150deg,#C13BD6,#7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', boxShadow: '0 12px 24px rgba(124,58,237,.32)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14v-2a8 8 0 0 1 16 0v2"/>
          <path d="M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2z"/>
          <path d="M20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2z"/>
          <path d="M18 16v1a3 3 0 0 1-3 3h-3"/>
        </svg>
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.01em', lineHeight: 1.3, color: C.ink }}>
        ¿No encuentras tu respuesta?
      </h3>
      <p style={{ fontSize: 13.5, color: C.muted, marginTop: 10, lineHeight: 1.55 }}>
        Nuestro equipo suele responder en menos de 24 horas.
      </p>
      <button style={{ marginTop: 18, width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 9, border: 'none', borderRadius: 13, padding: 13,
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
        background: 'linear-gradient(90deg,#F62E8E,#C13BD6)',
        boxShadow: '0 10px 22px rgba(220,60,160,.28)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2.5"/>
          <polyline points="3 7 12 13 21 7"/>
        </svg>
        Contactar soporte
      </button>
    </div>
  )
}

function ResourcesCard() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18,
      padding: 22, marginBottom: 20 }}>
      <h4 style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
        Recursos útiles
      </h4>
      {RESOURCES.map((r: Resource, i) => (
        <div key={r.title} style={{ display: 'flex', alignItems: 'center', gap: 13,
          padding: '13px 0',
          borderBottom: i < RESOURCES.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
          cursor: 'pointer' }}>
          <TintBox tint={r.tint} size={34} radius={10}>
            <Ico path={r.icoPath} size={17} />
          </TintBox>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{r.title}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{r.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NewUserCard() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 22 }}>
      <span style={{ fontSize: 22, color: '#C13BD6' }}>✦</span>
      <h4 style={{ marginTop: 12, fontSize: 15.5, fontWeight: 800, letterSpacing: '-.01em', color: C.ink }}>
        ¿Eres nuevo en Tokproof?
      </h4>
      <p style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.55 }}>
        Sigue nuestra guía rápida y crea tu primera página en menos de 5 minutos.
      </p>
      <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 9, marginTop: 16, width: '100%', background: '#F6F1FD',
        border: '1px solid #E8DEFA', color: C.violet, borderRadius: 11, padding: 11,
        fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        Ver guía rápida
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>
        </svg>
      </button>
    </div>
  )
}

// ─── Bottom banner ────────────────────────────────────────────────────────────
function HelpBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18,
      background: 'linear-gradient(90deg,#FCEAF3,#F7ECFB)',
      border: '1px solid #F4DEEC', borderRadius: 18, padding: '20px 24px', marginTop: 14 }}>
      <span style={{ width: 44, height: 44, borderRadius: 13, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        fontSize: 20, color: '#C13BD6', boxShadow: '0 6px 14px rgba(200,90,160,.14)' }}>
        ✦
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>¿Tienes alguna otra duda?</div>
        <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 3 }}>
          Estamos aquí para ayudarte a sacarle el máximo a Tokproof.
        </div>
      </div>
      <button style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 9,
        border: 'none', borderRadius: 13, padding: '13px 20px',
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
        background: 'linear-gradient(90deg,#F62E8E,#C13BD6)',
        boxShadow: '0 10px 22px rgba(220,60,160,.28)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2.5"/>
          <polyline points="3 7 12 13 21 7"/>
        </svg>
        Contactar soporte
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function HelpClient() {
  const [query,   setQuery]   = useState('')
  const [openIdx, setOpenIdx] = useState<number>(0) // first item open by default

  const filtered = FAQS.filter(f =>
    !query ||
    f.q.toLowerCase().includes(query.toLowerCase()) ||
    f.a.toLowerCase().includes(query.toLowerCase())
  )

  function handleSearch(value: string) {
    setQuery(value)
    setOpenIdx(-1) // close all when searching
  }

  function toggle(i: number) {
    setOpenIdx(prev => prev === i ? -1 : i)
  }

  return (
    <div style={{ padding: '40px 44px 36px', maxWidth: 1230,
      background: C.bg, minHeight: '100vh',
      fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', color: C.ink }}>
        Centro de{' '}
        <span style={{
          background: 'linear-gradient(90deg,#C13BD6,#FB2C7D)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>ayuda</span>
      </div>
      <div style={{ color: C.muted, fontSize: 15, marginTop: 9 }}>
        Todo lo que necesitas para crear, publicar y optimizar tus páginas.
      </div>

      {/* ── Search ── */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 13, background: C.card,
        border: `1px solid ${C.line}`, borderRadius: 16, padding: '17px 20px', marginTop: 26,
        cursor: 'text' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted2}
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
        </svg>
        <input
          type="text"
          placeholder="Buscar pregunta..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 15,
            color: C.ink, width: '100%', background: 'none' }} />
      </label>

      {/* ── Categories ── */}
      <CategoryGrid />

      {/* ── FAQ title ── */}
      <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.02em',
        margin: '36px 0 20px', color: C.ink }}>
        Preguntas frecuentes
      </div>

      {/* ── Two-column lower section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 26, alignItems: 'start' }}
        className="help-lower-grid">

        {/* Left: FAQ accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16,
              padding: '32px 24px', textAlign: 'center', color: C.muted, fontSize: 14 }}>
              No encontramos resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, i) => (
              <FaqRow key={item.q} item={item} isOpen={openIdx === i} onToggle={() => toggle(i)} />
            ))
          )}
        </div>

        {/* Right: sticky sidebar */}
        <div style={{ position: 'sticky', top: 24 }}>
          <SupportCard />
          <ResourcesCard />
          <NewUserCard />
        </div>
      </div>

      {/* ── Bottom banner ── */}
      <HelpBanner />
    </div>
  )
}
