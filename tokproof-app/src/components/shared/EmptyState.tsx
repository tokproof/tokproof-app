'use client'

interface Action {
  label: string
  onClick: () => void
  variant?: 'primary' | 'ghost'
}

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  primaryAction?: Action
  secondaryAction?: Action
  compact?: boolean
}

export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  const py = compact ? '32px' : '56px'
  const px = compact ? '20px' : '32px'
  const iconSize = compact ? 48 : 72
  const iconInner = compact ? 28 : 40
  const titleSize = compact ? 15 : 18
  const descSize = compact ? 13 : 14

  return (
    <>
      <style>{`
        @keyframes es-fade-in {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .es-root { animation: es-fade-in .22s cubic-bezier(.25,0,0,1); }
        .es-primary-btn:hover  { filter: brightness(1.06); transform: translateY(-1px) scale(1.01); }
        .es-primary-btn:active { transform: scale(0.98) !important; }
        .es-ghost-btn:hover    { background: rgba(123,97,255,.08) !important; border-color: rgba(123,97,255,.22) !important; }
        .es-ghost-btn:active   { transform: scale(0.98) !important; }
      `}</style>

      <div
        className="es-root"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: `${py} ${px}`,
          background: 'linear-gradient(135deg, rgba(246,71,169,.03) 0%, rgba(123,97,255,.04) 100%)',
          border: '1px solid rgba(123,97,255,.1)',
          borderRadius: 20,
          gap: 0,
        }}
      >
        {/* Icon circle */}
        <div style={{
          width: iconSize,
          height: iconSize,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(246,71,169,.1), rgba(123,97,255,.12))',
          border: '1.5px solid rgba(123,97,255,.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: compact ? 14 : 20,
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(123,97,255,.1)',
        }}>
          <span style={{ fontSize: iconInner, lineHeight: 1 }}>{icon}</span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: titleSize,
          fontWeight: 800,
          color: '#111827',
          letterSpacing: '-.02em',
          lineHeight: 1.25,
          marginBottom: description ? (compact ? 6 : 10) : (primaryAction ? 20 : 0),
          maxWidth: 320,
        }}>
          {title}
        </div>

        {/* Description */}
        {description && (
          <p style={{
            fontSize: descSize,
            color: '#6B7280',
            lineHeight: 1.65,
            margin: 0,
            maxWidth: 340,
            marginBottom: primaryAction ? (compact ? 16 : 24) : 0,
          }}>
            {description}
          </p>
        )}

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div style={{
            display: 'flex',
            flexDirection: compact ? 'row' : 'column',
            alignItems: 'center',
            gap: compact ? 8 : 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="es-primary-btn"
                style={{
                  padding: compact ? '8px 18px' : '11px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #F647A9, #7B61FF)',
                  color: '#fff',
                  fontSize: compact ? 13 : 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(246,71,169,.28)',
                  transition: 'transform .18s cubic-bezier(.25,0,0,1), filter .18s cubic-bezier(.25,0,0,1)',
                  whiteSpace: 'nowrap',
                }}
              >
                {primaryAction.label}
              </button>
            )}
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="es-ghost-btn"
                style={{
                  padding: compact ? '7px 16px' : '10px 22px',
                  borderRadius: 12,
                  border: '1.5px solid rgba(123,97,255,.18)',
                  background: 'transparent',
                  color: '#7B61FF',
                  fontSize: compact ? 12.5 : 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background .18s cubic-bezier(.25,0,0,1), border-color .18s cubic-bezier(.25,0,0,1), transform .18s cubic-bezier(.25,0,0,1)',
                  whiteSpace: 'nowrap',
                }}
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
