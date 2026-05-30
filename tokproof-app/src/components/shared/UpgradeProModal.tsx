'use client'

import { useRouter } from 'next/navigation'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
}

// Feature items — icon, label, gradient color
const FEATURES = [
  { emoji: '∞',  label: 'Páginas y Exits ilimitados', from: '#F647A9', to: '#EC4899' },
  { emoji: '📊', label: 'Analytics avanzados',         from: '#7B61FF', to: '#9333EA' },
  { emoji: '🛡️', label: 'Sin branding Tokproof',       from: '#F647A9', to: '#EC4899' },
  { emoji: '👑', label: 'Bloques y templates premium', from: '#7B61FF', to: '#9333EA' },
  { emoji: '🌐', label: 'Dominio personalizado',        from: '#7B61FF', to: '#F647A9' },
]

export default function UpgradeProModal({
  open, onClose,
  title = 'Desbloquea Tokproof Pro',
  description = 'Obtén acceso a todas las funciones premium y elimina los límites de tu plan actual.',
}: Props) {
  const router = useRouter()
  if (!open) return null

  function goToBilling() { onClose(); router.push('/dashboard/billing') }

  return (
    <>
      <style>{`
        @keyframes upgFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes upgSlideUp { from { opacity:0; transform:translateY(20px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>

      {/* Overlay */}
      <div
        onClick={e => { if (e.currentTarget === e.target) onClose() }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9500,
          background: 'rgba(8,6,20,.72)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          animation: 'upgFadeIn .18s ease',
        }}
      >
        {/* Modal card */}
        <div style={{
          position: 'relative',
          background: '#ffffff',
          borderRadius: 28,
          padding: '40px 36px 32px',
          width: '100%', maxWidth: 500,
          boxShadow: '0 32px 80px rgba(0,0,0,.28), 0 2px 8px rgba(0,0,0,.12)',
          animation: 'upgSlideUp .22s cubic-bezier(.22,.68,0,1.2)',
          textAlign: 'center',
          fontFamily: 'Inter,system-ui,sans-serif',
        }}>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 34, height: 34, borderRadius: '50%',
              border: '1.5px solid #E4E7F0', background: '#fff',
              cursor: 'pointer', display: 'grid', placeItems: 'center',
              color: '#9CA3AF', fontSize: 16, lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Gradient icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #F647A9 0%, #7B61FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 12px 32px rgba(246,71,169,.35)',
            fontSize: 28,
          }}>
            ⚡
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 10px', letterSpacing: '-.02em' }}>
            {title}
          </h2>

          {/* Description */}
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
            {description}
          </p>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {FEATURES.slice(0, 4).map(f => (
              <FeatureChip key={f.label} {...f} />
            ))}
          </div>
          {/* 5th item centered */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <FeatureChip {...FEATURES[4]} style={{ flex: '0 1 calc(50% - 5px)' }} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, height: 52, borderRadius: 14,
                border: '1.5px solid #E4E7F0', background: '#fff',
                color: '#374151', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background .12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
            >
              Ahora no
            </button>
            <button
              onClick={goToBilling}
              style={{
                flex: 1.6, height: 52, borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #F647A9 0%, #7B61FF 100%)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 8px 24px rgba(246,71,169,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'filter .12s, transform .12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.05)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
            >
              <span>⬆</span> Ver planes Pro <span>→</span>
            </button>
          </div>

          {/* No card needed */}
          <div style={{ marginTop: 14, fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <span>🔒</span> No necesitas tarjeta de crédito ahora mismo
          </div>

        </div>
      </div>
    </>
  )
}

// ─── Feature chip ─────────────────────────────────────────────────────────────
function FeatureChip({ emoji, label, from, to, style }: {
  emoji: string; label: string; from: string; to: string
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: 'rgba(123,97,255,.05)',
      border: '1px solid rgba(123,97,255,.14)',
      borderRadius: 12,
      textAlign: 'left',
      ...style,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15,
      }}>
        {emoji}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  )
}
