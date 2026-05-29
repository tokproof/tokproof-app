'use client'
import { useState } from 'react'
import type { LandingBlock, LandingTheme, FAQData } from '@/types/landing'
import { resolveBlockStyle } from '@/lib/blockStyle'

interface Props { block: LandingBlock; theme: LandingTheme }

export default function FAQBlock({ block, theme }: Props) {
  const d  = block.data as unknown as FAQData
  const rs = resolveBlockStyle(block, theme)
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div style={{ background: rs.bg, padding: rs.pad, color: rs.text, fontFamily: rs.fontFamily }}>
      {d.title && (
        <h2 style={{ fontSize: rs.h2, fontWeight: 800, marginBottom: rs.gap + 4, color: rs.text, textAlign: rs.align }}>{d.title}</h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: rs.gap }}>
        {(d.items ?? []).map((item) => (
          <div key={item.id} style={{
            borderRadius: rs.cardR,
            background: rs.elementBg,
            border: rs.cardBorder,
            backdropFilter: rs.glassFilter,
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setOpen(o => o === item.id ? null : item.id)}
              style={{
                width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              }}
            >
              <span style={{ fontSize: rs.body + 1, fontWeight: 600, color: rs.text, lineHeight: 1.4 }}>{item.question}</span>
              <span style={{ color: rs.textSecondary, fontSize: 16, flexShrink: 0, transform: open === item.id ? 'rotate(180deg)' : 'none', transition: '.2s' }}>▾</span>
            </button>
            {open === item.id && (
              <div style={{ padding: '0 14px 12px', fontSize: rs.body, color: rs.textSecondary, lineHeight: 1.55 }}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
