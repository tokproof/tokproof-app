import type { LandingBlock, LandingTheme } from '@/types/landing'
import HeroProductBlock from './blocks/HeroProductBlock'
import BenefitsBlock from './blocks/BenefitsBlock'
import LinkListBlock from './blocks/LinkListBlock'
import FAQBlock from './blocks/FAQBlock'
import CTABlock from './blocks/CTABlock'

interface Props {
  block: LandingBlock
  theme: LandingTheme
}

export default function BlockRenderer({ block, theme }: Props) {
  switch (block.type) {
    case 'hero_product':
      return <HeroProductBlock block={block} theme={theme} />
    case 'benefits':
      return <BenefitsBlock block={block} theme={theme} />
    case 'link_list':
      return <LinkListBlock block={block} theme={theme} />
    case 'faq':
      return <FAQBlock block={block} theme={theme} />
    case 'cta':
      return <CTABlock block={block} theme={theme} />
    // Stubs for future blocks — render an empty placeholder so the page builds
    case 'tiktok_comments':
    case 'reviews':
    case 'profile_header':
    case 'product_grid':
    case 'trust_badges':
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
