import type { LandingBlock, LandingTheme } from '@/types/landing'

// ─── Font family map (key → CSS with variable fallback) ──────────────────────
export const FONT_FAMILIES: Record<string, string> = {
  'Inter':            'var(--font-inter, Inter), system-ui, sans-serif',
  'Poppins':          'var(--font-poppins, Poppins), system-ui, sans-serif',
  'Nunito Sans':      'var(--font-nunito, "Nunito Sans"), system-ui, sans-serif',
  'Manrope':          'var(--font-manrope, Manrope), system-ui, sans-serif',
  'Playfair Display': 'var(--font-playfair, "Playfair Display"), Georgia, serif',
}

export const FONT_OPTIONS = Object.keys(FONT_FAMILIES)

// ─── Radius map ───────────────────────────────────────────────────────────────
const RADIUS: Record<string, { card: number; btn: number }> = {
  square: { card: 0,  btn: 2   },
  soft:   { card: 14, btn: 14  },
  medium: { card: 24, btn: 24  },
  round:  { card: 32, btn: 999 },
}

// ─── Font size map ────────────────────────────────────────────────────────────
const FONT_SIZE: Record<string, { h1: number; h2: number; body: number; sub: number }> = {
  small:  { h1: 17, h2: 14, body: 11, sub: 10 },
  medium: { h1: 20, h2: 15, body: 12, sub: 11 },
  large:  { h1: 24, h2: 18, body: 14, sub: 12 },
}

// ─── Spacing map ──────────────────────────────────────────────────────────────
const SPACING: Record<string, { pad: string; gap: number }> = {
  compact: { pad: '12px 14px', gap: 6  },
  normal:  { pad: '20px 18px', gap: 10 },
  airy:    { pad: '28px 22px', gap: 16 },
}

// ─── Resolved style ───────────────────────────────────────────────────────────
export interface ResolvedStyle {
  bg:         string
  text:       string
  accent:     string
  grad:       string
  fontFamily: string
  h1: number; h2: number; body: number; sub: number
  align:      'left' | 'center'
  cardR:      number
  btnR:       number
  pad:        string
  gap:        number
}

export function resolveBlockStyle(block: LandingBlock, theme: LandingTheme): ResolvedStyle {
  const s = block.style ?? {}

  const radius = s.borderRadius ?? theme.radius ?? 'soft'
  const r      = RADIUS[radius] ?? RADIUS.soft

  const fs = FONT_SIZE[s.fontSize ?? 'medium']
  const sp = SPACING[s.spacing ?? 'normal']

  const accent     = s.accentColor ?? theme.primaryColor
  const fontKey    = s.fontFamily ?? theme.fontFamily ?? 'Nunito Sans'
  const fontFamily = FONT_FAMILIES[fontKey] ?? fontKey

  return {
    bg:         s.backgroundColor ?? theme.backgroundColor,
    text:       s.textColor       ?? theme.textColor,
    accent,
    grad:       `linear-gradient(135deg, ${accent}, ${theme.secondaryColor})`,
    fontFamily,
    h1:   fs.h1,  h2:  fs.h2,
    body: fs.body, sub: fs.sub,
    align:  s.textAlign ?? 'left',
    cardR:  r.card,
    btnR:   r.btn,
    pad:    sp.pad,
    gap:    sp.gap,
  }
}
