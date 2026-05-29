import type { LandingConfig } from '@/types/landing'
import { FONT_FAMILIES, getPageBackground } from '@/lib/blockStyle'
import BlockRenderer from '@/components/editor/BlockRenderer'

interface Props {
  config: LandingConfig
}

export default function LandingPageRenderer({ config }: Props) {
  const fontFamily = FONT_FAMILIES[config.theme.fontFamily] ?? config.theme.fontFamily

  return (
    <div style={{
      minHeight: '100vh',
      background: getPageBackground(config.theme),
      color: config.theme.textColor,
      fontFamily,
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {config.blocks
          .filter(b => b.visible)
          .map(block => (
            <BlockRenderer key={block.id} block={block} theme={config.theme} />
          ))
        }
      </div>
    </div>
  )
}
