import type { LandingBlock, LandingTheme } from '@/types/landing'

// ─── Font family map ──────────────────────────────────────────────────────────
export const FONT_FAMILIES: Record<string, string> = {
  'Inter':            'var(--font-inter, Inter), system-ui, sans-serif',
  'Poppins':          'var(--font-poppins, Poppins), system-ui, sans-serif',
  'Nunito Sans':      'var(--font-nunito, "Nunito Sans"), system-ui, sans-serif',
  'Manrope':          'var(--font-manrope, Manrope), system-ui, sans-serif',
  'Playfair Display': 'var(--font-playfair, "Playfair Display"), Georgia, serif',
}
export const FONT_OPTIONS = Object.keys(FONT_FAMILIES)

// ─── Scale maps ───────────────────────────────────────────────────────────────
const RADIUS: Record<string, { card: number; btn: number }> = {
  square: { card: 0,  btn: 2   },
  soft:   { card: 14, btn: 14  },
  medium: { card: 24, btn: 24  },
  round:  { card: 32, btn: 999 },
}
const FONT_SIZE: Record<string, { h1: number; h2: number; body: number; sub: number }> = {
  small:  { h1: 17, h2: 14, body: 11, sub: 10 },
  medium: { h1: 20, h2: 15, body: 12, sub: 11 },
  large:  { h1: 24, h2: 18, body: 14, sub: 12 },
}
const SPACING: Record<string, { pad: string; gap: number }> = {
  compact: { pad: '12px 14px', gap: 6  },
  normal:  { pad: '20px 18px', gap: 10 },
  airy:    { pad: '28px 22px', gap: 16 },
}

// ─── Glass maps ───────────────────────────────────────────────────────────────
const GLASS_FILTER: Record<string, string> = {
  soft: 'blur(4px)', medium: 'blur(8px)', strong: 'blur(16px)',
}
// Fallback element-bg when theme doesn't define cardBackgroundColor
const DARK_ELEMENT_BG: Record<string, string> = {
  none:   'rgba(255,255,255,0.05)',
  soft:   'rgba(255,255,255,0.07)',
  medium: 'rgba(255,255,255,0.12)',
  strong: 'rgba(255,255,255,0.18)',
}

// ─── Resolved style ───────────────────────────────────────────────────────────
export interface ResolvedStyle {
  bg:            string  // block section background (transparent for gradient themes)
  text:          string  // primary text
  textSecondary: string  // secondary / muted text
  accent:        string  // accent / CTA color
  buttonText:    string  // text ON buttons
  grad:          string  // gradient string for buttons
  fontFamily:    string
  h1: number; h2: number; body: number; sub: number
  align:         'left' | 'center'
  cardR:         number
  btnR:          number
  pad:           string
  gap:           number
  elementBg:     string  // card / item background
  innerBg:       string  // inner element within a card (image placeholder, countdown, etc.)
  cardBorder:    string  // full CSS border declaration
  glassFilter:   string | undefined
}

// ─── Page background ──────────────────────────────────────────────────────────
export function getPageBackground(theme: LandingTheme): string {
  // Prefer flat fields (current); fall back to nested ThemeBackground (legacy Phase 3)
  const mode = theme.backgroundMode ?? theme.background?.mode ?? 'solid'
  if (mode === 'gradient') {
    const from = theme.gradientFrom ?? theme.background?.gradientFrom ?? theme.backgroundColor
    const to   = theme.gradientTo   ?? theme.background?.gradientTo   ?? theme.primaryColor
    return `linear-gradient(180deg, ${from} 0%, ${to} 100%)`
  }
  return theme.backgroundColor
}

// ─── Block style resolver ─────────────────────────────────────────────────────
export function resolveBlockStyle(block: LandingBlock, theme: LandingTheme): ResolvedStyle {
  const s = block.style ?? {}

  // Toggle gates: false = use global theme; undefined = backward-compat (use if set)
  const useColors = s.customColorsEnabled !== false
  const useFont   = s.customFontEnabled   !== false
  const useBorder = s.customBorderEnabled !== false

  const radius = (useBorder ? s.borderRadius : undefined) ?? theme.radius ?? 'soft'
  const r      = RADIUS[radius] ?? RADIUS.soft

  const fs = FONT_SIZE[(useFont ? s.fontSize : undefined) ?? 'medium']
  const sp = SPACING[(useBorder ? s.spacing : undefined) ?? 'normal']

  const accent     = (useColors ? s.accentColor : undefined) ?? theme.accentColor ?? theme.primaryColor
  const fontKey    = (useFont ? s.fontFamily : undefined) ?? theme.fontFamily ?? 'Nunito Sans'
  const fontFamily = FONT_FAMILIES[fontKey] ?? fontKey

  // Glass
  const glassKey   = s.glassIntensity ?? 'none'
  const glassFilter = glassKey !== 'none' ? GLASS_FILTER[glassKey] : undefined

  // Block section background — transparent for gradient themes so page gradient shows through
  const backgroundMode = theme.backgroundMode ?? theme.background?.mode ?? 'solid'
  const isGradient     = backgroundMode === 'gradient'
  const blockBgDefault = isGradient ? 'transparent' : theme.backgroundColor
  const bg             = (useColors ? s.backgroundColor : undefined) ?? blockBgDefault

  // Card / item background (largest inner element: benefit card, FAQ item, product card, etc.)
  const elementBg = (useColors && s.elementBackgroundColor)
    ? s.elementBackgroundColor
    : theme.cardBackgroundColor ?? DARK_ELEMENT_BG[glassKey]

  // Inner element within a card (image placeholder, countdown bg, etc.)
  const innerBg = theme.elementBackgroundColor ?? DARK_ELEMENT_BG['none']

  // Border
  const cardBorder = (useColors && s.borderColor)
    ? `1px solid ${s.borderColor}`
    : `1px solid ${theme.borderColor ?? 'rgba(255,255,255,0.08)'}`

  // Text
  const text          = (useColors ? s.textColor : undefined) ?? theme.textColor
  const textSecondary = theme.secondaryTextColor ?? 'rgba(255,255,255,0.55)'
  const buttonText    = theme.buttonTextColor ?? '#FFFFFF'

  return {
    bg, text, textSecondary,
    accent,
    buttonText,
    grad: `linear-gradient(135deg, ${accent}, ${theme.secondaryColor})`,
    fontFamily,
    h1: fs.h1, h2: fs.h2, body: fs.body, sub: fs.sub,
    align:  s.textAlign ?? 'left',
    cardR:  r.card, btnR:  r.btn,
    pad:    sp.pad,  gap:  sp.gap,
    elementBg, innerBg, cardBorder, glassFilter,
  }
}
