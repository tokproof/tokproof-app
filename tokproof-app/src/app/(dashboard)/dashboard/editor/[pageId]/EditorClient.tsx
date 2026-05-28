'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { FullPage, PageSettings } from '@/types'
import TrustPageRenderer from '@/components/public/TrustPageRenderer'
import SimplePageRenderer from '@/components/public/SimplePageRenderer'

// ─── Demo data (shown when Supabase is unavailable) ─────────────────────────
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

// ─── Color picker component ──────────────────────────────────────────────────
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

  return (
    <div className="ed-page">

      {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
      <header className="ed-topbar">
        <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ gap: 5, flexShrink: 0 }}>← Volver</Link>
        <div className="tb-sep" />
        <input
          className="fi"
          style={{ width: 220, height: 32, fontSize: 13, padding: '0 10px', borderRadius: 8 }}
          value={page.title ?? ''}
          onChange={e => setPage(p => ({ ...p, title: e.target.value }))}
          placeholder="Título de la página"
        />
        {isDemo && <span className="badge badge-warn" style={{ fontSize: 9, padding: '2px 9px', flexShrink: 0 }}>Demo</span>}

        <div className="ed-tb-r">
          <button className="btn btn-ghost btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? '...' : saved ? '✓ Guardado' : 'Guardar'}
          </button>
          {!isDemo && (
            <a href={`/u/${page.username}`} className="btn btn-ghost btn-sm" target="_blank">Ver página</a>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigator.clipboard?.writeText?.(`https://${publicUrl}`)}
          >Copiar link</button>
          <button className="btn btn-pub btn-sm" onClick={handlePublish}>🚀 Publicar</button>
          <label className="tw" style={{ marginLeft: 4 }}>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            <span className="tw-lbl" style={{ fontSize: 12 }}>Activo</span>
          </label>
        </div>
      </header>

      <div className="ed-body">

        {/* ── SIDEBAR ────────────────────────────────────────────────────── */}
        <aside className="ed-sb">

          {/* 1 · General */}
          <details className="ed-sec" open>
            <summary><span className="ed-sec-ico">⚙️</span> General <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-desc">Configuración básica: nombre, URL y enlace público.</div>
            <div className="ed-sec-body">
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
                <span className="fh">Enlace público: <span style={{ color: 'var(--spurple)' }}>tokproof.app/@{page.username || 'tuusuario'}</span></span>
              </div>
              <div className="fg">
                <label className="fl">Estado de la página</label>
                <label className="tw">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                  <span className="tw-lbl">Activo (visible al público)</span>
                </label>
              </div>
            </div>
          </details>

          {/* 2 · Branding / Colores */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">🎨</span> Branding / Colores <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-desc">Personaliza los colores. Los cambios se aplican en la preview.</div>
            <div className="ed-sec-body">
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
            </div>
          </details>

          {/* 3 · Perfil público */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">👤</span> Perfil público <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-desc">Aparece en la cabecera. Ideal para trust pages de marca personal.</div>
            <div className="ed-sec-body">
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
                <span className="fh">Máximo 120 caracteres. Visible bajo tu nombre.</span>
              </div>
              <div className="fg">
                <label className="fl">URL del avatar / logo <span className="fi-label-opt">Opcional</span></label>
                <input className="fi" type="url" value={page.settings.avatar_url ?? ''}
                  onChange={e => updateSettings({ avatar_url: e.target.value })}
                  placeholder="https://cdn.tumarca.com/logo.jpg" />
                <span className="fh">JPG o PNG. Se mostrará como círculo.</span>
              </div>
            </div>
          </details>

          {/* 4 · Producto */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">🏷️</span> Producto <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-desc">El texto principal de tu trust page. El headline es lo primero que leerá el usuario.</div>
            <div className="ed-sec-body">
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
            </div>
          </details>

          {/* 5 · Media */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">🎥</span> Media <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-desc">Vídeo o imagen estilo TikTok. Ratio 9:16 recomendado.</div>
            <div className="ed-sec-body">
              <div className="fg">
                <label className="fl">Tipo de media</label>
                <div className="media-tabs">
                  <div
                    className={`media-tab${(page.settings.media_type ?? 'image') === 'image' ? ' active' : ''}`}
                    onClick={() => updateSettings({ media_type: 'image' })}
                  >🖼 Imagen</div>
                  <div
                    className={`media-tab${page.settings.media_type === 'video' ? ' active' : ''}`}
                    onClick={() => updateSettings({ media_type: 'video' })}
                  >🎬 Vídeo</div>
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
            </div>
          </details>

          {/* 6 · Precio */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">💰</span> Precio <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-desc">El precio es opcional. Ocúltalo para una experiencia más social.</div>
            <div className="ed-sec-body">
              <div className="fg">
                <label className="fl">Mostrar precio</label>
                <label className="tw">
                  <input type="checkbox" checked={!!page.settings.price}
                    onChange={e => { if (!e.target.checked) updateSettings({ price: '' }) }} />
                  <span className="tw-lbl">Visible en la landing</span>
                </label>
                <div className="fi-tip" style={{ marginTop: 8 }}><span className="fi-tip-ico">💡</span>Ocultarlo hace que la página se sienta más social y menos como una tienda.</div>
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
            </div>
          </details>

          {/* 7 · Botones */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">🛒</span> Botones <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-body">
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
                Botones secundarios (estilo Linktree)
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
            </div>
          </details>

          {/* 8 · Comentarios TikTok */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">💬</span> Comentarios TikTok <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-body">
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
            </div>
          </details>

          {/* 9 · Reviews */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">⭐</span> Reviews <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-body">
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
            </div>
          </details>

          {/* 10 · Logos / Visto en */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">🏆</span> Logos / Visto en <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-body">
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
            </div>
          </details>

          {/* 11 · FAQ */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">❓</span> FAQ <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-body">
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
            </div>
          </details>

          {/* 12 · Garantías */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">🛡</span> Garantías <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-body">
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
            </div>
          </details>

          {/* 13 · Orden de bloques */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">⠿</span> Orden de bloques <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-body">
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.6 }}>
                Arrastra para reordenar los bloques de tu landing. <span style={{ color: 'var(--spurple)' }}>Drag & drop</span> próximamente.
              </p>
              <div className="block-list">
                {[
                  ['🎥', 'Hero / Media'],
                  ['🏷️', 'Producto'],
                  ['💰', 'Precio'],
                  ['🛒', 'Botones CTA'],
                  ['💬', 'Comentarios TikTok'],
                  ['⭐', 'Reviews'],
                  ['🏆', 'Logos'],
                  ['🛡', 'Garantías'],
                  ['❓', 'FAQ'],
                  ['📄', 'Footer'],
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
            </div>
          </details>

          {/* 14 · Analytics */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">📊</span> Analytics <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-body">
              <div className="an-stat-grid">
                <div className="an-stat-card">
                  <div className="an-lbl">Vistas</div>
                  <div className="an-val" style={{ color: 'var(--text)' }}>{isDemo ? '—' : '0'}</div>
                </div>
                <div className="an-stat-card">
                  <div className="an-lbl">Clicks CTA</div>
                  <div className="an-val" style={{ color: 'var(--pink)' }}>{isDemo ? '—' : '0'}</div>
                </div>
                <div className="an-stat-card">
                  <div className="an-lbl">CTR</div>
                  <div className="an-val" style={{ color: 'var(--pink)' }}>{isDemo ? '—' : '0%'}</div>
                </div>
                <div className="an-stat-card">
                  <div className="an-lbl">Shopify</div>
                  <div className="an-val" style={{ color: 'var(--spurple)' }}>{isDemo ? '—' : '0'}</div>
                </div>
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
            </div>
          </details>

          {/* 15 · Safe Link / SEO */}
          <details className="ed-sec">
            <summary><span className="ed-sec-ico">🔍</span> Safe Link / SEO <span className="ed-sec-chev">›</span></summary>
            <div className="ed-sec-desc">Optimiza para TikTok. Un score alto mejora la confianza del comprador.</div>
            <div className="ed-sec-body">
              <div className="sl-score-row">
                <div>
                  <div className="sl-score-val">
                    {page.safe_score}
                    <span style={{ fontSize: 14, fontWeight: 700, opacity: .6 }}>/100</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    Safe Score
                  </div>
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
                <label className="fl">Título SEO de la página</label>
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
                <label className="tw">
                  <input type="checkbox" defaultChecked />
                  <span className="tw-lbl">Mostrar en footer</span>
                </label>
              </div>
            </div>
          </details>

          {/* 16 · TikTok Rescue */}
          <details className="ed-sec">
            <summary>
              <span className="ed-sec-ico">🛡</span>
              <span style={{ flex: 1 }}>TikTok Rescue</span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.2)', borderRadius: 99, color: 'var(--purple)', marginRight: 8 }}>PRO</span>
              <span className="ed-sec-chev">›</span>
            </summary>
            <div className="ed-sec-desc">
              Crea un link directo para TikTok. Dentro del WebView de TikTok muestra una guía para abrir el navegador externo. Fuera de TikTok, redirige directamente al producto.
            </div>
            <div className="ed-sec-body">
              <div className="fg">
                <label className="tw">
                  <input
                    type="checkbox"
                    checked={!!page.settings.direct_exit_enabled}
                    onChange={e => updateSettings({ direct_exit_enabled: e.target.checked })}
                  />
                  <span className="tw-lbl">Activar Direct Exit</span>
                </label>
              </div>

              {page.settings.direct_exit_enabled && (
                <>
                  <div className="fg">
                    <label className="fl">URL Destino del Producto</label>
                    <input
                      className="fi"
                      type="url"
                      placeholder="https://tutienda.myshopify.com/products/producto"
                      value={page.settings.direct_exit_url ?? ''}
                      onChange={e => updateSettings({ direct_exit_url: e.target.value })}
                    />
                    {(() => {
                      const v = validateDirectExitUrl(page.settings.direct_exit_url ?? '')
                      if (!page.settings.direct_exit_url) return (
                        <div className="fi-tip" style={{ background: 'rgba(245,158,11,.07)', borderColor: 'rgba(245,158,11,.2)' }}>
                          <span>⚠️</span><span className="fi-tip-txt" style={{ color: 'var(--warn)' }}>Necesitas añadir una URL destino para activar Direct Exit.</span>
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
                    <select
                      className="fi"
                      value={page.settings.direct_exit_delay ?? 800}
                      onChange={e => updateSettings({ direct_exit_delay: Number(e.target.value) })}
                    >
                      <option value={300}>0.3s — Muy rápido</option>
                      <option value={800}>0.8s — Recomendado</option>
                      <option value={1500}>1.5s — Con animación</option>
                    </select>
                  </div>

                  <div className="fg">
                    <label className="fl">Texto de guía (editable)</label>
                    <textarea
                      className="fi"
                      rows={3}
                      placeholder="Para abrir la tienda sin bloqueos, toca los tres puntos arriba a la derecha y elige 'Abrir en navegador'."
                      value={page.settings.direct_exit_guide_text ?? ''}
                      onChange={e => updateSettings({ direct_exit_guide_text: e.target.value })}
                    />
                  </div>

                  <div className="fg">
                    <label className="tw">
                      <input
                        type="checkbox"
                        checked={page.settings.direct_exit_on_trust_cta !== false}
                        onChange={e => updateSettings({ direct_exit_on_trust_cta: e.target.checked })}
                      />
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
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigator.clipboard?.writeText?.(`https://tokproof.app/u/${page.username}/go`)}
                      >📋</button>
                    </div>
                    <div className="fh">Comparte este link en TikTok Bio o en tus vídeos.</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <div style={{ background: 'rgba(124,58,237,.07)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 10, padding: '10px 12px', fontSize: 11, lineHeight: 1.55 }}>
                      <div style={{ fontWeight: 800, color: 'var(--spurple)', marginBottom: 3 }}>🔗 Trust Page</div>
                      <div style={{ color: 'var(--muted)' }}>Ideal para generar confianza con comentarios, reviews y prueba social.</div>
                    </div>
                    <div style={{ background: 'rgba(255,45,117,.07)', border: '1px solid rgba(255,45,117,.15)', borderRadius: 10, padding: '10px 12px', fontSize: 11, lineHeight: 1.55 }}>
                      <div style={{ fontWeight: 800, color: 'var(--spink)', marginBottom: 3 }}>🚀 Direct Exit</div>
                      <div style={{ color: 'var(--muted)' }}>Ideal para enviar rápido al producto reduciendo bloqueos del navegador interno.</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </details>

          <div style={{ height: 40 }} />
        </aside>

        {/* ── PREVIEW ────────────────────────────────────────────────────── */}
        <main className="ed-main">
          <div className="ed-preview-col">

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="ed-device-toggle">
                <button
                  className={`ed-dev-btn${preview === 'mobile' ? ' active' : ''}`}
                  onClick={() => setPreview('mobile')}
                >📱 Móvil</button>
                <button
                  className={`ed-dev-btn${preview === 'desktop' ? ' active' : ''}`}
                  onClick={() => setPreview('desktop')}
                >🖥 Desktop</button>
              </div>
              {isDemo && (
                <span className="badge badge-warn" style={{ fontSize: 10 }}>Demo mode</span>
              )}
            </div>

            <div className="ed-prev-lbl">Vista previa en tiempo real</div>

            <div
              className="ed-url-bar"
              style={preview === 'desktop' ? { width: 860 } : undefined}
            >
              🔒 {publicUrl}
            </div>

            <div className={`ed-iframe-wrap${preview === 'desktop' ? ' ed-desk' : ''}`}>
              <div style={{ overflowY: 'auto', height: '100%', background: page.settings.bg_color ?? 'var(--bg)' }}>
                {isTrust
                  ? <TrustPageRenderer data={previewData} preview />
                  : <SimplePageRenderer data={previewData} preview />
                }
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {!isDemo && (
                <a href={`/u/${page.username}`} className="btn btn-ghost btn-sm" target="_blank">↗ Abrir en nueva pestaña</a>
              )}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigator.clipboard?.writeText?.(`https://${publicUrl}`)}
              >📋 Copiar enlace</button>
            </div>

          </div>
        </main>

      </div>
    </div>
  )
}
