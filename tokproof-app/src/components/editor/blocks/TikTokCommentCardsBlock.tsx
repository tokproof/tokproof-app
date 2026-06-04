'use client'

import type { LandingBlock, LandingTheme, TikTokCommentCardsData, TikTokCommentCard } from '@/types/landing'

// ─── Default demo comments ────────────────────────────────────────────────────
const DEFAULT_COMMENTS: TikTokCommentCard[] = [
  { id: 'tcc1', enabled: true, avatarUrl: '', username: '@glowwithmaria',  text: "I was skeptical but WOW. So worth it!! 💕",        timeAgo: '1w ago', likes: '1.8K', verified: true  },
  { id: 'tcc2', enabled: true, avatarUrl: '', username: '@skinbyalexa',    text: "The glow is unmatched ✨ My new holy grail.",        timeAgo: '5d ago', likes: '1.2K', verified: true  },
  { id: 'tcc3', enabled: true, avatarUrl: '', username: '@beautywithlex',  text: "Everyone needs this in their routine 🔥",            timeAgo: '3d ago', likes: '987',  verified: true  },
]

// ─── Avatar helper ────────────────────────────────────────────────────────────
const AV_COLORS = ['#FF2D55','#7B61FF','#0EA5E9','#10B981','#F59E0B','#8B5CF6']

function avatarBg(name: string): string {
  return AV_COLORS[name.charCodeAt(0) % AV_COLORS.length] ?? '#FF2D55'
}
function initials(name: string): string {
  const clean = name.replace(/^@/, '').trim()
  return (clean.split(/[\s._]+/).map(w => w[0] ?? '').join('').slice(0, 2) || clean.slice(0, 1)).toUpperCase() || '?'
}

// ─── Style maps ───────────────────────────────────────────────────────────────
const RADIUS_MAP: Record<string, number> = { square: 0, soft: 14, medium: 18, round: 24 }
const SHADOW_MAP: Record<string, string> = {
  none:   'none',
  soft:   '0 2px 14px rgba(0,0,0,0.14)',
  medium: '0 4px 22px rgba(0,0,0,0.22)',
  strong: '0 8px 32px rgba(0,0,0,0.32)',
}
// Maps block.style.spacing (compact/normal/airy) → section padding px
const SPACING_PY: Record<string, number> = { compact: 12, normal: 24, airy: 40 }

// ─── TikTok logo ──────────────────────────────────────────────────────────────
function TikTokLogo({ size = 20, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  )
}

// ─── Heart icon ───────────────────────────────────────────────────────────────
function HeartFilled({ size = 13, color = '#FF2D55' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

// ─── Single comment card ──────────────────────────────────────────────────────
function CommentCard({
  comment, cardBg, textColor, usernameColor, metaColor, accentColor, cardBorder, radius, shadow,
}: {
  comment:      TikTokCommentCard
  cardBg:       string; textColor: string; usernameColor: string
  metaColor:    string; accentColor: string; cardBorder: string
  radius:       number; shadow: string
}) {
  const bg  = comment.avatarUrl ? 'transparent' : avatarBg(comment.username)
  const ini = initials(comment.username)

  return (
    <div style={{
      minWidth: 260, width: 260, flexShrink: 0,
      background: cardBg,
      borderRadius: radius,
      boxShadow: shadow,
      padding: '16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      scrollSnapAlign: 'start',
      border: `1px solid ${cardBorder}`,
    }}>
      {/* Top row: avatar + username + verified */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          overflow: 'hidden', background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.12)',
        }}>
          {comment.avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={comment.avatarUrl} alt={comment.username} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1, userSelect: 'none' }}>{ini}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: usernameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {comment.username}
          </span>
          {comment.verified && (
            <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#20d5ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: 8, fontWeight: 900, lineHeight: 1 }}>✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Comment text */}
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: textColor, flex: 1 }}>
        {comment.text}
      </p>

      {/* Footer: likes + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <HeartFilled size={13} color={accentColor} />
          <span style={{ fontSize: 12, fontWeight: 600, color: metaColor }}>{comment.likes}</span>
        </div>
        <span style={{ fontSize: 11, color: metaColor }}>{comment.timeAgo}</span>
      </div>
    </div>
  )
}

// ─── Main block ───────────────────────────────────────────────────────────────
export default function TikTokCommentCardsBlock({ block, theme }: { block: LandingBlock; theme: LandingTheme }) {
  const d = block.data as Partial<TikTokCommentCardsData>
  const s = block.style ?? {}

  const comments = (d.comments ?? DEFAULT_COMMENTS).filter(c => c.enabled !== false)

  // ── Resolve colors: block.style → block.data → theme → hard default ──
  const sectionBg   = s.backgroundColor       ?? d.sectionBackground  ?? theme.backgroundColor           ?? '#0B0B12'
  const titleClr    = s.textColor              ?? d.titleColor         ?? theme.textColor                 ?? '#ffffff'
  const accentClr   = s.accentColor            ?? d.accentColor        ?? theme.primaryColor              ?? '#FF2D55'
  const cardBg      = s.elementBackgroundColor ?? d.cardBackground     ?? theme.cardBackgroundColor       ?? '#1a1a22'
  const cardBorder  = s.borderColor                                    ?? 'rgba(255,255,255,0.07)'
  const textClr     = s.textColor              ?? d.cardTextColor      ?? theme.textColor                 ?? '#ffffff'
  const userClr     = s.textColor              ?? d.usernameColor      ?? theme.textColor                 ?? '#ffffff'
  const metaClr     = d.metaColor              ?? 'rgba(255,255,255,0.50)'

  // ── Radius from block.style.borderRadius ──
  const radius  = RADIUS_MAP[s.borderRadius ?? d.cardRadius ?? 'soft'] ?? 14
  // ── Shadow from block.data (no standard equivalent) ──
  const shadow  = SHADOW_MAP[d.cardShadow ?? 'soft'] ?? SHADOW_MAP.soft

  // ── Section padding from block.style.spacing (compact/normal/airy) ──
  const py = SPACING_PY[s.spacing ?? 'normal'] ?? 24

  const showTitle  = d.showTitle ?? true
  const showIcon   = d.showTikTokIcon ?? true
  const title      = d.title ?? "TikTok Can't Get Enough"
  const layout     = d.layout ?? 'carousel'

  return (
    <section style={{ background: sectionBg, paddingTop: py, paddingBottom: py, width: '100%' }}>

      {/* Section header */}
      {showTitle && title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20, paddingLeft: 16, paddingRight: 16 }}>
          {showIcon && <TikTokLogo size={20} color={accentClr} />}
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: titleClr, letterSpacing: '-0.02em', textAlign: 'center' }}>
            {title}
          </h2>
        </div>
      )}

      {/* Empty state */}
      {comments.length === 0 && (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: metaClr, fontSize: 13, fontStyle: 'italic' }}>
          No comments — add some in the editor.
        </div>
      )}

      {/* Carousel */}
      {comments.length > 0 && layout === 'carousel' && (
        <div className="tcc-scroll" style={{
          display: 'flex', gap: 14,
          overflowX: 'auto',
          // paddingRight intentionally omitted — right spacer div handles it
          paddingLeft: 20, paddingBottom: 8,
          scrollSnapType: 'x mandatory',
          scrollPaddingLeft: 20,
          WebkitOverflowScrolling: 'touch',
        }}>
          {comments.map(c => (
            <CommentCard key={c.id} comment={c} cardBg={cardBg} textColor={textClr} usernameColor={userClr} metaColor={metaClr} accentColor={accentClr} cardBorder={cardBorder} radius={radius} shadow={shadow} />
          ))}
          {/* Right spacer — ensures last card has trailing space on iOS/Android */}
          <div style={{ minWidth: 20, flexShrink: 0 }} />
        </div>
      )}

      {/* Grid */}
      {comments.length > 0 && layout === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, paddingLeft: 16, paddingRight: 16 }}>
          {comments.map(c => (
            <CommentCard key={c.id} comment={c} cardBg={cardBg} textColor={textClr} usernameColor={userClr} metaColor={metaClr} accentColor={accentClr} cardBorder={cardBorder} radius={radius} shadow={shadow} />
          ))}
        </div>
      )}

      <style>{`.tcc-scroll::-webkit-scrollbar{display:none}.tcc-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </section>
  )
}
