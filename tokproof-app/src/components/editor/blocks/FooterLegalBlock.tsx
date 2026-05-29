import type { LandingBlock, LandingTheme, FooterLegalData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function FooterLegalBlock({ block, theme }: Props) {
  const d  = block.data as unknown as FooterLegalData
  const rs = resolveBlockStyle(block, theme)

  return (
    <div style={{ background: rs.bg, padding: '16px 18px 28px', fontFamily: rs.fontFamily, textAlign: 'center' }}>
      {d.brandName && (
        <div style={{ fontSize: rs.body, fontWeight: 700, color: rs.text, marginBottom: 10 }}>
          {d.brandName}
        </div>
      )}

      {/* Legal links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
        {d.privacyUrl && (
          <a href={d.privacyUrl} style={{ fontSize: rs.sub, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            Privacidad
          </a>
        )}
        {d.termsUrl && (
          <a href={d.termsUrl} style={{ fontSize: rs.sub, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            Términos
          </a>
        )}
        {d.contactEmail && (
          <a href={`mailto:${d.contactEmail}`} style={{ fontSize: rs.sub, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            Contacto
          </a>
        )}
      </div>

      {d.legalText && (
        <p style={{ fontSize: rs.sub - 1, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5, maxWidth: 320, margin: '0 auto 10px' }}>
          {d.legalText}
        </p>
      )}

      {d.showTokproofBranding && (
        <div style={{ fontSize: rs.sub, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>
          Powered by <span style={{ fontWeight: 700 }}>Tokproof</span>
        </div>
      )}
    </div>
  )
}
