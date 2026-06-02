'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './landing.css'

interface LandingPageProps {
  isLoggedIn: boolean
}

const CHAT_MESSAGES = [
  '¿Dónde puedo comprar el serum? 😍',
  'Acabo de comprarlo!! gracias ✨',
  '¿Tienen envío a México? 🇲🇽',
  'El link no me funciona en TikTok 😅',
  '¿Es el mismo del video viral?',
]

const SALE_VALUES = ['$34.99', '$89.00', '$24.99', '$149.00', '$59.99', '$34.99', '$79.00']

const CREATOR_DATA = [
  { name: 'Sofia Ramírez', handle: '@sofiabeauty', niche: 'Beauty & Skincare', foll: '1.2M seguidores', tag: 'Belleza', grad: 'linear-gradient(160deg,#FFD1B1,#FFB1E7)' },
  { name: 'Carlos Tech', handle: '@carlostech_', niche: 'Tecnología & Gadgets', foll: '890K seguidores', tag: 'Tech', grad: 'linear-gradient(160deg,#B1D4FF,#C9A0FF)' },
  { name: 'Laura Fit', handle: '@laurafit.mx', niche: 'Fitness & Nutrición', foll: '2.1M seguidores', tag: 'Fitness', grad: 'linear-gradient(160deg,#C9F4D4,#A0E0FF)' },
  { name: 'Diego Style', handle: '@diegostyle', niche: 'Moda Masculina', foll: '650K seguidores', tag: 'Moda', grad: 'linear-gradient(160deg,#FFB1C1,#FF9BE0)' },
  { name: 'Ana Cocina', handle: '@anacocina', niche: 'Recetas & Comida', foll: '3.4M seguidores', tag: 'Foodie', grad: 'linear-gradient(160deg,#FFE4B1,#FFD1B1)' },
  { name: 'Marta Deco', handle: '@martadeco', niche: 'Hogar & Decoración', foll: '780K seguidores', tag: 'Deco', grad: 'linear-gradient(160deg,#E0D4FF,#C9A0FF)' },
]

const MAP_DOTS_DATA = [
  { x: 22, y: 38, hot: true }, { x: 26, y: 42, hot: false }, { x: 18, y: 35, warm: true },
  { x: 32, y: 36, hot: false }, { x: 28, y: 30, warm: true }, { x: 20, y: 48, hot: false },
  { x: 38, y: 40, hot: false }, { x: 14, y: 28, hot: false }, { x: 42, y: 22, warm: true },
  { x: 48, y: 35, hot: true }, { x: 52, y: 30, hot: false }, { x: 58, y: 38, warm: true },
  { x: 55, y: 45, hot: false }, { x: 62, y: 28, hot: false }, { x: 68, y: 32, warm: true },
  { x: 72, y: 40, hot: true }, { x: 76, y: 35, hot: false }, { x: 78, y: 22, hot: false },
  { x: 82, y: 38, warm: true }, { x: 88, y: 42, hot: false }, { x: 85, y: 28, hot: false },
  { x: 46, y: 55, hot: false }, { x: 50, y: 60, warm: true }, { x: 35, y: 58, hot: false },
  { x: 62, y: 58, hot: false }, { x: 70, y: 52, warm: true },
]

const PING_DOTS = [
  { x: 22, y: 40, pd: '0s', big: false, purple: false },
  { x: 72, y: 36, pd: '0.8s', big: true, purple: false },
  { x: 48, y: 55, pd: '1.6s', big: false, purple: true },
]

const SVG_POINTS = [
  [0, 88], [60, 72], [120, 90], [180, 52], [240, 64], [300, 28], [360, 44], [460, 14]
]

function buildLinePath(pts: number[][]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const cur = pts[i]
    const cx = (prev[0] + cur[0]) / 2
    d += ` C ${cx} ${prev[1]}, ${cx} ${cur[1]}, ${cur[0]} ${cur[1]}`
  }
  return d
}

function buildAreaPath(pts: number[][]): string {
  if (pts.length < 2) return ''
  const line = buildLinePath(pts)
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${line} L ${last[0]} 120 L ${first[0]} 120 Z`
}

export default function LandingPage({ isLoggedIn }: LandingPageProps) {
  const router = useRouter()
  const stageRef = useRef<HTMLDivElement>(null)
  const testiTrackRef = useRef<HTMLDivElement>(null)
  const claimInputRef = useRef<HTMLInputElement>(null)
  const [testiIndex, setTestiIndex] = useState(0)
  const [claimVal, setClaimVal] = useState('')
  const [saleVal, setSaleVal] = useState('$34.99')
  const [chatMsg, setChatMsg] = useState('')
  const [annotIndex, setAnnotIndex] = useState(0)

  const linePath = buildLinePath(SVG_POINTS)
  const areaPath = buildAreaPath(SVG_POINTS)
  const lastPt = SVG_POINTS[SVG_POINTS.length - 1]

  /* ── scroll reveal ── */
  useEffect(() => {
    const els = document.querySelectorAll('.tp-landing .reveal')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target) } })
    }, { threshold: 0.12 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  /* ── analytics bar fills ── */
  useEffect(() => {
    const fills = document.querySelectorAll<HTMLElement>('.tp-landing .fill')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          const w = el.getAttribute('data-w')
          if (w) el.style.width = w + '%'
          obs.unobserve(el)
        }
      })
    }, { threshold: 0.2 })
    fills.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  /* ── hero annotation cycling ── */
  useEffect(() => {
    const total = 3
    const timer = setInterval(() => {
      setAnnotIndex(i => (i + 1) % total)
    }, 2600)
    return () => clearInterval(timer)
  }, [])

  /* ── chat bubble typing ── */
  useEffect(() => {
    let msgIdx = 0
    let charIdx = 0
    let typingTimer: ReturnType<typeof setTimeout>

    function typeNext() {
      const msg = CHAT_MESSAGES[msgIdx]
      if (charIdx <= msg.length) {
        setChatMsg(msg.slice(0, charIdx))
        charIdx++
        typingTimer = setTimeout(typeNext, 45)
      } else {
        typingTimer = setTimeout(() => {
          msgIdx = (msgIdx + 1) % CHAT_MESSAGES.length
          charIdx = 0
          setChatMsg('')
          typingTimer = setTimeout(typeNext, 300)
        }, 2200)
      }
    }
    typingTimer = setTimeout(typeNext, 1200)
    return () => clearTimeout(typingTimer)
  }, [])

  /* ── sale counter ── */
  useEffect(() => {
    let idx = 0
    const timer = setInterval(() => {
      idx = (idx + 1) % SALE_VALUES.length
      setSaleVal(SALE_VALUES[idx])
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  /* ── draggable bubbles ── */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const bubbles = stage.querySelectorAll<HTMLElement>('.bubble')

    function makeDraggable(el: HTMLElement) {
      let startX = 0, startY = 0, origLeft = 0, origTop = 0
      let dragging = false

      function onDown(e: MouseEvent | TouchEvent) {
        e.preventDefault()
        dragging = true
        el.classList.add('dragging')
        const pt = 'touches' in e ? e.touches[0] : e
        startX = pt.clientX; startY = pt.clientY
        origLeft = el.offsetLeft; origTop = el.offsetTop
        window.addEventListener('mousemove', onMove)
        window.addEventListener('touchmove', onMove, { passive: false })
        window.addEventListener('mouseup', onUp)
        window.addEventListener('touchend', onUp)
      }

      function onMove(e: MouseEvent | TouchEvent) {
        if (!dragging) return
        const pt = 'touches' in e ? e.touches[0] : e
        const dx = pt.clientX - startX
        const dy = pt.clientY - startY
        el.style.left = (origLeft + dx) + 'px'
        el.style.top = (origTop + dy) + 'px'
      }

      function onUp() {
        dragging = false
        el.classList.remove('dragging')
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('touchmove', onMove)
        window.removeEventListener('mouseup', onUp)
        window.removeEventListener('touchend', onUp)
      }

      el.addEventListener('mousedown', onDown)
      el.addEventListener('touchstart', onDown, { passive: false })
      return () => {
        el.removeEventListener('mousedown', onDown)
        el.removeEventListener('touchstart', onDown)
      }
    }

    const cleanups = Array.from(bubbles).map(makeDraggable)
    return () => cleanups.forEach(fn => fn())
  }, [])

  /* ── testimonial carousel ── */
  useEffect(() => {
    const track = testiTrackRef.current
    if (!track) return
    const cards = track.querySelectorAll<HTMLElement>('.testi-card')
    const total = cards.length
    const visible = window.innerWidth <= 680 ? 1 : window.innerWidth <= 1000 ? 2 : 3
    const cardW = cards[0]?.offsetWidth ?? 0
    const gap = 20
    const max = Math.max(0, total - visible)
    const clamped = Math.min(testiIndex, max)
    track.style.transform = `translateX(-${clamped * (cardW + gap)}px)`
  }, [testiIndex])

  function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push('/signup' + (claimVal ? `?username=${encodeURIComponent(claimVal)}` : ''))
  }

  return (
    <div className="tp-landing">

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-in">
          <Link className="brand" href="/">
            <span className="mk">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/tokproof-isotipo.png" alt="Tokproof" width={22} height={22} style={{ width: 22, height: 22, objectFit: 'contain', display: 'block' }} />
            </span>
            Tokproof
          </Link>
          <div className="nav-links">
            <a href="#features">Producto</a>
            <a href="#features">Beneficios</a>
            <a href="#how">Cómo funciona</a>
            <a href="#pricing">Precios</a>
          </div>
          <div className="nav-right">
            {isLoggedIn ? (
              <Link className="nav-cta" href="/dashboard">Ir al Dashboard</Link>
            ) : (
              <>
                <Link className="login" href="/login">Iniciar sesión</Link>
                <Link className="nav-cta" href="/signup">Comenzar gratis</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="hero">
        <div className="bg-grid" />
        <div className="aura pink" style={{ width: 340, height: 340, right: -40, top: -60 }} />
        <div className="aura purple" style={{ width: 300, height: 300, left: -80, bottom: -80 }} />
        <div className="hero-in">
          {/* Copy */}
          <div className="hero-copy reveal">
            <span className="hero-pill"><span className="dot" />Plataforma todo en uno para vender en redes sociales</span>
            <h1>Vende de forma segura<br />desde <span className="grad-ink">TikTok, Instagram</span><br />y cualquier red social</h1>
            <p className="lead">Tokproof es la plataforma que necesitas para convertir tu tráfico en ventas reales, proteger tu negocio y profesionalizar tu marca. Sin riesgo de bloqueos. Sin fricciones. Sin complicaciones.</p>
            <ul className="hero-checks">
              {['Vende sin miedo a bloqueos en TikTok', 'Centraliza todos tus enlaces en un solo lugar', 'Crea páginas optimizadas que convierten', 'Aumenta la confianza y tus conversiones'].map(txt => (
                <li key={txt}><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>{txt}</li>
              ))}
            </ul>

            {isLoggedIn ? (
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/dashboard">
                  Ir al Dashboard
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </Link>
              </div>
            ) : (
              <form className="claim" onSubmit={handleClaimSubmit}>
                <span className="claim-mk"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                <span className="claim-host">tokproof.app/</span>
                <input
                  ref={claimInputRef}
                  className="claim-input"
                  type="text"
                  placeholder="tu-nombre"
                  value={claimVal}
                  onChange={e => setClaimVal(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button className="claim-btn" type="submit">Crear gratis</button>
              </form>
            )}

            <div className="claim-note">
              <span className="ck-mini"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>
              Gratis para siempre · sin tarjeta · listo en 2 minutos
            </div>

            <div className="hero-proof">
              <div className="hero-avs">
                {['linear-gradient(135deg,#FFD1B1,#FFB1E7)', 'linear-gradient(135deg,#B1D4FF,#C9A0FF)', 'linear-gradient(135deg,#FFB1C1,#FF9BE0)', 'linear-gradient(135deg,#C9F4D4,#A0E0FF)'].map((g, i) => (
                  <span key={i} style={{ background: g }} />
                ))}
              </div>
              <div>
                <div className="stars">★★★★★</div>
                <div className="ptxt"><b>+2.4K marcas</b> ya venden con Tokproof</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="hero-visual reveal">
            <div className="float-chip star" style={{ left: -10, top: '11%', ['--r' as string]: '-4deg' }}>
              <span className="ci"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.5 7 .6-5.3 4.6 1.7 6.8L12 17l-6.1 3.5 1.7-6.8L2 9.1l7-.6z"/></svg></span>
              4.9 <small>· 2.4K reseñas</small>
            </div>
            <div className="float-chip verify" style={{ left: -22, top: '45%', ['--r' as string]: '3deg', animationDelay: '-1.6s' }}>
              <span className="ci"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>
              Verificado
            </div>

            {/* Chat bubble */}
            <div className="chat-pop">
              <div className="cu">
                @glowskincare_lia
                <span className="dotv"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>
              </div>
              <div className="cmsg">
                {chatMsg}<span className="caret" />
              </div>
            </div>

            {/* Phone */}
            <div className="phone">
              <div className="pscreen">
                <div className="pstat"><span>9:41</span><span className="r"><svg width="14" height="10" viewBox="0 0 16 11" fill="#1a1a1a"><rect x="0" y="7" width="2.5" height="4" rx=".5"/><rect x="3.5" y="5" width="2.5" height="6" rx=".5"/><rect x="7" y="2.5" width="2.5" height="8.5" rx=".5"/><rect x="10.5" y="0" width="2.5" height="11" rx=".5"/></svg></span></div>
                <div className="phead"><span className="lg">G</span>GLOWLAB<span className="st">🔥 Trending</span></div>
                <div className="phero-img"><div className="jar" /></div>
                <div className="pbody">
                  <div className="ttl">Vitamin C <span className="ac">Face Serum</span></div>
                  <div className="prprice"><span className="now">$34.99</span><span className="was">$49.99</span><span className="off">-30%</span></div>
                  <div className="prmeta"><span className="st">★ 4.9</span> · 1,247 vendidos · <span className="vf"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>Oficial</span></div>
                  <div className="ds">El serum del que todo TikTok está hablando ✨</div>
                  <button className="pbuy">🧴 Ver producto oficial</button>
                  <button className="psecond"><span className="tk"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1v7a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3z"/></svg></span>Ver vídeo en TikTok</button>
                  <div className="pcomments-h">Comentarios <a href="#">Ver más</a></div>
                  <div className="pcomment"><div className="ca" /><div><div className="cn">@skincarebysofia</div><div className="ct">GLOWING en 3 días 😍 esto sí funciona</div></div><div className="hl"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>2.3k</div></div>
                </div>
              </div>
            </div>

            {/* Annotations */}
            <div className="hero-annot">
              <span className="annot-line" />
              {[
                { label: <><b>El cliente</b> hace clic en tu enlace</> },
                { label: <><b>Ve tu página</b> con tu marca y reseñas</> },
                { label: <><b>Abre tu tienda</b> y compra seguro</> },
              ].map((a, i) => (
                <div key={i} className={`annot${annotIndex === i ? ' on' : ''}`}>
                  <span className="n">{i + 1}</span>
                  <div className="atx">{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── LOGOS ── */}
      <section className="logos">
        <div className="logos-in">
          <div className="logos-lab">Únete a miles de marcas que ya venden en</div>
          <div className="logos-row">
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#010101"><path d="M16 3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1v7a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3z"/></svg>, name: 'TikTok' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#igGrad)" strokeWidth="2"><defs><linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FEDA75"/><stop offset=".35" stopColor="#FA7E1E"/><stop offset=".6" stopColor="#D62976"/><stop offset="1" stopColor="#962FBF"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="#D62976"/></svg>, name: 'Instagram' },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000"><path d="M23 7c-.3-1-1-1.8-2-2C19 4.5 12 4.5 12 4.5s-7 0-9 .5c-1 .2-1.7 1-2 2C.5 9 .5 12 .5 12s0 3 .5 5c.3 1 1 1.8 2 2 2 .5 9 .5 9 .5s7 0 9-.5c1-.2 1.7-1 2-2 .5-2 .5-5 .5-5s0-3-.5-5zM10 16V8l6 4-6 4z"/></svg>, name: 'YouTube' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2s-1.2.2-3.7-1c-2.9-1.5-4.7-4.6-4.8-4.8s-1-1.4-1-2.6.6-1.8.9-2.1.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7s.7 1.2 1.5 1.9c1 .9 1.8 1.2 2.1 1.3s.4.1.6-.1l.8-1c.2-.2.3-.2.6-.1l1.9.9c.3.1.5.2.5.4z"/></svg>, name: 'WhatsApp' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>, name: 'Facebook' },
            ].map(p => (
              <span key={p.name} className="logo-item">{p.icon}{p.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="wrap">
          <div className="kicker reveal">Mucho más que un exit guide</div>
          <h2 className="section-title reveal">Todo lo que necesitas para convertir<br />y crecer en redes sociales</h2>
          <div className="feat-grid">
            {[
              { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, title: 'Vende sin bloqueos', desc: 'Páginas intermedias que cumplen con las políticas de cada plataforma y protegen tu negocio.' },
              { icon: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></>, title: 'Multiplica tus canales', desc: 'Crea y gestiona todos tus enlaces en un solo lugar. Ideal para marcas con varios productos.' },
              { icon: <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/>, title: 'Más confianza, más ventas', desc: 'Muestra reseñas, beneficios, envíos, garantías y más para que compren con total seguridad.' },
              { icon: <><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></>, title: 'Experiencia rápida', desc: 'Cargas ultrarrápidas y diseño mobile first para que nadie abandone tu página.' },
              { icon: <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></>, title: '100% personalizable', desc: 'Editor visual intuitivo. Cambia textos, colores, secciones y más en segundos.' },
            ].map((f, i) => (
              <div key={i} className="feat reveal">
                <div className="fic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg></div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CENTRALIZA ── */}
      <section className="centralize" id="how">
        <div className="wrap">
          <div className="centralize-card reveal">
            <div className="cz-copy">
              <div className="kicker" style={{ textAlign: 'left' }}>Centraliza todo</div>
              <h2>Todos tus enlaces,<br />en <span className="ac">un solo lugar</span></h2>
              <p>Organiza colecciones, agrupa enlaces ilimitados y actualiza todo cuando quieras.</p>
              <ul className="cz-list">
                {['Enlaces ilimitados', 'Colecciones y organización', 'Estadísticas de clics', 'QR Codes personalizados', 'Integraciones con tus herramientas'].map(t => (
                  <li key={t}><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>{t}</li>
                ))}
              </ul>
            </div>

            <div className="cz-stage" ref={stageRef}>
              <div className="cz-phones">
                {/* Left phone */}
                <div className="cz-phone left"><div className="sc">
                  <div className="mini-stat">
                    <div className="ph">Estadísticas</div>
                    <div className="big">12.4K</div>
                    <div className="dl">+18.2% · vistas</div>
                    <div className="mini-kpis">
                      <div className="k"><div className="kl">CLICS</div><div className="kv">3.8K</div></div>
                      <div className="k"><div className="kl">CTR</div><div className="kv">30.6%</div></div>
                    </div>
                    <div className="mini-bars">
                      {[40,62,48,78,58,92,70].map((h,i) => <span key={i} style={{ height: `${h}%` }} />)}
                    </div>
                  </div>
                </div></div>
                {/* Center phone */}
                <div className="cz-phone center"><div className="sc">
                  <div className="lk-mini"><div className="ph">Mis enlaces</div></div>
                  <div className="lk-scrollwrap"><div className="lk-scroll">
                    {['Colección Verano','Productos virales','Productos envíos','WhatsApp','Soporte al cliente','Envíos y devoluciones','Colección Verano','Productos virales','Productos envíos','WhatsApp','Soporte al cliente','Envíos y devoluciones'].map((t,i) => (
                      <div key={i} className="lk-row">
                        <span className="li"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg></span>
                        {t}<span className="ch">›</span>
                      </div>
                    ))}
                  </div></div>
                  <div className="lk-add">+ Añadir enlace</div>
                </div></div>
                {/* Right phone */}
                <div className="cz-phone right"><div className="sc">
                  <div className="mini-edit-top">
                    <span style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--grad)', display: 'inline-block' }} />
                    Editor
                    <span className="dot3"><i/><i/><i/></span>
                  </div>
                  {[{ on: true, label: 'Producto' }, { on: false, label: 'Reseñas' }, { on: false, label: 'Botones' }].map(r => (
                    <div key={r.label} className={`mini-edit-row${r.on ? ' on' : ''}`}>
                      <span className="ei"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg></span>
                      {r.label}
                    </div>
                  ))}
                  <div className="mini-edit-prev"><div className="jar2" /></div>
                </div></div>
              </div>

              {/* Draggable bubbles */}
              {[
                { x: 14, y: 38, delay: '0s', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M16 3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1v7a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3z"/></svg> },
                { x: 20, y: 300, delay: '-1.6s', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F647A9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg> },
                { x: 330, y: 60, delay: '-.8s', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2.2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg> },
                { x: 340, y: 190, delay: '-2.4s', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="#E1306C"/></svg> },
                { x: 330, y: 320, delay: '-1.2s', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2z"/></svg> },
              ].map((b, i) => (
                <div key={i} className="bubble" style={{ left: b.x, top: b.y, animationDelay: b.delay }}>
                  <span className="ring" />
                  {b.icon}
                </div>
              ))}

              <div className="dragnote">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>
                Arrastra los iconos para reorganizar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIKTOK ── */}
      <section className="tiktok">
        <div className="tiktok-in">
          <div className="tk-visual reveal">
            <div className="aura purple" style={{ width: 300, height: 300, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
            <div className="float-chip verify" style={{ right: '2%', top: '14%', ['--r' as string]: '4deg' }}>
              <span className="ci"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>
              Sin bloqueos
            </div>
            <div className="tk-phone">
              <div className="tk-badge verify-blue">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <div className="sc exit" style={{ position: 'relative', overflow: 'hidden', height: 480 }}>
                <div className="eg-ghost">
                  <div className="g gav"/><div className="g gl"/><div className="g gl s"/>
                  <div className="g gc"/><div className="g gc"/><div className="g gc"/>
                </div>
                <div className="eg-dim"/>
                <div className="eg-top">
                  <span className="url">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zM9 9V6a3 3 0 1 1 6 0v3H9z"/></svg>
                    tokproof.app/@glowlab
                  </span>
                  <span className="eg-dots">
                    <span className="rng"/>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
                  </span>
                </div>
                <svg className="eg-arrow" viewBox="0 0 246 480" preserveAspectRatio="none">
                  <path d="M 120 300 C 200 250, 232 150, 226 18 l -12 18 l 12 -18 l 13 18"/>
                </svg>
                <div className="eg-pop">
                  <div className="eg-item">
                    <span className="ei"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
                    Copiar enlace
                  </div>
                  <div className="eg-item hl">
                    <span className="ei"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="#fff" fillOpacity=".25"/></svg></span>
                    Abrir en el navegador
                    <span className="eg-hand"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11V6a2 2 0 0 1 4 0v5"/><path d="M13 9a2 2 0 0 1 4 0v3"/><path d="M17 10a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-1l-3-3a2 2 0 0 1 3-3l2 2"/></svg></span>
                  </div>
                </div>
                <div className="eg-cap">
                  <div className="t1">Para abrir esta página</div>
                  <div className="t2">toca los ··· y elige<br /><span className="pill">Abrir en el navegador</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="tk-copy reveal">
            <div className="kicker" style={{ textAlign: 'left' }}>Especializado en TikTok</div>
            <h2>Optimizado para <span className="ac">TikTok</span>,<br />sin miedo a bloqueos</h2>
            <p>Cumplimos las políticas de TikTok para que puedas vender con tranquilidad. Páginas compatibles, menos riesgo de bloqueos y máximo rendimiento.</p>
            <ul className="tk-list">
              {['Páginas compatibles con las políticas de TikTok','Menos riesgo de bloqueos y restricciones','Mayor entregabilidad y confianza','Convierte visitas en clientes'].map(t => (
                <li key={t}><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── EDITOR ── */}
      <section className="editorsec">
        <div className="wrap">
          <div className="editorsec-card reveal">
            <div className="bg-grid" />
            <div className="es-copy">
              <div className="kicker" style={{ textAlign: 'left' }}>Diseña sin límites</div>
              <h2>Editor visual fácil<br />y <span className="ac">poderoso</span></h2>
              <p>Crea tu página perfecta con nuestro editor drag &amp; drop. Vista previa en tiempo real y optimización automática para móviles.</p>
              <ul className="es-list">
                {['Secciones personalizables','Vista previa mobile y desktop','Optimización automática','Publica con un clic'].map(t => (
                  <li key={t}><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>{t}</li>
                ))}
              </ul>
            </div>
            <div style={{ position: 'relative' }}>
              <div className="ed-win">
                <div className="ed-bar">
                  <div className="brand2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/tokproof-isotipo.png" alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain', borderRadius: 4, display: 'inline-block', verticalAlign: 'middle' }} />
                    &nbsp;Tokproof
                  </div>
                  <div className="crumb"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>Crema Hidratante Premium</div>
                  <div className="pub">+ Publicar cambios</div>
                </div>
                <div className="ed-body">
                  <div className="ed-side">
                    <div className="sh">Secciones</div>
                    {[
                      { label: 'General', on: true, icon: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></> },
                      { label: 'Branding', on: false, icon: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></> },
                      { label: 'Producto', on: false, icon: <><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></> },
                      { label: 'Reseñas', on: false, icon: <path d="M12 2l3 6.5 7 .6-5.3 4.6 1.7 6.8L12 17l-6.1 3.5 1.7-6.8L2 9.1l7-.6z"/> },
                      { label: 'TikTok Rescue', on: false, icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
                    ].map(s => (
                      <div key={s.label} className={`ed-sec${s.on ? ' on' : ''}`}>
                        <span className="si"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{s.icon}</svg></span>
                        {s.label}
                      </div>
                    ))}
                  </div>
                  <div className="ed-canvas">
                    <div className="ed-cursor"><svg width="16" height="16" viewBox="0 0 24 24" fill="#15101C"><path d="M4 2l16 8-7 2-2 7z"/></svg></div>
                    <div className="ed-phone"><div className="es">
                      <div className="phero-img" style={{ height: 120, margin: '10px 10px 0', borderRadius: 12 }}><div className="jar" style={{ width: 54, height: 62 }} /></div>
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>Crema <span style={{ color: 'var(--pink)' }}>Premium</span></div>
                        <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 3 }}>★ 4.9 · +2.4K reseñas</div>
                        <div style={{ marginTop: 9, background: 'var(--grad)', borderRadius: 9, padding: 8, textAlign: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>Comprar ahora</div>
                        <div style={{ marginTop: 6, background: '#F5F2FB', borderRadius: 8, padding: 7, textAlign: 'center', fontSize: 9, fontWeight: 600, color: '#6B7280' }}>Más información</div>
                      </div>
                    </div></div>
                  </div>
                </div>
              </div>
              <div className="es-scan"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M3 12h18"/></svg></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANALYTICS ── */}
      <section className="analytics" id="pricing">
        <div className="wrap">
          <div className="kicker reveal">Entiende. Optimiza. Crece</div>
          <h2 className="section-title reveal">Entiende tu crecimiento con claridad</h2>
          <p className="section-sub reveal">Toma decisiones basadas en datos y escala tu negocio con confianza.</p>

          <div className="an-shell reveal">
            <div className="an-grid">
              {/* Left panel */}
              <div className="an-panel">
                <div className="an-kpis">
                  <div className="an-kpi pink"><span className="ki"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></span><div><div className="kl">Vistas del perfil</div><div className="kv">1.2M</div></div></div>
                  <div className="an-kpi green"><span className="ki"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg></span><div><div className="kl">Clics en el link</div><div className="kv">14k</div></div></div>
                </div>
                <div className="an-sale">
                  <div className="pop">+1 venta</div>
                  <div className="sl">Nueva venta</div>
                  <div className="sv">{saleVal}</div>
                  <div className="sm"><span className="av"/>&nbsp;@avaTorres · Los Ángeles · Móvil</div>
                </div>
                <div className="map-wrap">
                  <div className="mapfield">
                    {MAP_DOTS_DATA.map((d, i) => (
                      <div key={i} className={`md${d.hot ? ' hot' : d.warm ? ' warm' : ''}`} style={{ left: `${d.x}%`, top: `${d.y}%` }} />
                    ))}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                    {PING_DOTS.map((d, i) => (
                      <div key={i} className={`map-dot${d.big ? ' big' : ''}${d.purple ? ' purple' : ''}`} style={{ left: `${d.x}%`, top: `${d.y}%`, ['--pd' as string]: d.pd }} />
                    ))}
                  </div>
                  <div className="rank">
                    <div className="rank-row"><span className="fl fl-us"/><span className="ct">1. EE. UU.</span><span className="vv">96k vistas</span></div>
                    <div className="rank-row"><span className="fl fl-uk"/><span className="ct">2. Reino Unido</span><span className="vv">41k vistas</span></div>
                    <div className="rank-row"><span className="fl fl-mx"/><span className="ct">3. México</span><span className="vv">23k vistas</span></div>
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="an-panel">
                <div className="an-row3">
                  <div className="an-mini"><div className="l">Ingresos netos</div><div className="v">$2.73M</div><div className="d pink">+15.6%</div></div>
                  <div className="an-mini"><div className="l">Tasa de conversión</div><div className="v">5.03%</div><div className="d green">+0.8 pts</div></div>
                  <div className="an-mini"><div className="l">Eficiencia</div><div className="v">4.68x</div><div className="d purple">+0.6x</div></div>
                </div>
                <div className="chart-box">
                  <div className="ct-top">
                    <div className="t">Resumen de rendimiento</div>
                    <div className="leg">
                      <span><span className="sw" style={{ background: '#7B61FF' }}/>Máximo</span>
                      <span><span className="sw" style={{ background: '#F647A9' }}/>Tendencia</span>
                    </div>
                  </div>
                  <svg className="line-svg" viewBox="0 0 460 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7B61FF"/><stop offset="1" stopColor="#FF4FD8"/></linearGradient>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9A0FF" stopOpacity=".5"/><stop offset="1" stopColor="#FFC7EC" stopOpacity="0"/></linearGradient>
                    </defs>
                    <path className="area-path" d={areaPath} />
                    <path className="line-path" d={linePath} />
                    <circle r="4.5" fill="#FF4FD8" stroke="#fff" strokeWidth="2" cx={lastPt[0]} cy={lastPt[1]} />
                  </svg>
                  <div className="xaxis">{['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO'].map(m => <span key={m}>{m}</span>)}</div>
                </div>
                <div className="an-bottom">
                  <div className="donut-box">
                    <div className="t">Balance de adquisición</div>
                    <div className="donut-flex">
                      <div className="donut" style={{ background: 'conic-gradient(#7B61FF 0% 34%, #FF4FD8 34% 60%, #FFB1E7 60% 78%, #C9A0FF 78% 100%)' }}>
                        <div className="hole">Orgánico<br />34%</div>
                      </div>
                      <div className="donut-leg">
                        {[['#7B61FF','Orgánico','34%'],['#FF4FD8','Pago','26%'],['#FFB1E7','Correo','18%'],['#C9A0FF','Directo','22%']].map(([c,l,p]) => (
                          <div key={l as string} className="lr"><span className="sw" style={{ background: c as string }}/>{l as string}<span className="pc">{p as string}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="aud-box">
                    <div className="t">Respuesta de la audiencia</div>
                    <div className="aud-bars">
                      {[['Guías',84],['Aperturas',67],['Compras',48]].map(([n,w]) => (
                        <div key={n as string} className="aud-bar">
                          <span className="bn">{n as string}</span>
                          <span className="track"><span className="fill" data-w={w} /></span>
                          <span className="pc">{w}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="an-foot">
              <div className="reveal"><h4>Estadísticas globales en tiempo real, gratis.</h4><p>Tokproof mantiene tu perfil disponible en todo el mundo. Todo funciona de forma estable y puedes ver con claridad de dónde viene tu actividad.</p></div>
              <div className="reveal"><h4>Visualización premium de estadísticas.</h4><p>Un panel de estadísticas en vivo que complementa tus métricas globales con una narrativa visual más sólida.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testi" id="recursos">
        <div className="wrap">
          <div className="kicker reveal">+2.4K marcas ya venden con Tokproof</div>
          <div className="testi-head reveal" style={{ marginTop: 14 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Resultados reales de creadores y marcas</h2>
            <div className="testi-nav">
              <button className="tnav" onClick={() => setTestiIndex(i => Math.max(0, i - 1))}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="tnav" onClick={() => setTestiIndex(i => i + 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>
          <div className="testi-track-wrap">
            <div className="testi-track" ref={testiTrackRef}>
              {[
                { q: '"Desde que usamos Tokproof nuestras conversiones desde TikTok aumentaron más de 40%. Impresionante."', nm: 'María Gómez', rl: '@glowlab', grad: 'linear-gradient(135deg,#FFD1B1,#FFB1E7)' },
                { q: '"Por fin una herramienta que entiende TikTok y me permite vender sin miedo a bloqueos."', nm: 'Javier Ruiz', rl: 'Fitness Pro', grad: 'linear-gradient(135deg,#B1D4FF,#C9A0FF)' },
                { q: '"Centralicé todos mis enlaces y ahora todo se ve más profesional y mis ventas se duplicaron."', nm: 'Laura Martínez', rl: 'Cozy Home', grad: 'linear-gradient(135deg,#FFB1C1,#FF9BE0)' },
                { q: '"La página de confianza eliminó las dudas de mis clientes. Las ventas subieron sin gastar más en ads."', nm: 'Diego Salas', rl: 'TechDrop', grad: 'linear-gradient(135deg,#C9F4D4,#A0E0FF)' },
                { q: '"Configurarlo me tomó 10 minutos. Ahora mi link in bio convierte como una tienda real."', nm: 'Carla Vega', rl: 'Beauty Studio', grad: 'linear-gradient(135deg,#FFD1B1,#FFB1E7)' },
              ].map((t, i) => (
                <div key={i} className="testi-card">
                  <div className="stars">★★★★★</div>
                  <div className="quote">{t.q}</div>
                  <div className="who">
                    <div className="av" style={{ background: t.grad }} />
                    <div><div className="nm">{t.nm}</div><div className="rl">{t.rl}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CREATORS ── */}
      <section className="creators">
        <div className="wrap">
          <div className="kicker reveal">La comunidad Tokproof</div>
          <h2 className="section-title reveal">Creadores y marcas que ya crecen con su link</h2>
          <p className="section-sub reveal">Miles de perfiles comparten todos sus enlaces y venden de forma segura cada día.</p>
        </div>
        <div className="cr-track-wrap">
          <div className="cr-track">
            {[...CREATOR_DATA, ...CREATOR_DATA].map((c, i) => (
              <div key={i} className="cr-card">
                <div className="cr-photo" style={{ background: c.grad }}>
                  <div className="cr-tag">{c.tag}</div>
                </div>
                <div className="cr-body">
                  <div className="cr-name">
                    {c.name}
                    <span className="vf"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>
                  </div>
                  <div className="cr-handle">{c.handle}</div>
                  <div className="cr-foll">{c.foll}</div>
                  <div className="cr-niche">{c.niche}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final">
        <div className="wrap">
          <div className="final-card reveal">
            <div className="bg-grid" />
            <div className="aura pink" style={{ width: 280, height: 280, left: -30, top: -40 }} />
            <div className="aura purple" style={{ width: 300, height: 300, right: -40, bottom: -60 }} />
            <div className="float-chip star" style={{ top: 16, right: '30%', ['--r' as string]: '-5deg' }}>
              <span className="ci"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.5 7 .6-5.3 4.6 1.7 6.8L12 17l-6.1 3.5 1.7-6.8L2 9.1l7-.6z"/></svg></span>
              +2.4K marcas
            </div>
            <h2>Crea tu perfil.<br />Comparte tu link.<br />Empieza <span className="ac">a vender.</span></h2>
            <div className="final-actions">
              <div className="row">
                {isLoggedIn ? (
                  <Link className="btn btn-primary" href="/dashboard">
                    Ir al Dashboard
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </Link>
                ) : (
                  <>
                    <Link className="btn btn-primary" href="/signup">
                      Comenzar gratis ahora
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </Link>
                    <Link className="btn btn-white" href="/login">
                      <span className="play"><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>
                      Iniciar sesión
                    </Link>
                  </>
                )}
              </div>
              <div className="note">No necesitas tarjeta de crédito</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-in">
          <div>
            <Link className="brand" href="/">
              <span className="mk">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/tokproof-isotipo.png" alt="Tokproof" width={22} height={22} style={{ width: 22, height: 22, objectFit: 'contain', display: 'block' }} />
              </span>
              Tokproof
            </Link>
            <p className="fdesc">La plataforma todo en uno para vender de forma segura en redes sociales y hacer crecer tu negocio.</p>
            <div className="fsoc">
              <a href="#"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1v7a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3z"/></svg></a>
              <a href="#"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor"/></svg></a>
            </div>
          </div>
          <div className="fcol"><h5>Producto</h5><a href="#">Funciones</a><a href="#">Integraciones</a><a href="#">Precios</a><a href="#">Novedades</a></div>
          <div className="fcol"><h5>Recursos</h5><a href="#">Guías</a><a href="#">Blog</a><a href="#">Centro de ayuda</a><a href="#">Comunidad</a></div>
          <div className="fcol"><h5>Empresa</h5><a href="#">Nosotros</a><a href="#">Contacto</a><Link href="/terms">Términos</Link><Link href="/privacy">Privacidad</Link></div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Tokproof. Todos los derechos reservados.</span>
          <span>Hecho con ❤️ para creadores y marcas</span>
        </div>
      </footer>

    </div>
  )
}
