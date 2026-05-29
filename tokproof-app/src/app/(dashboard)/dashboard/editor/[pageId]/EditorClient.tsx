'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { FullPage, PageSettings } from '@/types'
import TrustPageRenderer from '@/components/public/TrustPageRenderer'
import SimplePageRenderer from '@/components/public/SimplePageRenderer'
import {
  Home, BarChart3, ShieldCheck, LayoutGrid, CreditCard, Settings,
  Link2, HelpCircle, LogOut, ArrowLeft, Pencil, ChevronDown,
  Eye, UploadCloud, Plus, Undo2, Redo2, Monitor, Minus, Palette,
  User, Box, DollarSign, MessageSquare, Star, MousePointerClick, Search,
  Image as ImageIcon, type LucideIcon,
} from 'lucide-react'

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg: '#FBF9FC',
  card: '#FFFFFF',
  ink: '#171717',
  ink2: '#6B7280',
  ink3: '#9CA3AF',
  pink: '#F647A9',
  purple: '#7B61FF',
  green: '#1AA960',
  greenBg: '#E6F9EE',
  border: 'rgba(123,97,255,0.10)',
  border2: 'rgba(123,97,255,0.16)',
  softPink: '#FFF1FA',
  softPink2: '#FFE3F1',
  softPurple: '#F4F0FF',
  grad: 'linear-gradient(135deg,#FF4FD8 0%,#7B61FF 100%)',
  gradSide: 'linear-gradient(180deg,#FEF5FA 0%,#F4EDFE 100%)',
  shadowCard: '0 8px 30px rgba(123,97,255,0.06)',
  shadowPop: '0 18px 50px -12px rgba(40,20,80,.18)',
  shadowBtn: '0 10px 25px rgba(255,79,216,0.22)',
} as const

// ─── SecRow accordion ────────────────────────────────────────────────────────
interface SecRowProps {
  open: boolean
  onToggle: () => void
  icon: LucideIcon
  label: string
  badge?: React.ReactNode
  children: React.ReactNode
}
function SecRow({ open, onToggle, icon: Icon, label, badge, children }: SecRowProps) {
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', border: 'none', background: 'transparent',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: open ? T.softPink2 : '#F5F2FB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}>
          <Icon size={16} color={open ? T.pink : T.purple} />
        </div>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: T.ink, textAlign: 'left' }}>
          {label}
        </span>
        {badge}
        <ChevronDown
          size={14}
          color={T.ink3}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s', flexShrink: 0 }}
        />
      </button>
      {open && (
        <div style={{ padding: '4px 14px 16px', background: '#FEFBFF' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── ToolBtn ─────────────────────────────────────────────────────────────────
function ToolBtn({ icon: Icon, onClick, title }: {
  icon: LucideIcon
  onClick: () => void
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32, borderRadius: 8, border: 'none',
        background: 'transparent', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.ink2,
      }}
    >
      <Icon size={14} />
    </button>
  )
}

// ─── Demo data ───────────────────────────────────────────────────────────────
const DEMO: FullPage = {
  page: {
    id: 'demo', user_id: 'demo', username: 'auraglow',
    type: 'trust', status: 'draft',
    title: 'AuraGlow Vitamin C Serum',
    brand_name: 'AuraGlow',
    product_name: 'Vitamin C Face Serum',
    shopify_url: 'https://auraglow.myshopify.com/products/vitamin-c-serum',
    slug: 'auraglow',
    settings: {
      brand_color: '#FF2D75', accent_color: '#7C3AED',
      media_type: 'image', media_url: '',
      headline: 'The serum everyone on TikTok is talking about',
      subheadline: 'Vitamin C + Hyaluronic Acid formula loved by 10,000+ buyers.',
      description: 'Fast results, gentle formula.',
      price: '$34.99', original_price: '$49.99',
      cta_text: '🛒 Ver producto oficial',
      cta_subtext: '🔒 Te llevaremos a la página oficial del producto.',
      cta_sticky: true,
      show_comments: true, show_reviews: true, show_logos: true,
      show_faq: true, show_guarantees: true, show_social: true,
      contact_email: 'hola@auraglow.com',
    },
    safe_score: 92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: null,
  },
  buttons: [
    { id: 'b1', page_id: 'demo', label: '🎵 Ver vídeo en TikTok', url: 'https://tiktok.com', type: 'tiktok', icon: null, sort_order: 1, is_visible: true, created_at: '' },
    { id: 'b2', page_id: 'demo', label: '💬 WhatsApp soporte', url: 'https://wa.me', type: 'whatsapp', icon: null, sort_order: 2, is_visible: true, created_at: '' },
  ],
  comments: [
    { id: 'c1', page_id: 'demo', name: 'Sofia R.', username: '@skincarebysofia', avatar: null, text: 'Literally just got mine and my skin is GLOWING after 3 days 🤩', likes: 2300, image_url: null, brand_reply: 'Thank you Sofia! So happy! 💚', is_visible: true, sort_order: 1, created_at: '' },
    { id: 'c2', page_id: 'demo', name: 'Kayla M.', username: '@kayla.wellness', avatar: null, text: 'Does it work on dark spots? Asking for a friend 👀', likes: 891, image_url: null, brand_reply: 'Yes! Results in 2–4 weeks 🙌', is_visible: true, sort_order: 2, created_at: '' },
    { id: 'c3', page_id: 'demo', name: 'Mira L.', username: '@makeupmira_', avatar: null, text: 'No cap this is the best $35 I\'ve spent this year 😭', likes: 1100, image_url: null, brand_reply: null, is_visible: true, sort_order: 3, created_at: '' },
  ],
  reviews: [
    { id: 'r1', page_id: 'demo', name: 'Jessica R.', rating: 5, text: '"I was skeptical but this faded my dark spots in 2 weeks. My dermatologist couldn\'t believe it!"', date: '2 weeks ago', verified: true, image_url: null, is_visible: true, sort_order: 1, created_at: '' },
    { id: 'r2', page_id: 'demo', name: 'Amara L.', rating: 5, text: '"Sensitive skin queen here — zero reaction, just results. 10/10 💖"', date: '5 days ago', verified: true, image_url: null, is_visible: true, sort_order: 2, created_at: '' },
  ],
  faqs: [
    { id: 'f1', page_id: 'demo', question: 'Does it work on dark spots?', answer: 'Yes — Vitamin C is clinically proven to reduce hyperpigmentation in 2–4 weeks of daily use.', is_visible: true, sort_order: 1, created_at: '' },
    { id: 'f2', page_id: 'demo', question: 'How fast is shipping?', answer: '2–5 business days US. Free shipping on all orders. Tracking included.', is_visible: true, sort_order: 2, created_at: '' },
    { id: 'f3', page_id: 'demo', question: 'Is it safe for sensitive skin?', answer: 'Formulated without parabens, sulfates, or artificial fragrances. Dermatologist-tested.', is_visible: true, sort_order: 3, created_at: '' },
  ],
  logos: [
    { id: 'l1', page_id: 'demo', name: '🎵 TikTok', image_url: null, is_visible: true, sort_order: 1, created_at: '' },
    { id: 'l2', page_id: 'demo', name: '🛍 Shopify', image_url: null, is_visible: true, sort_order: 2, created_at: '' },
    { id: 'l3', page_id: 'demo', name: '⭐ Trustpilot', image_url: null, is_visible: true, sort_order: 3, created_at: '' },
    { id: 'l4', page_id: 'demo', name: '💄 Cosmopolitan', image_url: null, is_visible: true, sort_order: 4, created_at: '' },
  ],
  profile: {
    id: 'demo', user_id: 'demo', username: 'auraglow',
    display_name: 'AuraGlow', email: null, avatar_url: null,
    plan: 'free', onboarding_completed: true, created_at: '', updated_at: '',
  },
}

// ─── Color picker ────────────────────────────────────────────────────────────
function CpfPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="cpf">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 26, height: 26, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none', flexShrink: 0 }}
      />
      <span className="cpf-lbl">{label}</span>
      <span className="cpf-hex">{value.toUpperCase()}</span>
    </div>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface EditorClientProps {
  fullPage: FullPage | null
  demoMode?: boolean
}

type PreviewMode = 'mobile' | 'desktop'

// ─── Component ───────────────────────────────────────────────────────────────
export default function EditorClient({ fullPage: initial, demoMode = false }: EditorClientProps) {
  const data = initial ?? DEMO
  const isDemo = demoMode || initial === null

  // ── Existing state ──
  const [page, setPage] = useState(data.page)
  const [buttons, setButtons] = useState(data.buttons)
  const [comments, setComments] = useState(data.comments)
  const [reviews, setReviews] = useState(data.reviews)
  const [faqs, setFaqs] = useState(data.faqs)
  const [logos, setLogos] = useState(data.logos)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState<PreviewMode>('mobile')
  const [isActive, setIsActive] = useState(page.status === 'published')

  // ── Layout state ──
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [focus, setFocus] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [activeTool, setActiveTool] = useState<'secciones' | 'estilos' | 'ajustes'>('secciones')
  const [openSecs, setOpenSecs] = useState<Set<string>>(new Set(['general']))
  const [toast, setToast] = useState<string | null>(null)
  const [focusCard, setFocusCard] = useState(false)

  // ── Helpers ──
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  function toggleSec(id: string) {
    setOpenSecs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleFocusToggle() {
    setFocus(f => !f)
    setFocusCard(true)
    setTimeout(() => setFocusCard(false), 2200)
  }

  function handleCopy() {
    navigator.clipboard?.writeText?.(`https://${publicUrl}`)
    showToast('Enlace copiado')
  }

  // ── Existing handlers ──
  const updateSettings = useCallback((patch: Partial<PageSettings>) => {
    setPage(prev => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  async function handleSave() {
    if (isDemo) { alert('Modo demo — conecta Supabase para guardar cambios.'); return }
    setSaving(true)
    const supabase = createClient()
    await supabase.from('pages').update({
      title: page.title,
      brand_name: page.brand_name,
      product_name: page.product_name,
      shopify_url: page.shopify_url,
      settings: page.settings,
    }).eq('id', page.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handlePublish() {
    if (isDemo) { alert('Modo demo — conecta Supabase para publicar.'); return }
    const res = await fetch('/api/publish-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId: page.id }),
    })
    if (res.ok) {
      setPage(prev => ({ ...prev, status: 'published' }))
      setIsActive(true)
    } else {
      const d = await res.json()
      alert(d.error ?? 'Error al publicar')
    }
  }

  function validateDirectExitUrl(url: string): { ok: boolean; warning?: string } {
    if (!url) return { ok: false }
    if (!url.startsWith('https://')) return { ok: false, warning: 'La URL debe empezar por https://' }
    if (/javascript:|data:|about:/i.test(url)) return { ok: false, warning: 'URL no permitida.' }
    if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|buff\.ly/i.test(url)) return { ok: true, warning: 'Acortadores pueden reducir la confianza. Usa la URL directa si es posible.' }
    if (/\/cart|\/checkout/i.test(url)) return { ok: true, warning: 'Las URLs de carrito/checkout pueden tener restricciones en TikTok.' }
    if (/amzn\.|amazon\..*tag=/i.test(url)) return { ok: true, warning: 'Los enlaces de afiliado Amazon pueden ser filtrados por TikTok.' }
    return { ok: true }
  }

  const isTrust = page.type === 'trust'
  const previewData: FullPage = { page, buttons, comments, reviews, faqs, logos, profile: data.profile }
  const publicUrl = `tokproof.app/@${page.username ?? 'tuusuario'}`

  // ── NAV items ──
  const navItems: Array<{ icon: LucideIcon; label: string; href: string; active?: boolean }> = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard' },
    { icon: LayoutGrid, label: 'Páginas', href: '/dashboard', active: true },
    { icon: CreditCard, label: 'Billing', href: '/dashboard' },
    { icon: Settings, label: 'Ajustes', href: '/dashboard' },
  ]

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes edFadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes edFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        .ed-nav-item:hover { background: rgba(123,97,255,0.06) !important; }
        .ed-tool-btn:hover { background: rgba(123,97,255,0.06) !important; }
        .ed-sec-row-btn:hover { background: rgba(123,97,255,0.03) !important; }
      `}</style>

      <div style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        background: T.bg, fontFamily: 'Inter,system-ui,sans-serif',
      }}>

        {/* ═══ NAV ═══════════════════════════════════════════════════════════ */}
        {!focus && (
          <nav style={{
            width: navCollapsed ? 72 : 210,
            flexShrink: 0,
            background: T.gradSide,
            borderRight: `1px solid ${T.border}`,
            display: 'flex',
            flexDirection: 'column',
            transition: 'width .28s cubic-bezier(.5,.1,.2,1)',
            overflow: 'hidden',
          }}>
            {/* Logo */}
            <div style={{
              padding: navCollapsed ? '18px 0' : '18px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: T.grad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: navCollapsed ? 'auto' : 0,
                marginRight: navCollapsed ? 'auto' : 0,
              }}>
                <ShieldCheck size={17} color="white" />
              </div>
              {!navCollapsed && (
                <span style={{ fontSize: 14, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap' }}>
                  Tokproof
                </span>
              )}
            </div>

            {/* Nav items */}
            <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="ed-nav-item"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: navCollapsed ? '9px 0' : '9px 10px',
                    borderRadius: 13,
                    justifyContent: navCollapsed ? 'center' : 'flex-start',
                    background: item.active ? T.softPink : 'transparent',
                    color: item.active ? T.pink : T.ink2,
                    textDecoration: 'none',
                    fontSize: 13, fontWeight: item.active ? 600 : 500,
                    transition: 'background .15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <item.icon size={16} style={{ flexShrink: 0 }} />
                  {!navCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>

            {/* Bottom: help + logout */}
            <div style={{ padding: '8px 8px 16px', display: 'flex', flexDirection: 'column', gap: 2, borderTop: `1px solid ${T.border}` }}>
              <button
                className="ed-nav-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: navCollapsed ? '9px 0' : '9px 10px',
                  borderRadius: 13, border: 'none', background: 'transparent',
                  color: T.ink2, cursor: 'pointer', width: '100%',
                  justifyContent: navCollapsed ? 'center' : 'flex-start',
                  fontSize: 13, fontWeight: 500,
                }}
              >
                <HelpCircle size={16} style={{ flexShrink: 0 }} />
                {!navCollapsed && <span>Ayuda</span>}
              </button>
              <Link
                href="/logout"
                className="ed-nav-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: navCollapsed ? '9px 0' : '9px 10px',
                  borderRadius: 13, color: T.ink2, textDecoration: 'none',
                  fontSize: 13, fontWeight: 500,
                  justifyContent: navCollapsed ? 'center' : 'flex-start',
                }}
              >
                <LogOut size={16} style={{ flexShrink: 0 }} />
                {!navCollapsed && <span>Salir</span>}
              </Link>
            </div>
          </nav>
        )}

        {/* ═══ SECTIONS WRAP (position:relative — anchors mini-rail) ════════ */}
        {!focus && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 290,
              height: '100vh',
              background: T.card,
              borderRight: `1px solid ${T.border2}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>

              {/* Panel header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: T.pink }}>General</span>
                <button
                  onClick={() => setNavCollapsed(p => !p)}
                  title={navCollapsed ? 'Expandir nav' : 'Colapsar nav'}
                  style={{
                    width: 28, height: 28,
                    border: `1px solid ${T.border2}`, borderRadius: 8,
                    background: T.card, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.ink2,
                  }}
                >
                  <span style={{
                    fontSize: 14, fontWeight: 600, lineHeight: 1,
                    display: 'inline-block',
                    transform: navCollapsed ? 'rotate(180deg)' : 'none',
                    transition: 'transform .28s',
                  }}>‹</span>
                </button>
              </div>

              {/* Page info card */}
              <div style={{
                margin: '12px 12px 4px',
                padding: '12px 14px',
                background: T.softPurple,
                borderRadius: 14,
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    flex: 1, fontSize: 13, fontWeight: 600, color: T.ink,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {page.title || 'Sin título'}
                  </span>
                  <Pencil size={12} color={T.ink3} style={{ flexShrink: 0 }} />
                </div>
                <div style={{ fontSize: 11, color: T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  tokproof.app/@{page.username || 'tuusuario'}
                </div>
                {isDemo && (
                  <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700, padding: '2px 8px', background: 'rgba(245,158,11,.12)', borderRadius: 999, color: '#b45309' }}>
                    Demo
                  </span>
                )}
              </div>

              {/* Scrollable section list */}
              <div style={{ flex: 1, overflowY: 'auto' }}>

                {/* 1 · General */}
                <SecRow open={openSecs.has('general')} onToggle={() => toggleSec('general')} icon={Settings} label="General">
                  <div className="fg">
                    <label className="fl">Nombre de marca</label>
                    <input className="fi" type="text" value={page.brand_name ?? ''} placeholder="Ej: AuraGlow"
                      onChange={e => setPage(p => ({ ...p, brand_name: e.target.value }))} />
                  </div>
                  <div className="fg">
                    <label className="fl">Nombre del producto <span className="fi-label-opt">Opcional</span></label>
                    <input className="fi" type="text" value={page.product_name ?? ''}
                      onChange={e => setPage(p => ({ ...p, product_name: e.target.value }))} />
                  </div>
                  <div className="fg">
                    <label className="fl">URL del producto (Shopify) <span className="fi-label-rec">Importante</span></label>
                    <input className="fi" type="url" value={page.shopify_url ?? ''} placeholder="https://tu-tienda.myshopify.com/products/..."
                      onChange={e => setPage(p => ({ ...p, shopify_url: e.target.value }))} />
                    <div className="fi-tip"><span className="fi-tip-ico">💡</span>Destino del CTA principal. Usa la URL exacta del producto.</div>
                  </div>
                  <div className="fg">
                    <label className="fl">Tu URL pública en Tokproof</label>
                    <div style={{ display: 'flex' }}>
                      <span style={{ padding: '9px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: 'var(--r) 0 0 var(--r)', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        tokproof.app/@
                      </span>
                      <input className="fi" type="text" value={page.username ?? ''}
                        onChange={e => setPage(p => ({ ...p, username: e.target.value }))}
                        style={{ borderRadius: '0 var(--r) var(--r) 0' }} />
                    </div>
                  </div>
                  <div className="fg">
                    <label className="fl">Estado de la página</label>
                    <label className="tw">
                      <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                      <span className="tw-lbl">Activo (visible al público)</span>
                    </label>
                  </div>
                </SecRow>

                {/* 2 · Branding */}
                <SecRow open={openSecs.has('branding')} onToggle={() => toggleSec('branding')} icon={Palette} label="Branding / Colores">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>
                    Vista previa del degradado
                  </div>
                  <div className="grad-preview" style={{ background: `linear-gradient(135deg, ${page.settings.brand_color ?? '#FF2D75'}, ${page.settings.accent_color ?? '#7C3AED'})` }} />
                  <CpfPicker label="Color principal (pink)" value={page.settings.brand_color ?? '#FF2D75'} onChange={v => updateSettings({ brand_color: v })} />
                  <CpfPicker label="Color secundario (purple)" value={page.settings.accent_color ?? '#7C3AED'} onChange={v => updateSettings({ accent_color: v })} />
                  <CpfPicker label="Fondo de landing" value={page.settings.bg_color ?? '#0F0F10'} onChange={v => updateSettings({ bg_color: v })} />
                  <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                  <div className="fg" style={{ marginTop: 6 }}>
                    <label className="fl">Fuente</label>
                    <select className="fi" value={page.settings.font ?? 'Nunito Sans'} onChange={e => updateSettings({ font: e.target.value })}>
                      <option>Nunito Sans (recomendada)</option>
                      <option>Inter</option>
                      <option>Poppins</option>
                      <option>DM Sans</option>
                    </select>
                  </div>
                </SecRow>

                {/* 3 · Perfil */}
                <SecRow open={openSecs.has('perfil')} onToggle={() => toggleSec('perfil')} icon={User} label="Perfil público">
                  <div className="fg">
                    <label className="fl">Nombre para mostrar</label>
                    <input className="fi" type="text" value={page.brand_name ?? ''} placeholder="Tu nombre o nombre de marca"
                      onChange={e => setPage(p => ({ ...p, brand_name: e.target.value }))} />
                  </div>
                  <div className="fg">
                    <label className="fl">Bio / Descripción corta <span className="fi-label-opt">Opcional</span></label>
                    <textarea className="fi" style={{ minHeight: 52 }} value={page.settings.bio ?? ''}
                      onChange={e => updateSettings({ bio: e.target.value })}
                      placeholder="Ej: Skincare para piel radiante 🌟 Envío gratis en todos los pedidos" />
                    <span className="fh">Máximo 120 caracteres.</span>
                  </div>
                  <div className="fg">
                    <label className="fl">URL del avatar / logo <span className="fi-label-opt">Opcional</span></label>
                    <input className="fi" type="url" value={page.settings.avatar_url ?? ''}
                      onChange={e => updateSettings({ avatar_url: e.target.value })}
                      placeholder="https://cdn.tumarca.com/logo.jpg" />
                  </div>
                </SecRow>

                {/* 4 · Producto */}
                <SecRow open={openSecs.has('producto')} onToggle={() => toggleSec('producto')} icon={Box} label="Producto">
                  <div className="fg">
                    <label className="fl">Headline principal</label>
                    <input className="fi" type="text" value={page.settings.headline ?? ''}
                      onChange={e => updateSettings({ headline: e.target.value })} />
                  </div>
                  <div className="fg">
                    <label className="fl">Subheadline</label>
                    <textarea className="fi" value={page.settings.subheadline ?? ''}
                      onChange={e => updateSettings({ subheadline: e.target.value })} />
                  </div>
                  <div className="fg">
                    <label className="fl">Descripción corta <span className="fi-label-opt">Opcional</span></label>
                    <textarea className="fi" style={{ minHeight: 52 }} value={page.settings.description ?? ''}
                      onChange={e => updateSettings({ description: e.target.value })} />
                  </div>
                </SecRow>

                {/* 5 · Media */}
                <SecRow open={openSecs.has('media')} onToggle={() => toggleSec('media')} icon={ImageIcon} label="Media">
                  <div className="fg">
                    <label className="fl">Tipo de media</label>
                    <div className="media-tabs">
                      <div className={`media-tab${(page.settings.media_type ?? 'image') === 'image' ? ' active' : ''}`}
                        onClick={() => updateSettings({ media_type: 'image' })}>🖼 Imagen</div>
                      <div className={`media-tab${page.settings.media_type === 'video' ? ' active' : ''}`}
                        onClick={() => updateSettings({ media_type: 'video' })}>🎬 Vídeo</div>
                    </div>
                  </div>
                  <div className="fg">
                    <label className="fl">URL de imagen / vídeo</label>
                    <input className="fi" type="url" value={page.settings.media_url ?? ''}
                      onChange={e => updateSettings({ media_url: e.target.value })}
                      placeholder="https://cdn.tumarca.com/producto.mp4" />
                    <span className="fh">MP4, WebM o imagen JPG/PNG. Ratio 9:16 recomendado.</span>
                  </div>
                  <div className="fg">
                    <label className="fl">Iconos laterales estilo TikTok</label>
                    <label className="tw">
                      <input type="checkbox" checked={page.settings.show_social !== false}
                        onChange={e => updateSettings({ show_social: e.target.checked })} />
                      <span className="tw-lbl">Mostrar likes / comentar / compartir</span>
                    </label>
                  </div>
                </SecRow>

                {/* 6 · Precio */}
                <SecRow open={openSecs.has('precio')} onToggle={() => toggleSec('precio')} icon={DollarSign} label="Precio">
                  <div className="fg">
                    <label className="fl">Mostrar precio</label>
                    <label className="tw">
                      <input type="checkbox" checked={!!page.settings.price}
                        onChange={e => { if (!e.target.checked) updateSettings({ price: '' }) }} />
                      <span className="tw-lbl">Visible en la landing</span>
                    </label>
                    <div className="fi-tip" style={{ marginTop: 8 }}><span className="fi-tip-ico">💡</span>Ocultarlo hace que la página se sienta más social.</div>
                  </div>
                  <div className="fi-row">
                    <div className="fg">
                      <label className="fl">Precio actual</label>
                      <input className="fi" type="text" value={page.settings.price ?? ''}
                        onChange={e => updateSettings({ price: e.target.value })} placeholder="$34.99" />
                    </div>
                    <div className="fg">
                      <label className="fl">Precio original</label>
                      <input className="fi" type="text" value={page.settings.original_price ?? ''}
                        onChange={e => updateSettings({ original_price: e.target.value })} placeholder="$49.99" />
                    </div>
                  </div>
                </SecRow>

                {/* 7 · Botones */}
                <SecRow open={openSecs.has('botones')} onToggle={() => toggleSec('botones')} icon={MousePointerClick} label="Botones">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
                    Botón principal (degradado)
                  </div>
                  <div className="fg">
                    <label className="fl">Texto CTA</label>
                    <input className="fi" type="text" value={page.settings.cta_text ?? ''}
                      onChange={e => updateSettings({ cta_text: e.target.value })} />
                  </div>
                  <div className="fg">
                    <label className="fl">Microcopy bajo el botón</label>
                    <input className="fi" type="text" value={page.settings.cta_subtext ?? ''}
                      onChange={e => updateSettings({ cta_subtext: e.target.value })} />
                  </div>
                  <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
                    Botones secundarios
                  </div>
                  {buttons.map((btn, i) => (
                    <div key={btn.id} style={{ padding: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 8 }}>
                      <div className="fg">
                        <label className="fl">Botón {i + 1} — Texto</label>
                        <input className="fi" type="text" value={btn.label}
                          onChange={e => setButtons(bs => bs.map((b, j) => j === i ? { ...b, label: e.target.value } : b))} />
                      </div>
                      <div className="fg" style={{ marginBottom: 6 }}>
                        <label className="fl">URL</label>
                        <input className="fi" type="url" value={btn.url ?? ''}
                          onChange={e => setButtons(bs => bs.map((b, j) => j === i ? { ...b, url: e.target.value } : b))} />
                      </div>
                      <label className="tw">
                        <input type="checkbox" checked={btn.is_visible}
                          onChange={e => setButtons(bs => bs.map((b, j) => j === i ? { ...b, is_visible: e.target.checked } : b))} />
                        <span className="tw-lbl">Visible</span>
                      </label>
                    </div>
                  ))}
                  <div className="fg">
                    <label className="fl">CTA sticky inferior</label>
                    <label className="tw">
                      <input type="checkbox" checked={!!page.settings.cta_sticky}
                        onChange={e => updateSettings({ cta_sticky: e.target.checked })} />
                      <span className="tw-lbl">Mostrar CTA fijo en la base</span>
                    </label>
                  </div>
                </SecRow>

                {/* 8 · Comentarios */}
                <SecRow open={openSecs.has('comentarios')} onToggle={() => toggleSec('comentarios')} icon={MessageSquare} label="Comentarios TikTok">
                  {comments.map((c, i) => (
                    <div key={c.id} style={{ padding: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 10 }}>
                      <div className="fi-row">
                        <div className="fg">
                          <label className="fl">Usuario</label>
                          <input className="fi" type="text" value={c.username ?? ''}
                            onChange={e => setComments(cs => cs.map((cc, j) => j === i ? { ...cc, username: e.target.value } : cc))} />
                        </div>
                        <div className="fg">
                          <label className="fl">Nombre</label>
                          <input className="fi" type="text" value={c.name ?? ''}
                            onChange={e => setComments(cs => cs.map((cc, j) => j === i ? { ...cc, name: e.target.value } : cc))} />
                        </div>
                      </div>
                      <div className="fg">
                        <label className="fl">Comentario</label>
                        <textarea className="fi" style={{ minHeight: 52 }} value={c.text ?? ''}
                          onChange={e => setComments(cs => cs.map((cc, j) => j === i ? { ...cc, text: e.target.value } : cc))} />
                      </div>
                      <div className="fi-row">
                        <div className="fg">
                          <label className="fl">Likes</label>
                          <input className="fi" type="text" value={c.likes}
                            onChange={e => setComments(cs => cs.map((cc, j) => j === i ? { ...cc, likes: Number(e.target.value) || 0 } : cc))} />
                        </div>
                      </div>
                      <div className="fg">
                        <label className="fl">Respuesta de la marca</label>
                        <textarea className="fi" style={{ minHeight: 40 }} value={c.brand_reply ?? ''}
                          onChange={e => setComments(cs => cs.map((cc, j) => j === i ? { ...cc, brand_reply: e.target.value } : cc))} />
                      </div>
                      <label className="tw">
                        <input type="checkbox" checked={c.is_visible}
                          onChange={e => setComments(cs => cs.map((cc, j) => j === i ? { ...cc, is_visible: e.target.checked } : cc))} />
                        <span className="tw-lbl">Visible</span>
                      </label>
                    </div>
                  ))}
                </SecRow>

                {/* 9 · Reviews */}
                <SecRow open={openSecs.has('reviews')} onToggle={() => toggleSec('reviews')} icon={Star} label="Reviews">
                  {reviews.map((r, i) => (
                    <div key={r.id} style={{ padding: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 10 }}>
                      <div className="fi-row">
                        <div className="fg">
                          <label className="fl">Nombre</label>
                          <input className="fi" type="text" value={r.name ?? ''}
                            onChange={e => setReviews(rs => rs.map((rr, j) => j === i ? { ...rr, name: e.target.value } : rr))} />
                        </div>
                        <div className="fg">
                          <label className="fl">Estrellas</label>
                          <select className="fi" value={r.rating}
                            onChange={e => setReviews(rs => rs.map((rr, j) => j === i ? { ...rr, rating: Number(e.target.value) } : rr))}>
                            <option value={5}>5 ★★★★★</option>
                            <option value={4}>4 ★★★★</option>
                            <option value={3}>3 ★★★</option>
                          </select>
                        </div>
                      </div>
                      <div className="fg">
                        <label className="fl">Texto de la review</label>
                        <textarea className="fi" value={r.text ?? ''}
                          onChange={e => setReviews(rs => rs.map((rr, j) => j === i ? { ...rr, text: e.target.value } : rr))} />
                      </div>
                      <div className="fi-row">
                        <div className="fg">
                          <label className="fl">Fecha</label>
                          <input className="fi" type="text" value={r.date ?? ''}
                            onChange={e => setReviews(rs => rs.map((rr, j) => j === i ? { ...rr, date: e.target.value } : rr))} />
                        </div>
                        <div className="fg">
                          <label className="fl">Verificado</label>
                          <label className="tw" style={{ marginTop: 6 }}>
                            <input type="checkbox" checked={r.verified}
                              onChange={e => setReviews(rs => rs.map((rr, j) => j === i ? { ...rr, verified: e.target.checked } : rr))} />
                            <span className="tw-lbl">Sí</span>
                          </label>
                        </div>
                      </div>
                      <label className="tw">
                        <input type="checkbox" checked={r.is_visible}
                          onChange={e => setReviews(rs => rs.map((rr, j) => j === i ? { ...rr, is_visible: e.target.checked } : rr))} />
                        <span className="tw-lbl">Visible</span>
                      </label>
                    </div>
                  ))}
                </SecRow>

                {/* 10 · Logos */}
                <SecRow open={openSecs.has('logos')} onToggle={() => toggleSec('logos')} icon={BarChart3} label="Logos / Visto en">
                  <div className="fg">
                    <label className="fl">Mostrar sección &ldquo;Visto en&rdquo;</label>
                    <label className="tw">
                      <input type="checkbox" checked={page.settings.show_logos !== false}
                        onChange={e => updateSettings({ show_logos: e.target.checked })} />
                      <span className="tw-lbl">Visible</span>
                    </label>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {logos.map((l, i) => (
                      <div key={l.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input className="fi" type="text" value={l.name ?? ''}
                          onChange={e => setLogos(ls => ls.map((ll, j) => j === i ? { ...ll, name: e.target.value } : ll))}
                          style={{ flex: 1 }} />
                        <label className="tw">
                          <input type="checkbox" checked={l.is_visible}
                            onChange={e => setLogos(ls => ls.map((ll, j) => j === i ? { ...ll, is_visible: e.target.checked } : ll))} />
                        </label>
                      </div>
                    ))}
                  </div>
                </SecRow>

                {/* 11 · FAQ */}
                <SecRow open={openSecs.has('faq')} onToggle={() => toggleSec('faq')} icon={HelpCircle} label="FAQ">
                  {faqs.map((f, i) => (
                    <div key={f.id} style={{ padding: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 8 }}>
                      <div className="fg">
                        <label className="fl">Pregunta {i + 1}</label>
                        <input className="fi" type="text" value={f.question ?? ''}
                          onChange={e => setFaqs(fs => fs.map((ff, j) => j === i ? { ...ff, question: e.target.value } : ff))} />
                      </div>
                      <div className="fg" style={{ marginBottom: 0 }}>
                        <label className="fl">Respuesta</label>
                        <textarea className="fi" style={{ minHeight: 52 }} value={f.answer ?? ''}
                          onChange={e => setFaqs(fs => fs.map((ff, j) => j === i ? { ...ff, answer: e.target.value } : ff))} />
                      </div>
                    </div>
                  ))}
                </SecRow>

                {/* 12 · Garantías */}
                <SecRow open={openSecs.has('garantias')} onToggle={() => toggleSec('garantias')} icon={ShieldCheck} label="Garantías">
                  {[
                    { emoji: '📦', title: 'Free Shipping', sub: 'On all orders, always' },
                    { emoji: '↩️', title: '30-Day Returns', sub: 'No questions asked' },
                    { emoji: '🔒', title: 'SSL Secure', sub: '256-bit encryption' },
                  ].map((g, i) => (
                    <div key={i} style={{ padding: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 8 }}>
                      <div className="fi-row">
                        <div className="fg"><label className="fl">Emoji</label><input className="fi" type="text" defaultValue={g.emoji} /></div>
                        <div className="fg"><label className="fl">Título</label><input className="fi" type="text" defaultValue={g.title} /></div>
                      </div>
                      <div className="fg" style={{ marginBottom: 0 }}><label className="fl">Subtexto</label><input className="fi" type="text" defaultValue={g.sub} /></div>
                    </div>
                  ))}
                </SecRow>

                {/* 13 · Orden de bloques */}
                <SecRow open={openSecs.has('orden')} onToggle={() => toggleSec('orden')} icon={LayoutGrid} label="Orden de bloques">
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>
                    Arrastra para reordenar los bloques. <span style={{ color: 'var(--spurple)' }}>Drag & drop</span> próximamente.
                  </p>
                  <div className="block-list">
                    {[
                      ['🎥', 'Hero / Media'], ['🏷️', 'Producto'], ['💰', 'Precio'], ['🛒', 'Botones CTA'],
                      ['💬', 'Comentarios TikTok'], ['⭐', 'Reviews'], ['🏆', 'Logos'], ['🛡', 'Garantías'],
                      ['❓', 'FAQ'], ['📄', 'Footer'],
                    ].map(([ico, name]) => (
                      <div key={name} className="boi">
                        <span className="boi-drag">⠿</span>
                        <span className="boi-ico">{ico}</span>
                        <span className="boi-name">{name}</span>
                        <div className="boi-actions">
                          <label className="tw"><input type="checkbox" defaultChecked /></label>
                        </div>
                      </div>
                    ))}
                  </div>
                </SecRow>

                {/* 14 · Analytics */}
                <SecRow open={openSecs.has('analytics')} onToggle={() => toggleSec('analytics')} icon={BarChart3} label="Analytics">
                  <div className="an-stat-grid">
                    <div className="an-stat-card"><div className="an-lbl">Vistas</div><div className="an-val">{isDemo ? '—' : '0'}</div></div>
                    <div className="an-stat-card"><div className="an-lbl">Clicks CTA</div><div className="an-val" style={{ color: 'var(--pink)' }}>{isDemo ? '—' : '0'}</div></div>
                    <div className="an-stat-card"><div className="an-lbl">CTR</div><div className="an-val" style={{ color: 'var(--pink)' }}>{isDemo ? '—' : '0%'}</div></div>
                    <div className="an-stat-card"><div className="an-lbl">Shopify</div><div className="an-val" style={{ color: 'var(--spurple)' }}>{isDemo ? '—' : '0'}</div></div>
                  </div>
                  <div className="an-chart-placeholder">
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
                      Vistas · últimos 7 días
                    </div>
                    <div className="an-chart-bars">
                      {[35, 55, 42, 70, 58, 90, 65].map((h, i) => (
                        <div key={i} className="an-bar" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: 'var(--muted2)' }}>
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
                    </div>
                  </div>
                </SecRow>

                {/* 15 · Safe Link / SEO */}
                <SecRow open={openSecs.has('seo')} onToggle={() => toggleSec('seo')} icon={Search} label="Safe Link / SEO">
                  <div className="sl-score-row">
                    <div>
                      <div className="sl-score-val">{page.safe_score}<span style={{ fontSize: 14, fontWeight: 700, opacity: .6 }}>/100</span></div>
                      <div style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>Safe Score</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ height: '100%', width: `${page.safe_score}%`, background: 'var(--grad)', borderRadius: 99 }} />
                      </div>
                      <ul className="sl-checklist">
                        <li className="sl-check-item"><span className="sl-check-ico sl-check-ok">✓</span>Sin redirecciones automáticas</li>
                        <li className="sl-check-item"><span className="sl-check-ico sl-check-ok">✓</span>URL destino clara y visible</li>
                        <li className="sl-check-item"><span className="sl-check-ico sl-check-ok">✓</span>Footer legal presente</li>
                        <li className="sl-check-item"><span className="sl-check-ico sl-check-ok">✓</span>HTTPS activo</li>
                        <li className="sl-check-item"><span className="sl-check-ico sl-check-warn">!</span>Meta descripción vacía</li>
                      </ul>
                    </div>
                  </div>
                  <div className="fg">
                    <label className="fl">Título SEO</label>
                    <input className="fi" type="text" value={page.title ?? ''}
                      onChange={e => setPage(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="fg">
                    <label className="fl">Email de contacto</label>
                    <input className="fi" type="email" value={page.settings.contact_email ?? ''}
                      onChange={e => updateSettings({ contact_email: e.target.value })} placeholder="hola@tumarca.com" />
                  </div>
                  <div className="fg">
                    <label className="fl">Texto legal (footer)</label>
                    <textarea className="fi" rows={2} value={page.settings.legal_text ?? ''}
                      onChange={e => updateSettings({ legal_text: e.target.value })}
                      placeholder="Resultados no garantizados. Ver términos." style={{ resize: 'vertical' }} />
                  </div>
                  <div className="fg">
                    <label className="fl">Badge &ldquo;Powered by Tokproof&rdquo;</label>
                    <label className="tw"><input type="checkbox" defaultChecked /><span className="tw-lbl">Mostrar en footer</span></label>
                  </div>
                </SecRow>

                {/* 16 · TikTok Rescue */}
                <SecRow
                  open={openSecs.has('rescue')}
                  onToggle={() => toggleSec('rescue')}
                  icon={ShieldCheck}
                  label="TikTok Rescue"
                  badge={
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', background: 'rgba(123,97,255,.1)', border: '1px solid rgba(123,97,255,.2)', borderRadius: 99, color: T.purple, marginRight: 4, flexShrink: 0 }}>
                      PRO
                    </span>
                  }
                >
                  <div className="ed-sec-desc" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
                    Muestra una guía para abrir el navegador externo dentro del WebView de TikTok. Fuera de TikTok, redirige directamente al producto.
                  </div>
                  <div className="fg">
                    <label className="tw">
                      <input type="checkbox" checked={!!page.settings.direct_exit_enabled}
                        onChange={e => updateSettings({ direct_exit_enabled: e.target.checked })} />
                      <span className="tw-lbl">Activar Direct Exit</span>
                    </label>
                  </div>
                  {page.settings.direct_exit_enabled && (
                    <>
                      <div className="fg">
                        <label className="fl">URL Destino del Producto</label>
                        <input className="fi" type="url"
                          placeholder="https://tutienda.myshopify.com/products/producto"
                          value={page.settings.direct_exit_url ?? ''}
                          onChange={e => updateSettings({ direct_exit_url: e.target.value })} />
                        {(() => {
                          const v = validateDirectExitUrl(page.settings.direct_exit_url ?? '')
                          if (!page.settings.direct_exit_url) return (
                            <div className="fi-tip" style={{ background: 'rgba(245,158,11,.07)', borderColor: 'rgba(245,158,11,.2)' }}>
                              <span>⚠️</span><span className="fi-tip-txt" style={{ color: 'var(--warn)' }}>Necesitas añadir una URL destino.</span>
                            </div>
                          )
                          if (!v.ok && v.warning) return (
                            <div className="fi-tip" style={{ background: 'rgba(239,68,68,.07)', borderColor: 'rgba(239,68,68,.2)' }}>
                              <span>🚫</span><span className="fi-tip-txt" style={{ color: 'var(--danger)' }}>{v.warning}</span>
                            </div>
                          )
                          if (v.warning) return (
                            <div className="fi-tip" style={{ background: 'rgba(245,158,11,.07)', borderColor: 'rgba(245,158,11,.2)' }}>
                              <span>⚠️</span><span className="fi-tip-txt" style={{ color: 'var(--warn)' }}>{v.warning}</span>
                            </div>
                          )
                          return <div className="fi-tip"><span>✅</span><span className="fi-tip-txt">URL válida y segura.</span></div>
                        })()}
                      </div>
                      <div className="fg">
                        <label className="fl">Delay de redirección</label>
                        <select className="fi" value={page.settings.direct_exit_delay ?? 800}
                          onChange={e => updateSettings({ direct_exit_delay: Number(e.target.value) })}>
                          <option value={300}>0.3s — Muy rápido</option>
                          <option value={800}>0.8s — Recomendado</option>
                          <option value={1500}>1.5s — Con animación</option>
                        </select>
                      </div>
                      <div className="fg">
                        <label className="fl">Texto de guía</label>
                        <textarea className="fi" rows={3}
                          placeholder="Para abrir la tienda sin bloqueos, toca los tres puntos arriba a la derecha..."
                          value={page.settings.direct_exit_guide_text ?? ''}
                          onChange={e => updateSettings({ direct_exit_guide_text: e.target.value })} />
                      </div>
                      <div className="fg">
                        <label className="tw">
                          <input type="checkbox" checked={page.settings.direct_exit_on_trust_cta !== false}
                            onChange={e => updateSettings({ direct_exit_on_trust_cta: e.target.checked })} />
                          <span className="tw-lbl">Activar en CTA de la Trust Page</span>
                        </label>
                        <div className="fh">Cuando el usuario pulse el botón principal, verá la guía de salida si está en TikTok.</div>
                      </div>
                      <div className="fg">
                        <label className="fl">Tu Direct Exit Link</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div className="fi" style={{ flex: 1, background: 'var(--bg)', fontSize: 12, color: 'var(--spurple)', fontFamily: 'monospace', cursor: 'default', userSelect: 'all' as const }}>
                            tokproof.app/u/{page.username ?? 'tu-usuario'}/go
                          </div>
                          <button type="button" className="btn btn-secondary btn-sm"
                            onClick={() => navigator.clipboard?.writeText?.(`https://tokproof.app/u/${page.username}/go`)}>
                            📋
                          </button>
                        </div>
                        <div className="fh">Comparte este link en TikTok Bio o en tus vídeos.</div>
                      </div>
                    </>
                  )}
                </SecRow>

                <div style={{ height: 32 }} />
              </div>

              {/* Add section button */}
              <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
                <button style={{
                  width: '100%', padding: '9px 0', borderRadius: 999,
                  border: `1.5px dashed ${T.border2}`, background: 'transparent',
                  color: T.purple, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Plus size={14} />
                  Añadir sección
                </button>
              </div>

            </div>

            {/* ── MINI-RAIL (floats over gutter) ── */}
            <div style={{
              position: 'absolute', top: 96, right: -74,
              background: T.card, borderRadius: 18, padding: '8px 6px',
              boxShadow: T.shadowPop,
              display: 'flex', flexDirection: 'column', gap: 2,
              width: 64, zIndex: 10,
            }}>
              {([
                { id: 'secciones', icon: LayoutGrid, label: 'Secciones' },
                { id: 'estilos', icon: Palette, label: 'Estilos' },
                { id: 'ajustes', icon: Settings, label: 'Ajustes' },
              ] as const).map(tool => {
                const active = activeTool === tool.id
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '6px 0', border: 'none', background: 'transparent', cursor: 'pointer',
                      borderRadius: 10, width: '100%',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: active ? T.softPink2 : '#F5F2FB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background .15s',
                    }}>
                      <tool.icon size={15} color={active ? T.pink : T.purple} />
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 500, color: active ? T.pink : T.ink3 }}>
                      {tool.label}
                    </span>
                  </button>
                )
              })}
            </div>

          </div>
        )}

        {/* ═══ MAIN ═══════════════════════════════════════════════════════════ */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
          <header style={{
            height: 56, flexShrink: 0,
            background: T.card,
            borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: 10,
            boxShadow: T.shadowCard,
          }}>
            {/* Back */}
            <Link
              href="/dashboard"
              style={{
                width: 38, height: 38, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10,
                color: T.ink2, textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} />
            </Link>

            {/* Title + pencil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 1 auto', minWidth: 0 }}>
              <span style={{
                fontSize: 17, fontWeight: 700, color: T.ink,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {page.title || 'Sin título'}
              </span>
              <button style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: T.ink3, padding: 2, display: 'flex' }}>
                <Pencil size={13} />
              </button>
            </div>

            {/* Status pill */}
            <div style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 999,
              background: page.status === 'published' ? T.greenBg : T.softPurple,
              fontSize: 12, fontWeight: 600,
              color: page.status === 'published' ? T.green : T.purple,
            }}>
              {page.status === 'published' ? 'Publicado' : 'Borrador'}
              <ChevronDown size={11} />
            </div>

            {/* Spacer — title shrinks, buttons stay */}
            <div style={{ flex: '1 1 12px' }} />

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

              {/* Focus toggle */}
              <button
                onClick={handleFocusToggle}
                title={focus ? 'Salir del Focus mode' : 'Focus mode'}
                style={{
                  width: 36, height: 36, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 9,
                  border: focus ? 'none' : `1px solid ${T.border2}`,
                  background: focus ? T.grad : T.card,
                  cursor: 'pointer',
                  color: focus ? 'white' : T.ink2,
                  boxShadow: focus ? T.shadowBtn : 'none',
                }}
              >
                {focus ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8V5a2 2 0 0 1 2-2h3" />
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                    <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                    <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                    <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                  </svg>
                )}
              </button>

              {/* Copy link */}
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 999,
                  border: `1px solid ${T.border2}`, background: T.card,
                  color: T.pink, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Link2 size={13} />
                Copiar link
              </button>

              {/* Preview */}
              {!isDemo && (
                <a
                  href={`/u/${page.username}`}
                  target="_blank"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 999,
                    border: `1px solid ${T.border2}`, background: T.card,
                    color: T.ink2, fontSize: 13, fontWeight: 500, textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  <Eye size={13} />
                  Vista previa
                </a>
              )}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 999,
                  border: `1px solid ${T.border2}`, background: T.card,
                  color: saved ? T.green : T.ink2, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', opacity: saving ? .6 : 1,
                  flexShrink: 0,
                }}
              >
                {saving ? '...' : saved ? '✓ Guardado' : 'Guardar'}
              </button>

              {/* Publish */}
              <button
                onClick={handlePublish}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 18px', borderRadius: 999,
                  border: 'none', background: T.grad,
                  color: 'white', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', boxShadow: T.shadowBtn,
                  flexShrink: 0,
                }}
              >
                <UploadCloud size={13} />
                Publicar cambios
              </button>

            </div>
          </header>

          {/* ── WORK AREA ──────────────────────────────────────────────────── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}>

            {/* Canvas */}
            <div style={{
              flex: 1, overflow: 'auto',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: 40,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

                {/* Device toggle */}
                <div style={{ display: 'flex', background: T.softPurple, borderRadius: 999, padding: 3, gap: 2 }}>
                  {([
                    { key: 'mobile' as const, label: 'Móvil' },
                    { key: 'desktop' as const, label: 'Escritorio' },
                  ]).map(d => {
                    const active = preview === d.key
                    return (
                      <button
                        key={d.key}
                        onClick={() => setPreview(d.key)}
                        style={{
                          padding: '5px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
                          fontSize: 13, fontWeight: 500,
                          background: active ? 'white' : 'transparent',
                          color: active ? T.ink : T.ink2,
                          boxShadow: active ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
                          transition: 'all .15s',
                        }}
                      >
                        {d.label}
                      </button>
                    )
                  })}
                </div>

                {/* Phone / Desktop frame with zoom */}
                <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform .2s' }}>
                  {preview === 'mobile' ? (
                    <div style={{
                      width: 312, height: 642,
                      borderRadius: 46,
                      background: 'linear-gradient(160deg,#23202b,#0c0b12)',
                      padding: '14px 9px 9px',
                      boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
                      position: 'relative',
                    }}>
                      {/* Notch */}
                      <div style={{
                        position: 'absolute', top: 13, left: '50%',
                        transform: 'translateX(-50%)',
                        width: 82, height: 22,
                        background: '#12101a', borderRadius: 999, zIndex: 2,
                      }} />
                      {/* Screen */}
                      <div style={{
                        borderRadius: 38, overflow: 'hidden',
                        height: '100%', background: 'white',
                        position: 'relative',
                      }}>
                        {/* Status bar spacer */}
                        <div style={{ height: 28, background: 'rgba(0,0,0,.02)' }} />
                        <div style={{ height: 'calc(100% - 28px)', overflowY: 'auto' }}>
                          {isTrust
                            ? <TrustPageRenderer data={previewData} preview />
                            : <SimplePageRenderer data={previewData} preview />
                          }
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width: 860,
                      borderRadius: 18,
                      overflow: 'hidden',
                      border: `1px solid ${T.border}`,
                      boxShadow: T.shadowCard,
                      background: 'white',
                      maxHeight: 620,
                    }}>
                      <div style={{ overflowY: 'auto', maxHeight: 620 }}>
                        {isTrust
                          ? <TrustPageRenderer data={previewData} preview />
                          : <SimplePageRenderer data={previewData} preview />
                        }
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Canvas tools bar */}
            <div style={{
              height: 48, flexShrink: 0,
              background: T.card,
              borderTop: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 2, padding: '0 16px',
            }}>
              <ToolBtn icon={Undo2} onClick={() => {}} title="Deshacer" />
              <ToolBtn icon={Redo2} onClick={() => {}} title="Rehacer" />
              <div style={{ width: 1, height: 16, background: T.border, margin: '0 6px' }} />
              <ToolBtn
                icon={Eye}
                onClick={() => !isDemo && window.open(`/u/${page.username}`, '_blank')}
                title="Vista previa"
              />
              <ToolBtn
                icon={Monitor}
                onClick={() => setPreview(p => p === 'mobile' ? 'desktop' : 'mobile')}
                title="Cambiar dispositivo"
              />
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setZoom(z => Math.max(50, z - 10))}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: `1px solid ${T.border}`, background: 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.ink2,
                }}
              >
                <Minus size={12} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 500, color: T.ink2, minWidth: 38, textAlign: 'center' }}>
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(150, z + 10))}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: `1px solid ${T.border}`, background: 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: T.ink2,
                }}
              >
                <Plus size={12} />
              </button>
            </div>

          </div>
        </main>

      </div>

      {/* Focus mode card */}
      {focusCard && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          background: T.ink, color: 'white',
          borderRadius: 18, padding: '14px 24px',
          boxShadow: T.shadowPop, zIndex: 9999,
          animation: 'edFadeUp .3s ease both',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
            {focus ? 'Focus mode' : 'Modo normal'}
          </div>
          <div style={{ fontSize: 12, opacity: .65 }}>
            {focus ? 'Oculta la sidebar para concentrarte en el editor' : 'Sidebar restaurada'}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          background: T.ink, color: 'white',
          borderRadius: 999, padding: '9px 22px',
          boxShadow: T.shadowPop, zIndex: 9999,
          fontSize: 13, fontWeight: 500,
          animation: 'edFadeIn .2s ease both',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}
