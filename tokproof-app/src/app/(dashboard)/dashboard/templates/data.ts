export type Category    = 'ecommerce' | 'creator' | 'fitness' | 'affiliate'
export type Badge       = 'popular' | 'new' | 'premium' | 'free'
export type PageType    = 'trust' | 'simple' | 'affiliate'
export type CheckColor  = 'green' | 'pink'
export type BtnVariant  = 'pink' | 'purple' | 'green'
export type PreviewType = 'links' | 'shop' | 'product' | 'profile' | 'links-dark' | 'creator' | 'conversion-max'

export interface Template {
  id:          string
  category:    Category
  title:       string
  description: string
  features:    string[]
  previewType: PreviewType
  checkColor:  CheckColor
  btnVariant:  BtnVariant
  pageType:    PageType
  badge?:      Badge
  featured?:   boolean
  comingSoon?: boolean
}

export interface CategoryMeta {
  label:    string
  bg:       string
  text:     string
  icon:     string
  gradient: string
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  ecommerce: {
    label:    'Ecommerce',
    bg:       '#fbe0ef',
    text:     '#d6359a',
    icon:     '🛍️',
    gradient: 'linear-gradient(135deg,#fb47a0 0%,#e0359a 60%,#d62f8f 100%)',
  },
  creator: {
    label:    'Creator',
    bg:       '#ece1fb',
    text:     '#8b5cf6',
    icon:     '✨',
    gradient: 'linear-gradient(135deg,#a78bfa 0%,#8b6ff0 100%)',
  },
  fitness: {
    label:    'Fitness',
    bg:       '#dcfce7',
    text:     '#16a34a',
    icon:     '💪',
    gradient: 'linear-gradient(135deg,#4ade80 0%,#16a34a 100%)',
  },
  affiliate: {
    label:    'Affiliate',
    bg:       '#fef9c3',
    text:     '#a16207',
    icon:     '🔗',
    gradient: 'linear-gradient(135deg,#fbbf24 0%,#d97706 100%)',
  },
}

export interface BadgeMeta {
  label: string
  bg:    string
  text:  string
}

export const BADGE_META: Record<Badge, BadgeMeta> = {
  popular: { label: 'Popular', bg: '#fff7ed', text: '#ea580c' },
  new:     { label: 'New',     bg: '#f0fdf4', text: '#16a34a' },
  premium: { label: 'Premium', bg: '#f5f3ff', text: '#7c3aed' },
  free:    { label: 'Free',    bg: '#ecfdf5', text: '#059669' },
}

export const TEMPLATES: Template[] = [
  // ── ECOMMERCE ─────────────────────────────────────────────────────────────
  {
    id:          'conversion-max',
    category:    'ecommerce',
    title:       'Conversion Max',
    description: 'Plantilla PRO optimizada para maximizar conversiones. Prueba social, urgencia, comparativa y showcase completo.',
    features:    ['Hero + Urgencia + Trust Badges', 'TikTok Comments + Benefit Icons', 'Comparativa + Product Showcase + FAQ'],
    previewType: 'conversion-max',
    checkColor:  'green',
    btnVariant:  'purple',
    pageType:    'trust',
    badge:       'premium',
    featured:    true,
  },
  {
    id:          'tiktok-product',
    category:    'ecommerce',
    title:       'TikTok Product',
    description: 'Convierte el tráfico social en ventas. Hero, comentarios TikTok reales, Before/After y Product Showcase.',
    features:    ['TikTok Comments carousel', 'Before / After + Product Showcase', 'Hero + FAQ + CTA listos'],
    previewType: 'product',
    checkColor:  'green',
    btnVariant:  'pink',
    pageType:    'trust',
    badge:       'popular',
    featured:    true,
  },
  {
    id:          'beauty-product',
    category:    'ecommerce',
    title:       'Beauty Product',
    description: 'Template elegante para belleza y skincare. Transmite lujo y confianza.',
    features:    ['Foto glam del producto', 'Ingredientes y beneficios', 'Reviews de clientes'],
    previewType: 'shop',
    checkColor:  'pink',
    btnVariant:  'pink',
    pageType:    'trust',
    badge:       'new',
  },
  {
    id:          'product-catalog',
    category:    'ecommerce',
    title:       'Product Catalog',
    description: 'Muestra varios productos en un catálogo limpio y fácil de navegar.',
    features:    ['Grid de productos', 'Precios y etiquetas', 'Link directo a tienda'],
    previewType: 'shop',
    checkColor:  'green',
    btnVariant:  'purple',
    pageType:    'trust',
    badge:       'free',
  },
  {
    id:          'gadget-viral',
    category:    'ecommerce',
    title:       'Gadget Viral',
    description: 'Para gadgets y tech que necesitan una presentación que genere FOMO.',
    features:    ['Demo en video', 'Specs técnicas visuales', 'Contador de stock'],
    previewType: 'product',
    checkColor:  'green',
    btnVariant:  'purple',
    pageType:    'trust',
    badge:       'premium',
    comingSoon:  true,
  },
  // ── CREATOR ───────────────────────────────────────────────────────────────
  {
    id:          'creator-links',
    category:    'creator',
    title:       'Creator Links',
    description: 'Tu hub de creador: centraliza redes, contenido y monetización en un link.',
    features:    ['Links de redes sociales', 'Video destacado', 'Merch o cursos'],
    previewType: 'links-dark',
    checkColor:  'pink',
    btnVariant:  'purple',
    pageType:    'simple',
    badge:       'popular',
  },
  {
    id:          'personal-brand',
    category:    'creator',
    title:       'Personal Brand',
    description: 'Construye tu marca personal con un perfil profesional y elegante.',
    features:    ['Foto y bio impactante', 'Proyectos destacados', 'Botón de contacto'],
    previewType: 'profile',
    checkColor:  'pink',
    btnVariant:  'purple',
    pageType:    'simple',
    badge:       'new',
  },
  {
    id:          'coach',
    category:    'creator',
    title:       'Coach',
    description: 'Diseñada para coaches y consultores que venden sesiones o programas.',
    features:    ['Resultados y testimonios', 'Paquetes de servicios', 'CTA de booking'],
    previewType: 'creator',
    checkColor:  'green',
    btnVariant:  'purple',
    pageType:    'simple',
    badge:       'premium',
    comingSoon:  true,
  },
  // ── FITNESS ───────────────────────────────────────────────────────────────
  {
    id:          'fitness-creator',
    category:    'fitness',
    title:       'Fitness Creator',
    description: 'Para atletas y fitfluencers. Energía y movimiento en cada pixel.',
    features:    ['Perfil de atleta', 'Links a programas y retos', 'Suplementos afiliados'],
    previewType: 'creator',
    checkColor:  'green',
    btnVariant:  'green',
    pageType:    'simple',
    badge:       'new',
  },
  // ── AFFILIATE ─────────────────────────────────────────────────────────────
  {
    id:          'amazon-finds',
    category:    'affiliate',
    title:       'Amazon Finds',
    description: 'La página perfecta para compartir tus finds de Amazon con tu audiencia.',
    features:    ['Grid de productos', 'Links de afiliado', 'Categorías de productos'],
    previewType: 'shop',
    checkColor:  'green',
    btnVariant:  'pink',
    pageType:    'affiliate',
    badge:       'popular',
    comingSoon:  true,
  },
]

export type FilterKey = 'all' | Category

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'ecommerce', label: 'Ecommerce' },
  { key: 'creator',   label: 'Creator' },
  { key: 'fitness',   label: 'Fitness' },
  { key: 'affiliate', label: 'Affiliate' },
]

export const CATEGORY_ORDER: Category[] = ['ecommerce', 'creator', 'fitness', 'affiliate']
