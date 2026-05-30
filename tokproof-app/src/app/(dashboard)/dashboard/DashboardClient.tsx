'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Eye, MousePointerClick, TrendingUp, ShieldCheck,
  ExternalLink, Clock, Lightbulb, Plus, Check,
} from 'lucide-react'
import PageCard from '@/components/dashboard/PageCard'
import UpgradeModal from '@/components/shared/UpgradeModal'
import CreateEcommerceModal from '@/components/dashboard/CreateEcommerceModal'
import CreatePersonalBrandModal from '@/components/dashboard/CreatePersonalBrandModal'
import QuickExitWidget from '@/components/dashboard/QuickExitWidget'
import type { Page, Profile } from '@/types'
import { getPublicPageUrl, getPublicExitUrl, getPublicPageDisplay, getPublicExitDisplay } from '@/lib/urls'
import { getUserPlan, getPlanLimits } from '@/lib/plans'

function isQuickExit(page: Page): boolean {
  const s = page.settings as Record<string, unknown>
  if (s._pageType === 'quick_exit') return true
  const cfg = s._landingConfig as Record<string, unknown> | undefined
  return cfg?.pageType === 'quick_exit'
}

/* ── Link icon con gradiente SVG ─────────────── */
function GradLinkIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="gLink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F647A9" />
          <stop offset="100%" stopColor="#7B61FF" />
        </linearGradient>
      </defs>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="url(#gLink)" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="url(#gLink)" />
    </svg>
  )
}

/* ── Hook: copia al portapapeles + estado breve ── */
function useCopy(ms = 1500) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const copy = useCallback((text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), ms)
  }, [ms])
  return { copied, copy }
}

/* ── Toast ───────────────────────────────────── */
function Toast({ show, msg }: { show: boolean; msg: string }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: `translateX(-50%) translateY(${show ? 0 : 16}px)`,
      background: '#1a1a1a', color: 'white',
      padding: '12px 22px', borderRadius: 999,
      fontSize: 14, fontWeight: 500,
      opacity: show ? 1 : 0,
      pointerEvents: 'none',
      transition: 'opacity .2s ease, transform .2s ease',
      boxShadow: '0 10px 30px rgba(0,0,0,.22)',
      zIndex: 999, whiteSpace: 'nowrap',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Check size={14} /> {msg}
    </div>
  )
}

interface DashboardClientProps {
  profile: Profile
  pages: Page[]
  analytics?: {
    views: string; clicks: string; ctr: string; rescues: string
    viewsTrend: string; clicksTrend: string; ctrTrend: string; rescuesTrend: string
    rescueGuides?: string; rescueOpens?: string; rescueRate?: string
  }
  pageStats?: Record<string, { views: string; clicks: string; ctr: string }>
}

/* ── Sparkline SVG ───────────────────────────── */
function Sparkline({ color, index = 0 }: { color: string; index?: number }) {
  const paths = [
    'M0,28 C14,22 24,14 36,18 C48,22 58,8 70,12 C80,14 88,4 96,6',
    'M0,26 C12,22 22,28 34,16 C46,4 56,20 68,12 C78,4 86,16 96,6',
    'M0,24 C14,28 24,16 36,20 C48,24 58,10 70,14 C82,18 90,6 96,8',
    'M0,22 C14,24 24,12 36,16 C48,20 58,8 70,10 C80,12 88,2 96,4',
  ]
  return (
    <svg width="110" height="34" viewBox="0 0 96 32" fill="none" style={{ flexShrink: 0, opacity: .9 }}>
      <path d={paths[index % paths.length]} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Metric cards ────────────────────────────── */
const METRICS = [
  { Icon: Eye,               iconBg: '#FFF1FA', iconColor: '#F647A9', trendColor: '#F647A9', sparkColor: '#F647A9', label: 'Vistas totales',    key: 'views',   trendKey: 'viewsTrend' },
  { Icon: MousePointerClick, iconBg: '#F4F0FF', iconColor: '#7B61FF', trendColor: '#7B61FF', sparkColor: '#7B61FF', label: 'Clicks totales',    key: 'clicks',  trendKey: 'clicksTrend' },
  { Icon: TrendingUp,        iconBg: '#FFF1FA', iconColor: '#F647A9', trendColor: '#F647A9', sparkColor: '#F647A9', label: 'CTR promedio',      key: 'ctr',     trendKey: 'ctrTrend' },
  { Icon: ShieldCheck,       iconBg: '#F4F0FF', iconColor: '#7B61FF', trendColor: '#7B61FF', sparkColor: '#7B61FF', label: 'Rescates exitosos', key: 'rescues', trendKey: 'rescuesTrend' },
]

/* ── TikTok Rescue widget ────────────────────── */
function RescueWidget({ guides, opens, rate }: {
  guides?: string; opens?: string; rate?: string
}) {
  const [exitOn, setExitOn] = useState(true)
  return (
    <div className="rescue-widget">
      <div className="rescue-head">
        <h3>TikTok Rescue</h3>
        <span className="badge-pro">PRO</span>
      </div>
      <div className="rescue-body">
        {/* iPhone mockup */}
        <div className="rescue-phone">
          <div className="rescue-phone-bg">
            <div className="rescue-phone-icon">
              <ShieldCheck size={52} color="white" strokeWidth={1.8} />
            </div>
            <div className="rescue-phone-text">Protegiendo tus clics desde TikTok</div>
          </div>
        </div>
        {/* Right content */}
        <div className="rescue-content">
          <h4>Protege tus clics desde TikTok</h4>
          <p className="rescue-desc">Activa el Exit Guide para mostrar un paso intermedio y aumentar las aperturas en navegador.</p>
          <div className="rescue-stats">
            <div className="rescue-stat-row">
              <span className="rescue-stat-ico"><Clock size={14} /></span>
              <span className="rescue-stat-lbl">Guías mostradas</span>
              <span className="rescue-stat-val">{guides ?? '—'}</span>
            </div>
            <div className="rescue-stat-row">
              <span className="rescue-stat-ico"><ExternalLink size={14} /></span>
              <span className="rescue-stat-lbl">Aperturas en navegador</span>
              <span className="rescue-stat-val">{opens ?? '—'}</span>
            </div>
            <div className="rescue-stat-row">
              <span className="rescue-stat-ico"><TrendingUp size={14} /></span>
              <span className="rescue-stat-lbl">Tasa de éxito</span>
              <span className="rescue-stat-val">{rate ?? '—'}</span>
            </div>
          </div>
          <div className="rescue-toggle-row">
            <span className="rescue-toggle-lbl">
              <ShieldCheck size={16} />
              Exit Guide {exitOn ? 'activo' : 'inactivo'}
            </span>
            <div
              className={`ui-toggle${exitOn ? '' : ' off'}`}
              onClick={() => setExitOn(v => !v)}
              style={exitOn ? {} : { background: '#E5E7EB' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Link widget ─────────────────────────────── */
function LinkWidget({ profile }: { profile: Profile }) {
  const username = profile.username
  const publicUrl     = username ? getPublicPageUrl(username)     : null
  const publicDisplay = username ? getPublicPageDisplay(username) : null
  const goUrl         = username ? getPublicExitUrl(username)     : null
  const goDisplay     = username ? getPublicExitDisplay(username) : null
  const primary = useCopy()
  const go = useCopy()

  return (
    <>
      <div className="link-widget">
        <h3>Tu link principal</h3>
        <div className="link-fields">
          <div className="link-field-group">
            <div className="link-field-label">Enlace principal</div>
            <div className="link-field-row">
              <span className="link-field-url">{publicDisplay ?? 'Sin configurar'}</span>
              {publicUrl && (
                <button
                  className={`link-copy-btn${primary.copied ? ' copied' : ''}`}
                  title="Copiar"
                  onClick={() => primary.copy(publicUrl)}
                >
                  {primary.copied ? <Check size={13} /> : <GradLinkIcon size={13} />}
                </button>
              )}
            </div>
          </div>
          <div className="link-field-group">
            <div className="link-field-label">Enlace Direct Exit</div>
            <div className="link-field-row">
              <span className="link-field-url">{goDisplay ?? 'Sin configurar'}</span>
              {goUrl && (
                <button
                  className={`link-copy-btn${go.copied ? ' copied' : ''}`}
                  title="Copiar"
                  onClick={() => go.copy(goUrl)}
                >
                  {go.copied ? <Check size={13} /> : <GradLinkIcon size={13} />}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="link-tip">
          <div className="link-tip-icon-box">
            <Lightbulb size={18} color="#F647A9" />
          </div>
          <div>
            <div className="link-tip-title">Usa tu enlace /go en TikTok</div>
            <div className="link-tip-text">Los usuarios verán el Exit Guide antes de salir a tu producto. Más aperturas, más ventas.</div>
          </div>
        </div>
      </div>
      <Toast show={primary.copied || go.copied} msg="¡Link copiado!" />
    </>
  )
}

/* ── Category selector modal ─────────────────── */
function CategorySelectModal({
  open, onClose, onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (cat: 'ecommerce' | 'personal_brand') => void
}) {
  if (!open) return null
  return (
    <div className="cm-overlay" onClick={e => { if (e.currentTarget === e.target) onClose() }}>
      <div className="cat-modal">
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#171717', marginBottom: 4, letterSpacing: '-.03em' }}>¿Qué quieres crear?</h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Elige el tipo de página que mejor encaja con tu objetivo.</p>

        <div className="cat-card" onClick={() => onSelect('ecommerce')}>
          <div className="cat-card-ico" style={{ background: 'rgba(123,97,255,.1)' }}>🛒</div>
          <div>
            <div className="cat-card-title">E-commerce</div>
            <div className="cat-card-desc">Crea páginas para vender productos físicos o digitales.</div>
          </div>
        </div>

        <div className="cat-card" onClick={() => onSelect('personal_brand')}>
          <div className="cat-card-ico" style={{ background: 'rgba(16,185,129,.1)' }}>⭐</div>
          <div>
            <div className="cat-card-title">Marca Personal</div>
            <div className="cat-card-desc">Crea páginas para compartir enlaces, servicios, redes y contenido.</div>
          </div>
        </div>

        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 12 }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────── */
export default function DashboardClient({ profile, pages, analytics, pageStats }: DashboardClientProps) {
  const [pageList, setPageList] = useState<Page[]>(pages)
  const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [categoryOpen,  setCategoryOpen]  = useState(false)
  const [ecomOpen,      setEcomOpen]      = useState(false)
  const [pbOpen,        setPbOpen]        = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const headerCopy = useCopy()

  const plan       = getUserPlan(profile)
  const limits     = getPlanLimits(plan)
  const isFree     = plan === 'free'
  const nonExitPages   = pageList.filter(p => !isQuickExit(p))
  const quickExits     = pageList.filter(isQuickExit)
  const publishedCount = nonExitPages.filter(p => p.status === 'published').length
  const draftCount     = nonExitPages.filter(p => p.status === 'draft').length
  const firstName = (profile.display_name ?? profile.email ?? 'creator').split(' ')[0]
  const publicUrl     = profile.username ? getPublicPageUrl(profile.username)     : null
  const publicDisplay = profile.username ? getPublicPageDisplay(profile.username) : null

  function openNewLanding() {
    if (isFree && publishedCount >= 1) { setUpgradeOpen(true); return }
    setCategoryOpen(true)
  }

  function handleCategorySelect(cat: 'ecommerce' | 'personal_brand') {
    setCategoryOpen(false)
    if (cat === 'ecommerce') setEcomOpen(true)
    else setPbOpen(true)
  }

  const filteredPages = pageList.filter(p => {
    if (isQuickExit(p)) return false   // quick exits live in the widget, not the pages list
    if (activeFilter === 'published') return p.status === 'published'
    if (activeFilter === 'draft') return p.status === 'draft'
    return true
  })

  const filters: [string, string, number][] = [
    ['all',       'Todas',      nonExitPages.length],
    ['published', 'Publicadas', publishedCount],
    ['draft',     'Borradores', draftCount],
  ]

  return (
    <>
      <CategorySelectModal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        onSelect={handleCategorySelect}
      />
      <CreateEcommerceModal
        open={ecomOpen}
        onClose={() => setEcomOpen(false)}
        userId={profile.user_id}
        username={profile.username}
      />
      <CreatePersonalBrandModal
        open={pbOpen}
        onClose={() => setPbOpen(false)}
        userId={profile.user_id}
        username={profile.username}
      />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <div className="db-main">

        {/* ── Header ── */}
        <div className="db-header">
          <div>
            <h1 className="db-heading">Hola, {firstName} <span className="wave">👋</span></h1>
            <p className="db-subheading">Aquí tienes un resumen de tu actividad y rendimiento.</p>
          </div>
          <div className="db-header-actions">
            {publicUrl && (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => headerCopy.copy(publicUrl!)}
                  style={headerCopy.copied ? {
                    background: 'linear-gradient(135deg,#F647A9 0%,#7B61FF 100%)',
                    borderColor: 'transparent',
                    color: 'white',
                    transition: 'all .18s ease',
                  } : { transition: 'all .18s ease' }}
                >
                  {headerCopy.copied ? (
                    <>
                      <Check size={15} color="white" />
                      <span style={{ color: 'white', fontWeight: 600 }}>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <GradLinkIcon size={15} />
                      <span style={{
                        background: 'linear-gradient(135deg,#F647A9 0%,#7B61FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 600,
                      }}>Copiar mi link</span>
                    </>
                  )}
                </button>
                <Toast show={headerCopy.copied} msg="¡Link copiado!" />
              </>
            )}
            {profile.username && (
              <a href={`/u/${profile.username}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                <Eye size={15} style={{ color: '#7B61FF' }} />
                Vista previa
              </a>
            )}
            <button className="btn btn-primary btn-sm" onClick={openNewLanding}>
              <Plus size={16} />
              Nueva landing
            </button>
          </div>
        </div>

        {/* ── Metric cards ── */}
        <div className="db-metrics">
          {METRICS.map((m, i) => {
            const { Icon, iconBg, iconColor, trendColor, sparkColor, label, key, trendKey } = m
            const value = analytics ? (analytics as any)[key] : '—'
            const trend = analytics ? (analytics as any)[trendKey] : ''
            return (
              <div className="db-metric-card" key={key}>
                <div className="db-metric-icon" style={{ background: iconBg, color: iconColor }}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="db-metric-left">
                  <div className="db-metric-label">{label}</div>
                  <div className="db-metric-value">{value}</div>
                </div>
                <div className="db-metric-bottom">
                  {trend && (
                    <div className="db-metric-trend" style={{ color: trendColor }}>{trend}</div>
                  )}
                  <Sparkline color={sparkColor} index={i} />
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Plan usage bar ── */}
        {isFree && (
          <div style={{ marginBottom: 18, padding: '12px 16px', background: '#fff', borderRadius: 14, border: '1px solid #E4E7F0', boxShadow: '0 1px 4px rgba(15,23,42,.04)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#F647A9,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⚡</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Plan Free</span>
            </div>
            <div style={{ display: 'flex', gap: 20, flex: 1, flexWrap: 'wrap' }}>
              {/* Exits usage */}
              <div style={{ display: 'flex', flex: 1, minWidth: 140, flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#6B7280' }}>
                  <span>Exits Rápidos</span>
                  <span style={{ fontWeight: 700, color: quickExits.length >= limits.maxQuickExits ? '#EF4444' : '#374151' }}>{quickExits.length} / {limits.maxQuickExits === Infinity ? '∞' : limits.maxQuickExits}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: '#F3F4F6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: quickExits.length >= limits.maxQuickExits ? '#EF4444' : 'linear-gradient(135deg,#F647A9,#7B61FF)', width: `${Math.min(100, (quickExits.length / (limits.maxQuickExits === Infinity ? 1 : limits.maxQuickExits)) * 100)}%`, transition: 'width .3s' }} />
                </div>
              </div>
              {/* Pages usage */}
              <div style={{ display: 'flex', flex: 1, minWidth: 140, flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#6B7280' }}>
                  <span>Páginas publicadas</span>
                  <span style={{ fontWeight: 700, color: publishedCount >= limits.maxPublishedPages ? '#EF4444' : '#374151' }}>{publishedCount} / {limits.maxPublishedPages === Infinity ? '∞' : limits.maxPublishedPages}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: '#F3F4F6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: publishedCount >= limits.maxPublishedPages ? '#EF4444' : 'linear-gradient(135deg,#F647A9,#7B61FF)', width: `${Math.min(100, (publishedCount / (limits.maxPublishedPages === Infinity ? 1 : limits.maxPublishedPages)) * 100)}%`, transition: 'width .3s' }} />
                </div>
              </div>
            </div>
            <a href="/dashboard/billing" style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 9, background: 'linear-gradient(135deg,#F647A9,#7B61FF)', color: '#fff', textDecoration: 'none', flexShrink: 0, boxShadow: '0 4px 12px rgba(246,71,169,.25)' }}>
              Upgrade Pro
            </a>
          </div>
        )}

        {/* ── Widgets ── */}
        <div className="db-widgets">
          <QuickExitWidget
            initialExits={quickExits}
            userId={profile.user_id}
            plan={plan}
            guides={analytics?.rescueGuides}
            opens={analytics?.rescueOpens}
            rate={analytics?.rescueRate}
          />
          <LinkWidget profile={profile} />
        </div>

        {/* ── Pages section ── */}
        <div className="db-pages-section">
          <div className="db-pages-header">
            <h2>Tus páginas</h2>
            <div className="page-filter-tabs">
              {filters.map(([key, label, count]) => (
                <button
                  key={key}
                  className={`page-filter-tab${activeFilter === key ? ' active' : ''}`}
                  onClick={() => setActiveFilter(key as 'all' | 'published' | 'draft')}
                >
                  {label} <span className="tab-count">{count}</span>
                </button>
              ))}
            </div>
            <div className="db-pages-tools">
              <div className="db-search">
                <span style={{ color: '#9CA3AF', display: 'flex' }}><Eye size={14} /></span>
                <input placeholder="Buscar..." readOnly />
              </div>
              <div className="db-sort-btn">Ordenar ▾</div>
            </div>
          </div>

          {filteredPages.length === 0 ? (
            <div className="page-empty">
              <div className="page-empty-icon">📄</div>
              <div className="page-empty-title">
                {activeFilter === 'all' ? 'Aún no tienes páginas' : `No hay páginas ${activeFilter === 'published' ? 'publicadas' : 'en borrador'}`}
              </div>
              <p className="page-empty-sub">
                {activeFilter === 'all'
                  ? 'Crea tu primera trust page para TikTok en menos de 5 minutos.'
                  : 'Prueba cambiando el filtro de arriba.'}
              </p>
              {activeFilter === 'all' && (
                <button className="btn btn-primary" onClick={openNewLanding}>+ Crear mi primera landing</button>
              )}
            </div>
          ) : (
            <div className="page-list">
              {filteredPages.map((page, i) => (
                <PageCard
                  key={page.id}
                  page={page}
                  pageNumber={i + 1}
                  onDeleted={id => setPageList(prev => prev.filter(p => p.id !== id))}
                  stats={pageStats?.[page.id]}
                />
              ))}
            </div>
          )}

          {pageList.length > 0 && (
            <button
              onClick={openNewLanding}
              style={{
                marginTop: 10, width: '100%',
                background: 'none', border: '2px dashed rgba(123,97,255,0.2)',
                borderRadius: 20, padding: '18px 24px', textAlign: 'center',
                cursor: 'pointer', color: '#9CA3AF', fontSize: 13, fontWeight: 600,
                transition: 'border-color .18s ease, color .18s ease',
                marginBottom: 20,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(246,71,169,.4)'
                ;(e.currentTarget as HTMLElement).style.color = '#F647A9'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(123,97,255,0.2)'
                ;(e.currentTarget as HTMLElement).style.color = '#9CA3AF'
              }}
            >
              + Nueva landing page
            </button>
          )}

          {isFree && publishedCount >= 1 && (
            <div style={{
              marginTop: 16, marginBottom: 20,
              background: '#FFF1FA', border: '1px solid rgba(246,71,169,.15)',
              borderRadius: 20, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#171717', marginBottom: 4 }}>
                  Plan Free · Límite alcanzado
                </div>
                <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
                  Con Pro: páginas ilimitadas, TikTok Rescue activo, A/B testing y analytics avanzados.
                </p>
              </div>
              <Link href="/dashboard/billing" className="btn btn-primary btn-sm">
                ↑ Upgrade to Pro
              </Link>
            </div>
          )}
        </div>

        <div style={{ height: 60 }} />
      </div>

      <style>{`
        .wave { display: inline-block; transform-origin: 70% 70%; animation: wave 2.6s ease-in-out infinite; }
        @keyframes wave {
          0%,60%,100%{transform:rotate(0deg)}
          10%{transform:rotate(14deg)}
          20%{transform:rotate(-8deg)}
          30%{transform:rotate(14deg)}
          40%{transform:rotate(-4deg)}
          50%{transform:rotate(10deg)}
        }
        .link-tip-icon-box {
          width: 36px; height: 36px; border-radius: 12px;
          background: white; display: grid; place-items: center; flex-shrink: 0;
        }
        .ui-toggle.off::after { left: 3px !important; }
        .ui-toggle::after { left: 23px; }
      `}</style>
    </>
  )
}
