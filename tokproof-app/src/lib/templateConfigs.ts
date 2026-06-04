import type { LandingConfig, LandingBlock } from '@/types/landing'
import {
  type HeroProductData,
  type TikTokCommentsData,
  type TikTokCommentCardsData,
  type TikTokCommentCard,
  type BenefitIconsRowData,
  type BenefitIconsItem,
  type BeforeAfterData,
  type FeaturedProductData,
  type UrgencyOfferData,
  type TrustBadgesData,
  type ComparisonData,
  type ComparisonRow,
  type FAQData,
  type CTAData,
  type FooterLegalData,
} from '@/types/landing'

// ─── TikTok Product ───────────────────────────────────────────────────────────
function makeTikTokProductBlocks(): LandingBlock[] {
  return [
    {
      id: 'tp_hero',
      type: 'hero_product',
      label: 'Hero',
      visible: true,
      data: {
        headline: 'The Product Everyone on TikTok Is Talking About',
        subheadline: 'Clinically proven formula · Visible results in 7 days',
        description: 'Join over 2M people who\'ve already transformed their routine. Backed by science, loved by creators.',
        imageUrl: '',
        badgeText: '#1 Product on TikTok 🔥',
        showBadge: true,
        showRating: true,
        rating: '4.9',
      } satisfies HeroProductData,
    },
    {
      id: 'tp_tiktok_comments',
      type: 'tiktok_comments',
      label: 'TikTok Comments',
      visible: true,
      data: {
        title: '',
        subtitle: '',
        badgeText: '',
        showTitle: false,
        showSubtitle: false,
        showBadge: false,
        layout: 'carousel',
        comments: [
          {
            id: 'tc1',
            avatarUrl: '',
            username: 'Sofia.wellness 🌿',
            verified: false,
            text: 'Okay I\'ve been using this for 3 weeks and my skin literally looks different. My mom asked if I got a facial 😭 the texture improvement alone is worth it, I wasn\'t expecting results this fast tbh',
            imageUrl: '',
            likes: '18.4K',
            date: '2 d',
            replyItems: [
              {
                id: 'r1a',
                avatarUrl: '',
                username: 'Official Brand ✨',
                verified: true,
                text: 'That makes us SO happy to hear! 3 weeks is right when most customers start seeing major results 💗 Thank you for sharing!',
                likes: '342',
                date: '1 d',
              },
            ],
            showReply: true,
            showLikes: true,
            showReplies: true,
          },
          {
            id: 'tc2',
            avatarUrl: '',
            username: 'realgirlreviews',
            verified: true,
            text: 'I was super skeptical bc I\'ve tried everything for my hyperpigmentation. This is literally the first product that has made a visible difference in my dark spots. I\'m genuinely shocked and I don\'t say that lightly',
            imageUrl: '',
            likes: '42.1K',
            date: '5 d',
            replyItems: [
              {
                id: 'r2a',
                avatarUrl: '',
                username: 'Maya_skincare',
                verified: false,
                text: 'Same!!! I had the same experience, been using it for a month and the results are unreal 🙌',
                likes: '1.2K',
                date: '4 d',
              },
              {
                id: 'r2b',
                avatarUrl: '',
                username: 'Official Brand ✨',
                verified: true,
                text: 'Hyperpigmentation is one of our specialty formulas! So glad it\'s working for you 💕',
                likes: '890',
                date: '4 d',
              },
            ],
            showReply: true,
            showLikes: true,
            showReplies: true,
          },
          {
            id: 'tc3',
            avatarUrl: '',
            username: 'tiktokbymartina',
            verified: false,
            text: 'The way this arrived in 2 days and I was already using it the same night 😂 I\'ve been doing updates every 3 days and the difference is genuinely insane. Already ordered the full size before finishing the trial',
            imageUrl: '',
            likes: '9.2K',
            date: '1 sem',
            replyItems: [
              {
                id: 'r3a',
                avatarUrl: '',
                username: 'Official Brand ✨',
                verified: true,
                text: 'Love the dedication! 3-day updates are the best way to track progress 📈',
                likes: '156',
                date: '6 d',
              },
            ],
            showReply: true,
            showLikes: true,
            showReplies: true,
          },
        ],
        showArrows: true,
        showDots: true,
        autoplay: false,
        autoplaySpeed: 3,
        borderRadius: 'soft',
        shadowIntensity: 'soft',
        spacing: 'normal',
      } satisfies TikTokCommentsData,
    },
    {
      id: 'tp_before_after',
      type: 'before_after',
      label: 'Before / After',
      visible: true,
      data: {
        title: 'See The Difference',
        subtitle: 'Real results from real customers after consistent use.',
        badgeText: 'Verified Results ✓',
        mode: 'cards',
        beforeImageUrl: '',
        afterImageUrl: '',
        beforeLabel: 'Before',
        afterLabel: 'After',
        beforeDescription: 'Dull skin, uneven texture, visible dark spots after years of sun damage and stress.',
        afterDescription: 'Radiant, smooth skin with visibly reduced dark spots in just 28 days of daily use.',
        showBadge: true,
        showSubtitle: true,
        showDescriptions: true,
        showCTA: false,
        buttonText: 'View Official Product',
        buttonUrl: '',
        borderRadius: 'soft',
        shadowIntensity: 'soft',
      } satisfies BeforeAfterData,
    },
    {
      id: 'tp_featured_product',
      type: 'featured_product',
      label: 'Product Showcase',
      visible: true,
      data: {
        imageUrl: '',
        badgeText: 'Most Loved 🔥',
        productName: 'Why You\'ll Love It',
        description: 'Every ingredient is chosen for maximum efficacy. No fillers, no compromises — just results you can see.',
        rating: 4.9,
        reviewCount: '2.4K',
        price: '$29.99',
        compareAtPrice: '$49.99',
        discountText: '-40%',
        benefits: [
          'Clinically tested formula with dermatologist approval',
          '100% clean ingredients, cruelty-free & vegan',
          'Visible improvement from first application',
          'Made for all skin tones and types',
        ],
        buttonText: 'View Official Product',
        buttonUrl: '',
        showBadge: true,
        showRating: true,
        showReviews: true,
        showPrice: true,
        showCompareAtPrice: true,
        showDiscount: true,
        showBenefits: true,
        layout: 'card',
        colorTheme: 'dark',
        buttonStyle: 'filled',
      } satisfies FeaturedProductData,
    },
    {
      id: 'tp_faq',
      type: 'faq',
      label: 'FAQ',
      visible: true,
      data: {
        title: 'Frequently Asked Questions',
        items: [
          {
            id: 'faq1',
            question: 'How fast will I see results?',
            answer: 'Most customers notice a visible difference within 7–14 days of consistent daily use. Full results are typically visible after 28 days. For best results, use every morning and evening on clean skin.',
          },
          {
            id: 'faq2',
            question: 'Is it safe for sensitive skin?',
            answer: 'Yes! Our formula is dermatologist-tested and free from parabens, sulfates, and artificial fragrances. It\'s suitable for all skin types including sensitive skin. We recommend a patch test before full application.',
          },
          {
            id: 'faq3',
            question: 'What\'s your return policy?',
            answer: 'We offer a 30-day no-questions-asked money-back guarantee. If you\'re not completely satisfied with your results, contact our support team for a full refund. We stand behind our product 100%.',
          },
          {
            id: 'faq4',
            question: 'Do you ship internationally?',
            answer: 'We currently ship to the US, Canada, UK, EU, and Australia. Standard shipping takes 3–7 business days. Free shipping on all orders over $30. Express delivery available at checkout.',
          },
        ],
      } satisfies FAQData,
    },
    {
      id: 'tp_cta',
      type: 'cta',
      label: 'Final CTA',
      visible: true,
      data: {
        text: '🛒 View Official Product',
        subtext: 'Join thousands of happy customers.',
        url: '',
        style: 'gradient',
      } satisfies CTAData,
    },
  ]
}

export function getTemplateConfig(
  templateId: string,
  overrides: { id?: string; title?: string; slug?: string; status?: 'draft' | 'published' },
): LandingConfig | null {
  switch (templateId) {
    case 'tiktok-product':
      return {
        id: overrides.id,
        title: overrides.title ?? 'TikTok Product',
        slug: overrides.slug ?? 'tiktok-product',
        status: overrides.status ?? 'draft',
        destinationUrl: '',
        template: 'trust_product',
        theme: {
          primaryColor: '#FF2D55',
          secondaryColor: '#8B5CF6',
          backgroundColor: '#0B0B12',
          textColor: '#FFFFFF',
          fontFamily: 'Inter',
          radius: 'soft',
          backgroundMode: 'solid',
          accentColor: '#FF4D6A',
          secondaryTextColor: '#A1A1AA',
          cardBackgroundColor: '#18181F',
          elementBackgroundColor: '#252530',
          borderColor: '#2E2E3A',
          buttonTextColor: '#FFFFFF',
          buttonStyle: 'gradient',
          buttonGradientFrom: '#FF2D55',
          buttonGradientTo: '#8B5CF6',
        },
        settings: {
          showTokproofBranding: true,
          enableTikTokRescue: false,
          directExitUrl: '',
          seoTitle: overrides.title ?? 'TikTok Product',
          seoDescription: '',
        },
        blocks: makeTikTokProductBlocks(),
      }
    case 'conversion-max':
      return {
        id: overrides.id,
        title: overrides.title ?? 'Conversion Max',
        slug: overrides.slug ?? 'conversion-max',
        status: overrides.status ?? 'draft',
        destinationUrl: '',
        template: 'trust_product',
        theme: {
          primaryColor: '#7C3AED',
          secondaryColor: '#A855F7',
          backgroundColor: '#FFFFFF',
          textColor: '#111111',
          fontFamily: 'Inter',
          radius: 'soft',
          backgroundMode: 'solid',
          accentColor: '#A855F7',
          secondaryTextColor: '#6B7280',
          cardBackgroundColor: '#F9FAFB',
          elementBackgroundColor: '#F5F3FF',
          borderColor: '#E5E7EB',
          buttonTextColor: '#FFFFFF',
          buttonStyle: 'gradient',
          buttonGradientFrom: '#7C3AED',
          buttonGradientTo: '#A855F7',
        },
        settings: {
          showTokproofBranding: true,
          enableTikTokRescue: false,
          directExitUrl: '',
          seoTitle: overrides.title ?? 'Conversion Max',
          seoDescription: '',
        },
        blocks: makeConversionMaxBlocks(),
      }
    default:
      return null
  }
}

// ─── Conversion Max ───────────────────────────────────────────────────────────
function makeConversionMaxBlocks(): LandingBlock[] {
  return [
    // 1. Hero del producto
    {
      id: 'cm_hero',
      type: 'hero_product',
      label: 'Hero del producto',
      visible: true,
      data: {
        headline: 'El producto viral que está arrasando en TikTok',
        subheadline: 'Miles de personas ya lo están usando y compartiendo sus resultados.',
        description: 'Ahora disponible con descuento exclusivo por tiempo limitado.',
        imageUrl: '',
        badgeText: '⚡ Más vendido',
        showBadge: true,
        showRating: true,
        rating: '4.9',
      } satisfies HeroProductData,
    },

    // 2. Urgencia / Oferta
    {
      id: 'cm_urgency',
      type: 'urgency_offer',
      label: 'Urgencia / Oferta',
      visible: true,
      data: {
        title: 'Solo quedan 12 unidades',
        description: 'Descuento exclusivo disponible hoy.',
        badgeText: '🔥 Oferta limitada',
        countdownEnabled: true,
        countdownText: 'Quedan pocas horas',
        ctaText: '🛒 Aprovechar oferta',
        ctaUrl: '',
      } satisfies UrgencyOfferData,
    },

    // 3. Trust Badges
    {
      id: 'cm_trust',
      type: 'trust_badges',
      label: 'Trust Badges',
      visible: true,
      data: {
        badges: [
          { id: 'cm_tb1', icon: 'shipping'  as const, title: 'Envío gratuito',   description: 'En todos los pedidos', enabled: true },
          { id: 'cm_tb2', icon: 'secure'    as const, title: 'Pago seguro SSL',  description: 'Cifrado 256-bit',      enabled: true },
          { id: 'cm_tb3', icon: 'guarantee' as const, title: 'Garantía 30 días', description: 'Sin preguntas',        enabled: true },
        ],
      } satisfies TrustBadgesData,
    },

    // 4. TikTok Comment Cards
    {
      id: 'cm_tcc',
      type: 'tiktok_comment_cards',
      label: 'TikTok Comment Cards',
      visible: true,
      data: {
        title: "TikTok Can't Get Enough",
        showTitle: true,
        showTikTokIcon: true,
        layout: 'carousel' as const,
        cardShadow: 'none' as const,
        comments: [
          { id: 'cm_c1', enabled: true, avatarUrl: '', username: '@maria_beauty',  text: 'WOW. No esperaba que funcionara tan bien 😍 Lo estoy recomendando a toda mi familia.',   timeAgo: '2d ago', likes: '2.3K', verified: true  } satisfies TikTokCommentCard,
          { id: 'cm_c2', enabled: true, avatarUrl: '', username: '@shopper_alex',  text: 'Lo vi en TikTok y ahora entiendo el hype. Llegó en 2 días y la calidad es increíble.', timeAgo: '5d ago', likes: '1.8K', verified: false } satisfies TikTokCommentCard,
          { id: 'cm_c3', enabled: true, avatarUrl: '', username: '@lucia.reviews', text: 'Mi mejor compra de este año 🔥 Los resultados son reales, lo tengo que recomendar.',    timeAgo: '1w ago', likes: '4.1K', verified: true  } satisfies TikTokCommentCard,
          { id: 'cm_c4', enabled: true, avatarUrl: '', username: '@real_compras',  text: 'Llegó súper rápido y la calidad es increíble. Ya pedí una segunda unidad para regalo.', timeAgo: '3d ago', likes: '987',  verified: false } satisfies TikTokCommentCard,
        ],
      } satisfies TikTokCommentCardsData,
    },

    // 5. Benefit Icons Row
    {
      id: 'cm_bir',
      type: 'benefit_icons_row',
      label: 'Benefit Icons Row',
      visible: true,
      data: {
        title: 'Por qué funciona',
        subtitle: '',
        showTitle: true,
        showSubtitle: false,
        showDividers: false,
        layout: 'grid' as const,
        itemShadow: 'none' as const,
        items: [
          { id: 'cm_bi1', enabled: true, icon: '✨', title: 'Resultados visibles', description: 'Desde la primera semana de uso'    } satisfies BenefitIconsItem,
          { id: 'cm_bi2', enabled: true, icon: '💧', title: 'Fácil de usar',       description: 'No requiere experiencia previa'   } satisfies BenefitIconsItem,
          { id: 'cm_bi3', enabled: true, icon: '🛡️', title: 'Seguro y probado',   description: 'Dermatológicamente testado'        } satisfies BenefitIconsItem,
          { id: 'cm_bi4', enabled: true, icon: '⚡', title: 'Resultados rápidos',  description: 'En menos de 7 días'              } satisfies BenefitIconsItem,
        ],
      } satisfies BenefitIconsRowData,
    },

    // 6. Before / After
    {
      id: 'cm_ba',
      type: 'before_after',
      label: 'Antes / Después',
      visible: true,
      data: {
        title: 'Resultados reales',
        subtitle: 'Mira la diferencia después de usar el producto.',
        badgeText: '✓ Resultados verificados',
        mode: 'cards' as const,
        beforeImageUrl: '',
        afterImageUrl: '',
        beforeLabel: 'Antes',
        afterLabel: 'Después',
        beforeDescription: 'Sin el producto: resultados limitados y lentos.',
        afterDescription: 'Con el producto: transformación visible en días.',
        showBadge: true,
        showSubtitle: true,
        showDescriptions: true,
        showCTA: false,
        buttonText: 'Ver producto',
        buttonUrl: '',
        borderRadius: 'soft' as const,
        shadowIntensity: 'soft' as const,
      } satisfies BeforeAfterData,
    },

    // 7. Comparativa
    {
      id: 'cm_comp',
      type: 'comparison',
      label: 'Comparativa',
      visible: true,
      data: {
        title: '¿Por qué elegirnos?',
        leftTitle: 'Competencia',
        rightTitle: 'Nosotros',
        rows: [
          { id: 'cm_cr1', label: 'Resultados',   leftValue: '❌', rightValue: '✅', winner: 'right' as const } satisfies ComparisonRow,
          { id: 'cm_cr2', label: 'Garantía',     leftValue: '❌', rightValue: '✅', winner: 'right' as const } satisfies ComparisonRow,
          { id: 'cm_cr3', label: 'Envío rápido', leftValue: '❌', rightValue: '✅', winner: 'right' as const } satisfies ComparisonRow,
          { id: 'cm_cr4', label: 'Soporte',      leftValue: '❌', rightValue: '✅', winner: 'right' as const } satisfies ComparisonRow,
        ],
      } satisfies ComparisonData,
    },

    // 8. Product Showcase
    {
      id: 'cm_showcase',
      type: 'featured_product',
      label: 'Product Showcase',
      visible: true,
      data: {
        imageUrl: '',
        badgeText: '⭐ Más vendido',
        productName: 'Todo lo que incluye',
        description: 'Un producto completo diseñado para darte resultados reales desde el primer uso.',
        rating: 4.9,
        reviewCount: '1.2K',
        price: '39,99€',
        compareAtPrice: '59,99€',
        discountText: '-33%',
        benefits: [
          'Calidad premium certificada',
          'Fácil de utilizar en casa',
          'Resultados visibles en días',
          'Miles de clientes satisfechos',
        ],
        buttonText: '🛒 Ver producto oficial',
        buttonUrl: '',
        showBadge: true,
        showRating: true,
        showReviews: true,
        showPrice: true,
        showCompareAtPrice: true,
        showDiscount: true,
        showBenefits: true,
        layout: 'card' as const,
        colorTheme: 'light' as const,
        buttonStyle: 'filled' as const,
      } satisfies FeaturedProductData,
    },

    // 9. FAQ
    {
      id: 'cm_faq',
      type: 'faq',
      label: 'Preguntas frecuentes',
      visible: true,
      data: {
        title: 'Preguntas frecuentes',
        items: [
          { id: 'cm_faq1', question: '¿Cuánto tarda el envío?',  answer: 'Entre 2 y 5 días laborables. Recibirás un email con el número de seguimiento en cuanto se procese tu pedido.' },
          { id: 'cm_faq2', question: '¿Tiene garantía?',         answer: 'Sí, ofrecemos 30 días de garantía total. Si no estás satisfecho, te devolvemos el dinero sin preguntas.' },
          { id: 'cm_faq3', question: '¿Es fácil de usar?',       answer: 'Sí, está diseñado para cualquier persona. No necesitas experiencia previa. Incluye instrucciones y soporte.' },
        ],
      } satisfies FAQData,
    },

    // 10. CTA Final
    {
      id: 'cm_cta',
      type: 'cta',
      label: 'Botón CTA',
      visible: true,
      data: {
        text: '🛒 Comprar ahora',
        subtext: 'Únete a miles de clientes satisfechos.',
        url: '',
        style: 'gradient' as const,
      } satisfies CTAData,
    },

    // 11. Footer Legal
    {
      id: 'cm_footer',
      type: 'footer_legal',
      label: 'Footer Legal',
      visible: true,
      data: {
        brandName: 'Mi Marca',
        contactEmail: 'hola@mimarca.com',
        privacyUrl: '',
        termsUrl: '',
        showTokproofBranding: true,
        legalText: '',
      } satisfies FooterLegalData,
    },
  ]
}
