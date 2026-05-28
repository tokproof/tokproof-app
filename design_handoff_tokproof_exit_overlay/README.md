# Handoff: Tokproof — TikTok Exit Guide Overlay

## Overview
**Animación overlay** que Tokproof inyecta encima del navegador interno de TikTok cuando detecta que un visitante llegó a una trust page desde TikTok. Su único propósito: enseñar visualmente al usuario que tiene que tocar los **⋯ (tres puntos)** arriba a la derecha y elegir **"Abrir en el navegador"** para escapar del WebView de TikTok y aterrizar en Safari/Chrome — donde las conversiones funcionan.

La animación no toca la UI de TikTok (que está fuera del WebView). Solo dibuja **encima del contenido propio de la trust page**: una flecha curva que apunta arriba, un círculo con ⋯, un pequeño popup mostrando la opción de menú con un cursor de mano haciendo click, y un caption explicativo.

## About the Design Files
`Tokproof Exit Guide Overlay.html` es una **referencia de diseño** — el HTML/CSS muestra exactamente cómo debe verse y animarse el overlay, no es código para shippear.

Tu trabajo es **recrear este overlay en el SDK/JS embebido de Tokproof** (probablemente un script que se inyecta en cada trust page y solo se activa cuando `navigator.userAgent` matchea TikTok). Implementación sugerida: un componente Web vanilla (Custom Element o un `<div>` montado al `<body>`) sin dependencias, con CSS inline. Debe pesar poco (<10KB minified).

## Fidelity
**High-fidelity (hifi)**. Colores, timing de animaciones, easings, posiciones, tamaños y copy son finales. Recrear pixel-perfect.

---

## Design Tokens

### Colores
```css
--pink: #FF4FD8;
--purple: #7B61FF;
--grad: linear-gradient(135deg, #FF4FD8 0%, #7B61FF 100%);
--grad-soft: linear-gradient(135deg, rgba(255,79,216,.22), rgba(123,97,255,.22));

/* Overlay dim */
--dim-bg: rgba(8, 4, 18, 0.35);  /* + backdrop-filter: blur(2px) */

/* Popup */
--popup-bg: rgba(28, 22, 42, 0.96);  /* + backdrop-filter: blur(16px) */
--popup-border: rgba(255, 255, 255, 0.08);
--popup-hl-bg: linear-gradient(90deg, rgba(255,79,216,.22), rgba(123,97,255,.22));
--popup-hl-stripe: linear-gradient(180deg, #FF4FD8, #7B61FF);

/* Text */
--text-primary: #fff;
--text-secondary: rgba(255,255,255,.78);
--text-tertiary: rgba(255,255,255,.5);
```

### Sombras y glows
```css
--glow-arrow: drop-shadow(0 0 6px rgba(255,79,216,.55));   /* sobre la flecha */
--glow-cursor: 0 12px 40px rgba(255,79,216,.45), 0 0 0 8px rgba(255,255,255,.08);
--glow-popup: 0 20px 50px rgba(0,0,0,.5);
--glow-hand:  drop-shadow(0 4px 12px rgba(255,79,216,.7));
```

### Tipografía
- Familia: **Inter** (400, 500, 600, 700)
- Caption título: **19px / 700** · `letter-spacing: -0.02em`
- Caption body: **14px / 400** · `line-height: 1.55`
- Popup item: **12px / 500**
- Popup pill highlight: **12px / 600**

### Radios
- Canvas / contenedor del overlay: `44px` (igual que el screen radius del iPhone)
- Popup: `14px`
- Popup items: `0` (inherit del contenedor)
- Pills internas (caption "Abrir en el navegador"): `999px`
- Cursor circle: `50%`

---

## Layout (viewport-relative)

El overlay cubre **toda la pantalla del WebView** (`position: fixed; inset: 0;`). Dentro de él, los elementos se posicionan en coordenadas **proporcionales** al viewport. El HTML de referencia usa un canvas fijo de 360×740 — adaptar a viewport real:

| Elemento | Posición (referencia 360×740) | Equivalente responsive |
|---|---|---|
| Cursor circle (⋯) | `top: 460px` · `left: 50%` · `translateX(-50%)` | ~62% de la altura del viewport |
| Popup menu | `top: 514px` · centrado horizontalmente | justo debajo del cursor, gap 8px |
| Caption | `top: 620px` · centrado | bajo el popup, gap 32px |
| Flecha (SVG path) | curva desde (195, 500) hasta (325, 14) | desde el cursor hasta arriba-derecha donde estaría el ⋯ de TikTok |

---

## Components

### 1. Dim background
- `position: fixed; inset: 0;`
- `background: rgba(8, 4, 18, 0.35);`
- `backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);`
- z-index alto (e.g. 9998)

### 2. Curved arrow (SVG)
- Un único `<path>` con el trazo Y la punta de flecha en **un solo stroke continuo**
- `d="M 195 500 C 290 450, 330 240, 325 14 l -16 22 l 16 -22 l 14 22"` (escalar al viewport)
- Stroke: `#fff`, `width: 2.4`, `linecap: round`, `linejoin: round`
- Filter: `drop-shadow(0 0 6px rgba(255,79,216,.55))`
- Animación de dibujo: `stroke-dasharray: 600; stroke-dashoffset: 600 → 0` durante el 0%→62% del loop
- El retrace por la pata izquierda de la flecha es invisible gracias a `linecap: round`

### 3. Cursor circle (los ⋯)
- 70×70px, `border-radius: 50%`, fondo blanco
- Contenido: 3 puntos negros centrados (24×24 SVG, `currentColor` = `#0E0B17`)
- Box-shadow doble: glow rosa + halo blanco translúcido (ver tokens)
- Aparece desde abajo con fade-in + scale-up

### 4. Popup menu
- 178px ancho, fondo `rgba(28,22,42,.96)` + blur 16px
- Border `1px rgba(255,255,255,.08)` + radius 14px
- Pequeña **flecha apuntando hacia arriba** (pseudo-elemento ::before, 10×10 rotado 45°)
- Contiene 2 items:

#### Item 1 — "Copiar enlace" (gris)
- Icono outline: copy/clipboard (13×13)
- Color: `rgba(255,255,255,.78)`
- Borde inferior `1px rgba(255,255,255,.05)`
- Padding: `10px 12px`

#### Item 2 — "Abrir en el navegador" (highlight)
- Fondo gradient suave rosa→púrpura
- **Stripe vertical izquierdo 2px** con gradiente full
- Icono: **brújula tipo TikTok** (círculo + rombo interior de color blanco):
  ```svg
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="currentColor" fill-opacity=".2"/>
  </svg>
  ```
- Texto y icono en **blanco puro**
- Encima del icono va la **mano-cursor animada** (ver siguiente sección)

### 5. Hand-tap cursor (la mano que hace click)
- `position: absolute; top: 14px; left: 28px;` (encima del icono de brújula)
- 16×16 icono SVG outline de mano apuntando:
  ```svg
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 11V6a2 2 0 0 1 4 0v5"/>
    <path d="M13 9a2 2 0 0 1 4 0v3"/>
    <path d="M17 10a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-1l-3-3a2 2 0 0 1 3-3l2 2"/>
  </svg>
  ```
- Color: blanco con `drop-shadow(0 4px 12px rgba(255,79,216,.7))`
- `transform-origin: 30% 0%;`

**Animación `tapHand`** (2.4s loop infinito, easing `cubic-bezier(.5,.1,.2,1)`):
| % | opacity | transform | nota |
|---|---|---|---|
| 0%   | 0   | `translate(28px, 36px) scale(.3)` | aparece pequeña abajo-derecha |
| 18%  | 1   | `translate(20px, 26px) scale(.55)` | crece subiendo |
| 52%  | 1   | `translate(0, 0) scale(1)`         | llega al icono |
| 62%  | 1   | `translate(-2px, -2px) scale(1.12)`| lift antes del click |
| 72%  | 1   | `translate(2px, 4px) scale(.88)`   | press del click |
| 82%  | 1   | `translate(0, 0) scale(1)`         | settle |
| 100% | 0   | `translate(0, 0) scale(1)`         | fade out |

**Ripple `tapRing`** (mismo loop 2.4s, pseudo-elemento `::after` de la mano):
- 14×14, círculo blanco con border 2px, posición `left:8px top:10px` relativa a la mano
- 0%–68%: invisible, `scale(.3)`
- 72%: `opacity:.9 scale(.5)`
- 84%: `opacity:0 scale(2.4)`

### 6. Caption
```html
<div class="caption">
  <div class="t1">Para abrir esta página</div>
  <div class="t2">
    toca los <span class="dots"><i></i><i></i><i></i></span> y elige<br>
    <span class="pill">Abrir en el navegador</span>
  </div>
</div>
```
- Título: `font-size: 19px; font-weight: 700; color: #fff;`
- Body: `font-size: 14px; color: rgba(255,255,255,.78); line-height: 1.55;`
- Pill "tres puntos": fondo `rgba(255,255,255,.08)`, border `1px rgba(255,255,255,.12)`, radius 999, 3 puntitos blancos de 3×3
- Pill "Abrir en el navegador": fondo `--grad-soft`, border `1px rgba(255,79,216,.35)`, radius 999

---

## Animation Timeline (loop principal: 6.5s)

| Tiempo | Evento |
|---|---|
| 0% – 6% | Estado inicial: cursor invisible, popup oculto, flecha sin dibujar, caption oculta |
| 6% – 14% | Cursor circle fade-in con scale-up |
| 8% – 14% | Flecha empieza a dibujarse |
| 14% – 62% | Flecha completa su trazado hasta llegar arriba (incluye la punta) |
| 18% – 26% | Popup menu scale-in (cubic-bezier .5,.1,.2,1) |
| 18% – 84% | Caption visible |
| 26% – 80% | Popup totalmente visible · mano cursor cicla (2.4s loop independiente) |
| 80% – 90% | Fade out de cursor, popup, flecha, caption |
| 90% – 100% | Estado de reposo (todo oculto) — preparar reinicio |

Easings recomendados:
- Flecha: `cubic-bezier(.6, .05, .2, 1)` (start lento, mid rápido, end suave)
- Popup: `cubic-bezier(.5, .1, .2, 1)` (overshoot sutil)
- Mano: `cubic-bezier(.5, .1, .2, 1)`
- Cursor circle: `cubic-bezier(.55, .05, .25, 1)`

---

## Interactions & Behavior

- **El overlay NO bloquea clicks** del usuario sobre el contenido subyacente (`pointer-events: none` en todos los elementos, excepto el caption si quieres añadir un botón "Entendido")
- Detección de TikTok WebView:
  ```js
  const isTikTok = /(?:TikTok|musical_ly|Bytedance|Bytelocale)/i.test(navigator.userAgent);
  ```
- Mostrar overlay solo si `isTikTok === true` y no se ha dismisseado en la sesión:
  ```js
  if (isTikTok && !sessionStorage.getItem('tkp_overlay_dismissed')) {
    mount();
  }
  ```
- Opcional: añadir botón sutil "x Entendido" abajo del caption para dismiss permanente en la sesión

## Files
- `Tokproof Exit Guide Overlay.html` — referencia visual completa, autocontenida (HTML + CSS, sin JS necesario para la animación)

## Notas para Claude Code

1. **Empaqueta como JS único**: el SDK de Tokproof debería ser un solo archivo `tokproof-overlay.js` que se inyecta con `<script async src="https://cdn.tokproof.app/overlay.js" data-id="...">`.
2. **No usar React/frameworks** dentro del overlay — vanilla JS + un template HTML inyectado al `<body>`.
3. **Lazy fonts**: cargar Inter solo si no está ya disponible. Fallback a `system-ui` para mantener performance.
4. **Z-index**: usar `2147483646` (uno menos que el máximo) para que el overlay quede sobre cualquier contenido pero permita que un eventual debugger encima funcione.
5. **Reduced motion**: respetar `@media (prefers-reduced-motion: reduce)` — mostrar el cursor + popup + flecha en estado final estático sin animaciones.
6. **Internacionalización**: el copy "Para abrir esta página / toca los ... y elige Abrir en el navegador" debe ser configurable por locale (al menos ES / EN / PT).
