type ToastType = 'success' | 'error' | 'info'

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
}

function getWrap(): HTMLDivElement {
  let wrap = document.getElementById('tp-toast-root') as HTMLDivElement | null
  if (!wrap) {
    wrap = document.createElement('div')
    wrap.id = 'tp-toast-root'
    wrap.className = 'tp-toast-wrap'
    document.body.appendChild(wrap)
  }
  return wrap
}

export function toast(msg: string, type: ToastType = 'success', ms = 2500) {
  if (typeof document === 'undefined') return
  const wrap = getWrap()
  const el = document.createElement('div')
  el.className = `tp-toast tp-toast-${type}`
  el.innerHTML = `<div class="tp-toast-ico">${ICONS[type]}</div><div class="tp-toast-msg">${msg}</div>`
  wrap.appendChild(el)

  setTimeout(() => {
    if (!el.parentElement) return
    el.classList.add('is-exiting')
    el.addEventListener('animationend', () => el.remove(), { once: true })
    setTimeout(() => el.remove(), 350)
  }, ms)
}

export function confettiOnce(key: string) {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
  } catch {
    return
  }
  launchConfetti()
}

function launchConfetti() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;top:0;left:0;pointer-events:none;z-index:99999;width:100vw;height:100vh'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) { canvas.remove(); return }

  const COLORS = ['#F647A9', '#7B61FF', '#ffffff', '#10B981', '#FBBF24', '#60A5FA']

  type Particle = {
    x: number; y: number; vx: number; vy: number
    color: string; w: number; h: number
    rot: number; rotV: number; alpha: number
  }

  const particles: Particle[] = Array.from({ length: 55 }, () => ({
    x: Math.random() * canvas.width,
    y: -12,
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 3.5 + 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: Math.random() * 7 + 4,
    h: Math.random() * 5 + 3,
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.18,
    alpha: 1,
  }))

  const start = performance.now()
  const duration = 2200

  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1)
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.09
      p.rot += p.rotV
      p.alpha = Math.max(0, 1 - t * 1.5)

      if (p.alpha > 0.01) {
        alive = true
        ctx!.save()
        ctx!.globalAlpha = p.alpha
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rot)
        ctx!.fillStyle = p.color
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx!.restore()
      }
    }

    if (alive) requestAnimationFrame(frame)
    else canvas.remove()
  }

  requestAnimationFrame(frame)
}
