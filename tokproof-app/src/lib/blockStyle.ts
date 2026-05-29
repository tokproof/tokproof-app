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

// ─── Glass / element-bg maps ──────────────────────────────────────────────────
const GLASS_FILTER: Record<string, string> = {
  soft:   'blur(4px)',
  medium: 'blur(8px)',
  strong: 'blur(16px)',
}

const ELEMENT_BG_MAP: Record<string, string> = {
  none:   'rgba(255,255,255,0.05)',
  soft:   'rgba(255,255,255,0.07)',
  medium: 'rgba(255,255,255,0.12)',
  strong: 'rgba(255,255,255,0.18)',
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
  elementBg:   string
  cardBorder:  string
  glassFilter: string | undefined
}

// ─── Page background helper ───────────────────────────────────────────────────
export function getPageBackground(theme: LandingTheme): string {
  const bg = theme.background
  if (!bg || bg.mode === 'solid') return theme.backgroundColor
  const dir  = bg.gradientDirection ?? 'to bottom'
  const from = bg.gradientFrom ?? theme.backgroundColor
  const to   = bg.gradientTo   ?? theme.primaryColor
  return `linear-gradient(${dir}, ${from}, ${to})`
}

// ─── Block style resolver ─────────────────────────────────────────────────────
export function resolveBlockStyle(block: LandingBlock, theme: LandingTheme): ResolvedStyle {
  const s = block.style ?? {}

  // Toggle gates: false = use global; undefined = backward compat (use value if set)
  const useColors = s.customColorsEnabled !== false
  const useFont   = s.customFontEnabled   !== false
  const useBorder = s.customBorderEnabled !== false

  const radius = (useBorder ? s.borderRadius : undefined) ?? theme.radius ?? 'soft'
  const r      = RADIUS[radius] ?? RADIUS.soft

  const fs = FONT_SIZE[(useFont ? s.fontSize : undefined) ?? 'medium']
  const sp = SPACING[(useBorder ? s.spacing : undefined) ?? 'normal']

  const accent     = (useColors ? s.accentColor : undefined) ?? theme.primaryColor
  const fontKey    = (useFont ? s.fontFamily : undefined) ?? theme.fontFamily ?? 'Nunito Sans'
  const fontFamily = FONT_FAMILIES[fontKey] ?? fontKey

  const glassKey   = s.glassIntensity ?? 'none'
  const glassFilter = glassKey !== 'none' ? GLASS_FILTER[glassKey] : undefined

  const elementBg = (useColors && s.elementBackgroundColor)
    ? s.elementBackgroundColor
    : ELEMENT_BG_MAP[glassKey] ?? 'rgba(255,255,255,0.05)'

  const cardBorder = (useColors && s.borderColor)
    ? `1px solid ${s.borderColor}`
    : '1px solid rgba(255,255,255,0.08)'

  return {
    bg:     (useColors ? s.backgroundColor : undefined) ?? theme.backgroundColor,
    text:   (useColors ? s.textColor       : undefined) ?? theme.textColor,
    accent,
    grad:   `linear-gradient(135deg, ${accent}, ${theme.secondaryColor})`,
    fontFamily,
    h1:   fs.h1,  h2:   fs.h2,
    body: fs.body, sub: fs.sub,
    align:  s.textAlign ?? 'left',
    cardR:  r.card, btnR:  r.btn,
    pad:    sp.pad,  gap:  sp.gap,
    elementBg, cardBorder, glassFilter,
  }
}
