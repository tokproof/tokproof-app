import type { LandingBlock, LandingTheme, CTAData } from '@/types/landing'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function CTABlock({ block, theme }: Props) {
  const d = block.data as unknown as CTAData
  const grad = `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`

  const btnStyle: React.CSSProperties =
    d.style === 'gradient'
      ? { background: grad, color: '#fff', border: 'none', boxShadow: `0 10px 28px ${theme.primaryColor}44` }
      : d.style === 'outline'
      ? { background: 'transparent', color: theme.primaryColor, border: `2px solid ${theme.primaryColor}` }
      : { background: theme.primaryColor, color: '#fff', border: 'none' }

  return (
    <div style={{ background: theme.backgroundColor, padding: '20px 18px 28px', textAlign: 'center' }}>
      <button style={{
        width: '100%', padding: '14px 20px', borderRadius: 14,
        fontSize: 14, fontWeight: 800, cursor: 'pointer',
        letterSpacing: '-0.01em', lineHeight: 1.3,
        ...btnStyle,
      }}>
        {d.text || '🛒 Comprar ahora'}
      </button>
      {d.subtext && (
        <p style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
          {d.subtext}
        </p>
      )}
    </div>
  )
}
