import type { LandingBlock, LandingTheme, LinkListData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function LinkListBlock({ block, theme }: Props) {
  const d  = block.data as unknown as LinkListData
  const rs = resolveBlockStyle(block, theme)

  return (
    <div style={{ background: rs.bg, padding: rs.pad, color: rs.text, fontFamily: rs.fontFamily }}>
      {d.title && (
        <h2 style={{ fontSize: rs.h2, fontWeight: 800, marginBottom: rs.gap + 4, color: rs.text, textAlign: rs.align }}>{d.title}</h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: rs.gap }}>
        {(d.links ?? []).filter(l => l.visible !== false).map((link, i) => (
          <div key={link.id ?? i} style={{
            padding: '12px 16px', borderRadius: rs.btnR,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: rs.body + 1, fontWeight: 600, color: rs.text,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>{link.label || 'Enlace'}</span>
            <span style={{ fontSize: 16, opacity: .6 }}>→</span>
          </div>
        ))}
        {(d.links ?? []).length === 0 && (
          <div style={{ padding: '12px 16px', borderRadius: rs.cardR, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)', fontSize: rs.body, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
            Añade enlaces en el editor
          </div>
        )}
      </div>
    </div>
  )
}
