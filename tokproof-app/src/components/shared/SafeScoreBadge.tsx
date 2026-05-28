interface SafeScoreBadgeProps {
  score: number
  showTip?: boolean
}

export default function SafeScoreBadge({ score, showTip = true }: SafeScoreBadgeProps) {
  const cls =
    score >= 80 ? 'lc-safe-green'
    : score >= 50 ? 'lc-safe-yellow'
    : 'lc-safe-red'

  return (
    <div className={`lc-safe-pill ${cls}`}>
      🛡 {score}
      {showTip && (
        <div className="lc-safe-tip">
          <div style={{ fontWeight: 800, color: 'var(--text)', marginBottom: 5 }}>
            Safe Link Score · {score}/100
          </div>
          <div className={`lc-tip-row ${score >= 80 ? 'lc-tip-ok' : 'lc-tip-warn'}`}>
            {score >= 80
              ? '✓ Página verificada'
              : score >= 50
              ? '· Mejorable — revisa el editor'
              : '✕ Requiere atención'}
          </div>
        </div>
      )}
    </div>
  )
}
