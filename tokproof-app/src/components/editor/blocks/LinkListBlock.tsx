import type { LandingBlock, LandingTheme, LinkListData } from '@/types/landing'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function LinkListBlock({ block, theme }: Props) {
  const d = block.data as unknown as LinkListData
  const grad = `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`

  return (
    <div style={{ background: theme.backgroundColor, padding: '20px 18px', color: theme.textColor }}>
      {d.title && (
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: theme.textColor }}>{d.title}</h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(d.links ?? []).filter(l => l.visible !== false).map((link, i) => (
          <div key={link.id ?? i} style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 13, fontWeight: 600, color: theme.textColor,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>{link.label || 'Enlace'}</span>
            <span style={{ fontSize: 16, opacity: .6 }}>→</span>
          </div>
        ))}
        {(d.links ?? []).length === 0 && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)', fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
            Añade enlaces en el editor
          </div>
        )}
      </div>
    </div>
  )
}
