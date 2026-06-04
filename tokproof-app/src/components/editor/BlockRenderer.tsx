import type { LandingBlock, LandingTheme } from '@/types/landing'
import HeroProductBlock  from './blocks/HeroProductBlock'
import BenefitsBlock     from './blocks/BenefitsBlock'
import LinkListBlock     from './blocks/LinkListBlock'
import FAQBlock          from './blocks/FAQBlock'
import CTABlock          from './blocks/CTABlock'
import ProfileHeaderBlock from './blocks/ProfileHeaderBlock'
import SocialLinksBlock  from './blocks/SocialLinksBlock'
import ProductGridBlock  from './blocks/ProductGridBlock'
import TrustBadgesBlock  from './blocks/TrustBadgesBlock'
import ComparisonBlock   from './blocks/ComparisonBlock'
import UrgencyOfferBlock    from './blocks/UrgencyOfferBlock'
import FooterLegalBlock      from './blocks/FooterLegalBlock'
import FeaturedProductBlock   from './blocks/FeaturedProductBlock'
import PartnerDiscountsBlock  from './blocks/PartnerDiscountsBlock'
import BeforeAfterBlock       from './blocks/BeforeAfterBlock'
import TikTokCommentsBlock      from './blocks/TikTokCommentsBlock'
import TikTokCommentCardsBlock  from './blocks/TikTokCommentCardsBlock'
import BenefitIconsRowBlock     from './blocks/BenefitIconsRowBlock'

interface Props {
  block: LandingBlock
  theme: LandingTheme
}

export default function BlockRenderer({ block, theme }: Props) {
  switch (block.type) {
    case 'hero_product':   return <HeroProductBlock  block={block} theme={theme} />
    case 'benefits':       return <BenefitsBlock     block={block} theme={theme} />
    case 'link_list':      return <LinkListBlock      block={block} theme={theme} />
    case 'faq':            return <FAQBlock           block={block} theme={theme} />
    case 'cta':            return <CTABlock           block={block} theme={theme} />
    case 'profile_header': return <ProfileHeaderBlock block={block} theme={theme} />
    case 'social_links':   return <SocialLinksBlock   block={block} theme={theme} />
    case 'product_grid':   return <ProductGridBlock   block={block} theme={theme} />
    case 'trust_badges':   return <TrustBadgesBlock   block={block} theme={theme} />
    case 'comparison':     return <ComparisonBlock    block={block} theme={theme} />
    case 'urgency_offer':    return <UrgencyOfferBlock    block={block} theme={theme} />
    case 'footer_legal':     return <FooterLegalBlock     block={block} theme={theme} />
    case 'featured_product':   return <FeaturedProductBlock   block={block} theme={theme} />
    case 'partner_discounts':  return <PartnerDiscountsBlock  block={block} theme={theme} />
    case 'before_after':       return <BeforeAfterBlock       block={block} theme={theme} />
    case 'tiktok_comments':       return <TikTokCommentsBlock       block={block} theme={theme} />
    case 'tiktok_comment_cards':  return <TikTokCommentCardsBlock   block={block} theme={theme} />
    case 'benefit_icons_row':     return <BenefitIconsRowBlock      block={block} theme={theme} />
    // Stubs for future blocks
    case 'reviews':
      return (
        <div style={{ padding: '16px 18px', background: theme.backgroundColor, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
            {block.label} — próximamente
          </span>
        </div>
      )
    default:
      return null
  }
}
