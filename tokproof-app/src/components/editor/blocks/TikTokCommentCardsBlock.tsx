'use client'

import type { LandingBlock, LandingTheme, TikTokCommentCardsData, TikTokCommentCard } from '@/types/landing'

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_COMMENTS: TikTokCommentCard[] = [
  { id: 'tcc1', enabled: true, avatarUrl: '', username: '@glowwithmaria',  text: "I was skeptical but WOW. So worth it!! 💕",           timeAgo: '1w ago', likes: '1.8K', verified: true  },
  { id: 'tcc2', enabled: true, avatarUrl: '', username: '@skinbyalexa',    text: "The glow is unmatched ✨ My new holy grail.",           timeAgo: '5d ago', likes: '1.2K', verified: true  },
  { id: 'tcc3', enabled: true, avatarUrl: '', username: '@beautywithlex',  text: "Everyone needs this in their routine 🔥",               timeAgo: '3d ago', likes: '987',  verified: true  },
]

const DEFAULT_DATA: TikTokCommentCardsData = {
  title: "TikTok Can't Get Enough",
  showTitle: true,
  showTikTokIcon: true,
  layout: 'carousel',
  comments: DEFAULT_COMMENTS,
}

// ─── Avatar colors ────────────────────────────────────────────────────────────
const AV_COLORS = ['#FF2D55','#7B61FF','#0EA5E9','#10B981','#F59E0B','#8B5CF6']

function getAvatarColor(name: string): string {
  return AV_COLORS[name.charCodeAt(0) % AV_COLORS.length] ?? '#FF2D55'
}

function getInitials(name: string): string {
  const clean = name.replace(/^@/, '')
  const words = clean.trim().split(/[\s._]+/)
  return words.map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
}

// ─── Radius map ───────────────────────────────────────────────────────────────
const RADIUS_MAP: Record<string, number> = { square: 0, soft: 14, medium: 18, round: 24 }
const SHADOW_MAP: Record<string, string> = {
  none:   'none',
  soft:   '0 2px 14px rgba(0,0,0,0.14)',
  medium: '0 4px 22px rgba(0,0,0,0.22)',
  strong: '0 8px 32px rgba(0,0,0,0.32)',
}

// ─── TikTok logo icon ─────────────────────────────────────────────────────────
function TikTokLogo({ size = 22, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
    </svg>
  )
}

// ─── Heart icon ───────────────────────────────────────────────────────────────
function HeartIcon({ size = 14, color = '#FF2D55' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

// ─── Comment card ─────────────────────────────────────────────────────────────
function CommentCard({
  comment, cardBg, textColor, usernameColor, metaColor, accentColor, radius, shadow,
}: {
  comment: TikTokCommentCard
  cardBg: string; textColor: string; usernameColor: string; metaColor: string; accentColor: string
  radius: number; shadow: string
}) {
  const bg = comment.avatarUrl ? 'transparent' : getAvatarColor(comment.username)
  const initials = getInitials(comment.username)

  return (
    <div style={{
      minWidth: 260, width: 260, flexShrink: 0,
      background: cardBg,
      borderRadius: radius,
      boxShadow: shadow,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      scrollSnapAlign: 'start',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Top: avatar + username + verified */}
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
            : <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{initials}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: usernameColor,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {comment.username}
            </span>
            {comment.verified && (
              <div style={{
                width: 15, height: 15, borderRadius: '50%',
                background: '#20d5ec',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontSize: 8, fontWeight: 900, lineHeight: 1 }}>✓</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment text */}
      <p style={{
        margin: 0,
        fontSize: 14, lineHeight: 1.5, color: textColor,
        flex: 1,
      }}>
        {comment.text}
      </p>

      {/* Footer: likes + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <HeartIcon size={14} color={accentColor} />
          <span style={{ fontSize: 12, fontWeight: 600, color: metaColor }}>{comment.likes}</span>
        </div>
        <span style={{ fontSize: 11, color: metaColor }}>{comment.timeAgo}</span>
      </div>
    </div>
  )
}

// ─── Main block ───────────────────────────────────────────────────────────────
interface Props {
  block: LandingBlock
  theme: LandingTheme
}

export default function TikTokCommentCardsBlock({ block, theme }: Props) {
  const d = { ...DEFAULT_DATA, ...(block.data as Partial<TikTokCommentCardsData>) }
  const comments = (d.comments ?? DEFAULT_COMMENTS).filter(c => c.enabled !== false)

  const sectionBg  = d.sectionBackground  ?? theme.backgroundColor  ?? '#0B0B12'
  const titleClr   = d.titleColor         ?? theme.textColor         ?? '#ffffff'
  const accentClr  = d.accentColor        ?? theme.primaryColor      ?? '#FF2D55'
  const cardBg     = d.cardBackground     ?? (theme.cardBackgroundColor ?? '#1a1a22')
  const textClr    = d.cardTextColor      ?? theme.textColor         ?? '#ffffff'
  const userClr    = d.usernameColor      ?? theme.textColor         ?? '#ffffff'
  const metaClr    = d.metaColor          ?? 'rgba(255,255,255,0.50)'
  const radius     = RADIUS_MAP[d.cardRadius ?? 'soft'] ?? 14
  const shadow     = SHADOW_MAP[d.cardShadow ?? 'soft'] ?? SHADOW_MAP.soft
  const spTop      = d.spacingTop  ?? 28
  const spBottom   = d.spacingBottom ?? 28

  return (
    <section style={{
      background: sectionBg,
      paddingTop: spTop,
      paddingBottom: spBottom,
      width: '100%',
    }}>
      {/* Section header */}
      {d.showTitle && d.title && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginBottom: 20, paddingLeft: 16, paddingRight: 16,
        }}>
          {d.showTikTokIcon && <TikTokLogo size={22} color={accentClr} />}
          <h2 style={{
            margin: 0,
            fontSize: 20, fontWeight: 800, color: titleClr,
            letterSpacing: '-0.02em', textAlign: 'center',
          }}>
            {d.title}
          </h2>
        </div>
      )}

      {/* Cards */}
      {comments.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: metaClr, fontSize: 13, fontStyle: 'italic' }}>
          No comments yet — add some in the editor.
        </div>
      ) : d.layout === 'carousel' ? (
        /* ── Carousel / horizontal scroll ── */
        <div style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingLeft: 16, paddingRight: 16,
          paddingBottom: 8,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          // hide scrollbar
        }}
          className="tcc-scroll"
        >
          {comments.map(c => (
            <CommentCard
              key={c.id}
              comment={c}
              cardBg={cardBg} textColor={textClr} usernameColor={userClr}
              metaColor={metaClr} accentColor={accentClr}
              radius={radius} shadow={shadow}
            />
          ))}
          {/* Spacer so last card isn't flush on iOS */}
          <div style={{ minWidth: 4, flexShrink: 0 }} />
        </div>
      ) : (
        /* ── Grid layout ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 14,
          paddingLeft: 16, paddingRight: 16,
        }}>
          {comments.map(c => (
            <CommentCard
              key={c.id}
              comment={c}
              cardBg={cardBg} textColor={textClr} usernameColor={userClr}
              metaColor={metaClr} accentColor={accentClr}
              radius={radius} shadow={shadow}
            />
          ))}
        </div>
      )}

      <style>{`
        .tcc-scroll::-webkit-scrollbar { display: none; }
        .tcc-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
