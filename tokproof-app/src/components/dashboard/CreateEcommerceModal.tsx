'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  username: string | null
}

type EcomType = 'trust_page' | 'simple_page'

// ─── CSS vars from HTML reference ─────────────────────────────────────────────
const C = {
  pink:       '#ec4899',
  pinkDeep:   '#db2777',
  purple:     '#a855f7',
  purpleDeep: '#9333ea',
  ink:        '#1f2430',
  muted:      '#5d6473',
}

const FONT = `var(--font-poppins, 'Poppins'), system-ui, sans-serif`

// ─── SVG icons (exact copies from HTML) ───────────────────────────────────────
const SparkIcon = () => (
  <svg style={{ width: 32, height: 32, flexShrink: 0 }} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ec4899" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <path d="M12 2c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7z" fill="url(#sg)" />
    <path d="M19 3c.2 1.6.9 2.3 2.5 2.5C19.9 5.7 19.2 6.4 19 8c-.2-1.6-.9-2.3-2.5-2.5C18.1 5.3 18.8 4.6 19 3z" fill="url(#sg)" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 22, height: 22 }}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 21, height: 21, color: '#fff' }}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9.5 12l1.8 1.8L15 10" />
  </svg>
)

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 21, height: 21, color: '#fff' }}>
    <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5" />
    <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
    <path d="M5 12l4 4 10-10" />
  </svg>
)

const ShieldFootIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: '#a855f7', flexShrink: 0 }}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
  </svg>
)

// Social icons (exact from HTML)
const TikTokSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 12, height: 12, color: '#fff', opacity: .95 }}>
    <path d="M16 3v3.2a4.8 4.8 0 003.5 1.6V11a8 8 0 01-3.6-.9v5.5a5.6 5.6 0 11-5.6-5.6c.3 0 .6 0 .9.1v3.3a2.4 2.4 0 102.4 2.4V3H16z" />
  </svg>
)
const InstagramSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12, color: '#fff', opacity: .95 }}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
)
const YouTubeSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 12, height: 12, color: '#fff', opacity: .95 }}>
    <path d="M22 8.2a3 3 0 00-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 002 8.2 31 31 0 002 12a31 31 0 00.1 3.8 3 3 0 002.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 002.1-2.1A31 31 0 0022 12a31 31 0 00-.1-3.8zM10 15V9l5 3-5 3z" />
  </svg>
)

// ─── Phone: Trust ─────────────────────────────────────────────────────────────
function TrustPhone() {
  const sbDot: React.CSSProperties = { display: 'block', width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: .65 }
  const sbBar: React.CSSProperties = { display: 'block', width: 5, height: 5, borderRadius: 1, background: 'currentColor', opacity: .65 }

  return (
    <div style={{
      width: 145, borderRadius: 27, padding: 5,
      background: 'linear-gradient(160deg,#2a2a2e,#0e0e10)',
      boxShadow: '0 16px 32px -14px rgba(20,10,40,.5)',
      position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
    }}>
      <div style={{ borderRadius: 23, overflow: 'hidden', position: 'relative', height: 280 }}>
        {/* Notch */}
        <div style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', width: 54, height: 15, background: '#0e0e10', borderRadius: 10, zIndex: 5 }} />
        {/* Status bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px 0', zIndex: 4, color: '#3f4452' }}>
          <span style={{ display: 'flex', gap: 2 }}>
            <i style={sbDot} /><i style={sbDot} /><i style={sbDot} />
          </span>
          <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <i style={sbBar} /><i style={sbBar} /><i style={{ ...sbBar, width: 8 }} />
          </span>
        </div>
        {/* Screen content */}
        <div style={{ background: 'linear-gradient(180deg,#fde6f0 0%,#fbdbe9 100%)', height: '100%', color: '#3f4452', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
          <div style={{ height: 24, flexShrink: 0 }} />
          <div style={{ padding: '4px 9px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.05, fontWeight: 700, color: '#e0397f', letterSpacing: '-.02em', marginTop: 2 }}>
              Descubre tu mejor<br />versión ✨
            </div>
            <div style={{ fontSize: 7.5, lineHeight: 1.3, color: '#5b6171', marginTop: 5, padding: '0 4px' }}>
              Skincare coreano para una piel saludable y radiante.
            </div>
            <div style={{ marginTop: 6, height: 58, borderRadius: 10, overflow: 'hidden', background: '#f8cfe0' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/modal-product.png" alt="producto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 3, marginTop: 6, fontSize: 7, color: '#7a7f8c' }}>
              <span style={{ color: '#f5b301', fontSize: 8, letterSpacing: -1 }}>★★★★★</span> 4.8 (128 reseñas)
            </div>
            <div style={{ textAlign: 'left', fontSize: 8.5, fontWeight: 600, color: '#3f4452', marginTop: 6 }}>
              ¿Por qué te encantará?
            </div>
            <ul style={{ listStyle: 'none', marginTop: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Ingredientes naturales', 'Resultados visibles', 'Envío rápido y seguro'].map(t => (
                <li key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 7.5, color: '#5b6171' }}>
                  <i style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: C.pink, flexShrink: 0 }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {/* Buy button — pushed to bottom via auto margin */}
          <div style={{ margin: 'auto 9px 10px', height: 26, borderRadius: 10, background: 'linear-gradient(90deg,#f9388f,#e0266f)', color: '#fff', fontSize: 9, fontWeight: 600, display: 'grid', placeItems: 'center' }}>
            Comprar ahora
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Phone: Links ─────────────────────────────────────────────────────────────
function LinksPhone() {
  const sbDot: React.CSSProperties = { display: 'block', width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: .65 }
  const sbBar: React.CSSProperties = { display: 'block', width: 5, height: 5, borderRadius: 1, background: 'currentColor', opacity: .65 }

  return (
    <div style={{
      width: 145, borderRadius: 27, padding: 5,
      background: 'linear-gradient(160deg,#2a2a2e,#0e0e10)',
      boxShadow: '0 16px 32px -14px rgba(20,10,40,.5)',
      position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
    }}>
      <div style={{ borderRadius: 23, overflow: 'hidden', position: 'relative', height: 280 }}>
        {/* Notch */}
        <div style={{ position: 'absolute', top: 7, left: '50%', transform: 'translateX(-50%)', width: 54, height: 15, background: '#0e0e10', borderRadius: 10, zIndex: 5 }} />
        {/* Status bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px 0', zIndex: 4, color: '#fff' }}>
          <span style={{ display: 'flex', gap: 2 }}>
            <i style={sbDot} /><i style={sbDot} /><i style={sbDot} />
          </span>
          <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <i style={sbBar} /><i style={sbBar} /><i style={{ ...sbBar, width: 8 }} />
          </span>
        </div>
        {/* Screen content */}
        <div style={{ background: 'linear-gradient(180deg,#9b6cf0 0%,#b388f4 55%,#e9dcfb 100%)', height: '100%', color: '#fff', textAlign: 'center', padding: '22px 11px 0', fontFamily: FONT }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', margin: '5px auto 0', overflow: 'hidden', border: '2px solid rgba(255,255,255,.55)', background: '#cbb6ee' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/modal-avatar.png" alt="perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6 }}>@tuusuario</div>
          <div style={{ fontSize: 7, opacity: .85, marginTop: 2 }}>Creadora de contenido | Belleza | Lifestyle</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 9, marginTop: 6 }}>
            <TikTokSVG /><InstagramSVG /><YouTubeSVG />
          </div>
          {['Mi tienda', 'Productos favoritos', 'Descuentos exclusivos', 'Sígueme en TikTok'].map(lnk => (
            <div key={lnk} style={{ marginTop: 7, background: 'rgba(255,255,255,.92)', color: '#7c3aed', fontSize: 7.5, fontWeight: 600, borderRadius: 9, height: 22, display: 'grid', placeItems: 'center', boxShadow: '0 4px 10px -4px rgba(80,30,140,.4)' }}>
              {lnk}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Feature bullet ───────────────────────────────────────────────────────────
function Feat({ text, bulletBg }: { text: string; bulletBg: string }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, lineHeight: 1.3, color: '#3f4452', fontWeight: 400 }}>
      <span style={{ width: 17, height: 17, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', marginTop: 1, background: bulletBg }}>
        <CheckIcon />
      </span>
      {text}
    </li>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function CreateEcommerceModal({ open, onClose, userId, username }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<EcomType>('trust_page')
  const [creating, setCreating] = useState(false)

  if (!open) return null

  async function handleCreate() {
    setCreating(true)
    const supabase = createClient()
    const title      = selected === 'trust_page' ? 'Nueva Página de Confianza' : 'Nueva Página de Links'
    const legacyType = selected === 'trust_page' ? 'trust' : 'simple'

    const { data: page } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        username,
        type: legacyType,
        status: 'draft',
        title,
        settings: { _category: 'ecommerce', _pageType: selected },
      })
      .select()
      .single()

    onClose()
    if (page?.id) router.push(`/dashboard/editor/${page.id}`)
  }

  const trustSelected = selected === 'trust_page'
  const linksSelected = selected === 'simple_page'

  const trustBorder   = trustSelected ? '#f4a8cf'  : 'transparent'
  const trustShadow   = trustSelected ? '0 14px 34px -18px rgba(236,72,153,.45)' : 'none'
  const linksBorder   = linksSelected ? '#c9aef0'  : 'transparent'
  const linksShadow   = linksSelected ? '0 14px 34px -18px rgba(168,85,247,.4)' : 'none'

  return (
    /* Overlay */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(18,16,26,.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 32px',
      }}
      onClick={e => { if (e.currentTarget === e.target) onClose() }}
    >
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'relative',
          width: 980,
          maxWidth: 'calc(100vw - 64px)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg,#ffffff 0%,#fdfbfe 60%,#faf6fd 100%)',
          borderRadius: 24,
          padding: '32px 32px 24px',
          boxShadow: '0 40px 90px -20px rgba(20,10,40,.55)',
          fontFamily: FONT,
          animation: 'cmSlideUp .2s ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 26, right: 28,
            width: 30, height: 30, border: 'none', background: 'transparent',
            color: '#9aa0ac', cursor: 'pointer', display: 'grid', placeItems: 'center',
            borderRadius: 8, transition: '.15s', padding: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f1eef5'; (e.currentTarget as HTMLButtonElement).style.color = '#5d6473' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#9aa0ac' }}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </button>

        {/* Head */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 11 }}>
          <SparkIcon />
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-.01em', color: '#161a23', margin: 0 }}>
            Crear nueva página
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: 15, lineHeight: 1.5, color: '#4f5563', maxWidth: 540, fontWeight: 400, margin: 0 }}>
          Elige el formato que mejor se adapta a tu objetivo. Todas las páginas incluyen nuestra{' '}
          <b style={{ fontWeight: 600, color: C.pinkDeep }}>guía para abrir en navegador</b> desde TikTok.
        </p>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, width: '100%', marginTop: 22 }}>

          {/* ── TRUST card ── */}
          <div
            onClick={() => setSelected('trust_page')}
            style={{
              borderRadius: 20, padding: 28, cursor: 'pointer', position: 'relative',
              transition: 'transform .18s ease, box-shadow .18s ease',
              minWidth: 0, maxWidth: '100%', overflow: 'hidden', height: 340,
              background: 'linear-gradient(160deg,#fdeef5 0%,#fbe3ef 100%)',
              border: `2px solid ${trustBorder}`,
              boxShadow: trustShadow,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; if (!trustSelected) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px -18px rgba(236,72,153,.5)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = trustShadow }}
          >
            <div style={{ maxWidth: 'calc(100% - 175px)', minWidth: 0 }}>
              {/* Badge icon */}
              <div style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 12, background: 'linear-gradient(150deg,#f472b6,#db2777)', boxShadow: '0 8px 18px -6px rgba(219,39,119,.6)' }}>
                <ShieldIcon />
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 600, color: '#1c2029', letterSpacing: '-.02em', margin: 0 }}>
                Página de Confianza
              </h2>
              <div style={{ display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 600, color: '#c026a8', background: '#fbd7ee', padding: '4px 12px', borderRadius: 999 }}>
                Recomendada
              </div>
              <p style={{ marginTop: 11, fontSize: 12, lineHeight: 1.45, color: '#5b6171', fontWeight: 400 }}>
                Crea una mini landing completa y optimizada para generar confianza y convertir más.
              </p>
              <ul style={{ listStyle: 'none', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                <Feat text="Diseño completo y personalizable"  bulletBg={C.pink} />
                <Feat text="Reviews, FAQ y beneficios"         bulletBg={C.pink} />
                <Feat text="Ideal para productos físicos"       bulletBg={C.pink} />
                <Feat text="Incluye apertura en navegador"      bulletBg={C.pink} />
              </ul>
            </div>
            <TrustPhone />
          </div>

          {/* ── LINKS card ── */}
          <div
            onClick={() => setSelected('simple_page')}
            style={{
              borderRadius: 20, padding: 28, cursor: 'pointer', position: 'relative',
              transition: 'transform .18s ease, box-shadow .18s ease',
              minWidth: 0, maxWidth: '100%', overflow: 'hidden', height: 340,
              background: 'linear-gradient(160deg,#f6f1fd 0%,#efe6fb 100%)',
              border: `2px solid ${linksBorder}`,
              boxShadow: linksShadow,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; if (!linksSelected) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px -18px rgba(168,85,247,.45)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = linksShadow }}
          >
            <div style={{ maxWidth: 'calc(100% - 175px)', minWidth: 0 }}>
              {/* Badge icon */}
              <div style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 12, background: 'linear-gradient(150deg,#c084fc,#9333ea)', boxShadow: '0 8px 18px -6px rgba(147,51,234,.55)' }}>
                <LinkIcon />
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 600, color: '#1c2029', letterSpacing: '-.02em', margin: 0 }}>
                Página de Links
              </h2>
              <p style={{ marginTop: 16, fontSize: 12, lineHeight: 1.45, color: '#5b6171', fontWeight: 400 }}>
                Crea una página simple con enlaces directos para enviar tráfico rápidamente a tu web o redes sociales.
              </p>
              <ul style={{ listStyle: 'none', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                <Feat text="Enlaces ilimitados"                      bulletBg={C.purple} />
                <Feat text="Diseño limpio y rápido"                   bulletBg={C.purple} />
                <Feat text="Ideal para creadores y marcas"            bulletBg={C.purple} />
                <Feat text="Incluye exit para abrir en navegador"     bulletBg={C.purple} />
              </ul>
            </div>
            <LinksPhone />
          </div>

        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 18, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              height: 56, borderRadius: 18, fontFamily: FONT, fontSize: 17, fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid #e6e2ee', background: '#fff', color: '#3f4452',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '.16s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f7f5fb' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              height: 56, borderRadius: 18, fontFamily: FONT, fontSize: 17, fontWeight: 600,
              cursor: creating ? 'not-allowed' : 'pointer', border: 'none',
              background: creating ? '#c084fc' : 'linear-gradient(90deg,#f0339a 0%,#c43cd6 55%,#9b53f0 100%)',
              color: '#fff',
              boxShadow: creating ? 'none' : '0 16px 30px -12px rgba(180,40,190,.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: '.16s',
            }}
            onMouseEnter={e => { if (!creating) { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.04)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
          >
            {creating
              ? (selected === 'trust_page' ? 'Creando Página de Confianza…' : 'Creando Página de Links…')
              : <><span>Crear página</span><span aria-hidden="true">→</span></>
            }
          </button>
        </div>

        {/* Footer note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, fontSize: 13.5, color: '#6a7080', fontWeight: 400 }}>
          <ShieldFootIcon />
          <span>
            Todas las páginas incluyen nuestra <b style={{ color: C.pinkDeep, fontWeight: 600 }}>guía para abrir en navegador</b> desde TikTok.
          </span>
        </div>

      </div>
    </div>
  )
}
