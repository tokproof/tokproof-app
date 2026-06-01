'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, Pencil, ChevronDown, UploadCloud,
  User, Share2, Link2, Palette, Shield, Signal,
  Plus, Trash2, GripVertical, Eye, Monitor, Minus,
} from 'lucide-react'
import type { FullPage } from '@/types'
import type { LandingTheme, LandingConfig, SimplePageConfig, SimplePageLink, SimplePagePlatform, TrafficSource } from '@/types/landing'
import { makeDefaultSimplePageConfig } from '@/types/landing'
import TrafficSourcesSection from '@/components/editor/TrafficSourcesSection'
import { FONT_OPTIONS, getPageBackground } from '@/lib/blockStyle'
import { getPublicPageDisplay, getPublicExitDisplay } from '@/lib/urls'
import SimplePagePublicRenderer from '@/components/public/SimplePagePublicRenderer'

// ─── Design tokens (same as EditorClient) ────────────────────────────────────
const T = {
  bg: '#FBF9FC', card: '#FFFFFF', ink: '#171717',
  ink2: '#6B7280', ink3: '#9CA3AF', pink: '#F647A9', purple: '#7B61FF',
  green: '#1AA960', greenBg: '#E6F9EE',
  border: 'rgba(123,97,255,0.10)', border2: 'rgba(123,97,255,0.16)',
  softPink2: '#FFE3F1', softPurple: '#F4F0FF',
  grad: 'linear-gradient(135deg,#FF4FD8 0%,#7B61FF 100%)',
  shadowCard: '0 8px 30px rgba(123,97,255,0.06)',
  shadowPop: '0 18px 50px -12px rgba(40,20,80,.18)',
  shadowBtn: '0 10px 25px rgba(255,79,216,0.22)',
} as const

// ─── Theme presets (same 8 as EditorClient) ───────────────────────────────────
type ThemePreset = Omit<LandingTheme, 'fontFamily' | 'radius'> & {
  id: string; name: string; description: string
  fontFamily: string; radius: 'square' | 'soft' | 'medium' | 'round'
}

const THEME_PRESETS: ThemePreset[] = [
  { id: 'rosa_premium', name: 'Rosa Premium', description: 'Femenino, elegante y moderno', backgroundMode: 'gradient', gradientFrom: '#FFF4FA', gradientTo: '#FBE7F4', backgroundColor: '#FFF4FA', primaryColor: '#EC3FA3', secondaryColor: '#A855F7', accentColor: '#FF4FB8', textColor: '#171717', secondaryTextColor: '#6B7280', cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#FCE7F3', borderColor: '#F9A8D4', buttonTextColor: '#FFFFFF', buttonStyle: 'gradient', buttonGradientFrom: '#FF4FB8', buttonGradientTo: '#A855F7', fontFamily: 'Nunito Sans', radius: 'soft' },
  { id: 'negro_onyx', name: 'Negro Onyx', description: 'Moderno, profesional y sofisticado', backgroundMode: 'solid', backgroundColor: '#0B0B10', gradientFrom: '#0B0B10', gradientTo: '#18181B', primaryColor: '#8B5CF6', secondaryColor: '#EC4899', accentColor: '#A855F7', textColor: '#FFFFFF', secondaryTextColor: '#A1A1AA', cardBackgroundColor: '#18181B', elementBackgroundColor: '#27272A', borderColor: '#3F3F46', buttonTextColor: '#FFFFFF', buttonStyle: 'gradient', buttonGradientFrom: '#8B5CF6', buttonGradientTo: '#EC4899', fontFamily: 'Inter', radius: 'square' },
  { id: 'amarillo_pollito', name: 'Amarillo Pollito', description: 'Cálido, amigable y llamativo', backgroundMode: 'solid', backgroundColor: '#FDE68A', gradientFrom: '#FDE68A', gradientTo: '#FEF3C7', primaryColor: '#F59E0B', secondaryColor: '#92400E', accentColor: '#FBBF24', textColor: '#3B2600', secondaryTextColor: '#856321', cardBackgroundColor: '#FEF3C7', elementBackgroundColor: '#FCD34D', borderColor: '#F59E0B', buttonTextColor: '#3B2600', buttonStyle: 'solid', buttonColor: '#F59E0B', fontFamily: 'Poppins', radius: 'medium' },
  { id: 'azul_confianza', name: 'Azul Confianza', description: 'Profesional, limpio y confiable', backgroundMode: 'gradient', gradientFrom: '#EFF6FF', gradientTo: '#DBEAFE', backgroundColor: '#EFF6FF', primaryColor: '#3B82F6', secondaryColor: '#60A5FA', accentColor: '#2563EB', textColor: '#0F172A', secondaryTextColor: '#64748B', cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#DBEAFE', borderColor: '#93C5FD', buttonTextColor: '#FFFFFF', buttonStyle: 'solid', buttonColor: '#2563EB', fontFamily: 'Inter', radius: 'soft' },
  { id: 'verde_natural', name: 'Verde Natural', description: 'Fresco, natural y saludable', backgroundMode: 'gradient', gradientFrom: '#F0FDF4', gradientTo: '#DCFCE7', backgroundColor: '#F0FDF4', primaryColor: '#22C55E', secondaryColor: '#16A34A', accentColor: '#15803D', textColor: '#052E16', secondaryTextColor: '#4B6356', cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#DCFCE7', borderColor: '#86EFAC', buttonTextColor: '#FFFFFF', buttonStyle: 'solid', buttonColor: '#22C55E', fontFamily: 'Nunito Sans', radius: 'medium' },
  { id: 'nude_beauty', name: 'Nude Beauty', description: 'Suave, elegante y minimalista', backgroundMode: 'solid', backgroundColor: '#FFF7ED', gradientFrom: '#FFF7ED', gradientTo: '#FFEDD5', primaryColor: '#FB923C', secondaryColor: '#C084FC', accentColor: '#EA580C', textColor: '#431407', secondaryTextColor: '#9A6B55', cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#FFEDD5', borderColor: '#FDBA74', buttonTextColor: '#FFFFFF', buttonStyle: 'solid', buttonColor: '#EA580C', fontFamily: 'Playfair Display', radius: 'soft' },
  { id: 'morado_creator', name: 'Morado Creator', description: 'Creativo, moderno y vibrante', backgroundMode: 'gradient', gradientFrom: '#F5F3FF', gradientTo: '#EDE9FE', backgroundColor: '#F5F3FF', primaryColor: '#8B5CF6', secondaryColor: '#EC4899', accentColor: '#7C3AED', textColor: '#1E1B4B', secondaryTextColor: '#6D5C91', cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#EDE9FE', borderColor: '#C4B5FD', buttonTextColor: '#FFFFFF', buttonStyle: 'gradient', buttonGradientFrom: '#8B5CF6', buttonGradientTo: '#EC4899', fontFamily: 'Manrope', radius: 'round' },
  { id: 'minimal_blanco', name: 'Minimal Blanco', description: 'Minimalista, limpio y profesional', backgroundMode: 'solid', backgroundColor: '#FFFFFF', gradientFrom: '#FFFFFF', gradientTo: '#F3F4F6', primaryColor: '#111827', secondaryColor: '#6B7280', accentColor: '#111827', textColor: '#111827', secondaryTextColor: '#6B7280', cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#F3F4F6', borderColor: '#E5E7EB', buttonTextColor: '#FFFFFF', buttonStyle: 'solid', buttonColor: '#111827', fontFamily: 'Inter', radius: 'soft' },
]

function applyPreset(p: ThemePreset): Partial<LandingTheme> {
  const { id: _i, name: _n, description: _d, ...fields } = p; return fields
}

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS: Array<{ key: SimplePagePlatform; label: string; placeholder: string; emoji: string }> = [
  { key: 'instagram', label: 'Instagram',  placeholder: 'https://instagram.com/tuusuario', emoji: '📸' },
  { key: 'tiktok',   label: 'TikTok',     placeholder: 'https://tiktok.com/@tuusuario',   emoji: '🎵' },
  { key: 'youtube',  label: 'YouTube',    placeholder: 'https://youtube.com/@tucanal',    emoji: '▶️' },
  { key: 'website',  label: 'Web',        placeholder: 'https://tuweb.com',              emoji: '🌐' },
  { key: 'whatsapp', label: 'WhatsApp',   placeholder: 'https://wa.me/34600000000',      emoji: '💬' },
  { key: 'email',    label: 'Email',      placeholder: 'mailto:hola@tuweb.com',          emoji: '✉️' },
  { key: 'x',        label: 'X / Twitter', placeholder: 'https://x.com/tuusuario',       emoji: '✕'  },
  { key: 'linkedin', label: 'LinkedIn',   placeholder: 'https://linkedin.com/in/tu',     emoji: '💼' },
]

// ─── Small form primitives ────────────────────────────────────────────────────
const FL = ({ children }: { children: React.ReactNode }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.ink2, marginBottom: 4 }}>{children}</label>
)
const FG = ({ children, mb = 10 }: { children: React.ReactNode; mb?: number }) => (
  <div style={{ marginBottom: mb }}>{children}</div>
)
const FI = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} style={{ width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12, border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none', fontFamily: 'inherit', ...p.style }} />
)
const FTA = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} style={{ width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12, border: `1px solid ${T.border2}`, background: T.card, color: T.ink, outline: 'none', resize: 'vertical', minHeight: 52, fontFamily: 'inherit', ...p.style }} />
)
const ColorRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
    <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }} />
    <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: T.ink2 }}>{label}</span>
    <span style={{ fontSize: 11, fontWeight: 600, color: T.ink3, fontFamily: 'monospace' }}>{value.toUpperCase()}</span>
  </div>
)

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{ width: 38, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, padding: 2, background: checked ? T.pink : '#D1D5DB', display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start', transition: 'background .15s' }}
      >
        <div style={{ width: 16, height: 16, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
      </button>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: T.ink }}>{label}</span>
    </label>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────
const SH = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10.5, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, marginTop: 14 }}>{children}</div>
)

// ─── Initialise config from saved data or defaults ────────────────────────────
function initConfig(fullPage: FullPage): {
  simpleConfig:    SimplePageConfig
  theme:           LandingTheme
  slug:            string
  title:           string
  status:          'draft' | 'published'
  trafficSources:  TrafficSource[]
} {
  const saved = (fullPage.page.settings as Record<string, unknown>)?._landingConfig as LandingConfig | undefined
  const defaultTheme: LandingTheme = { primaryColor: '#F647A9', secondaryColor: '#7B61FF', backgroundColor: '#F5F3FF', textColor: '#1E1B4B', fontFamily: 'Nunito Sans', radius: 'soft', backgroundMode: 'gradient', gradientFrom: '#F5F3FF', gradientTo: '#EDE9FE', accentColor: '#7C3AED', secondaryTextColor: '#6D5C91', cardBackgroundColor: '#FFFFFF', elementBackgroundColor: '#EDE9FE', borderColor: '#C4B5FD', buttonTextColor: '#FFFFFF', buttonStyle: 'gradient', buttonGradientFrom: '#8B5CF6', buttonGradientTo: '#EC4899' }

  if (saved?.simplePage) {
    return {
      simpleConfig:   saved.simplePage,
      theme:          saved.theme ?? defaultTheme,
      slug:           saved.slug ?? fullPage.page.username ?? '',
      title:          saved.title ?? fullPage.page.title ?? '',
      status:         saved.status ?? fullPage.page.status as 'draft' | 'published',
      trafficSources: saved.trafficSources ?? [],
    }
  }
  return {
    simpleConfig:   makeDefaultSimplePageConfig(fullPage.page.title ?? '', fullPage.page.username ?? ''),
    theme:          defaultTheme,
    slug:           fullPage.page.username ?? '',
    title:          fullPage.page.title ?? 'Nueva Simple Page',
    status:         fullPage.page.status as 'draft' | 'published',
    trafficSources: [],
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  fullPage: FullPage
  pageType: 'simple_page' | 'creator_page'
}

type ActiveTool = 'perfil' | 'redes' | 'links' | 'estilos' | 'fuente' | 'guia'

// ═══════════════════════════════════════════════════════════════════════════════
export default function SimplePageEditorClient({ fullPage, pageType }: Props) {
  const pageId = fullPage.page.id
  const init = initConfig(fullPage)

  const [simpleConfig,    setSimpleConfig]    = useState<SimplePageConfig>(init.simpleConfig)
  const [theme,           setTheme]           = useState<LandingTheme>(init.theme)
  const [slug,            setSlug]            = useState(init.slug)
  const [title,           setTitle]           = useState(init.title)
  const [status,          setStatus]          = useState(init.status)
  const [trafficSources,  setTrafficSources]  = useState<TrafficSource[]>(init.trafficSources)
  const [activeTool,      setActiveTool]      = useState<ActiveTool>('perfil')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [toast,        setToast]        = useState<string | null>(null)
  const [preview,      setPreview]      = useState<'mobile' | 'desktop'>('mobile')
  const [zoom,         setZoom]         = useState(100)

  function showToast(msg: string, ms = 2200) { setToast(msg); setTimeout(() => setToast(null), ms) }

  const updateProfile = useCallback((patch: Partial<SimplePageConfig['profile']>) => {
    setSimpleConfig(c => ({ ...c, profile: { ...c.profile, ...patch } }))
  }, [])

  const updateSettings = useCallback((patch: Partial<SimplePageConfig['settings']>) => {
    setSimpleConfig(c => ({ ...c, settings: { ...c.settings, ...patch } }))
  }, [])

  const updateTheme = useCallback((patch: Partial<LandingTheme>) => {
    setTheme(t => ({ ...t, ...patch }))
  }, [])

  // Build the LandingConfig object to save / preview
  const firstActiveLink = simpleConfig.links.find(l => l.enabled && l.url)
  const destUrl = firstActiveLink?.url ?? ''

  const liveConfig: LandingConfig = {
    id: pageId,
    title,
    slug,
    status,
    destinationUrl: destUrl,
    template: 'link_in_bio',
    theme,
    settings: {
      showTokproofBranding: true,
      enableTikTokRescue: simpleConfig.settings.enableBrowserGuide,
      directExitUrl: destUrl,
      seoTitle: title,
      seoDescription: simpleConfig.profile.bio,
    },
    blocks: [],
    pageType,
    simplePage: simpleConfig,
    trafficSources,
  }

  async function handleSave(silent = false) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('pages').update({
      title,
      settings: {
        ...(fullPage.page.settings as Record<string, unknown>),
        _landingConfig: liveConfig,
      },
    }).eq('id', pageId)
    setSaving(false)
    if (!silent) {
      setSaved(true)
      showToast('Cambios guardados')
      setTimeout(() => setSaved(false), 2500)
    }
  }

  async function handlePublish() {
    const validSources = trafficSources.filter(s => s.handle.trim())
    if (validSources.length === 0) {
      showToast(
        'Antes de publicar, selecciona al menos una fuente de tráfico y añade el perfil donde compartirás esta página.',
        5000,
      )
      setActiveTool('fuente')
      return
    }

    // Persist current state (including trafficSources) before publishing
    await handleSave(true)

    const res = await fetch('/api/publish-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    })
    if (res.ok) { setStatus('published'); showToast('Página publicada ✓') }
    else { const d = await res.json(); alert(d.error ?? 'Error al publicar') }
  }

  const isPublished = status === 'published'
  const publicDisplay = slug ? getPublicPageDisplay(slug) : 'tokproof.app/@tuusuario'
  const exitDisplay   = slug ? getPublicExitDisplay(slug)  : 'tokproof.app/@tuusuario/go'
  const bgMode = theme.backgroundMode ?? 'solid'

  // ── Rail items (fuente between estilos and guia — publishing-related) ───────
  const railItems: Array<{ id: ActiveTool; icon: React.ReactNode; label: string }> = [
    { id: 'perfil',  icon: <User size={15} />,    label: 'Perfil'  },
    { id: 'redes',   icon: <Share2 size={15} />,  label: 'Redes'   },
    { id: 'links',   icon: <Link2 size={15} />,   label: 'Links'   },
    { id: 'estilos', icon: <Palette size={15} />, label: 'Estilos' },
    { id: 'fuente',  icon: <Signal size={15} />,  label: 'Fuente'  },
    { id: 'guia',    icon: <Shield size={15} />,  label: 'Guía'    },
  ]

  return (
    <>
      <style>{`@keyframes spFadeUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.bg, fontFamily: 'Inter,system-ui,sans-serif' }}>

        {/* ═══ LEFT SIDEBAR ══════════════════════════════════════════════════ */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 290, height: '100vh', background: T.card, borderRight: `1px solid ${T.border2}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: T.pink }}>
                {activeTool === 'perfil' ? 'Perfil' : activeTool === 'redes' ? 'Redes sociales' : activeTool === 'links' ? 'Links' : activeTool === 'estilos' ? 'Estilos' : activeTool === 'fuente' ? 'Fuente de tráfico' : 'Guía navegador'}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: isPublished ? T.greenBg : T.softPurple, color: isPublished ? T.green : T.purple }}>
                {isPublished ? 'Publicada' : 'Borrador'}
              </span>
            </div>

            {/* Page info card */}
            <div style={{ margin: '10px 12px 4px', padding: '10px 14px', background: T.softPurple, borderRadius: 12, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title || 'Sin título'}</span>
                <Pencil size={12} color={T.ink3} />
              </div>
              <div style={{ fontSize: 11, color: T.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{publicDisplay}</div>
            </div>

            {/* Panel body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 16px' }}>

              {/* ── PERFIL ── */}
              {activeTool === 'perfil' && (
                <div>
                  <FG><FL>Foto / Avatar URL</FL><FI type="url" value={simpleConfig.profile.avatarUrl} placeholder="https://..." onChange={e => updateProfile({ avatarUrl: e.target.value })} /></FG>
                  <FG><FL>Nombre visible</FL><FI value={simpleConfig.profile.displayName} onChange={e => updateProfile({ displayName: e.target.value })} /></FG>
                  <FG><FL>Usuario (@)</FL>
                    <div style={{ display: 'flex' }}>
                      <span style={{ padding: '7px 8px', background: T.softPurple, border: `1px solid ${T.border2}`, borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 11, color: T.ink3, display: 'flex', alignItems: 'center' }}>@</span>
                      <FI value={simpleConfig.profile.username} onChange={e => updateProfile({ username: e.target.value })} style={{ borderRadius: '0 8px 8px 0' }} />
                    </div>
                  </FG>
                  <FG><FL>Bio / Descripción</FL><FTA value={simpleConfig.profile.bio} placeholder="Creador de contenido 🌟" onChange={e => updateProfile({ bio: e.target.value })} /></FG>
                  <Toggle checked={simpleConfig.profile.verifiedBadge} onChange={v => updateProfile({ verifiedBadge: v })} label="Mostrar badge verificado ✅" />
                </div>
              )}

              {/* ── REDES ── */}
              {activeTool === 'redes' && (
                <div>
                  {PLATFORMS.map(plat => {
                    const social = simpleConfig.socialLinks.find(s => s.platform === plat.key)
                    const enabled = social?.enabled ?? false
                    const url     = social?.url ?? ''
                    const updSocial = (patch: { enabled?: boolean; url?: string }) => {
                      setSimpleConfig(c => {
                        const existing = c.socialLinks.find(s => s.platform === plat.key)
                        if (existing) return { ...c, socialLinks: c.socialLinks.map(s => s.platform === plat.key ? { ...s, ...patch } : s) }
                        return { ...c, socialLinks: [...c.socialLinks, { id: `sl_${plat.key}`, platform: plat.key, url: '', enabled: false, ...patch }] }
                      })
                    }
                    return (
                      <div key={plat.key} style={{ marginBottom: 14, padding: 10, background: T.bg, borderRadius: 10, border: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: enabled ? 8 : 0 }}>
                          <span style={{ fontSize: 16, flexShrink: 0 }}>{plat.emoji}</span>
                          <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: T.ink }}>{plat.label}</span>
                          <Toggle checked={enabled} onChange={v => updSocial({ enabled: v })} label="" />
                        </div>
                        {enabled && <FI type="url" value={url} placeholder={plat.placeholder} onChange={e => updSocial({ url: e.target.value })} />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── LINKS ── */}
              {activeTool === 'links' && (
                <div>
                  {simpleConfig.links.map((link, i) => (
                    <LinkRow
                      key={link.id}
                      link={link}
                      index={i}
                      total={simpleConfig.links.length}
                      onChange={patch => setSimpleConfig(c => ({ ...c, links: c.links.map((l, j) => j === i ? { ...l, ...patch } : l) }))}
                      onDelete={() => setSimpleConfig(c => ({ ...c, links: c.links.filter((_, j) => j !== i) }))}
                      onMove={(dir) => setSimpleConfig(c => {
                        const ls = [...c.links]; const to = i + dir
                        if (to < 0 || to >= ls.length) return c;
                        [ls[i], ls[to]] = [ls[to], ls[i]]; return { ...c, links: ls }
                      })}
                    />
                  ))}
                  <button
                    onClick={() => setSimpleConfig(c => ({ ...c, links: [...c.links, { id: `link_${Date.now()}`, title: 'Nuevo link', url: '', enabled: true }] }))}
                    style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: `1.5px dashed ${T.border2}`, background: 'transparent', color: T.purple, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                  >
                    <Plus size={13} /> Añadir link
                  </button>
                </div>
              )}

              {/* ── ESTILOS ── */}
              {activeTool === 'estilos' && (
                <div>
                  {/* Presets */}
                  <SH>Tema predefinido</SH>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                    {THEME_PRESETS.map(p => {
                      const isActive = theme.accentColor === p.accentColor && theme.cardBackgroundColor === p.cardBackgroundColor
                      const previewBg = p.backgroundMode === 'gradient' ? `linear-gradient(180deg,${p.gradientFrom} 0%,${p.gradientTo} 100%)` : p.backgroundColor
                      return (
                        <button key={p.id} onClick={() => setTheme(t => ({ ...t, ...applyPreset(p) }))}
                          style={{ padding: 0, border: `2px solid ${isActive ? T.pink : T.border2}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: 'none', textAlign: 'left' }}>
                          <div style={{ height: 14, background: `linear-gradient(135deg,${p.primaryColor},${p.secondaryColor})` }} />
                          <div style={{ padding: '3px 6px 5px', background: previewBg }}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: p.textColor, marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                            <div style={{ display: 'flex', gap: 3 }}>
                              {[p.primaryColor, p.secondaryColor, p.cardBackgroundColor ?? '#fff'].map((c, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: c, border: '1px solid rgba(128,128,128,0.2)', display: 'inline-block' }} />)}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Background */}
                  <SH>Fondo</SH>
                  <div style={{ display: 'flex', background: T.softPurple, borderRadius: 999, padding: 3, gap: 2, marginBottom: 10 }}>
                    {([{ key: 'solid', label: 'Sólido' }, { key: 'gradient', label: 'Degradado' }] as const).map(m => {
                      const active = bgMode === m.key
                      return <button key={m.key} onClick={() => updateTheme({ backgroundMode: m.key })} style={{ flex: 1, padding: '5px 0', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: active ? 'white' : 'transparent', color: active ? T.ink : T.ink2, boxShadow: active ? '0 2px 8px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>{m.label}</button>
                    })}
                  </div>
                  {bgMode === 'solid'
                    ? <ColorRow label="Color de fondo" value={theme.backgroundColor} onChange={v => updateTheme({ backgroundColor: v })} />
                    : <><ColorRow label="Color inicio" value={theme.gradientFrom ?? theme.backgroundColor} onChange={v => updateTheme({ gradientFrom: v })} /><ColorRow label="Color fin" value={theme.gradientTo ?? theme.primaryColor} onChange={v => updateTheme({ gradientTo: v })} /><div style={{ height: 22, borderRadius: 8, marginBottom: 10, background: getPageBackground(theme) }} /></>
                  }

                  {/* Colors */}
                  <SH>Colores</SH>
                  <ColorRow label="Color botones"     value={theme.accentColor ?? theme.primaryColor}    onChange={v => updateTheme({ accentColor: v })} />
                  <ColorRow label="Texto principal"   value={theme.textColor}                            onChange={v => updateTheme({ textColor: v })} />
                  <ColorRow label="Texto secundario"  value={theme.secondaryTextColor ?? '#9CA3AF'}      onChange={v => updateTheme({ secondaryTextColor: v })} />
                  <ColorRow label="Color cards"       value={theme.cardBackgroundColor ?? '#FFFFFF'}     onChange={v => updateTheme({ cardBackgroundColor: v })} />

                  {/* Botones */}
                  <SH>Botones</SH>
                  <div style={{ display: 'flex', background: T.softPurple, borderRadius: 999, padding: 3, gap: 2, marginBottom: 10 }}>
                    {([{ key: 'solid', label: 'Sólido' }, { key: 'gradient', label: 'Degradado' }] as const).map(m => {
                      const eff = theme.buttonStyle ?? (bgMode === 'gradient' ? 'gradient' : 'solid')
                      const active = eff === m.key
                      return <button key={m.key} onClick={() => updateTheme({ buttonStyle: m.key })} style={{ flex: 1, padding: '5px 0', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: active ? 'white' : 'transparent', color: active ? T.ink : T.ink2, boxShadow: active ? '0 2px 8px rgba(0,0,0,.08)' : 'none' }}>{m.label}</button>
                    })}
                  </div>
                  {(theme.buttonStyle === 'gradient' || (!theme.buttonStyle && bgMode === 'gradient'))
                    ? <><ColorRow label="Inicio botón" value={theme.buttonGradientFrom ?? theme.accentColor ?? theme.primaryColor} onChange={v => updateTheme({ buttonGradientFrom: v })} /><ColorRow label="Fin botón" value={theme.buttonGradientTo ?? theme.secondaryColor} onChange={v => updateTheme({ buttonGradientTo: v })} /></>
                    : <ColorRow label="Color botón" value={theme.buttonColor ?? theme.accentColor ?? theme.primaryColor} onChange={v => updateTheme({ buttonColor: v })} />
                  }
                  <ColorRow label="Texto del botón" value={theme.buttonTextColor ?? '#FFFFFF'} onChange={v => updateTheme({ buttonTextColor: v })} />

                  {/* Font */}
                  <SH>Tipografía</SH>
                  <select value={theme.fontFamily} onChange={e => updateTheme({ fontFamily: e.target.value })} style={{ width: '100%', padding: '7px 10px', borderRadius: 9, border: `1px solid ${T.border2}`, background: T.card, fontSize: 12, color: T.ink, outline: 'none', marginBottom: 10 }}>
                    {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>

                  {/* Radius */}
                  <SH>Bordes</SH>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {([{ key: 'square', label: 'Cuadrado' }, { key: 'soft', label: 'Suave' }, { key: 'medium', label: 'Medio' }, { key: 'round', label: 'Redondo' }] as const).map(r => (
                      <button key={r.key} onClick={() => updateTheme({ radius: r.key })} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: `1.5px solid ${theme.radius === r.key ? T.pink : T.border2}`, background: theme.radius === r.key ? T.softPink2 : T.card, color: theme.radius === r.key ? T.pink : T.ink2, fontSize: 11, fontWeight: 600, cursor: 'pointer', minWidth: 56 }}>{r.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FUENTE DE TRÁFICO ── */}
              {activeTool === 'fuente' && (
                <TrafficSourcesSection
                  sources={trafficSources}
                  onChange={setTrafficSources}
                />
              )}

              {/* ── GUÍA ── */}
              {activeTool === 'guia' && (
                <div>
                  <div style={{ background: T.softPurple, borderRadius: 12, padding: 12, marginBottom: 14 }}>
                    <Toggle checked={simpleConfig.settings.enableBrowserGuide} onChange={v => updateSettings({ enableBrowserGuide: v })} label="Activar guía para abrir en navegador" />
                    <p style={{ fontSize: 11.5, color: T.ink2, lineHeight: 1.55, marginTop: 10, marginBottom: 0 }}>
                      Cuando está activa, Tokproof mostrará una pantalla animada para que los visitantes de TikTok puedan abrir la página en su navegador real.
                    </p>
                  </div>

                  <SH>Tu enlace principal</SH>
                  <div style={{ padding: '10px 12px', background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 10 }}>
                    <div style={{ fontSize: 10.5, color: T.ink3, marginBottom: 3 }}>Página normal</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: T.purple, fontFamily: 'monospace' }}>{publicDisplay}</div>
                  </div>
                  <div style={{ padding: '10px 12px', background: simpleConfig.settings.enableBrowserGuide ? T.softPink2 : T.bg, borderRadius: 10, border: `1px solid ${simpleConfig.settings.enableBrowserGuide ? 'rgba(246,71,169,.3)' : T.border}` }}>
                    <div style={{ fontSize: 10.5, color: T.ink3, marginBottom: 3 }}>Con guía de navegador</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: simpleConfig.settings.enableBrowserGuide ? T.pink : T.ink3, fontFamily: 'monospace' }}>{exitDisplay}</div>
                    {!simpleConfig.settings.enableBrowserGuide && <div style={{ fontSize: 11, color: T.ink3, marginTop: 4 }}>Activa la guía para usar este link.</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Save / Publish footer */}
            <div style={{ padding: '10px 12px', borderTop: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', gap: 8 }}>
              <button onClick={() => handleSave()} disabled={saving}
                style={{ flex: 1, height: 38, borderRadius: 10, border: `1px solid ${T.border2}`, background: saved ? T.greenBg : T.card, color: saved ? T.green : T.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
                {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar'}
              </button>
              <button onClick={handlePublish}
                style={{ flex: 1, height: 38, borderRadius: 10, border: 'none', background: T.grad, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: T.shadowBtn }}>
                {isPublished ? 'Actualizar' : 'Publicar →'}
              </button>
            </div>
          </div>

          {/* Mini rail */}
          <div style={{ position: 'absolute', top: 72, right: -68, background: T.card, borderRadius: 16, padding: '8px 5px', boxShadow: T.shadowPop, display: 'flex', flexDirection: 'column', gap: 2, width: 58, zIndex: 10 }}>
            {railItems.map(item => {
              const active = activeTool === item.id
              return (
                <button key={item.id} onClick={() => setActiveTool(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 0', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 10, width: '100%' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: active ? T.softPink2 : '#F5F2FB', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}>
                    <span style={{ color: active ? T.pink : T.purple }}>{item.icon}</span>
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 500, color: active ? T.pink : T.ink3 }}>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ═══ MAIN ══════════════════════════════════════════════════════════ */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Topbar */}
          <header style={{ height: 56, flexShrink: 0, background: T.card, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, boxShadow: T.shadowCard }}>
            <Link href="/dashboard/ecommerce" style={{ width: 38, height: 38, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, color: T.ink2, textDecoration: 'none' }}>
              <ArrowLeft size={16} />
            </Link>
            <span style={{ fontSize: 17, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{title || 'Sin título'}</span>

            {/* Preview toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 10, background: T.softPurple, flexShrink: 0 }}>
              {([{ key: 'mobile', icon: <Eye size={14} /> }, { key: 'desktop', icon: <Monitor size={14} /> }] as const).map(m => (
                <button key={m.key} onClick={() => setPreview(m.key)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: preview === m.key ? T.card : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: preview === m.key ? T.pink : T.ink3, boxShadow: preview === m.key ? '0 2px 6px rgba(0,0,0,.08)' : 'none' }}>
                  {m.icon}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 10, background: T.softPurple, flexShrink: 0 }}>
              <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.ink2, minWidth: 36, textAlign: 'center' }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(150, z + 10))} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'none', cursor: 'pointer', color: T.ink2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
            </div>
            <button onClick={() => { const u = `https://${publicDisplay}`; navigator.clipboard?.writeText?.(u); showToast('Enlace copiado') }} style={{ height: 36, padding: '0 14px', borderRadius: 10, border: `1px solid ${T.border2}`, background: T.card, color: T.ink2, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              <UploadCloud size={14} /> Copiar link
            </button>
          </header>

          {/* Preview area */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 20px', background: '#F0EDF8' }}>
            <div style={{
              width: preview === 'mobile' ? 390 : 768,
              minHeight: 700,
              borderRadius: preview === 'mobile' ? 40 : 16,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,.22)',
              border: '6px solid #1a1a1a',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'width .2s, transform .2s',
              background: '#fff',
            }}>
              <SimplePagePublicRenderer config={liveConfig} preview />
            </div>
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a1a', color: '#fff',
          borderRadius: toast.length > 40 ? 14 : 999,
          padding: toast.length > 40 ? '12px 20px' : '12px 22px',
          fontSize: 13, fontWeight: 500, zIndex: 999,
          animation: 'spFadeUp .2s ease', boxShadow: '0 10px 30px rgba(0,0,0,.22)',
          maxWidth: 380, textAlign: 'center', lineHeight: 1.45,
        }}>
          {toast}
        </div>
      )}
    </>
  )
}

// ─── LinkRow sub-component ────────────────────────────────────────────────────
function LinkRow({ link, index, total, onChange, onDelete, onMove }: {
  link: SimplePageLink; index: number; total: number
  onChange: (patch: Partial<SimplePageLink>) => void
  onDelete: () => void
  onMove: (dir: 1 | -1) => void
}) {
  return (
    <div style={{ padding: 10, background: '#FEFBFF', border: `1px solid rgba(123,97,255,.12)`, borderRadius: 10, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          <button onClick={() => onMove(-1)} disabled={index === 0} style={{ width: 18, height: 18, border: 'none', background: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: index === 0 ? .3 : 1 }}>▲</button>
          <GripVertical size={12} color="#9CA3AF" />
          <button onClick={() => onMove(1)} disabled={index === total - 1} style={{ width: 18, height: 18, border: 'none', background: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: index === total - 1 ? .3 : 1 }}>▼</button>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FI value={link.title} placeholder="Título del botón" onChange={e => onChange({ title: e.target.value })} style={{ marginBottom: 6 }} />
          <FI type="url" value={link.url} placeholder="https://..." onChange={e => onChange({ url: e.target.value })} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.06)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={12} /></button>
          <button onClick={() => onChange({ enabled: !link.enabled })} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: link.enabled ? 'rgba(16,185,129,.1)' : '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{link.enabled ? '👁' : '🙈'}</button>
        </div>
      </div>
    </div>
  )
}
