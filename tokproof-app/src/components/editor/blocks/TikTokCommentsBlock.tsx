'use client'

import { useState, useRef, useEffect } from 'react'
import type { LandingBlock, LandingTheme, TikTokCommentsData, TikTokComment, TikTokReply } from '@/types/landing'

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_COMMENTS: TikTokComment[] = [
  {
    id: 'tc1', avatarUrl: '', username: 'Tri G🌸🥰👣', verified: true,
    text: 'Quiero ver donde le entregan el pan🥰',
    imageUrl: '', likes: '13', date: '3 h',
    replyItems: [
      { id: 'r1a', avatarUrl: '', username: 'GlowSkin Oficial 💗', verified: true, text: '¡Entregamos en toda España! Usa el código TIKTOK para un 15% off 📦🇪🇸', likes: '7', date: '2 h' },
    ],
    showReply: true, showLikes: true, showReplies: true,
  },
  {
    id: 'tc2', avatarUrl: '', username: 'Mira que bonito', verified: false,
    text: 'Mira que bonito se le ven esos zapatitoosss',
    imageUrl: '', likes: '24.7 mil', date: '1 d',
    replyItems: [
      { id: 'r2a', avatarUrl: '', username: 'Fashionista 💅',  verified: false, text: 'Jajaja exactamente lo que yo dije!!', likes: '127', date: '22 h' },
      { id: 'r2b', avatarUrl: '', username: 'Laura M.',        verified: false, text: 'Son divinos 😍 yo ya los pedí', likes: '38', date: '1 d' },
    ],
    showReply: true, showLikes: true, showReplies: true,
  },
  {
    id: 'tc3', avatarUrl: '', username: 'Antoni ⺣', verified: false,
    text: 'Necesito uno para mi michi 🤣',
    imageUrl: '', likes: '824', date: '2 d',
    replyItems: [],
    showReply: true, showLikes: true, showReplies: false,
  },
]

const DEFAULT_DATA: TikTokCommentsData = {
  title: '', subtitle: '', badgeText: '',
  showTitle: false, showSubtitle: false, showBadge: false,
  layout: 'feed',
  comments: DEMO_COMMENTS,
  showArrows: true, showDots: true, autoplay: false, autoplaySpeed: 3,
  borderRadius: 'soft', shadowIntensity: 'soft', spacing: 'normal',
}

// ─── Maps ─────────────────────────────────────────────────────────────────────
const SHADOW_MAP: Record<string, string> = {
  none: 'none', soft: '0 2px 16px rgba(0,0,0,0.06)', medium: '0 4px 24px rgba(0,0,0,0.11)',
}
const RADIUS_MAP: Record<string, number> = {
  square: 0, soft: 10, medium: 16, round: 24,
}
const SPACING_MAP: Record<string, { py: number; px: number }> = {
  compact: { py: 8,  px: 14 },
  normal:  { py: 13, px: 16 },
  airy:    { py: 17, px: 18 },
}

// ─── Colors ───────────────────────────────────────────────────────────────────
function resolveColors(d: TikTokCommentsData) {
  const c = d.colors ?? {}
  return {
    bg:       c.sectionBg      ?? '#ffffff',
    card:     c.cardBg         ?? '#ffffff',
    name:     c.nameColor      ?? '#161823',
    text:     c.textColor      ?? '#161823',
    likes:    c.likesColor     ?? '#161823',
    link:     c.linkColor      ?? '#6b7280',
    badge:    c.badgeColor     ?? '#F647A9',
    verified: c.verifiedColor  ?? '#20d5ec',
    sep:      c.separatorColor ?? '#f1f1f2',
  }
}
type C = ReturnType<typeof resolveColors>

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AV_COLORS = ['#F647A9','#7B61FF','#0EA5E9','#10B981','#F59E0B','#EF4444']

function Avatar({ url, name, size = 44 }: { url: string; name: string; size?: number }) {
  const letters  = name.split('').filter(ch => /[a-zA-ZÀ-ÿ]/.test(ch)).join('')
  const initials = letters.trim().split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
               || name.slice(0, 1).toUpperCase() || '?'
  const bg = AV_COLORS[name.charCodeAt(0) % AV_COLORS.length] ?? '#F647A9'
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: url ? 'transparent' : bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {url
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <span style={{ color: '#fff', fontSize: size * 0.36, fontWeight: 700, lineHeight: 1, userSelect: 'none' }}>{initials}</span>
      }
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function HeartOutline({ size = 19, color = '#161823' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ThumbDown({ size = 17, color = '#6b7280' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  )
}

// ─── Verified badge ───────────────────────────────────────────────────────────
function VerifiedBadge({ color }: { color: string }) {
  return (
    <div style={{ width: 15, height: 15, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: '#fff', fontSize: 8.5, fontWeight: 900, lineHeight: 1 }}>✓</span>
    </div>
  )
}

// ─── Reply row ────────────────────────────────────────────────────────────────
function ReplyRow({ reply, C }: { reply: TikTokReply; C: C }) {
  return (
    <div style={{ display: 'flex', gap: 10, paddingTop: 10, paddingBottom: 10 }}>
      <Avatar url={reply.avatarUrl} name={reply.username} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.name, lineHeight: 1.2 }}>{reply.username}</span>
            {reply.verified && <VerifiedBadge color={C.verified} />}
          </div>
          <span style={{ fontSize: 16, color: C.link, lineHeight: 1, paddingLeft: 6, flexShrink: 0, letterSpacing: 2 }}>···</span>
        </div>
        {/* Text */}
        <p style={{ margin: '0 0 6px', fontSize: 13.5, color: C.text, lineHeight: 1.5, wordBreak: 'break-word' }}>
          {reply.text}
        </p>
        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11.5, color: C.link }}>{reply.date}</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.link }}>Responder</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <HeartOutline size={17} color={C.likes} />
              <span style={{ fontSize: 11, color: C.likes }}>{reply.likes}</span>
            </div>
            <ThumbDown size={15} color={C.link} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Comment row (with collapsible replies) ───────────────────────────────────
function CommentRow({ c, C, sp }: { c: TikTokComment; C: C; sp: { py: number; px: number } }) {
  const [open, setOpen] = useState(false)
  const replies    = c.replyItems ?? []
  const replyCount = replies.length

  return (
    <div>
      {/* Main comment body */}
      <div style={{ display: 'flex', gap: 12, paddingTop: sp.py, paddingBottom: sp.py }}>
        <Avatar url={c.avatarUrl} name={c.username} size={44} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Username + verified + ··· */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.name, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                {c.username}
              </span>
              {c.verified && <VerifiedBadge color={C.verified} />}
            </div>
            <span style={{ fontSize: 18, color: C.link, lineHeight: 1, paddingLeft: 8, flexShrink: 0, letterSpacing: 2 }}>···</span>
          </div>

          {/* Comment text */}
          <p style={{ margin: '0 0 8px', fontSize: 14, color: C.text, lineHeight: 1.55, wordBreak: 'break-word' }}>
            {c.text}
          </p>

          {/* Inline image */}
          {c.imageUrl && (
            <div style={{ marginBottom: 9 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.imageUrl} alt="" style={{ borderRadius: 8, maxWidth: 130, maxHeight: 100, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Footer: date · Responder  |  ♡ · 👎 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 12, color: C.link }}>{c.date}</span>
              {c.showReply && (
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.link, cursor: 'pointer' }}>Responder</span>
              )}
            </div>
            {c.showLikes && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <HeartOutline size={19} color={C.likes} />
                  <span style={{ fontSize: 12, color: C.likes }}>{c.likes}</span>
                </div>
                <ThumbDown size={17} color={C.link} />
              </div>
            )}
          </div>

          {/* "Ver X respuestas ▼" toggle */}
          {c.showReplies && replyCount > 0 && (
            <button
              onClick={() => setOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ height: 1, width: 22, background: '#bdbdbd', flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: C.link, whiteSpace: 'nowrap' }}>
                {open
                  ? `Ocultar respuestas ▲`
                  : `Ver ${replyCount} ${replyCount === 1 ? 'respuesta' : 'respuestas'} ▼`
                }
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded replies — indented to align with content area */}
      {c.showReplies && open && replyCount > 0 && (
        <div style={{ paddingLeft: 56, borderTop: `1px solid ${C.sep}` }}>
          {replies.map((r, i) => (
            <div key={r.id}>
              <ReplyRow reply={r} C={C} />
              {i < replies.length - 1 && (
                <div style={{ height: 1, background: C.sep, marginLeft: 42 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Feed view ────────────────────────────────────────────────────────────────
function FeedView({ comments, C, sp }: { comments: TikTokComment[]; C: C; sp: { py: number; px: number } }) {
  return (
    <div>
      {comments.map((c, i) => (
        <div key={c.id}>
          <CommentRow c={c} C={C} sp={sp} />
          {i < comments.length - 1 && (
            <div style={{ height: 1, background: C.sep, marginLeft: 56 }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Carousel view ────────────────────────────────────────────────────────────
function CarouselView({ comments, C, sp, d }: { comments: TikTokComment[]; C: C; sp: { py: number; px: number }; d: TikTokCommentsData }) {
  const [idx, setIdx]     = useState(0)
  const touchStart        = useRef(0)

  useEffect(() => {
    if (!d.autoplay || comments.length < 2) return
    const ms = (d.autoplaySpeed ?? 3) * 1000
    const t  = setInterval(() => setIdx(i => (i + 1) % comments.length), ms)
    return () => clearInterval(t)
  }, [d.autoplay, d.autoplaySpeed, comments.length])

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(comments.length - 1, i + 1))
  const cur  = comments[idx]
  if (!cur) return null

  const arrowStyle = (side: 'left' | 'right', disabled: boolean): React.CSSProperties => ({
    position: 'absolute', [side]: -16, top: '50%', transform: 'translateY(-50%)',
    width: 32, height: 32, borderRadius: '50%',
    border: '1px solid #e5e7eb',
    background: disabled ? '#f3f4f6' : '#ffffff',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, color: disabled ? '#d1d5db' : '#374151',
    boxShadow: disabled ? 'none' : '0 2px 8px rgba(0,0,0,0.10)',
    zIndex: 2,
  })

  return (
    <div>
      <div style={{ position: 'relative' }}>
        {d.showArrows && (
          <button onClick={prev} disabled={idx === 0} style={arrowStyle('left', idx === 0)}>‹</button>
        )}

        <div
          onTouchStart={e => { touchStart.current = e.touches[0]?.clientX ?? 0 }}
          onTouchEnd={e => {
            const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current
            if (delta < -40 && idx < comments.length - 1) next()
            if (delta > 40  && idx > 0) prev()
          }}
        >
          <CommentRow c={cur} C={C} sp={sp} />
        </div>

        {d.showArrows && (
          <button onClick={next} disabled={idx === comments.length - 1} style={arrowStyle('right', idx === comments.length - 1)}>›</button>
        )}
      </div>

      {/* Dots */}
      {d.showDots && comments.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 14, paddingBottom: 4 }}>
          {comments.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 16 : 8, height: 8, borderRadius: 999,
              background: i === idx ? C.badge : '#d1d5db',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'width .2s ease, background .2s ease',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main block ───────────────────────────────────────────────────────────────
export default function TikTokCommentsBlock({ block, theme: _theme }: { block: LandingBlock; theme: LandingTheme }) {
  const raw      = block.data as Partial<TikTokCommentsData>
  const d        = { ...DEFAULT_DATA, ...raw } as TikTokCommentsData
  const comments = Array.isArray(d.comments) && d.comments.length > 0 ? d.comments : DEMO_COMMENTS

  const C      = resolveColors(d)
  const shadow = SHADOW_MAP[d.shadowIntensity ?? 'soft']
  const radius = RADIUS_MAP[d.borderRadius ?? 'soft']
  const sp     = SPACING_MAP[d.spacing ?? 'normal']

  return (
    <div style={{ background: C.bg, padding: '16px 0' }}>
      {/* Section header */}
      {(d.showBadge || d.showTitle || d.showSubtitle) && (
        <div style={{ paddingLeft: sp.px, paddingRight: sp.px, marginBottom: 12 }}>
          {d.showBadge && d.badgeText && (
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: `${C.badge}18`, color: C.badge, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
              {d.badgeText}
            </div>
          )}
          {d.showTitle && d.title && (
            <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: C.name, lineHeight: 1.2 }}>
              {d.title}
            </h2>
          )}
          {d.showSubtitle && d.subtitle && (
            <p style={{ margin: 0, fontSize: 13, color: C.link, lineHeight: 1.4 }}>{d.subtitle}</p>
          )}
        </div>
      )}

      {/* Card — extra margin on carousel to leave room for arrows */}
      <div style={{ margin: `0 ${d.layout === 'carousel' ? sp.px + 6 : sp.px}px`, position: 'relative' }}>
        <div style={{
          background: C.card,
          borderRadius: radius,
          boxShadow: shadow,
          border: '1px solid rgba(0,0,0,0.05)',
          paddingLeft: sp.px,
          paddingRight: sp.px,
          overflow: d.layout === 'feed' ? 'hidden' : 'visible',
        }}>
          {d.layout === 'feed'
            ? <FeedView  comments={comments} C={C} sp={sp} />
            : <CarouselView comments={comments} C={C} sp={sp} d={d} />
          }
        </div>
      </div>
    </div>
  )
}
