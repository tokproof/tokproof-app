// ─── Per-block style overrides ────────────────────────────────────────────────
export interface BlockStyle {
  // Toggle gates — false = use global theme; undefined = backward compat (use value if set)
  customColorsEnabled?: boolean
  customFontEnabled?: boolean
  customBorderEnabled?: boolean
  // Base overrides
  backgroundColor?: string
  textColor?: string
  accentColor?: string
  fontFamily?: string
  fontSize?: 'small' | 'medium' | 'large'
  textAlign?: 'left' | 'center'
  borderRadius?: 'square' | 'soft' | 'medium' | 'round'
  spacing?: 'compact' | 'normal' | 'airy'
  // Advanced per-block
  elementBackgroundColor?: string
  borderColor?: string
  glassIntensity?: 'none' | 'soft' | 'medium' | 'strong'
}

// ─── Block types ─────────────────────────────────────────────────────────────
export type BlockType =
  | 'hero_product'
  | 'benefits'
  | 'tiktok_comments'
  | 'tiktok_comment_cards'
  | 'benefit_icons_row'
  | 'reviews'
  | 'faq'
  | 'cta'
  | 'link_list'
  | 'profile_header'
  | 'social_links'
  | 'product_grid'
  | 'trust_badges'
  | 'comparison'
  | 'urgency_offer'
  | 'footer_legal'
  | 'featured_product'
  | 'partner_discounts'
  | 'before_after'

export interface LandingBlock {
  id: string
  type: BlockType
  label: string
  visible: boolean
  locked?: boolean
  data: Record<string, unknown>
  style?: BlockStyle
}

// ─── Media attachment ─────────────────────────────────────────────────────────
export interface HeroMedia {
  type: 'image' | 'video'
  url: string
  source: 'url' | 'upload' | 'extracted'
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
  media?: HeroMedia
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

export interface ProfileHeaderData {
  avatarUrl: string
  displayName: string
  username: string
  verifiedBadge: boolean
  bio: string
  location?: string
}

export type SocialPlatform = 'tiktok' | 'instagram' | 'youtube' | 'website' | 'email' | 'whatsapp' | 'x' | 'linkedin'
export interface SocialLink {
  id: string
  platform: SocialPlatform
  url: string
  label?: string
  enabled: boolean
}
export interface SocialLinksData {
  links: SocialLink[]
}

export interface ProductItem {
  id: string
  imageUrl: string
  title: string
  price?: string
  compareAtPrice?: string
  url: string
  badge?: string
  description?: string
}
export interface ProductGridData {
  title: string
  subtitle?: string
  products: ProductItem[]
}

export type TrustBadgeIcon = 'shipping' | 'secure' | 'guarantee' | 'returns' | 'support' | 'verified'
export interface TrustBadge {
  id: string
  icon: TrustBadgeIcon
  title: string
  description?: string
  enabled: boolean
}
export interface TrustBadgesData {
  badges: TrustBadge[]
}

export interface ComparisonRow {
  id: string
  label: string
  leftValue: string
  rightValue: string
  winner: 'left' | 'right'
}
export interface ComparisonData {
  title: string
  leftTitle: string
  rightTitle: string
  rows: ComparisonRow[]
}

export interface UrgencyOfferData {
  title: string
  description: string
  badgeText: string
  countdownEnabled: boolean
  countdownText?: string
  ctaText?: string
  ctaUrl?: string
}

export interface FeaturedProductData {
  imageUrl: string
  badgeText: string
  productName: string
  description: string
  rating: number
  reviewCount: string
  price: string
  compareAtPrice: string
  discountText: string
  benefits: string[]
  buttonText: string
  buttonUrl: string
  showBadge: boolean
  showRating: boolean
  showReviews: boolean
  showPrice: boolean
  showCompareAtPrice: boolean
  showDiscount: boolean
  showBenefits: boolean
  layout: 'card' | 'minimal'
  colorTheme: 'light' | 'dark'
  accentColor?: string
  buttonStyle: 'filled' | 'outline'
  imageFit?: 'cover' | 'contain'
  showButton?: boolean
  marginTop?: number
  marginBottom?: number
  customAnchorId?: string
  openInNewTab?: boolean
  hideOnMobile?: boolean
  hideOnDesktop?: boolean
}

export interface PDColors {
  sectionBg?: string
  titleColor?: string
  subtitleColor?: string
  badgeBg?: string
  badgeText?: string
  cardBg?: string
  cardBorder?: string
  brandColor?: string
  descriptionColor?: string
  discountBg?: string
  discountText?: string
  codeBg?: string
  codeText?: string
  copyBg?: string
  copyText?: string
  ctaBg?: string
  ctaText?: string
  footerBg?: string
  footerTextColor?: string
}

export interface PartnerDiscount {
  id: string
  brandName: string
  storeUrl: string
  logoUrl: string
  description: string
  discountText: string
  code: string
  buttonText: string
  buttonUrl: string
  isPopular: boolean
  enabled: boolean
}

export interface PartnerDiscountsData {
  title: string
  subtitle: string
  badgeText: string
  footerText: string
  layout: 'compact' | 'detailed'
  accentColor?: string
  showLogos: boolean
  showDescriptions: boolean
  showCopyButton: boolean
  showExternalButton: boolean
  showFooterText: boolean
  discounts: PartnerDiscount[]
  marginTop?: number
  marginBottom?: number
  customAnchorId?: string
  colors?: PDColors
  shadowIntensity?: 'none' | 'soft' | 'medium'
  hideOnMobile?: boolean
  hideOnDesktop?: boolean
}

export interface TikTokReply {
  id: string
  avatarUrl: string
  username: string
  verified: boolean
  text: string
  likes: string
  date: string
}

export interface TikTokComment {
  id: string
  avatarUrl: string
  username: string
  verified: boolean
  text: string
  imageUrl: string
  likes: string
  date: string
  replyItems: TikTokReply[]
  showReply: boolean
  showLikes: boolean
  showReplies: boolean
}

export interface TikTokCommentsColors {
  sectionBg?: string
  cardBg?: string
  nameColor?: string
  textColor?: string
  likesColor?: string
  linkColor?: string
  badgeColor?: string
  verifiedColor?: string
  separatorColor?: string
}

export interface TikTokCommentsData {
  title: string
  subtitle: string
  badgeText: string
  showTitle: boolean
  showSubtitle: boolean
  showBadge: boolean
  layout: 'feed' | 'carousel'
  comments: TikTokComment[]
  showArrows: boolean
  showDots: boolean
  autoplay: boolean
  autoplaySpeed: number
  borderRadius: 'square' | 'soft' | 'medium' | 'round'
  shadowIntensity: 'none' | 'soft' | 'medium'
  spacing: 'compact' | 'normal' | 'airy'
  colors?: TikTokCommentsColors
}

export interface BeforeAfterColors {
  backgroundColor?: string
  cardBackgroundColor?: string
  titleColor?: string
  subtitleColor?: string
  badgeBackgroundColor?: string
  badgeTextColor?: string
  labelBeforeBackground?: string
  labelAfterBackground?: string
  labelTextColor?: string
  buttonBackgroundColor?: string
  buttonTextColor?: string
  borderColor?: string
}

export interface BeforeAfterData {
  title: string
  subtitle: string
  badgeText: string
  mode: 'cards' | 'slider'
  beforeImageUrl: string
  afterImageUrl: string
  beforeLabel: string
  afterLabel: string
  beforeDescription: string
  afterDescription: string
  showBadge: boolean
  showSubtitle: boolean
  showDescriptions: boolean
  showCTA: boolean
  buttonText: string
  buttonUrl: string
  borderRadius: 'square' | 'soft' | 'medium' | 'round'
  shadowIntensity: 'none' | 'soft' | 'medium'
  colors?: BeforeAfterColors
}

export interface FooterLegalData {
  brandName: string
  contactEmail: string
  privacyUrl: string
  termsUrl: string
  showTokproofBranding: boolean
  legalText?: string
}

// ─── Benefit Icons Row ────────────────────────────────────────────────────────
export interface BenefitIconsItem {
  id: string
  enabled: boolean
  icon: string
  title: string
  description: string
}

export interface BenefitIconsRowData {
  title: string
  subtitle: string
  showTitle: boolean
  showSubtitle: boolean
  showDividers: boolean
  layout: 'row' | 'grid'
  itemShadow?: 'none' | 'soft' | 'medium'
  items: BenefitIconsItem[]
}

// ─── TikTok Comment Cards ─────────────────────────────────────────────────────
export interface TikTokCommentCard {
  id: string
  enabled: boolean
  avatarUrl: string
  username: string
  text: string
  timeAgo: string
  likes: string
  verified: boolean
}

export interface TikTokCommentCardsData {
  title: string
  showTitle: boolean
  showTikTokIcon: boolean
  layout: 'carousel' | 'grid'
  comments: TikTokCommentCard[]
  // Style overrides
  sectionBackground?: string
  titleColor?: string
  accentColor?: string
  cardBackground?: string
  cardTextColor?: string
  usernameColor?: string
  metaColor?: string
  cardRadius?: 'square' | 'soft' | 'medium' | 'round'
  cardShadow?: 'none' | 'soft' | 'medium' | 'strong'
  spacingTop?: number
  spacingBottom?: number
}

// ─── Simple Page / Creator Page ──────────────────────────────────────────────
export type SimplePagePlatform =
  | 'instagram' | 'tiktok' | 'youtube' | 'website'
  | 'whatsapp' | 'email' | 'x' | 'linkedin'

export interface SimplePageSocialLink {
  id: string
  platform: SimplePagePlatform
  url: string
  enabled: boolean
}

export interface SimplePageLink {
  id: string
  title: string
  url: string
  description?: string
  imageUrl?: string
  enabled: boolean
}

export interface SimplePageProfile {
  avatarUrl: string
  displayName: string
  username: string
  bio: string
  verifiedBadge: boolean
}

export interface SimplePageSettings {
  enableBrowserGuide: boolean
  destinationMode: 'direct' | 'guide'
}

export interface SimplePageConfig {
  profile: SimplePageProfile
  socialLinks: SimplePageSocialLink[]
  links: SimplePageLink[]
  settings: SimplePageSettings
}

export function makeDefaultSimplePageConfig(displayName = '', username = ''): SimplePageConfig {
  return {
    profile: { avatarUrl: '', displayName: displayName || 'Tu Nombre', username: username || 'tuusuario', bio: 'Creador de contenido 🌟', verifiedBadge: false },
    socialLinks: [
      { id: 'sl_tt', platform: 'tiktok',    url: '', enabled: true  },
      { id: 'sl_ig', platform: 'instagram', url: '', enabled: true  },
      { id: 'sl_yt', platform: 'youtube',   url: '', enabled: false },
    ],
    links: [
      { id: 'link_1', title: 'Mi tienda', url: '', enabled: true },
    ],
    settings: { enableBrowserGuide: false, destinationMode: 'direct' },
  }
}

// ─── Theme background ─────────────────────────────────────────────────────────
export interface ThemeBackground {
  mode: 'solid' | 'gradient'
  gradientFrom?: string
  gradientTo?: string
  gradientDirection?: 'to bottom' | 'to right' | 'to bottom right'
}

// ─── Theme & settings ─────────────────────────────────────────────────────────
export interface LandingTheme {
  // Core
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  radius: 'square' | 'soft' | 'medium' | 'round'
  // Gradient background (flat fields — preferred over nested ThemeBackground)
  backgroundMode?: 'solid' | 'gradient'
  gradientFrom?: string
  gradientTo?: string
  // Extended color palette
  accentColor?: string
  secondaryTextColor?: string
  cardBackgroundColor?: string
  elementBackgroundColor?: string
  borderColor?: string
  buttonTextColor?: string
  // Button system
  buttonStyle?: 'solid' | 'gradient'
  buttonColor?: string
  buttonGradientFrom?: string
  buttonGradientTo?: string
  // Legacy — kept for backward compat, prefer flat fields above
  background?: ThemeBackground
}

export interface LandingSettings {
  showTokproofBranding: boolean
  enableTikTokRescue: boolean
  directExitUrl: string
  seoTitle: string
  seoDescription: string
}

// ─── Traffic sources ──────────────────────────────────────────────────────────
export type TrafficPlatform =
  | 'tiktok' | 'instagram' | 'youtube'
  | 'facebook' | 'pinterest' | 'amazon' | 'other'

export interface TrafficSource {
  platform:  TrafficPlatform
  handle:    string
  isPrimary: boolean
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
  // Page type discriminator
  // trust_page / simple_page / creator_page = editor pages
  // quick_exit = redirect-only, no editor, managed via widget
  pageType?: 'trust_page' | 'simple_page' | 'creator_page' | 'quick_exit'
  simplePage?: SimplePageConfig
  trafficSources?: TrafficSource[]
  tiktokProfile?: string
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
      data: {
        text: '🛒 Ver producto oficial',
        subtext: '🔒 Página oficial del producto',
        url: '',
        style: 'gradient',
      } satisfies CTAData,
    },
  ]
}
