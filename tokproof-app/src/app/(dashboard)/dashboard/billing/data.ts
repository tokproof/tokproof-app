// ─── Types ────────────────────────────────────────────────────────────────────

export interface Feature {
  label: string
}

export interface ComparisonRow {
  label:    string
  free:     string | 'check' | 'dash'
  pro:      string | 'check' | 'dash'
  proGreen: boolean
}

// ─── Free plan features ───────────────────────────────────────────────────────
export const FREE_FEATURES: Feature[] = [
  { label: '1 página publicada' },
  { label: 'URL tokproof.app/@username' },
  { label: 'Templates Ecommerce, Creator y Afiliados' },
  { label: 'Analytics básicos' },
  { label: 'Safe Link Score' },
]

// ─── Pro plan features ────────────────────────────────────────────────────────
export const PRO_FEATURES: Feature[] = [
  { label: 'Analytics avanzados' },
  { label: 'Top países y dispositivos' },
  { label: 'Fuentes de tráfico' },
  { label: 'Embudo TikTok Rescue' },
  { label: 'Exit Guide Views & Open Browser Clicks' },
  { label: 'Sin branding Tokproof' },
  { label: 'Páginas ilimitadas' },
  { label: 'Soporte prioritario' },
]

// ─── Comparison table ─────────────────────────────────────────────────────────
export const COMPARISON: ComparisonRow[] = [
  { label: 'Páginas publicadas',      free: '1',        pro: 'Ilimitadas', proGreen: true  },
  { label: 'URL pública',             free: 'check',    pro: 'check',      proGreen: true  },
  { label: 'Templates',               free: '3 tipos',  pro: '3 tipos',    proGreen: false },
  { label: 'Analytics básicos',       free: 'check',    pro: 'check',      proGreen: true  },
  { label: 'Analytics avanzados',     free: 'dash',     pro: 'check',      proGreen: true  },
  { label: 'Embudo TikTok Rescue',    free: 'dash',     pro: 'check',      proGreen: true  },
  { label: 'Branding Tokproof',       free: 'Incluido', pro: 'No incluido',proGreen: false },
  { label: 'Soporte',                 free: 'Estándar', pro: 'Prioritario',proGreen: true  },
]
