'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  username: string | null
}

type EcomType = 'trust_page' | 'simple_page'

// ─── Phone mockup — Trust / Landing page ─────────────────────────────────────
function TrustPhoneMockup() {
  return (
    <div style={{
      width: 108, height: 190, borderRadius: 16, background: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,.18)', border: '5px solid #1a1a1a',
      overflow: 'hidden', flexShrink: 0, position: 'relative',
    }}>
      {/* Notch */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 7, background: '#1a1a1a', borderRadius: '0 0 8px 8px', zIndex: 2 }} />
      {/* Hero gradient */}
      <div style={{ height: 68, background: 'linear-gradient(160deg,#FFD6F0 0%,#F0D6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
        <div style={{ width: 34, height: 44, borderRadius: 8, background: 'linear-gradient(135deg,rgba(246,71,169,.3),rgba(123,97,255,.3))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 22, height: 28, borderRadius: 5, background: 'linear-gradient(135deg,#F647A9,#7B61FF)', opacity: .7 }} />
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: '7px 8px', background: '#fff' }}>
        {/* Stars */}
        <div style={{ display: 'flex', gap: 1, marginBottom: 4 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: 1, background: '#FBBF24' }} />
          ))}
        </div>
        {/* Title lines */}
        <div style={{ height: 5, borderRadius: 2, background: '#1a1a1a', marginBottom: 3, width: '80%' }} />
        <div style={{ height: 4, borderRadius: 2, background: '#E4E7F0', marginBottom: 6, width: '60%' }} />
        {/* Divider */}
        <div style={{ height: 1, background: '#F3F4F6', marginBottom: 6 }} />
        {/* Feature rows */}
        {[80, 65, 72].map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg,#F647A9,#7B61FF)', flexShrink: 0 }} />
            <div style={{ height: 3.5, borderRadius: 2, background: '#E4E7F0', width: `${w}%` }} />
          </div>
        ))}
        {/* CTA button */}
        <div style={{ height: 16, borderRadius: 6, background: 'linear-gradient(135deg,#F647A9,#7B61FF)', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.8)' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Phone mockup — Links / Bio page ─────────────────────────────────────────
function LinksPhoneMockup() {
  return (
    <div style={{
      width: 108, height: 190, borderRadius: 16, background: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,.18)', border: '5px solid #1a1a1a',
      overflow: 'hidden', flexShrink: 0, position: 'relative',
    }}>
      {/* Notch */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 7, background: '#1a1a1a', borderRadius: '0 0 8px 8px', zIndex: 2 }} />
      {/* Header gradient */}
      <div style={{ height: 52, background: 'linear-gradient(160deg,#6D28D9 0%,#EC4899 100%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 0, paddingTop: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #fff', background: 'linear-gradient(135deg,#F472B6,#A78BFA)', marginBottom: -16 }} />
      </div>
      <div style={{ background: '#F9FAFB', flex: 1, padding: '22px 8px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {/* Username */}
        <div style={{ height: 4, borderRadius: 2, background: '#374151', width: '50%', margin: '0 auto 6px' }} />
        {/* Link buttons */}
        {['#7B61FF', '#F647A9', '#7B61FF', '#EC4899'].map((color, i) => (
          <div key={i} style={{ height: 18, borderRadius: 6, background: '#fff', border: `1.5px solid ${color}22`, display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <div style={{ height: 3, borderRadius: 2, background: '#E4E7F0', width: `${55 + i * 8}%` }} />
          </div>
        ))}
        {/* Social row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 4 }}>
          {['#E4E7F0', '#E4E7F0', '#E4E7F0'].map((bg, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: bg }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Bullet ───────────────────────────────────────────────────────────────────
function Bullet({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        background: 'linear-gradient(135deg,#F647A9,#7B61FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.2 5.8L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.45 }}>{text}</span>
    </div>
  )
}

// ─── Page type card ───────────────────────────────────────────────────────────
function TypeCard({
  selected, onClick, title, badge, desc, bullets, mockup,
}: {
  selected: boolean
  onClick: () => void
  title: string
  badge?: string
  desc: string
  bullets: string[]
  mockup: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, borderRadius: 16, padding: '18px 16px 18px 20px',
        cursor: 'pointer', transition: 'all .18s',
        border: selected ? '2px solid transparent' : '2px solid #E4E7F0',
        background: selected
          ? 'linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg,#F647A9,#7B61FF) border-box'
          : '#FAFAFA',
        boxShadow: selected ? '0 4px 24px rgba(246,71,169,.18)' : '0 1px 4px rgba(15,23,42,.04)',
        display: 'flex', gap: 14, alignItems: 'flex-start',
        minWidth: 0,
      }}
    >
      {/* Left — text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#111827', letterSpacing: '-.02em' }}>{title}</span>
          {badge && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
              background: 'linear-gradient(135deg,#F647A9,#7B61FF)', color: '#fff',
              letterSpacing: '.02em', flexShrink: 0,
            }}>{badge}</span>
          )}
        </div>
        {/* Description */}
        <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.55, marginBottom: 12 }}>{desc}</p>
        {/* Bullets */}
        <div>{bullets.map(b => <Bullet key={b} text={b} />)}</div>
      </div>
      {/* Right — phone mockup */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {mockup}
      </div>
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function CreateEcommerceModal({ open, onClose, userId, username }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<EcomType>('trust_page')
  const [creating, setCreating] = useState(false)

  if (!open) return null

  async function handleCreate() {
    setCreating(true)
    const supabase = createClient()
    const title = selected === 'trust_page' ? 'Nueva Página de Confianza' : 'Nueva Página de Links'
    const legacyType = selected === 'trust_page' ? 'trust' : 'simple'

    const { data: page } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        username,
        type: legacyType,
        status: 'draft',
        title,
        settings: {
          _category: 'ecommerce',
          _pageType: selected,
        },
      })
      .select()
      .single()

    onClose()
    if (page?.id) router.push(`/dashboard/editor/${page.id}`)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(10,10,20,.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => { if (e.currentTarget === e.target) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 22, padding: '28px 28px 24px',
        width: '100%', maxWidth: 740,
        boxShadow: '0 32px 80px rgba(10,10,30,.22), 0 2px 8px rgba(10,10,30,.08)',
        animation: 'cmSlideUp .2s ease',
      }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            {/* Title with sparkle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg,#F647A9,#7B61FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L9.2 6.4L14.4 7L9.2 7.6L8 13L6.8 7.6L1.6 7L6.8 6.4L8 1Z" fill="white" />
                </svg>
              </div>
              <h2 style={{ fontSize: 21, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-.03em' }}>
                Crear nueva página
              </h2>
            </div>
            {/* Subtitle */}
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
              Elige el formato que mejor se adapta a tu objetivo. Todas las páginas incluyen nuestra{' '}
              <span style={{
                fontWeight: 700,
                background: 'linear-gradient(135deg,#F647A9,#7B61FF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                guía para abrir en navegador
              </span>
              {' '}desde TikTok.
            </p>
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid #E4E7F0', background: '#F9FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', flexShrink: 0, marginLeft: 16, marginTop: 2 }}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Cards ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <TypeCard
            selected={selected === 'trust_page'}
            onClick={() => setSelected('trust_page')}
            title="Página de Confianza"
            badge="Recomendada"
            desc="Crea una mini landing completa y optimizada para generar confianza, mostrar tu producto y convertir más."
            bullets={[
              'Diseño completo y personalizable',
              'Secciones de producto, reseñas, FAQ y más',
              'Ideal para TikTok Shop y productos físicos',
              'Incluye guía para abrir en navegador',
            ]}
            mockup={<TrustPhoneMockup />}
          />
          <TypeCard
            selected={selected === 'simple_page'}
            onClick={() => setSelected('simple_page')}
            title="Página de Links"
            desc="Crea una página simple con enlaces directos para enviar tráfico rápidamente a tu web o redes sociales."
            bullets={[
              'Enlaces ilimitados',
              'Diseño limpio y rápido',
              'Ideal para creadores y marcas',
              'Incluye guía para abrir en navegador',
            ]}
            mockup={<LinksPhoneMockup />}
          />
        </div>

        {/* ── Buttons ── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '11px 20px', borderRadius: 12, border: '1.5px solid #E4E7F0',
              background: '#fff', color: '#6B7280', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit',
              transition: 'all .15s',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              flex: 1, padding: '11px 24px', borderRadius: 12, border: 'none',
              background: creating ? '#D1D5DB' : 'linear-gradient(135deg,#F647A9 0%,#7B61FF 100%)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: creating ? 'not-allowed' : 'pointer',
              boxShadow: creating ? 'none' : '0 6px 20px rgba(246,71,169,.35)',
              fontFamily: 'inherit', letterSpacing: '-.01em',
              transition: 'all .15s',
            }}
          >
            {creating ? 'Creando...' : 'Crear página →'}
          </button>
        </div>

        {/* ── Footer note ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 7, marginTop: 14,
          fontSize: 11.5, color: '#9CA3AF', fontWeight: 500,
        }}>
          <span style={{ fontSize: 13 }}>🛡️</span>
          <span>
            Todas las páginas incluyen nuestra{' '}
            <span style={{
              fontWeight: 700,
              background: 'linear-gradient(135deg,#F647A9,#7B61FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              guía para abrir en navegador
            </span>
            {' '}desde TikTok.
          </span>
        </div>

      </div>
    </div>
  )
}
