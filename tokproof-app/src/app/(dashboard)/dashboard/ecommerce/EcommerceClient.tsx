'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Search, Plus, ExternalLink, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CreateEcommerceModal from '@/components/dashboard/CreateEcommerceModal'
import type { Page, Profile } from '@/types'
import { getPublicPageDisplay, getPublicPageUrl } from '@/lib/urls'
import { useTranslation } from '@/lib/i18n'
import PageMiniPreview from '@/components/shared/PageMiniPreview'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageCategory(page: Page): 'ecommerce' | 'personal_brand' {
  return (page.settings._category as 'ecommerce' | 'personal_brand' | undefined) ?? 'ecommerce'
}

function getEffectivePageType(page: Page): 'trust_page' | 'simple_page' | 'creator_page' {
  const t = page.settings._pageType as string | undefined
  if (t === 'trust_page' || t === 'simple_page' || t === 'creator_page') return t
  return page.type === 'trust' ? 'trust_page' : 'simple_page'
}

function getSafeScore(page: Page): number {
  if (page.safe_score && page.safe_score > 0) return page.safe_score
  const hash = page.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return 60 + (hash % 36)
}

function getScoreLabel(score: number, t: (k: string) => string): { label: string; color: string } {
  if (score >= 90) return { label: t('ecom.score.excellent'), color: '#10B981' }
  if (score >= 75) return { label: t('ecom.score.veryGood'), color: '#10B981' }
  if (score >= 60) return { label: t('ecom.score.improvable'), color: '#F59E0B' }
  return { label: t('ecom.score.highRisk'), color: '#EF4444' }
}

function timeAgo(dateStr: string, t: (k: string, v?: Record<string, string>) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return t('time.today')
  if (d === 1) return t('time.1dayAgo')
  if (d < 7)   return t('time.daysAgo', { d: String(d) })
  if (d < 14)  return t('time.1weekAgo')
  if (d < 30)  return t('time.weeksAgo', { w: String(Math.floor(d / 7)) })
  return t('time.monthsAgo', { m: String(Math.floor(d / 30)) })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="pm-score-wrap">
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <svg width={48} height={48} viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={24} cy={24} r={r} fill="none" stroke="#E4E7F0" strokeWidth={4} />
          <circle cx={24} cy={24} r={r} fill="none" stroke={color} strokeWidth={4}
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color }}>
          {score}
        </div>
      </div>
      <span className="pm-score-label">{label}</span>
    </div>
  )
}

// ─── Page thumbnail — delegates to shared PageMiniPreview ────────────────────

function PageThumb({ page }: { page: Page }) {
  return (
    <div className="pm-thumb" style={{ overflow: 'hidden' }}>
      <PageMiniPreview page={page} />
    </div>
  )
}

// ─── Type chip ────────────────────────────────────────────────────────────────

function TypeChip({ page }: { page: Page }) {
  const type = getEffectivePageType(page)
  if (type === 'trust_page') return <span className="pm-type-chip pm-type-trust">🛡 Trust Page</span>
  return <span className="pm-type-chip pm-type-simple">🔗 Simple Page</span>
}

// ─── Row menu ─────────────────────────────────────────────────────────────────

function RowMenu({ page, onDeleted }: { page: Page; onDeleted: (id: string) => void }) {
  const router = useRouter()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number }>({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const publicUrl = page.username ? getPublicPageUrl(page.username) : null

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation()
    if (!btnRef.current) return
    const rect  = btnRef.current.getBoundingClientRect()
    const right = window.innerWidth - rect.right
    const spaceBelow = window.innerHeight - rect.bottom
    if (spaceBelow < 260) {
      setMenuPos({ bottom: window.innerHeight - rect.top + 4, right })
    } else {
      setMenuPos({ top: rect.bottom + 4, right })
    }
    setOpen(v => !v)
  }

  async function handleDelete() {
    if (!confirm(t('ecom.deleteConfirmEcom'))) return
    const supabase = createClient()
    await supabase.from('pages').delete().eq('id', page.id)
    onDeleted(page.id)
    setOpen(false)
  }

  async function handleDuplicate() {
    const supabase = createClient()
    const { data } = await supabase.from('pages').insert({
      user_id: page.user_id,
      username: page.username,
      type: page.type,
      status: 'draft',
      title: `${page.title} ${t('ecom.duplicateSuffix')}`,
      settings: page.settings,
    }).select().single()
    if (data) router.push(`/dashboard/editor/${data.id}`)
    setOpen(false)
  }

  const items = [
    { icon: '✏️', label: t('ecom.menu.edit'), onClick: () => { router.push(`/dashboard/editor/${page.id}`); setOpen(false) } },
    page.username && page.status === 'published'
      ? { icon: '👁', label: t('ecom.menu.view'), onClick: () => { window.open(`/u/${page.username}`, '_blank'); setOpen(false) } }
      : null,
    { icon: '📊', label: t('ecom.menu.analytics'), onClick: () => { router.push('/dashboard/analytics'); setOpen(false) } },
    { icon: '⧉', label: t('ecom.menu.duplicate'), onClick: handleDuplicate },
    publicUrl && page.status === 'published'
      ? { icon: '🔗', label: t('ecom.menu.copyLink'), onClick: () => { navigator.clipboard?.writeText(publicUrl); setOpen(false) } }
      : null,
    { icon: '🗑', label: t('ecom.menu.delete'), onClick: handleDelete, danger: true },
  ].filter(Boolean) as { icon: string; label: string; onClick: () => void; danger?: boolean }[]

  const dropStyle: React.CSSProperties = {
    position: 'fixed', right: menuPos.right, zIndex: 1000,
    ...(menuPos.bottom !== undefined ? { bottom: menuPos.bottom } : { top: menuPos.top }),
  }

  return (
    <div>
      <button ref={btnRef} className="pm-menu-btn" onClick={openMenu}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div className="pm-menu-dropdown" style={dropStyle}>
            {items.map((item, i) => (
              <button key={i} className={`pm-menu-item${item.danger ? ' danger' : ''}`} onClick={e => { e.stopPropagation(); item.onClick() }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  const { t } = useTranslation()
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E4E7F0', overflow: 'hidden' }}>
      <div className="pm-empty">
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(246,71,169,.12),rgba(123,97,255,.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <ShoppingBag size={44} color="#7B61FF" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="pm-empty-title">{t('ecom.emptyTitleEcom')}</h2>
        <p className="pm-empty-sub">{t('ecom.emptySubEcom')}</p>
        <div className="pm-empty-actions">
          <button className="btn btn-primary" style={{ minWidth: 220, justifyContent: 'center' }} onClick={onCreateClick}>
            <Plus size={16} /> {t('ecom.createFirst')}
          </button>
          <button className="btn btn-ghost" style={{ minWidth: 220, justifyContent: 'center', fontSize: 13 }}>
            {t('ecom.howItWorks')}
          </button>
        </div>
        <div className="pm-empty-benefits">
          {[
            { icon: '🛡', label: t('ecom.benefit.trust'),       desc: t('ecom.benefit.trustDesc') },
            { icon: '📈', label: t('ecom.benefit.conversions'), desc: t('ecom.benefit.conversionsDesc') },
            { icon: '📱', label: t('ecom.benefit.optimized'),   desc: t('ecom.benefit.optimizedDesc') },
            { icon: '🔒', label: t('ecom.benefit.secure'),      desc: t('ecom.benefit.secureDesc') },
          ].map(b => (
            <div key={b.label} className="pm-benefit">
              <div className="pm-benefit-icon" style={{ background: 'linear-gradient(135deg,rgba(246,71,169,.1),rgba(123,97,255,.1))' }}>
                {b.icon}
              </div>
              <div className="pm-benefit-label">{b.label}</div>
              <div className="pm-benefit-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  profile: Profile
  allPages: Page[]
}

type TypeFilter   = 'all' | 'trust_page' | 'simple_page'
type StatusFilter = 'all' | 'published' | 'draft'

export default function EcommerceClient({ profile, allPages }: Props) {
  const { t } = useTranslation()
  const ecomPages = allPages.filter(p => getPageCategory(p) === 'ecommerce')

  const [pageList,     setPageList]     = useState<Page[]>(ecomPages)
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search,       setSearch]       = useState('')
  const [createOpen,   setCreateOpen]   = useState(false)

  const filtered = pageList
    .filter(p => typeFilter === 'all' || getEffectivePageType(p) === typeFilter)
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => {
      if (!search) return true
      const q = search.toLowerCase()
      return p.title?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)
    })

  return (
    <div className="pm-page">
      <div className="pm-main">

        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="pm-header-icon" style={{ background: 'linear-gradient(135deg,rgba(246,71,169,.12),rgba(123,97,255,.12))' }}>
              <ShoppingBag size={26} color="#7B61FF" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="pm-header-title">{t('ecom.title')}</h1>
              <p className="pm-header-sub">
                {pageList.length === 0 ? t('ecom.subtitleEmpty') : t('ecom.subtitleFull')}
              </p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> {t('ecom.newPage')}
          </button>
        </div>

        {/* Filters */}
        {pageList.length > 0 && (
          <div className="pm-filters">
            <div className="pm-filter-group">
              {([
                { key: 'all',        label: t('ecom.filterAll')    },
                { key: 'trust_page', label: t('ecom.filterTrust')  },
                { key: 'simple_page',label: t('ecom.filterSimple') },
              ] as const).map(f => (
                <button key={f.key} className={`pm-filter-btn ${typeFilter === f.key ? 'active' : ''}`}
                  onClick={() => setTypeFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            <div className="pm-status-group">
              {([
                { key: 'all',       label: t('ecom.filterAll')       },
                { key: 'published', label: t('ecom.filterPublished') },
                { key: 'draft',     label: t('ecom.filterDraft')     },
              ] as const).map(f => (
                <button key={f.key} className={`pm-filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            <div className="pm-search-box">
              <Search size={13} color="#9CA3AF" />
              <input
                placeholder={t('ecom.searchPages')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {pageList.length === 0 ? (
          <EmptyState onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <div className="pm-table">
            <div className="pm-table-header">
              <div className="pm-table-th pm-col-page">{t('ecom.colPage')}</div>
              <div className="pm-table-th pm-col-type">{t('ecom.colType')}</div>
              <div className="pm-table-th pm-col-status">{t('ecom.colStatus')}</div>
              <div className="pm-table-th pm-col-score">{t('ecom.colScore')}</div>
              <div className="pm-table-th pm-col-date">{t('ecom.colLastEdit')}</div>
              <div className="pm-table-th pm-col-action" />
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                {t('ecom.noMatch')}
              </div>
            ) : filtered.map(page => {
              const score   = getSafeScore(page)
              const { label: scoreLabel, color: scoreColor } = getScoreLabel(score, t)
              const display = page.username ? getPublicPageDisplay(page.username) : null
              const createdDate = new Date(page.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

              return (
                <div key={page.id} className="pm-table-row">
                  <div className="pm-table-cell pm-col-page">
                    <PageThumb page={page} />
                    <div>
                      <div className="pm-page-name">{page.title ?? page.product_name ?? t('ecom.untitled')}</div>
                      {display && (
                        <div className="pm-page-url">
                          <ExternalLink size={10} />
                          {display}
                        </div>
                      )}
                      <div className="pm-page-date">
                        {t('ecom.createdOn', { date: createdDate })}
                      </div>
                    </div>
                  </div>

                  <div className="pm-table-cell pm-col-type">
                    <TypeChip page={page} />
                  </div>

                  <div className="pm-table-cell pm-col-status">
                    {page.status === 'published'
                      ? <span className="pm-status-pub">{t('ecom.statusPublished')}</span>
                      : <span className="pm-status-draft">{t('ecom.statusDraft')}</span>
                    }
                  </div>

                  <div className="pm-table-cell pm-col-score">
                    <ScoreRing score={score} label={scoreLabel} color={scoreColor} />
                  </div>

                  <div className="pm-table-cell pm-col-date">
                    <div>
                      <div className="pm-date-main">{timeAgo(page.updated_at, t)}</div>
                      <div className="pm-date-sub">{formatDate(page.updated_at)}</div>
                    </div>
                  </div>

                  <div className="pm-table-cell pm-col-action" style={{ justifyContent: 'flex-end' }}>
                    <RowMenu page={page} onDeleted={id => setPageList(prev => prev.filter(p => p.id !== id))} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CreateEcommerceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        userId={profile.user_id}
        username={profile.username}
      />
    </div>
  )
}
