'use client'
import { useState } from 'react'
import type { LandingBlock, LandingTheme, FAQData } from '@/types/landing'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function FAQBlock({ block, theme }: Props) {
  const d = block.data as unknown as FAQData
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div style={{ background: theme.backgroundColor, padding: '20px 18px', color: theme.textColor }}>
      {d.title && (
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: theme.textColor }}>{d.title}</h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(d.items ?? []).map((item) => (
          <div key={item.id} style={{
            borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setOpen(o => o === item.id ? null : item.id)}
              style={{
                width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.textColor, lineHeight: 1.4 }}>{item.question}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, flexShrink: 0, transform: open === item.id ? 'rotate(180deg)' : 'none', transition: '.2s' }}>▾</span>
            </button>
            {open === item.id && (
              <div style={{ padding: '0 14px 12px', fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.55 }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
