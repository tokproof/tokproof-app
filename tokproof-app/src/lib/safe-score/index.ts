import type { SafeScoreResult, SafeScoreCheck } from '@/types'

const DANGEROUS_PATTERNS = [
  'free money', 'get rich', 'guaranteed income', 'miracle', 'instant results',
  '100% guaranteed', 'make money fast', 'overnight success', 'crypto signals',
  'earn instantly', 'lose weight fast', 'miracle skincare', 'instant cure',
  'before it\'s deleted', 'click now urgent', 'only today', 'act now',
  'shocking results', 'secret method', 'hidden trick', 'government doesn\'t want',
  'fake scarcity', 'unrealistic transformations', 'misleading claims',
  'last chance', 'free gift guaranteed', 'cash reward', 'investment guaranteed',
  'guaranteed profit', 'no risk', 'unlimited money',
]

const SHORT_URL_DOMAINS = [
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'buff.ly',
  'short.io', 'rb.gy', 'cutt.ly', 'is.gd', 'tiny.cc',
]

interface ScoreInput {
  shopify_url?: string | null
  settings: {
    cta_text?: string
    description?: string
    headline?: string
    subheadline?: string
    legal_text?: string
    contact_email?: string
    contact_whatsapp?: string
    cta_sticky?: boolean
  }
  has_legal_footer?: boolean
  has_contact?: boolean
}

export function computeSafeScore(input: ScoreInput): SafeScoreResult {
  const checks: SafeScoreCheck[] = []
  let score = 100

  // ── 1. Destination URL is HTTPS ─────────────────
  const isHttps =
    !input.shopify_url ||
    input.shopify_url.startsWith('https://')
  checks.push({
    id: 'https',
    label: 'URL destino es HTTPS',
    passed: isHttps,
  })
  if (!isHttps) score -= 25

  // ── 2. No URL shorteners ─────────────────────────
  const hasShortener = input.shopify_url
    ? SHORT_URL_DOMAINS.some((d) => input.shopify_url!.includes(d))
    : false
  checks.push({
    id: 'no_shortener',
    label: 'Sin acortadores de URL',
    passed: !hasShortener,
  })
  if (hasShortener) score -= 20

  // ── 3. Legal footer visible ──────────────────────
  const hasLegal =
    input.has_legal_footer ||
    !!input.settings.legal_text?.trim()
  checks.push({
    id: 'legal_footer',
    label: 'Footer legal visible',
    passed: hasLegal,
  })
  if (!hasLegal) score -= 15

  // ── 4. Contact info visible ──────────────────────
  const hasContact =
    input.has_contact ||
    !!input.settings.contact_email?.trim() ||
    !!input.settings.contact_whatsapp?.trim()
  checks.push({
    id: 'contact',
    label: 'Contacto visible',
    passed: hasContact,
  })
  if (!hasContact) score -= 10

  // ── 5. CTA natural (not aggressive) ──────────────
  const ctaNatural = !input.settings.cta_sticky ||
    (input.settings.cta_text?.length ?? 0) < 60
  checks.push({
    id: 'cta_natural',
    label: 'CTA natural (no agresivo)',
    passed: ctaNatural,
  })
  if (!ctaNatural) score -= 5

  // ── 6. No dangerous words/claims ─────────────────
  const allText = [
    input.settings.headline,
    input.settings.subheadline,
    input.settings.description,
    input.settings.cta_text,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const foundPatterns = DANGEROUS_PATTERNS.filter((p) =>
    allText.includes(p.toLowerCase())
  )
  const hasDangerous = foundPatterns.length > 0
  checks.push({
    id: 'no_dangerous',
    label: 'Sin claims peligrosos o engañosos',
    passed: !hasDangerous,
    warning: hasDangerous ? `Detectado: ${foundPatterns.slice(0, 2).join(', ')}` : undefined,
  })
  if (hasDangerous) score -= 20 * Math.min(foundPatterns.length, 2)

  const finalScore = Math.max(0, Math.min(100, score))

  let label: SafeScoreResult['label']
  if (finalScore >= 80) label = 'Excellent'
  else if (finalScore >= 50) label = 'Medium'
  else label = 'Risky'

  return { score: finalScore, label, checks }
}
