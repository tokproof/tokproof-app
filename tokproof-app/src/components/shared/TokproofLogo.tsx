const SIZE_PX = { xs: 20, sm: 28, md: 44, lg: 56 } as const

interface TokproofLogoProps {
  size?: keyof typeof SIZE_PX
  showText?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function TokproofLogo({
  size = 'sm',
  showText = false,
  className,
  style,
}: TokproofLogoProps) {
  const px = SIZE_PX[size]
  const textSize = { xs: 12, sm: 14, md: 18, lg: 24 }[size]

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/tokproof-isotipo.png"
        alt="Tokproof"
        width={px}
        height={px}
        style={{ width: px, height: px, objectFit: 'contain', display: 'block', flexShrink: 0 }}
      />
      {showText && (
        <span style={{ fontWeight: 800, fontSize: textSize, letterSpacing: '-0.02em', lineHeight: 1 }}>
          Tokproof
        </span>
      )}
    </span>
  )
}
