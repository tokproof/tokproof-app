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
  { label: '6 templates' },
  { label: 'Analytics básicos' },
  { label: 'Safe Link Score' },
]

// ─── Pro plan features ────────────────────────────────────────────────────────
export const PRO_FEATURES: Feature[] = [
  { label: 'Páginas ilimitadas' },
  { label: 'Analytics avanzados' },
  { label: 'A/B Testing' },
  { label: 'Dominio personalizado' },
  { label: 'Sin branding Tokproof' },
  { label: 'Soporte prioritario' },
]

// ─── Comparison table ─────────────────────────────────────────────────────────
export const COMPARISON: ComparisonRow[] = [
  { label: 'Páginas publicadas',   free: '1',        pro: 'Ilimitadas', proGreen: true  },
  { label: 'URL pública',          free: 'check',    pro: 'check',      proGreen: true  },
  { label: 'Templates',            free: '6',        pro: '6+',         proGreen: true  },
  { label: 'Analytics',            free: 'Básicos',  pro: 'Avanzados',  proGreen: true  },
  { label: 'A/B Testing',          free: 'dash',     pro: 'check',      proGreen: true  },
  { label: 'Dominio personalizado',free: 'dash',     pro: 'check',      proGreen: true  },
  { label: 'Branding Tokproof',    free: 'Incluido', pro: 'No incluido',proGreen: false },
  { label: 'Soporte',              free: 'Estándar', pro: 'Prioritario',proGreen: true  },
]
