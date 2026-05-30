'use client'

import Link from 'next/link'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  /** Bullet features shown in the upgrade pitch */
  features?: string[]
}

const DEFAULT_FEATURES = [
  '∞ Páginas y Exits ilimitados',
  '📊 Analytics avanzados',
  '🎨 Sin branding Tokproof',
  '🏷️ Bloques y templates premium',
  '🌐 Dominio personalizado',
]

export default function PlanLimitModal({
  open, onClose,
  title = 'Límite del Plan Free',
  description = 'Actualiza a Pro para eliminar todos los límites.',
  features = DEFAULT_FEATURES,
}: Props) {
  if (!open) return null

  return (
    <div
      className="nl-overlay open"
      onClick={e => { if (e.currentTarget === e.target) onClose() }}
    >
      <div className="nl-modal" style={{ maxWidth: 420, textAlign: 'center' }}>
        {/* Gradient icon */}
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg,#F647A9,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>
          ⚡
        </div>

        <h2 className="nl-modal-title">{title}</h2>
        <p className="nl-modal-sub" style={{ marginBottom: 18 }}>{description}</p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 22 }}>
          {features.map(f => (
            <span key={f} style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.18)', borderRadius: 99, color: 'var(--spurple)' }}>
              {f}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flexShrink: 0 }}>
            Ahora no
          </button>
          <Link href="/dashboard/billing" className="btn btn-primary btn-full" onClick={onClose}>
            ⬆ Ver planes Pro →
          </Link>
        </div>
      </div>
    </div>
  )
}
