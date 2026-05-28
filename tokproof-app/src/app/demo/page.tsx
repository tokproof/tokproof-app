import AppShell from '@/components/dashboard/AppShell'
import DashboardClient from '@/app/(dashboard)/dashboard/DashboardClient'
import type { Profile, Page } from '@/types'

const DEMO_PROFILE: Profile = {
  id: 'demo-profile-1',
  user_id: 'demo-user-1',
  username: 'mibrand',
  display_name: 'Paula Núñez',
  email: 'hola@mibrand.com',
  avatar_url: null,
  plan: 'pro',
  onboarding_completed: true,
  created_at: '2024-11-01T10:00:00Z',
  updated_at: '2025-01-15T14:30:00Z',
}

const DEMO_PAGES: Page[] = [
  {
    id: 'demo-page-1',
    user_id: 'demo-user-1',
    username: 'mibrand',
    type: 'trust',
    status: 'published',
    title: 'Crema Hidratante Premium',
    brand_name: 'GlowLab',
    product_name: 'Crema Vitamina C SPF50',
    shopify_url: 'https://glowlab.myshopify.com/products/crema-vitamina-c',
    slug: null,
    settings: {
      price: '39.90',
      original_price: '59.90',
      cta_text: 'Comprar ahora — 33% OFF',
      show_comments: true,
      show_reviews: true,
      direct_exit_enabled: true,
      direct_exit_url: 'https://glowlab.myshopify.com/products/crema-vitamina-c',
    },
    safe_score: 92,
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-20T16:00:00Z',
    published_at: '2025-01-12T09:00:00Z',
  },
  {
    id: 'demo-page-2',
    user_id: 'demo-user-1',
    username: 'mibrand-2',
    type: 'simple',
    status: 'published',
    title: 'Bundle Skincare × 3',
    brand_name: 'GlowLab',
    product_name: 'Kit Completo Skincare',
    shopify_url: 'https://glowlab.myshopify.com/products/bundle-3',
    slug: null,
    settings: {
      price: '89.90',
      cta_text: 'Quiero el bundle →',
      direct_exit_enabled: false,
      direct_exit_url: '',
    },
    safe_score: 88,
    created_at: '2025-01-18T11:00:00Z',
    updated_at: '2025-01-22T10:00:00Z',
    published_at: '2025-01-19T12:00:00Z',
  },
  {
    id: 'demo-page-3',
    user_id: 'demo-user-1',
    username: 'mibrand',
    type: 'trust',
    status: 'draft',
    title: 'Sérum Retinol Noche',
    brand_name: 'GlowLab',
    product_name: 'Sérum Retinol 0.5%',
    shopify_url: 'https://glowlab.myshopify.com/products/serum-retinol',
    slug: null,
    settings: {
      price: '44.90',
      cta_text: 'Ver producto',
      direct_exit_enabled: false,
    },
    safe_score: 71,
    created_at: '2025-01-25T15:00:00Z',
    updated_at: '2025-01-25T15:00:00Z',
    published_at: null,
  },
]

const DEMO_ANALYTICS = {
  views: '12.4K', clicks: '3.8K', ctr: '30.6%', rescues: '1.2K',
  viewsTrend: '+18.2%', clicksTrend: '+22.6%', ctrTrend: '+14.5%', rescuesTrend: '+27.8%',
  rescueGuides: '2.4K', rescueOpens: '1.6K', rescueRate: '66.7%',
}

const DEMO_PAGE_STATS: Record<string, { views: string; clicks: string; ctr: string }> = {
  'demo-page-1': { views: '2.4K', clicks: '840', ctr: '34.8%' },
  'demo-page-2': { views: '1.7K', clicks: '620', ctr: '36.5%' },
  'demo-page-3': { views: '—', clicks: '—', ctr: '—' },
}

export default function DemoPage() {
  return (
    <AppShell profile={DEMO_PROFILE}>
      <DashboardClient
        profile={DEMO_PROFILE}
        pages={DEMO_PAGES}
        analytics={DEMO_ANALYTICS}
        pageStats={DEMO_PAGE_STATS}
      />
    </AppShell>
  )
}
