export type Plan = 'free' | 'pro'
export type PageType = 'simple' | 'trust'
export type PageStatus = 'draft' | 'in_review' | 'published' | 'blocked'
export type EventType =
  | 'page_view'
  | 'button_click'
  | 'shopify_click'
  | 'cta_click'
  // Safe Exit System
  | 'webview_detected'
  | 'external_open_attempt'
  | 'external_open_failed'
  | 'copy_link'
  | 'instructions_viewed'
  | 'direct_exit_view'
  | 'direct_exit_webview_detected'
  | 'direct_exit_browser_detected'
  | 'direct_exit_redirected'
  | 'direct_exit_copy_link'
  | 'direct_exit_manual_continue'
  | 'exit_guide_shown'
  | 'exit_guide_closed'
  | 'trust_page_cta_exit_triggered'
export type ButtonType = 'link' | 'whatsapp' | 'shopify' | 'instagram' | 'tiktok' | 'youtube' | 'email'

export interface Profile {
  id: string
  user_id: string
  username: string | null
  display_name: string | null
  email: string | null
  avatar_url: string | null
  plan: Plan
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface PageSettings {
  // Branding
  brand_color?: string
  accent_color?: string
  bg_color?: string
  font?: string

  // Hero / Media
  media_url?: string
  media_type?: 'image' | 'video'
  headline?: string
  subheadline?: string
  description?: string

  // Product
  price?: string
  original_price?: string
  currency?: string

  // CTA
  cta_text?: string
  cta_subtext?: string
  cta_sticky?: boolean

  // Sections visible flags
  show_comments?: boolean
  show_reviews?: boolean
  show_logos?: boolean
  show_faq?: boolean
  show_guarantees?: boolean
  show_seen_on?: boolean
  show_social?: boolean

  // Social links
  tiktok_url?: string
  instagram_url?: string
  youtube_url?: string

  // Legal
  legal_text?: string
  contact_email?: string
  contact_whatsapp?: string

  // Guarantees
  guarantees?: Array<{ icon: string; text: string }>

  // Seen-on logos
  seen_on?: string[]

  // Block order (drag-and-drop future)
  block_order?: string[]

  // Simple page extras
  avatar_url?: string
  bio?: string
  background_style?: string

  // Direct Exit
  direct_exit_enabled?: boolean
  direct_exit_url?: string
  direct_exit_delay?: number
  direct_exit_guide_text?: string
  direct_exit_on_trust_cta?: boolean

  // Category system (stored in JSONB settings, no migration needed)
  _category?: 'ecommerce' | 'personal_brand'
  _pageType?: 'trust_page' | 'simple_page' | 'creator_page'
  _landingConfig?: Record<string, unknown>
}

export interface Page {
  id: string
  user_id: string
  username: string | null
  type: PageType
  status: PageStatus
  title: string | null
  brand_name: string | null
  product_name: string | null
  shopify_url: string | null
  slug: string | null
  settings: PageSettings
  safe_score: number
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface Button {
  id: string
  page_id: string
  label: string
  url: string | null
  type: ButtonType
  icon: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
}

export interface Comment {
  id: string
  page_id: string
  name: string | null
  username: string | null
  avatar: string | null
  text: string | null
  likes: number
  image_url: string | null
  brand_reply: string | null
  is_visible: boolean
  sort_order: number
  created_at: string
}

export interface Review {
  id: string
  page_id: string
  name: string | null
  rating: number
  text: string | null
  date: string | null
  verified: boolean
  image_url: string | null
  is_visible: boolean
  sort_order: number
  created_at: string
}

export interface FAQ {
  id: string
  page_id: string
  question: string | null
  answer: string | null
  is_visible: boolean
  sort_order: number
  created_at: string
}

export interface Logo {
  id: string
  page_id: string
  name: string | null
  image_url: string | null
  is_visible: boolean
  sort_order: number
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  page_id: string
  user_id: string | null
  event_type: EventType
  button_id: string | null
  referrer: string | null
  user_agent: string | null
  device: string | null
  browser: string | null
  country: string | null
  created_at: string
}

export interface Template {
  id: string
  name: string
  type: PageType
  category: string | null
  preview_url: string | null
  settings: PageSettings
  is_active: boolean
  created_at: string
}

// Aggregated analytics for dashboard
export interface PageAnalytics {
  page_id: string
  views: number
  clicks: number
  shopify_clicks: number
  ctr: number
}

// Full page with related data (used by public renderer)
export interface FullPage {
  page: Page
  buttons: Button[]
  comments: Comment[]
  reviews: Review[]
  faqs: FAQ[]
  logos: Logo[]
  profile: Profile
}
