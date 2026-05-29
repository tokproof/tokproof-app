'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { FullPage } from '@/types'
import {
  BarChart3, ShieldCheck, LayoutGrid, Settings,
  Link2, ArrowLeft, Pencil, ChevronDown,
  Eye, UploadCloud, Plus, Undo2, Redo2, Monitor, Minus, Palette,
  type LucideIcon,
} from 'lucide-react'
import { arrayMove } from '@dnd-kit/sortable'
import type { LandingConfig, LandingBlock, LandingTheme, LandingSettings, BlockStyle } from '@/types/landing'
import { makeDefaultConfig, makeDefaultBlocks } from '@/types/landing'
import { FONT_OPTIONS } from '@/lib/blockStyle'
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

  // ── Central state ──
  const [landingConfig, setLandingConfig] = useState<LandingConfig>(() =>
    initial ? pageToLandingConfig(initial) : makeDefaultConfig()
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

  // ── Toast helper ──
  function showToast(msg: string) {
    setToast(msg); setTimeout(() => setToast(null), 2200)
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
    setLandingConfig(prev => {
      const block = prev.blocks.find(b => b.id === blockId)
      if (!block) return prev
      if (block.locked && !window.confirm(`¿Eliminar "${block.label}"? Es un bloque importante.`)) return prev
      return { ...prev, blocks: prev.blocks.filter(b => b.id !== blockId) }
    })
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
    const newBlock: LandingBlock = {
      id: `block_${type}_${Date.now()}`,
      type, label: type.replace(/_/g, ' '),
      visible: true, data: defaultData,
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
  async function handleSave() {
    if (isDemo) { alert('Modo demo — conecta Supabase para guardar.'); return }
    setSaving(true)
    const supabase = createClient()
    await supabase.from('pages').update({
      title: landingConfig.title,
      settings: {
        // Preserve any old settings keys, then embed the full config
        ...(initial?.page?.settings ?? {}),
        _landingConfig: landingConfig,
      },
    }).eq('id', pageId)
    setSaving(false)
    setSaved(true)
    showToast('Cambios guardados')
    setTimeout(() => setSaved(false), 2500)
  }

  async function handlePublish() {
    if (isDemo) { alert('Modo demo — conecta Supabase para publicar.'); return }
    const res = await fetch('/api/publish-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId }),
    })
    if (res.ok) {
      setLandingConfig(prev => ({ ...prev, status: 'published' }))
      showToast('Página publicada ✓')
    } else {
      const d = await res.json()
      alert(d.error ?? 'Error al publicar')
    }
  }

  function handleCopy() {
    const url = `https://tokproof.app/@${landingConfig.slug}`
    navigator.clipboard?.writeText?.(url)
    showToast('Enlace copiado')
  }

  const publicUrl = `tokproof.app/@${landingConfig.slug || 'tuusuario'}`
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
        {!focus && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 290, height: '100vh', background: T.card, borderRight: `1px solid ${T.border2}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Panel header */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: T.pink }}>
                  {activeTool === 'secciones' ? 'Bloques' : activeTool === 'estilos' ? 'Tema' : 'Ajustes'}
                </span>
                {isDemo && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: 'rgba(245,158,11,.12)', borderRadius: 999, color: '#b45309' }}>Demo</span>
                )}
              </div>

              {/* Page info card */}
              <div style={{ margin: '10px 12px 4px', padding: '10px 14px', background: T.softPurple, borderRadius: 12, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {landingConfig.title || 'Sin título'}
                  </span>
                  <Pencil size={12} color={T.ink3} style={{ flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: 11, color: T.ink3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  tokproof.app/@{landingConfig.slug || 'tuusuario'}
                </div>
              </div>

              {/* Panel body — switches by activeTool */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* ── SECCIONES: sortable block list ── */}
                {activeTool === 'secciones' && (
                  <SortableBlockList
                    blocks={landingConfig.blocks}
                    theme={landingConfig.theme}
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
                {activeTool === 'estilos' && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Colores</div>
                      <ColorRow label="Color primario" value={landingConfig.theme.primaryColor} onChange={v => updateTheme({ primaryColor: v })} />
                      <ColorRow label="Color secundario" value={landingConfig.theme.secondaryColor} onChange={v => updateTheme({ secondaryColor: v })} />
                      <ColorRow label="Fondo de landing" value={landingConfig.theme.backgroundColor} onChange={v => updateTheme({ backgroundColor: v })} />
                      <ColorRow label="Color de texto" value={landingConfig.theme.textColor} onChange={v => updateTheme({ textColor: v })} />
                      {/* Gradient preview */}
                      <div style={{ height: 32, borderRadius: 10, marginTop: 8, background: `linear-gradient(135deg, ${landingConfig.theme.primaryColor}, ${landingConfig.theme.secondaryColor})` }} />
                    </section>
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Tipografía</div>
                      <select
                        value={landingConfig.theme.fontFamily}
                        onChange={e => updateTheme({ fontFamily: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 9, border: `1px solid ${T.border2}`, background: T.card, fontSize: 12, color: T.ink, outline: 'none' }}
                      >
                        {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </section>
                    <section>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Bordes</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {([
                          { key: 'square', label: 'Cuadrado' },
                          { key: 'soft',   label: 'Suave'    },
                          { key: 'medium', label: 'Medio'    },
                          { key: 'round',  label: 'Redondo'  },
                        ] as const).map(r => (
                          <button
                            key={r.key}
                            onClick={() => updateTheme({ radius: r.key })}
                            style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1.5px solid ${landingConfig.theme.radius === r.key ? T.pink : T.border2}`, background: landingConfig.theme.radius === r.key ? T.softPink2 : T.card, color: landingConfig.theme.radius === r.key ? T.pink : T.ink2, fontSize: 11, fontWeight: 600, cursor: 'pointer', minWidth: 56 }}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* ── AJUSTES: page settings ── */}
                {activeTool === 'ajustes' && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Página</div>
                      <Fg label="Título de la página">
                        <Fi value={landingConfig.title} onChange={e => setLandingConfig(p => ({ ...p, title: e.target.value }))} />
                      </Fg>
                      <Fg label="Slug (URL)">
                        <div style={{ display: 'flex' }}>
                          <span style={{ padding: '7px 8px', background: T.softPurple, border: `1px solid ${T.border2}`, borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 11, color: T.ink3, whiteSpace: 'nowrap' }}>@</span>
                          <Fi value={landingConfig.slug} onChange={e => setLandingConfig(p => ({ ...p, slug: e.target.value }))} style={{ borderRadius: '0 8px 8px 0' }} />
                        </div>
                      </Fg>
                      <Fg label="URL de destino (Shopify)">
                        <Fi type="url" value={landingConfig.destinationUrl} placeholder="https://tu-tienda.myshopify.com/..." onChange={e => setLandingConfig(p => ({ ...p, destinationUrl: e.target.value }))} />
                      </Fg>
                    </section>
                    <section style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>SEO</div>
                      <Fg label="Título SEO">
                        <Fi value={landingConfig.settings.seoTitle} onChange={e => updateSettings({ seoTitle: e.target.value })} />
                      </Fg>
                      <Fg label="Meta descripción">
                        <textarea value={landingConfig.settings.seoDescription} onChange={e => updateSettings({ seoDescription: e.target.value })} rows={3}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 9, border: `1px solid ${T.border2}`, background: T.card, fontSize: 12, color: T.ink, outline: 'none', resize: 'vertical' }} />
                      </Fg>
                    </section>
                    <section>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Opciones</div>
                      <Sw label="Mostrar badge Tokproof" checked={landingConfig.settings.showTokproofBranding} onChange={v => updateSettings({ showTokproofBranding: v })} />
                      <Sw label="Activar TikTok Rescue" checked={landingConfig.settings.enableTikTokRescue} onChange={v => updateSettings({ enableTikTokRescue: v })} />
                      {landingConfig.settings.enableTikTokRescue && (
                        <Fg label="URL de rescate">
                          <Fi type="url" value={landingConfig.settings.directExitUrl} placeholder="https://tu-tienda.com/producto" onChange={e => updateSettings({ directExitUrl: e.target.value })} />
                        </Fg>
                      )}
                    </section>
                  </div>
                )}

              </div>
            </div>

            {/* ── MINI-RAIL ── */}
            <div style={{ position: 'absolute', top: 96, right: -74, background: T.card, borderRadius: 18, padding: '8px 6px', boxShadow: T.shadowPop, display: 'flex', flexDirection: 'column', gap: 2, width: 64, zIndex: 10 }}>
              {([
                { id: 'secciones', icon: LayoutGrid, label: 'Secciones' },
                { id: 'estilos',   icon: Palette,    label: 'Estilos'   },
                { id: 'ajustes',   icon: Settings,   label: 'Ajustes'   },
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
            </div>
          </div>
        )}

        {/* ═══ MAIN ══════════════════════════════════════════════════════════ */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
          <header style={{ height: 56, flexShrink: 0, background: T.card, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, boxShadow: T.shadowCard }}>

            <Link href="/dashboard" style={{ width: 38, height: 38, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, color: T.ink2, textDecoration: 'none' }}>
              <ArrowLeft size={16} />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 1 auto', minWidth: 0 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {landingConfig.title || 'Sin título'}
              </span>
              <button style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, padding: 2, display: 'flex' }}>
                <Pencil size={13} />
              </button>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: isPublished ? T.greenBg : T.softPurple, fontSize: 12, fontWeight: 600, color: isPublished ? T.green : T.purple }}>
              {isPublished ? 'Publicado' : 'Borrador'}
              <ChevronDown size={11} />
            </div>

            {/* Spacer — title shrinks, buttons stay */}
            <div style={{ flex: '1 1 12px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Focus toggle */}
              <button onClick={handleFocusToggle} title={focus ? 'Salir del Focus mode' : 'Focus mode'} style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, border: focus ? 'none' : `1px solid ${T.border2}`, background: focus ? T.grad : T.card, cursor: 'pointer', color: focus ? 'white' : T.ink2, boxShadow: focus ? T.shadowBtn : 'none' }}>
                {focus ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                )}
              </button>

              <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: `1px solid ${T.border2}`, background: T.card, color: T.pink, fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                <Link2 size={13} />Copiar link
              </button>

              {!isDemo && (
                <a href={`/u/${landingConfig.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: `1px solid ${T.border2}`, background: T.card, color: T.ink2, fontSize: 13, fontWeight: 500, textDecoration: 'none', flexShrink: 0 }}>
                  <Eye size={13} />Vista previa
                </a>
              )}

              <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: `1px solid ${T.border2}`, background: T.card, color: saved ? T.green : T.ink2, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: saving ? .6 : 1, flexShrink: 0 }}>
                {saving ? '...' : saved ? '✓ Guardado' : 'Guardar'}
              </button>

              <button onClick={handlePublish} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: 999, border: 'none', background: T.grad, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: T.shadowBtn, flexShrink: 0 }}>
                <UploadCloud size={13} />Publicar
              </button>
            </div>
          </header>

          {/* ── WORK AREA ──────────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}>

            {/* Canvas */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>

                {/* Device toggle */}
                <div style={{ display: 'flex', background: T.softPurple, borderRadius: 999, padding: 3, gap: 2 }}>
                  {([{ key: 'mobile', label: 'Móvil' }, { key: 'desktop', label: 'Escritorio' }] as const).map(d => {
                    const active = preview === d.key
                    return (
                      <button key={d.key} onClick={() => setPreview(d.key)} style={{ padding: '5px 18px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: active ? 'white' : 'transparent', color: active ? T.ink : T.ink2, boxShadow: active ? '0 2px 8px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
                        {d.label}
                      </button>
                    )
                  })}
                </div>

                {/* Preview frame with zoom */}
                <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform .2s' }}>
                  {preview === 'mobile' ? (
                    // iPhone mockup
                    <div style={{ width: 390, height: 720, borderRadius: 50, background: 'linear-gradient(160deg,#23202b,#0c0b12)', padding: '16px 10px 10px', boxShadow: '0 40px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.06)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 90, height: 24, background: '#12101a', borderRadius: 999, zIndex: 2 }} />
                      <div style={{ borderRadius: 40, overflow: 'hidden', height: '100%', background: landingConfig.theme.backgroundColor }}>
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
                              Añade bloques en el panel izquierdo
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Desktop frame
                    <div style={{ width: 900, borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: T.shadowCard, background: landingConfig.theme.backgroundColor, maxHeight: 680 }}>
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
              <ToolBtn icon={Undo2} onClick={() => {}} title="Deshacer" />
              <ToolBtn icon={Redo2} onClick={() => {}} title="Rehacer" />
              <div style={{ width: 1, height: 16, background: T.border, margin: '0 6px' }} />
              <ToolBtn icon={Eye} onClick={() => !isDemo && window.open(`/u/${landingConfig.slug}`, '_blank')} title="Vista previa" />
              <ToolBtn icon={Monitor} onClick={() => setPreview(p => p === 'mobile' ? 'desktop' : 'mobile')} title="Cambiar dispositivo" />
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
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{focus ? 'Focus mode' : 'Modo normal'}</div>
          <div style={{ fontSize: 12, opacity: .65 }}>{focus ? 'Oculta el panel para concentrarte en el editor' : 'Panel restaurado'}</div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: T.ink, color: 'white', borderRadius: 999, padding: '9px 22px', boxShadow: T.shadowPop, zIndex: 9999, fontSize: 13, fontWeight: 500, animation: 'edFadeIn .2s ease both', whiteSpace: 'nowrap' }}>
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
