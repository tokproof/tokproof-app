// ─── Per-block style overrides ────────────────────────────────────────────────
export interface BlockStyle {
  backgroundColor?: string
  textColor?: string
  accentColor?: string
  fontFamily?: string
  fontSize?: 'small' | 'medium' | 'large'
  textAlign?: 'left' | 'center'
  borderRadius?: 'square' | 'soft' | 'medium' | 'round'
  spacing?: 'compact' | 'normal' | 'airy'
}

// ─── Block types ─────────────────────────────────────────────────────────────
export type BlockType =
  | 'hero_product'
  | 'benefits'
  | 'tiktok_comments'
  | 'reviews'
  | 'faq'
  | 'cta'
  | 'link_list'
  | 'profile_header'
  | 'product_grid'
  | 'trust_badges'

export interface LandingBlock {
  id: string
  type: BlockType
  label: string
  visible: boolean
  locked?: boolean
  data: Record<string, unknown>
  style?: BlockStyle
}

// ─── Per-block data shapes ────────────────────────────────────────────────────
export interface HeroProductData {
  headline: string
  subheadline: string
  description: string
  imageUrl: string
  badgeText: string
  showBadge: boolean
  showRating: boolean
  rating: string
}

export interface BenefitItem {
  icon: string
  title: string
  description: string
}
export interface BenefitsData {
  title: string
  items: BenefitItem[]
}

export interface LinkItem {
  id: string
  label: string
  url: string
  visible: boolean
}
export interface LinkListData {
  title: string
  links: LinkItem[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}
export interface FAQData {
  title: string
  items: FaqItem[]
}

export interface CTAData {
  text: string
  subtext: string
  url: string
  style: 'gradient' | 'solid' | 'outline'
}

// ─── Theme & settings ─────────────────────────────────────────────────────────
export interface LandingTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  radius: 'square' | 'soft' | 'medium' | 'round'
}

export interface LandingSettings {
  showTokproofBranding: boolean
  enableTikTokRescue: boolean
  directExitUrl: string
  seoTitle: string
  seoDescription: string
}

// ─── Template IDs ─────────────────────────────────────────────────────────────
export type TemplateId =
  | 'trust_product'
  | 'tiktok_shop'
  | 'link_in_bio'
  | 'creator_profile'
  | 'simple_product'
  | 'lead_magnet'

// ─── Root config ─────────────────────────────────────────────────────────────
export interface LandingConfig {
  id?: string
  title: string
  slug: string
  status: 'draft' | 'published'
  destinationUrl: string
  template: TemplateId
  theme: LandingTheme
  settings: LandingSettings
  blocks: LandingBlock[]
}

// ─── Default factory ─────────────────────────────────────────────────────────
export function makeDefaultConfig(overrides?: Partial<LandingConfig>): LandingConfig {
  return {
    title: 'Mi Landing Page',
    slug: 'mi-landing',
    status: 'draft',
    destinationUrl: '',
    template: 'trust_product',
    theme: {
      primaryColor: '#F647A9',
      secondaryColor: '#7B61FF',
      backgroundColor: '#0F0F10',
      textColor: '#FFFFFF',
      fontFamily: 'Nunito Sans',
      radius: 'soft',
    },
    settings: {
      showTokproofBranding: true,
      enableTikTokRescue: false,
      directExitUrl: '',
      seoTitle: '',
      seoDescription: '',
    },
    blocks: makeDefaultBlocks(),
    ...overrides,
  }
}

export function makeDefaultBlocks(): LandingBlock[] {
  return [
    {
      id: 'block_hero',
      type: 'hero_product',
      label: 'Hero del producto',
      visible: true,
      locked: true,
      data: {
        headline: 'El producto que todos en TikTok están buscando',
        subheadline: 'Fórmula con Vitamina C + Ácido Hialurónico',
        description: 'Resultados visibles en 7 días. Sin parabenos.',
        imageUrl: '',
        badgeText: '★ 4.9/5',
        showBadge: true,
        showRating: true,
        rating: '4.9',
      } satisfies HeroProductData,
    },
    {
      id: 'block_benefits',
      type: 'benefits',
      label: 'Beneficios',
      visible: true,
      data: {
        title: 'Por qué elegirlo',
        items: [
          { icon: '✨', title: 'Resultados en 7 días', description: 'Visible desde la primera semana.' },
          { icon: '🌿', title: 'Ingredientes naturales', description: 'Sin parabenos ni sulfatos.' },
          { icon: '📦', title: 'Envío gratis', description: 'En todos los pedidos.' },
        ],
      } satisfies BenefitsData,
    },
    {
      id: 'block_faq',
      type: 'faq',
      label: 'Preguntas frecuentes',
      visible: true,
      data: {
        title: 'Preguntas frecuentes',
        items: [
          { id: 'faq1', question: '¿Cuándo veré resultados?', answer: 'La mayoría ve cambios en 7–14 días con uso diario.' },
          { id: 'faq2', question: '¿Tiene garantía?', answer: 'Sí, 30 días de devolución sin preguntas.' },
        ],
      } satisfies FAQData,
    },
    {
      id: 'block_cta',
      type: 'cta',
      label: 'Botón principal',
      visible: true,
      locked: true,
      data: {
        text: '🛒 Ver producto oficial',
        subtext: '🔒 Página oficial del producto',
        url: '',
        style: 'gradient',
      } satisfies CTAData,
    },
  ]
}
