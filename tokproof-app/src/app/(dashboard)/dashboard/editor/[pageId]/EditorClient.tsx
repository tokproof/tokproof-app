'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { FullPage } from '@/types'
import {
  BarChart3, ShieldCheck, LayoutGrid, Settings,
  Link2, ArrowLeft, Pencil, ChevronDown,
  Eye, UploadCloud, Plus, Undo2, Redo2, Monitor, Minus, Palette, X,
  type LucideIcon,
} from 'lucide-react'
import { arrayMove } from '@dnd-kit/sortable'
import type { LandingConfig, LandingBlock, LandingTheme, LandingSettings, BlockStyle, TrafficSource } from '@/types/landing'
import { makeDefaultConfig, makeDefaultBlocks } from '@/types/landing'
import TrafficSourcesSection from '@/components/editor/TrafficSourcesSection'
import { FONT_OPTIONS, getPageBackground } from '@/lib/blockStyle'
import { getPublicPageUrl, getPublicPageDisplay } from '@/lib/urls'
import { getUserPlan } from '@/lib/plans'
import { useTranslation } from '@/lib/i18n'

// ─── Theme presets ────────────────────────────────────────────────────────────
type ThemePreset = Omit<LandingTheme, 'fontFamily' | 'radius'> & {
  id: string; name: string; description: string
  fontFamily: string; radius: 'square' | 'soft' | 'medium' | 'round'
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rosa_premium', name: 'Rosa Premium', description: 'Femenino, elegante y moderno',
    backgroundMode: 'gradient', gradientFrom: '#FFF4FA', gradientTo: '#FBE7F4',
    backgroundColor: '#FFF4FA',
    primaryColor: '#EC3FA3', secondaryColor: '#A855F7', accentColor: '#FF4FB8',
    textColor: '#171717', secondaryTextColor: '#6B7280',
    cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#FCE7F3',
    borderColor: '#F9A8D4', buttonTextColor: '#FFFFFF',
    buttonStyle: 'gradient', buttonGradientFrom: '#FF4FB8', buttonGradientTo: '#A855F7',
    fontFamily: 'Nunito Sans', radius: 'soft',
  },
  {
    id: 'negro_onyx', name: 'Negro Onyx', description: 'Moderno, profesional y sofisticado',
    backgroundMode: 'solid', backgroundColor: '#0B0B10',
    gradientFrom: '#0B0B10', gradientTo: '#18181B',
    primaryColor: '#8B5CF6', secondaryColor: '#EC4899', accentColor: '#A855F7',
    textColor: '#FFFFFF', secondaryTextColor: '#A1A1AA',
    cardBackgroundColor: '#18181B', elementBackgroundColor: '#27272A',
    borderColor: '#3F3F46', buttonTextColor: '#FFFFFF',
    buttonStyle: 'gradient', buttonGradientFrom: '#8B5CF6', buttonGradientTo: '#EC4899',
    fontFamily: 'Inter', radius: 'square',
  },
  {
    id: 'amarillo_pollito', name: 'Amarillo Pollito', description: 'Cálido, amigable y llamativo',
    backgroundMode: 'solid', backgroundColor: '#FDE68A',
    gradientFrom: '#FDE68A', gradientTo: '#FEF3C7',
    primaryColor: '#F59E0B', secondaryColor: '#92400E', accentColor: '#FBBF24',
    textColor: '#3B2600', secondaryTextColor: '#856321',
    cardBackgroundColor: '#FEF3C7', elementBackgroundColor: '#FCD34D',
    borderColor: '#F59E0B', buttonTextColor: '#3B2600',
    buttonStyle: 'solid', buttonColor: '#F59E0B',
    fontFamily: 'Poppins', radius: 'medium',
  },
  {
    id: 'azul_confianza', name: 'Azul Confianza', description: 'Profesional, limpio y confiable',
    backgroundMode: 'gradient', gradientFrom: '#EFF6FF', gradientTo: '#DBEAFE',
    backgroundColor: '#EFF6FF',
    primaryColor: '#3B82F6', secondaryColor: '#60A5FA', accentColor: '#2563EB',
    textColor: '#0F172A', secondaryTextColor: '#64748B',
    cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#DBEAFE',
    borderColor: '#93C5FD', buttonTextColor: '#FFFFFF',
    buttonStyle: 'solid', buttonColor: '#2563EB',
    fontFamily: 'Inter', radius: 'soft',
  },
  {
    id: 'verde_natural', name: 'Verde Natural', description: 'Fresco, natural y saludable',
    backgroundMode: 'gradient', gradientFrom: '#F0FDF4', gradientTo: '#DCFCE7',
    backgroundColor: '#F0FDF4',
    primaryColor: '#22C55E', secondaryColor: '#16A34A', accentColor: '#15803D',
    textColor: '#052E16', secondaryTextColor: '#4B6356',
    cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#DCFCE7',
    borderColor: '#86EFAC', buttonTextColor: '#FFFFFF',
    buttonStyle: 'solid', buttonColor: '#22C55E',
    fontFamily: 'Nunito Sans', radius: 'medium',
  },
  {
    id: 'nude_beauty', name: 'Nude Beauty', description: 'Suave, elegante y minimalista',
    backgroundMode: 'solid', backgroundColor: '#FFF7ED',
    gradientFrom: '#FFF7ED', gradientTo: '#FFEDD5',
    primaryColor: '#FB923C', secondaryColor: '#C084FC', accentColor: '#EA580C',
    textColor: '#431407', secondaryTextColor: '#9A6B55',
    cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#FFEDD5',
    borderColor: '#FDBA74', buttonTextColor: '#FFFFFF',
    buttonStyle: 'solid', buttonColor: '#EA580C',
    fontFamily: 'Playfair Display', radius: 'soft',
  },
  {
    id: 'morado_creator', name: 'Morado Creator', description: 'Creativo, moderno y vibrante',
    backgroundMode: 'gradient', gradientFrom: '#F5F3FF', gradientTo: '#EDE9FE',
    backgroundColor: '#F5F3FF',
    primaryColor: '#8B5CF6', secondaryColor: '#EC4899', accentColor: '#7C3AED',
    textColor: '#1E1B4B', secondaryTextColor: '#6D5C91',
    cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#EDE9FE',
    borderColor: '#C4B5FD', buttonTextColor: '#FFFFFF',
    buttonStyle: 'gradient', buttonGradientFrom: '#8B5CF6', buttonGradientTo: '#EC4899',
    fontFamily: 'Manrope', radius: 'round',
  },
  {
    id: 'minimal_blanco', name: 'Minimal Blanco', description: 'Minimalista, limpio y profesional',
    backgroundMode: 'solid', backgroundColor: '#FFFFFF',
    gradientFrom: '#FFFFFF', gradientTo: '#F3F4F6',
    primaryColor: '#111827', secondaryColor: '#6B7280', accentColor: '#111827',
    textColor: '#111827', secondaryTextColor: '#6B7280',
    cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB', buttonTextColor: '#FFFFFF',
    buttonStyle: 'solid', buttonColor: '#111827',
    fontFamily: 'Inter', radius: 'soft',
  },
]

function applyPreset(preset: ThemePreset): Partial<LandingTheme> {
  const { id: _id, name: _n, description: _d, ...themeFields } = preset
  return themeFields
}
import BlockRenderer from '@/components/editor/BlockRenderer'
import SortableBlockList from '@/components/editor/SortableBlockList'

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg: '#FBF9FC', card: '#FFFFFF', ink: '#171717',
  ink2: '#6B7280', ink3: '#9CA3AF', pink: '#F647A9', purple: '#7B61FF',
  green: '#1AA960', greenBg: '#E6F9EE',
  border: 'rgba(123,97,255,0.10)', border2: 'rgba(123,97,255,0.16)',
  softPink: '#FFF1FA', softPink2: '#FFE3F1', softPurple: '#F4F0FF',
  grad: 'linear-gradient(135deg,#FF4FD8 0%,#7B61FF 100%)',
  shadowCard: '0 8px 30px rgba(123,97,255,0.06)',
  shadowPop: '0 18px 50px -12px rgba(40,20,80,.18)',
  shadowBtn: '0 10px 25px rgba(255,79,216,0.22)',
} as const

// ─── ToolBtn ─────────────────────────────────────────────────────────────────
function ToolBtn({ icon: Icon, onClick, title }: { icon: LucideIcon; onClick: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink2 }}>
      <Icon size={14} />
    </button>
  )
}

// ─── Color picker row ────────────────────────────────────────────────────────
function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: T.ink2 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: T.ink3, fontFamily: 'monospace' }}>{value.toUpperCase()}</span>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pageToLandingConfig(data: FullPage): LandingConfig {
  // If the page already has a saved landingConfig, restore it
  const saved = (data.page.settings as Record<string, unknown>)?._landingConfig
  if (saved && typeof saved === 'object' && 'blocks' in saved) {
    return saved as LandingConfig
  }
  // Otherwise bootstrap a default from the legacy settings
  return makeDefaultConfig({
    id: data.page.id,
    title: data.page.title ?? 'Mi Landing Page',
    slug: data.page.username ?? 'mi-landing',
    status: (data.page.status as 'draft' | 'published') ?? 'draft',
    destinationUrl: data.page.shopify_url ?? '',
    theme: {
      primaryColor: (data.page.settings.brand_color as string | undefined) ?? '#F647A9',
      secondaryColor: (data.page.settings.accent_color as string | undefined) ?? '#7B61FF',
      backgroundColor: (data.page.settings.bg_color as string | undefined) ?? '#0F0F10',
      textColor: '#FFFFFF',
      fontFamily: (data.page.settings.font as string | undefined) ?? 'Nunito Sans',
      radius: 'soft',
    },
    settings: {
      showTokproofBranding: true,
      enableTikTokRescue: Boolean(data.page.settings.direct_exit_enabled),
      directExitUrl: (data.page.settings.direct_exit_url as string | undefined) ?? '',
      seoTitle: data.page.title ?? '',
      seoDescription: '',
    },
    blocks: makeDefaultBlocks(),
  })
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface EditorClientProps {
  fullPage: FullPage | null
  demoMode?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function EditorClient({ fullPage: initial, demoMode = false }: EditorClientProps) {
  const isDemo = demoMode || initial === null
  const pageId  = initial?.page?.id ?? 'demo'
  const plan    = getUserPlan(initial?.profile ?? null)
  const { t }   = useTranslation()

  // ── Central state ──
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(() =>
    initial ? pageToLandingConfig(initial) : makeDefaultConfig()
  )

  // ── Traffic sources (per-page, persisted inside _landingConfig) ──
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>(() =>
    (initial ? pageToLandingConfig(initial) : makeDefaultConfig()).trafficSources ?? []
  )

  // ── UI state ──
  const [preview, setPreview]         = useState<'mobile' | 'desktop'>('mobile')
  const [focus, setFocus]             = useState(false)
  const [zoom, setZoom]               = useState(100)
  const [activeTool, setActiveTool]   = useState<'secciones' | 'estilos' | 'ajustes'>('secciones')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [toast, setToast]             = useState<string | null>(null)
  const [focusCard, setFocusCard]     = useState(false)

  // ── Mobile state ──
  const [isMobile, setIsMobile]               = useState(false)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)
  const swipeStartY                           = useRef(0)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function onHandleTouchStart(e: React.TouchEvent) {
    swipeStartY.current = e.touches[0].clientY
  }
  function onHandleTouchEnd(e: React.TouchEvent) {
    if (e.changedTouches[0].clientY - swipeStartY.current > 56) setMobilePanelOpen(false)
  }

  // ── Toast helper ──
  function showToast(msg: string, ms = 2200) {
    setToast(msg); setTimeout(() => setToast(null), ms)
  }

  function handleFocusToggle() {
    setFocus(f => !f); setFocusCard(true); setTimeout(() => setFocusCard(false), 2200)
  }

  // ─── Block manipulation ───────────────────────────────────────────────────
  const updateBlock = useCallback((blockId: string, partialData: Partial<LandingBlock['data']>) => {
    setLandingConfig(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, data: { ...b.data, ...partialData } } : b),
    }))
  }, [])

  const toggleBlockVisibility = useCallback((blockId: string) => {
    setLandingConfig(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === blockId ? { ...b, visible: !b.visible } : b),
    }))
  }, [])

  const deleteBlock = useCallback((blockId: string) => {
    setLandingConfig(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== blockId),
    }))
  }, [])

  const duplicateBlock = useCallback((blockId: string) => {
    setLandingConfig(prev => {
      const index = prev.blocks.findIndex(b => b.id === blockId)
      if (index === -1) return prev
      const original = prev.blocks[index]
      const copy: LandingBlock = { ...original, id: `${original.id}_${Date.now()}`, locked: false, label: `${original.label} (copia)` }
      const blocks = [...prev.blocks]
      blocks.splice(index + 1, 0, copy)
      return { ...prev, blocks }
    })
  }, [])

  const moveBlock = useCallback((from: number, to: number) => {
    setLandingConfig(prev => ({ ...prev, blocks: arrayMove(prev.blocks, from, to) }))
  }, [])

  const addBlock = useCallback((type: LandingBlock['type'], defaultData: LandingBlock['data']) => {
    const LABEL: Partial<Record<LandingBlock['type'], string>> = {
      hero_product:    'Hero del producto',
      benefits:        'Beneficios',
      tiktok_comments: 'Comentarios TikTok',
      reviews:         'Reviews',
      faq:             'Preguntas frecuentes',
      cta:             'Botón CTA',
      link_list:       'Lista de links',
      profile_header:  'Profile Header',
      social_links:    'Redes Sociales',
      product_grid:    'Product Grid',
      trust_badges:    'Trust Badges',
      comparison:      'Comparativa',
      urgency_offer:   'Urgencia / Oferta',
      footer_legal:    'Footer Legal',
      featured_product:  'Product Showcase',
      partner_discounts: 'Partner Discounts',
    }
    const newBlock: LandingBlock = {
      id: `block_${type}_${Date.now()}`,
      type,
      label: LABEL[type] ?? type.replace(/_/g, ' '),
      visible: true,
      data: defaultData,
    }
    setLandingConfig(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }))
  }, [])

  const updateBlockStyle = useCallback((blockId: string, patch: Partial<BlockStyle>) => {
    setLandingConfig(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => {
        if (b.id !== blockId) return b
        const merged = { ...(b.style ?? {}), ...patch } as BlockStyle
        for (const key of Object.keys(merged) as Array<keyof BlockStyle>) {
          if (merged[key] === undefined) delete merged[key]
        }
        return { ...b, style: Object.keys(merged).length > 0 ? merged : undefined }
      }),
    }))
  }, [])

  const updateTheme = useCallback((patch: Partial<LandingTheme>) => {
    setLandingConfig(prev => ({ ...prev, theme: { ...prev.theme, ...patch } }))
  }, [])

  const updateSettings = useCallback((patch: Partial<LandingSettings>) => {
    setLandingConfig(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  // ─── Persistence ─────────────────────────────────────────────────────────
  async function _persistConfig(silent = false) {
    const supabase = createClient()
    await supabase.from('pages').update({
      title: landingConfig.title,
      settings: {
        ...(initial?.page?.settings ?? {}),
        _landingConfig: { ...landingConfig, trafficSources },
      },
    }).eq('id', pageId)
    if (!silent) {
      setSaved(true)
      showToast(t('editor.savedChanges'))
      setTimeout(() => setSaved(false), 2500)
    }
  }

  async function handleSave() {
    if (isDemo) { alert('Demo mode — connect Supabase to save.'); return }
    setSaving(true)
    await _persistConfig(false)
    setSaving(false)
  }

  async function handlePublish() {
    if (isDemo) { alert('Demo mode — connect Supabase to publish.'); return }

    const validSources = trafficSources.filter(s => s.handle.trim())
    if (validSources.length === 0) {
      showToast(t('editor.beforePublishMsg'), 5000)
      setActiveTool('ajustes')
      return
    }

    await _persistConfig(true)

    const res = await fetch('/api/publish-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    })
    if (res.ok) {
      setLandingConfig(prev => ({ ...prev, status: 'published' }))
      showToast(t('editor.pagePublished'))
    } else {
      const d = await res.json()
      alert(d.error ?? 'Error publishing')
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText?.(getPublicPageUrl(landingConfig.slug))
    showToast(t('editor.linkCopied'))
  }

  const publicUrl = getPublicPageDisplay(landingConfig.slug || 'tuusuario')
  const isPublished = landingConfig.status === 'published'

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes edFadeUp {
          from { opacity:0; transform:translateX(-50%) translateY(10px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes edFadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.bg, fontFamily: 'Inter,system-ui,sans-serif' }}>

        {/* ═══ SECTIONS PANEL ════════════════════════════════════════════════ */}
        {(!focus || isMobile) && (
          <div style={isMobile ? {
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '64vh',
            zIndex: 50,
            transform: mobilePanelOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
            borderRadius: '18px 18px 0 0',
            overflow: 'hidden',
            boxShadow: '0 -4px 28px rgba(40,20,80,.12)',
            /* flex column so drag handle is fixed and inner div fills the rest */
            display: 'flex', flexDirection: 'column',
          } : { position: 'relative', flexShrink: 0 }}>
            {/* Drag handle — mobile only (swipe-down to close + X button) */}
            {isMobile && (
              <div
                onTouchStart={onHandleTouchStart}
                onTouchEnd={onHandleTouchEnd}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px', background: T.card, flexShrink: 0, touchAction: 'none' }}
              >
                <div style={{ width: 28 }} />
                <div style={{ width: 38, height: 4, borderRadius: 2, background: '#dde0e5', cursor: 'row-resize' }} />
                <button
                  onClick={() => setMobilePanelOpen(false)}
                  style={{ width: 28, height: 28, borderRadius: 999, background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink2 }}
                >
                  <X size={13} />
                </button>
              </div>
            )}
            <div style={{ width: isMobile ? '100%' : 290, flex: isMobile ? 1 : undefined, height: isMobile ? undefined : '100vh', minHeight: 0, background: T.card, borderRight: isMobile ? 'none' : `1px solid ${T.border2}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1 }}>

              {/* Panel header — desktop: label / mobile: tab bar */}
              {isMobile ? (
                <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
                  {([
                    { id: 'secciones', icon: LayoutGrid, label: t('editor.sections') },
                    { id: 'estilos',   icon: Palette,    label: t('editor.styles')   },
                    { id: 'ajustes',   icon: Settings,   label: t('editor.settings') },
                  ] as const).map(tool => {
                    const active = activeTool === tool.id
                    return (
                      <button key={tool.id} onClick={() => setActiveTool(tool.id)} style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                        padding: '8px 0 9px', border: 'none', background: 'none', cursor: 'pointer',
                        color: active ? T.pink : T.ink3,
                        borderBottom: `2px solid ${active ? T.pink : 'transparent'}`,
                        transition: 'color .15s',
                      }}>
                        <tool.icon size={17} />
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.01em' }}>{tool.label}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: T.pink }}>
                    {activeTool === 'secciones' ? t('editor.blocks') : activeTool === 'estilos' ? t('editor.theme') : t('editor.settings')}
                  </span>
                  {isDemo && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: 'rgba(245,158,11,.12)', borderRadius: 999, color: '#b45309' }}>Demo</span>
                  )}
                </div>
              )}

              {/* Page info card */}
              <div style={{ margin: '10px 12px 4px', padding: '10px 14px', background: T.softPurple, borderRadius: 12, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {landingConfig.title || t('editor.untitled')}
                  </span>
                  <Pencil size={12} color={T.ink3} style={{ flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: 11, color: T.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {publicUrl}
                </div>
              </div>

              {/* Panel body — switches by activeTool */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* ── SECCIONES: sortable block list ── */}
                {activeTool === 'secciones' && (
                  <SortableBlockList
                    blocks={landingConfig.blocks}
                    theme={landingConfig.theme}
                    plan={plan}
                    userId={initial?.profile?.user_id}
                    pageId={pageId !== 'demo' ? pageId : undefined}
                    onUpdateBlock={updateBlock}
                    onUpdateBlockStyle={updateBlockStyle}
                    onToggleVisibility={toggleBlockVisibility}
                    onDelete={deleteBlock}
                    onDuplicate={duplicateBlock}
                    onMove={moveBlock}
                    onAdd={addBlock}
                  />
                )}

                {/* ── ESTILOS: theme editor ── */}
                {activeTool === 'estilos' && (() => {
                  const th  = landingConfig.theme
                  const bgMode = th.backgroundMode ?? th.background?.mode ?? 'solid'
                  return (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 48px', WebkitOverflowScrolling: 'touch' }}>

                    {/* ── Presets ── */}
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.predefinedTheme')}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        {THEME_PRESETS.map(p => {
                          const isActive = th.accentColor === p.accentColor && th.cardBackgroundColor === p.cardBackgroundColor
                          const previewBg = p.backgroundMode === 'gradient'
                            ? `linear-gradient(180deg,${p.gradientFrom} 0%,${p.gradientTo} 100%)`
                            : p.backgroundColor
                          return (
                            <button
                              key={p.id}
                              onClick={() => updateTheme(applyPreset(p))}
                              style={{ padding: 0, border: `2px solid ${isActive ? T.pink : T.border2}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: 'none', textAlign: 'left' }}
                            >
                              <div style={{ height: 18, background: `linear-gradient(135deg,${p.primaryColor},${p.secondaryColor})` }} />
                              <div style={{ padding: '4px 7px 6px', background: previewBg }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: p.textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{p.name}</div>
                                <div style={{ fontSize: 9, color: p.secondaryTextColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{p.description}</div>
                                <div style={{ display: 'flex', gap: 3 }}>
                                  {[p.primaryColor, p.secondaryColor, p.cardBackgroundColor ?? '#fff', p.textColor].map((c, i) => (
                                    <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: c, border: '1px solid rgba(128,128,128,0.2)', display: 'inline-block', flexShrink: 0 }} />
                                  ))}
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </section>

                    {/* ── Background ── */}
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.customBackground')}</div>
                      <div style={{ display: 'flex', background: T.softPurple, borderRadius: 999, padding: 3, gap: 2, marginBottom: 12 }}>
                        {([{ key: 'solid', label: t('editor.solid') }, { key: 'gradient', label: t('editor.gradient') }] as const).map(m => {
                          const active = bgMode === m.key
                          return (
                            <button key={m.key}
                              onClick={() => updateTheme({ backgroundMode: m.key })}
                              style={{ flex: 1, padding: '5px 0', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: active ? 'white' : 'transparent', color: active ? T.ink : T.ink2, boxShadow: active ? '0 2px 8px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
                              {m.label}
                            </button>
                          )
                        })}
                      </div>
                      {bgMode === 'solid' ? (
                        <ColorRow label={t('editor.bgColor')} value={th.backgroundColor} onChange={v => updateTheme({ backgroundColor: v })} />
                      ) : (
                        <>
                          <ColorRow label={t('editor.startColor')} value={th.gradientFrom ?? th.backgroundColor}  onChange={v => updateTheme({ gradientFrom: v })} />
                          <ColorRow label={t('editor.endColor')}   value={th.gradientTo   ?? th.secondaryColor}   onChange={v => updateTheme({ gradientTo: v })} />
                          <div style={{ height: 28, borderRadius: 8, marginTop: 4, background: getPageBackground(th) }} />
                        </>
                      )}
                    </section>

                    {/* ── Global colors ── */}
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.customColors')}</div>
                      <ColorRow label={t('editor.primaryColor')}   value={th.primaryColor}                            onChange={v => updateTheme({ primaryColor: v })} />
                      <ColorRow label={t('editor.secondaryColor')} value={th.secondaryColor}                          onChange={v => updateTheme({ secondaryColor: v })} />
                      <ColorRow label={t('editor.primaryText')}    value={th.textColor}                               onChange={v => updateTheme({ textColor: v })} />
                      <ColorRow label={t('editor.secondaryText')}  value={th.secondaryTextColor ?? '#9CA3AF'}         onChange={v => updateTheme({ secondaryTextColor: v })} />
                      <ColorRow label={t('editor.cardColor')}      value={th.cardBackgroundColor ?? '#FFFFFF'}        onChange={v => updateTheme({ cardBackgroundColor: v })} />
                      <ColorRow label={t('editor.elementColor')}   value={th.elementBackgroundColor ?? '#F3F4F6'}     onChange={v => updateTheme({ elementBackgroundColor: v })} />
                      <ColorRow label={t('editor.accentCta')}      value={th.accentColor ?? th.primaryColor}         onChange={v => updateTheme({ accentColor: v })} />
                    </section>

                    {/* ── Botones ── */}
                    {(() => {
                      const effectiveBtnStyle = th.buttonStyle ?? (bgMode === 'gradient' ? 'gradient' : 'solid')
                      const btnPreviewBg = effectiveBtnStyle === 'gradient'
                        ? `linear-gradient(135deg, ${th.buttonGradientFrom ?? th.accentColor ?? th.primaryColor}, ${th.buttonGradientTo ?? th.secondaryColor})`
                        : (th.buttonColor ?? th.accentColor ?? th.primaryColor)
                      const btnR = th.radius === 'round' ? 999 : th.radius === 'medium' ? 24 : th.radius === 'square' ? 2 : 14
                      return (
                        <section style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.buttons')}</div>
                          <div style={{ display: 'flex', background: T.softPurple, borderRadius: 999, padding: 3, gap: 2, marginBottom: 12 }}>
                            {([{ key: 'solid', label: t('editor.solid') }, { key: 'gradient', label: t('editor.gradient') }] as const).map(m => {
                              const active = effectiveBtnStyle === m.key
                              return (
                                <button key={m.key} onClick={() => updateTheme({ buttonStyle: m.key })}
                                  style={{ flex: 1, padding: '5px 0', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: active ? 'white' : 'transparent', color: active ? T.ink : T.ink2, boxShadow: active ? '0 2px 8px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
                                  {m.label}
                                </button>
                              )
                            })}
                          </div>
                          {effectiveBtnStyle === 'gradient' ? (
                            <>
                              <ColorRow label={t('editor.btnStartColor')} value={th.buttonGradientFrom ?? th.accentColor ?? th.primaryColor} onChange={v => updateTheme({ buttonGradientFrom: v })} />
                              <ColorRow label={t('editor.btnEndColor')}   value={th.buttonGradientTo   ?? th.secondaryColor}                  onChange={v => updateTheme({ buttonGradientTo: v })} />
                            </>
                          ) : (
                            <ColorRow label={t('editor.btnColor')}        value={th.buttonColor ?? th.accentColor ?? th.primaryColor}         onChange={v => updateTheme({ buttonColor: v })} />
                          )}
                          <ColorRow label={t('editor.btnText')}           value={th.buttonTextColor ?? '#FFFFFF'}                             onChange={v => updateTheme({ buttonTextColor: v })} />
                          <div style={{ marginTop: 10, padding: '10px 16px', borderRadius: btnR, background: btnPreviewBg, color: th.buttonTextColor ?? '#FFFFFF', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
                            {t('editor.btnPreview')}
                          </div>
                        </section>
                      )
                    })()}

                    {/* ── Typography ── */}
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.globalTypography')}</div>
                      <select
                        value={th.fontFamily}
                        onChange={e => updateTheme({ fontFamily: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 9, border: `1px solid ${T.border2}`, background: T.card, fontSize: 12, color: T.ink, outline: 'none' }}
                      >
                        {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </section>

                    {/* ── Borders ── */}
                    <section>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.globalBorders')}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {([
                          { key: 'square', label: t('editor.square') },
                          { key: 'soft',   label: t('editor.soft')   },
                          { key: 'medium', label: t('editor.medium') },
                          { key: 'round',  label: t('editor.round')  },
                        ] as const).map(r => (
                          <button key={r.key} onClick={() => updateTheme({ radius: r.key })}
                            style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1.5px solid ${th.radius === r.key ? T.pink : T.border2}`, background: th.radius === r.key ? T.softPink2 : T.card, color: th.radius === r.key ? T.pink : T.ink2, fontSize: 11, fontWeight: 600, cursor: 'pointer', minWidth: 56 }}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </section>

                  </div>
                  )
                })()}

                {/* ── AJUSTES: page settings ── */}
                {activeTool === 'ajustes' && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 48px', WebkitOverflowScrolling: 'touch' }}>
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.settings')}</div>
                      <Fg label={t('editor.pageTitle')}>
                        <Fi value={landingConfig.title} onChange={e => setLandingConfig(p => ({ ...p, title: e.target.value }))} />
                      </Fg>
                      <Fg label={t('editor.slugUrl')}>
                        <div style={{ display: 'flex' }}>
                          <span style={{ padding: '7px 8px', background: T.softPurple, border: `1px solid ${T.border2}`, borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 11, color: T.ink3, whiteSpace: 'nowrap' }}>@</span>
                          <Fi value={landingConfig.slug} onChange={e => setLandingConfig(p => ({ ...p, slug: e.target.value }))} style={{ borderRadius: '0 8px 8px 0' }} />
                        </div>
                      </Fg>
                      <Fg label={t('editor.destinationUrl')}>
                        <Fi type="url" value={landingConfig.destinationUrl} placeholder="https://tu-tienda.myshopify.com/..." onChange={e => setLandingConfig(p => ({ ...p, destinationUrl: e.target.value }))} />
                      </Fg>
                    </section>
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>SEO</div>
                      <Fg label={t('editor.seoTitle')}>
                        <Fi value={landingConfig.settings.seoTitle} onChange={e => updateSettings({ seoTitle: e.target.value })} />
                      </Fg>
                      <Fg label={t('editor.metaDescription')}>
                        <textarea value={landingConfig.settings.seoDescription} onChange={e => updateSettings({ seoDescription: e.target.value })} rows={3}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 9, border: `1px solid ${T.border2}`, background: T.card, fontSize: 12, color: T.ink, outline: 'none', resize: 'vertical' }} />
                      </Fg>
                    </section>
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.options')}</div>
                      <Sw label={t('editor.showTokproofBadge')} checked={landingConfig.settings.showTokproofBranding} onChange={v => updateSettings({ showTokproofBranding: v })} />
                      <Sw label={t('editor.enableTikTokRescue')} checked={landingConfig.settings.enableTikTokRescue} onChange={v => updateSettings({ enableTikTokRescue: v })} />
                      {landingConfig.settings.enableTikTokRescue && (
                        <Fg label={t('editor.rescueUrl')}>
                          <Fi type="url" value={landingConfig.settings.directExitUrl} placeholder="https://tu-tienda.com/producto" onChange={e => updateSettings({ directExitUrl: e.target.value })} />
                        </Fg>
                      )}
                    </section>

                    {/* ── Traffic sources ── */}
                    <section>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>{t('editor.distribution')}</div>
                      <TrafficSourcesSection
                        sources={trafficSources}
                        onChange={setTrafficSources}
                      />
                    </section>
                  </div>
                )}

              </div>
            </div>

            {/* ── MINI-RAIL (desktop only) ── */}
            {!isMobile && <div style={{ position: 'absolute', top: 96, right: -74, background: T.card, borderRadius: 18, padding: '8px 6px', boxShadow: T.shadowPop, display: 'flex', flexDirection: 'column', gap: 2, width: 64, zIndex: 10 }}>
              {([
                { id: 'secciones', icon: LayoutGrid, label: t('editor.sections') },
                { id: 'estilos',   icon: Palette,    label: t('editor.styles')   },
                { id: 'ajustes',   icon: Settings,   label: t('editor.settings') },
              ] as const).map(tool => {
                const active = activeTool === tool.id
                return (
                  <button key={tool.id} onClick={() => setActiveTool(tool.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 10, width: '100%' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: active ? T.softPink2 : '#F5F2FB', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}>
                      <tool.icon size={15} color={active ? T.pink : T.purple} />
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 500, color: active ? T.pink : T.ink3 }}>{tool.label}</span>
                  </button>
                )
              })}
            </div>}
          </div>
        )}

        {/* ═══ MAIN ══════════════════════════════════════════════════════════ */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
          <header style={{ height: 56, flexShrink: 0, background: T.card, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, boxShadow: T.shadowCard }}>

            <Link href="/dashboard" style={{ width: 38, height: 38, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, color: T.ink2, textDecoration: 'none' }}>
              <ArrowLeft size={16} />
            </Link>
            {/* Mobile panel toggle — only visible on mobile */}
            {isMobile && (
              <button
                onClick={() => setMobilePanelOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, border: `1.5px solid ${mobilePanelOpen ? T.pink : T.border2}`, background: mobilePanelOpen ? T.softPink2 : T.card, color: mobilePanelOpen ? T.pink : T.ink2, fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'all .15s' }}
              >
                {mobilePanelOpen
                  ? <><Eye size={13} /> {t('editor.preview')}</>
                  : <><LayoutGrid size={13} /> {t('editor.edit')}</>
                }
              </button>
            )}

            {/* Title + status — hidden on mobile to avoid overflow */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 1 auto', minWidth: 0 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {landingConfig.title || t('editor.untitled')}
                </span>
                <button style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, padding: 2, display: 'flex' }}>
                  <Pencil size={13} />
                </button>
              </div>
            )}
            {!isMobile && (
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: isPublished ? T.greenBg : T.softPurple, fontSize: 12, fontWeight: 600, color: isPublished ? T.green : T.purple }}>
                {isPublished ? t('editor.published') : t('editor.draft')}
                <ChevronDown size={11} />
              </div>
            )}

            {/* Spacer — title shrinks, buttons stay */}
            <div style={{ flex: '1 1 12px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Focus toggle — desktop only */}
              {!isMobile && (
                <button onClick={handleFocusToggle} title={focus ? 'Salir del Focus mode' : 'Focus mode'} style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, border: focus ? 'none' : `1px solid ${T.border2}`, background: focus ? T.grad : T.card, cursor: 'pointer', color: focus ? 'white' : T.ink2, boxShadow: focus ? T.shadowBtn : 'none' }}>
                  {focus ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                  )}
                </button>
              )}

              {/* Copy link — desktop only */}
              {!isMobile && (
                <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: `1px solid ${T.border2}`, background: T.card, color: T.pink, fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                  <Link2 size={13} />{t('editor.copyLink')}
                </button>
              )}

              {/* Preview link — desktop only */}
              {!isMobile && !isDemo && (
                <a href={`/u/${landingConfig.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: `1px solid ${T.border2}`, background: T.card, color: T.ink2, fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
                  <Eye size={13} />{t('editor.preview')}
                </a>
              )}

              <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '7px 12px' : '7px 14px', borderRadius: 999, border: `1px solid ${T.border2}`, background: T.card, color: saved ? T.green : T.ink2, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: saving ? .6 : 1, flexShrink: 0 }}>
                {saving ? t('editor.saving') : saved ? '✓' : t('editor.save')}
              </button>

              <button onClick={handlePublish} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '7px 14px' : '7px 18px', borderRadius: 999, border: 'none', background: T.grad, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: T.shadowBtn, flexShrink: 0 }}>
                <UploadCloud size={13} />{!isMobile && t('editor.publish')}
              </button>
            </div>
          </header>

          {/* ── WORK AREA ──────────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}>

            {/* Canvas */}
            <div style={{ flex: 1, overflow: 'auto', overflowX: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: isMobile ? '16px 0 90px' : 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 14 : 22 }}>

                {/* Device toggle — hidden on mobile (always shows mobile preview) */}
                {!isMobile && (
                <div style={{ display: 'flex', background: T.softPurple, borderRadius: 999, padding: 3, gap: 2 }}>
                  {([{ key: 'mobile', label: t('editor.mobile') }, { key: 'desktop', label: t('editor.desktop') }] as const).map(d => {
                    const active = preview === d.key
                    return (
                      <button key={d.key} onClick={() => setPreview(d.key)} style={{ padding: '5px 18px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: active ? 'white' : 'transparent', color: active ? T.ink : T.ink2, boxShadow: active ? '0 2px 8px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
                        {d.label}
                      </button>
                    )
                  })}
                </div>
                )}

                {/* Preview frame — scaled to fit on mobile (16px margins each side) */}
                <div style={{ transform: isMobile ? 'scale(0.87)' : `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform .2s',
                  /* Compensate layout width on mobile so scale doesn't cause scroll */
                  ...(isMobile ? { marginLeft: '-27px', marginRight: '-27px' } : {})
                }}>
                  {preview === 'mobile' ? (
                    // iPhone mockup
                    <div style={{ width: 390, height: 720, borderRadius: 50, background: 'linear-gradient(160deg,#23202b,#0c0b12)', padding: '16px 10px 10px', boxShadow: '0 40px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.06)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 90, height: 24, background: '#12101a', borderRadius: 999, zIndex: 2 }} />
                      <div style={{ borderRadius: 40, overflow: 'hidden', height: '100%', background: getPageBackground(landingConfig.theme) }}>
                        <div style={{ height: 32 }} />
                        <div style={{ height: 'calc(100% - 32px)', overflowY: 'auto' }}>
                          {landingConfig.blocks
                            .filter(b => b.visible)
                            .map(block => (
                              <BlockRenderer key={block.id} block={block} theme={landingConfig.theme} />
                            ))
                          }
                          {landingConfig.blocks.filter(b => b.visible).length === 0 && (
                            <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                              {t('editor.addBlocksHint')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Desktop frame
                    <div style={{ width: 900, borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: T.shadowCard, background: getPageBackground(landingConfig.theme), maxHeight: 680 }}>
                      <div style={{ overflowY: 'auto', maxHeight: 680 }}>
                        <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 0' }}>
                          {landingConfig.blocks
                            .filter(b => b.visible)
                            .map(block => (
                              <BlockRenderer key={block.id} block={block} theme={landingConfig.theme} />
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Canvas tools bar */}
            <div style={{ height: 48, flexShrink: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 2, padding: '0 16px' }}>
              <ToolBtn icon={Undo2} onClick={() => {}} title={t('editor.undo')} />
              <ToolBtn icon={Redo2} onClick={() => {}} title={t('editor.redo')} />
              <div style={{ width: 1, height: 16, background: T.border, margin: '0 6px' }} />
              <ToolBtn icon={Eye} onClick={() => !isDemo && window.open(`/u/${landingConfig.slug}`, '_blank')} title={t('editor.preview')} />
              <ToolBtn icon={Monitor} onClick={() => setPreview(p => p === 'mobile' ? 'desktop' : 'mobile')} title={t('editor.changeDevice')} />
              <div style={{ flex: 1 }} />
              <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink2 }}>
                <Minus size={12} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 500, color: T.ink2, minWidth: 38, textAlign: 'center' }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(150, z + 10))} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.ink2 }}>
                <Plus size={12} />
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* Focus card */}
      {focusCard && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: T.ink, color: 'white', borderRadius: 18, padding: '14px 24px', boxShadow: T.shadowPop, zIndex: 9999, animation: 'edFadeUp .3s ease both', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{focus ? t('editor.focusMode') : t('editor.normalMode')}</div>
          <div style={{ fontSize: 12, opacity: .65 }}>{focus ? t('editor.focusModeDesc') : t('editor.panelRestored')}</div>
        </div>
      )}

      {/* ── Mobile FAB: shown when panel is hidden ── */}
      {isMobile && !mobilePanelOpen && (
        <button
          onClick={() => setMobilePanelOpen(true)}
          style={{
            position: 'fixed', bottom: 26, right: 18, zIndex: 60,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '13px 20px',
            background: T.grad, color: 'white',
            border: 'none', borderRadius: 999,
            fontSize: 13, fontWeight: 800,
            boxShadow: '0 4px 24px rgba(246,71,169,.4)',
            cursor: 'pointer', letterSpacing: '.01em',
          }}
        >
          <LayoutGrid size={16} /> {t('editor.edit')}
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: T.ink, color: 'white',
          borderRadius: toast.length > 40 ? 14 : 999,
          padding: toast.length > 40 ? '12px 20px' : '9px 22px',
          boxShadow: T.shadowPop, zIndex: 9999, fontSize: 13, fontWeight: 500,
          animation: 'edFadeIn .2s ease both',
          maxWidth: 380, textAlign: 'center', lineHeight: 1.45,
        }}>
          {toast}
        </div>
      )}
    </>
  )
}

// ─── Tiny local helpers (no global CSS needed) ────────────────────────────────
function Fg({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  )
}

function Fi(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ width: '100%', padding: '7px 10px', borderRadius: 9, border: '1px solid rgba(123,97,255,0.16)', background: '#fff', fontSize: 12, color: '#171717', outline: 'none', ...props.style }} />
  )
}

function Sw({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: '#F647A9', width: 15, height: 15 }} />
      <span style={{ fontSize: 12.5, fontWeight: 500, color: '#6B7280' }}>{label}</span>
    </label>
  )
}
