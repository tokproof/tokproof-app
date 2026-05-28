'use client'

import Link from 'next/link'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  if (!open) return null

  return (
    <div
      className="nl-overlay open"
      onClick={e => { if (e.currentTarget === e.target) onClose() }}
    >
      <div className="nl-modal" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: 'center', fontSize: 36, marginBottom: 12 }}>⚡</div>
        <h2 className="nl-modal-title">Límite del Plan Free</h2>
        <p className="nl-modal-sub" style={{ marginBottom: 20 }}>
          Has alcanzado el límite de 1 página publicada en el Plan Free.
          Actualiza a Pro para publicar páginas ilimitadas.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {['∞ Páginas ilimitadas','🧪 A/B Testing','📊 Analytics avanzados','🌐 Dominio propio','🤝 Sin branding Tokproof'].map(f => (
            <span key={f} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.18)', borderRadius: 99, color: 'var(--spurple)' }}>
              {f}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flexShrink: 0 }}>Cancelar</button>
          <Link href="/dashboard/billing" className="btn btn-primary btn-full" onClick={onClose}>
            ⬆ Ver planes Pro →
          </Link>
        </div>
      </div>
    </div>
  )
}
