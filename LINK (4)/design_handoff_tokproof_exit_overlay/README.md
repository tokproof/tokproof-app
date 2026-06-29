# Handoff: Tokproof — TikTok Exit Guide Overlay (v2 — composición corregida)

## Qué cambió respecto a tu implementación actual
Tu versión en producción tenía el contenido pegado abajo y el texto se solapaba con los botones (ver screenshot que mandó el cliente). Esta v2 corrige composición, timing y UX. **No cambia colores, branding ni la lógica del flow** — solo layout, velocidad y jerarquía.

### Checklist de correcciones a aplicar en Claude Code
1. **Centrar el bloque verticalmente.** Sustituir los offsets fijos (`top: 460px`, `top: 514px`, `top: 620px`, etc.) por **un contenedor flex centrado**:
   ```css
   .stack {
     position: absolute; inset: 0;
     display: flex; flex-direction: column;
     align-items: center; justify-content: center;
     padding: 0 28px;
   }
   ```
   Todos los elementos (cursor, popup, caption, divider, botón) van como hijos en orden. Adiós solapamientos.

2. **Flecha casi instantánea.** El trazo debe verse a los ~0.2–0.3s y completarse a ~1.3s. Keyframe:
   ```css
   @keyframes drawArrow {
     0%   { stroke-dashoffset: 600; opacity: 0; }
     4%   { opacity: 1; }
     26%  { stroke-dashoffset: 0; opacity: 1; }
     86%  { stroke-dashoffset: 0; opacity: 1; }
     94%,100% { stroke-dashoffset: 0; opacity: 0; }
   }
   ```
   con `--LOOP: 5s` y easing `cubic-bezier(.5,0,.2,1)`.

3. **ELIMINAR** por completo el botón `"Ya estoy en el navegador"` (el CTA grande gradient de abajo). No va.

4. **"Copiar enlace" → secundario y pequeño.** Ya NO es CTA. Pill sutil:
   ```css
   .copy-btn {
     display: inline-flex; align-items: center; gap: 7px;
     padding: 9px 16px;
     background: rgba(255,255,255,.05);
     border: 1px solid rgba(255,255,255,.12);
     border-radius: 999px;
     color: rgba(255,255,255,.72);
     font-size: 13px; font-weight: 500;
   }
   .copy-btn:hover { background: rgba(255,255,255,.1); color: #fff; }
   ```

5. **Separador "o"** entre las instrucciones y el botón copiar:
   ```css
   .divider {
     display: flex; align-items: center; gap: 12px;
     width: 150px; margin-top: 30px;
     color: rgba(255,255,255,.42); font-size: 12px; font-weight: 500;
   }
   .divider::before, .divider::after { content:""; flex:1; height:1px; background: rgba(255,255,255,.14); }
   ```
   ```html
   <div class="divider">o</div>
   ```

6. **Spacing premium.** Gaps verticales: cursor → popup `14px` · popup → caption `34px` · caption → divider `30px` · divider → botón `22px`.

7. **Pantalla de redirección ultra rápida** (ver sección dedicada abajo).

---

## Orden de los elementos dentro de `.stack`
1. `.cursor` — círculo blanco 68×68 con los ⋯ (loop: aparece/desaparece)
2. `.popup` — menú (188px) con "Copiar enlace" + "Abrir en el navegador" (highlight)
3. `.caption` — "Para abrir esta página" + "toca los ⋯ y elige [Abrir en el navegador]" (**siempre visible**, no entra en el loop)
4. `.divider` — "o"
5. `.copy-btn` — botón secundario minimal

> La caption, el divider y el botón copiar son **persistentes** (siempre legibles). Solo el cursor + popup + flecha + mano forman el loop de demostración. Esto refuerza el "entender en <1s".

---

## Design Tokens (sin cambios)
```css
--pink: #FF4FD8;
--purple: #7B61FF;
--grad: linear-gradient(135deg, #FF4FD8 0%, #7B61FF 100%);
--grad-soft: linear-gradient(135deg, rgba(255,79,216,.22), rgba(123,97,255,.22));
--LOOP: 5s;

--dim-bg: rgba(8,4,18,.40);          /* + backdrop-filter: blur(2px) */
--popup-bg: rgba(28,22,42,.96);      /* + backdrop-filter: blur(16px) */
--popup-border: rgba(255,255,255,.08);
--popup-hl-bg: linear-gradient(90deg, rgba(255,79,216,.22), rgba(123,97,255,.22));
--popup-hl-stripe: linear-gradient(180deg, #FF4FD8, #7B61FF);
```

### Tipografía (Inter)
- Caption título: **20px / 700**, `letter-spacing: -0.02em`
- Caption body: **14px / 400**, `line-height: 1.6`
- Popup item: **12.5px / 500**
- Botón copiar / divider: **13px / 12px**

### Glows
```css
--glow-arrow:  drop-shadow(0 0 6px rgba(255,79,216,.55));
--glow-cursor: 0 12px 40px rgba(255,79,216,.45), 0 0 0 8px rgba(255,255,255,.08);
--glow-popup:  0 20px 50px rgba(0,0,0,.5);
--glow-hand:   drop-shadow(0 4px 12px rgba(255,79,216,.7));
```

---

## Componentes clave (markup + detalle)

### Flecha (SVG, un solo trazo con punta incluida)
```html
<svg class="arrow" viewBox="0 0 360 740" preserveAspectRatio="none">
  <path class="line" d="M 220 300 C 300 250, 332 150, 325 14 l -15 21 l 15 -21 l 14 21" />
</svg>
```
- Stroke `#fff`, `width: 2.4`, `linecap/linejoin: round`, `drop-shadow` rosa.
- `stroke-dasharray: 600; stroke-dashoffset: 600 → 0`. La punta es parte del mismo path (retrace invisible gracias a `linecap: round`).

### Icono "Abrir en el navegador" (brújula tipo TikTok, blanca)
```svg
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="currentColor" fill-opacity=".2"/>
</svg>
```

### Mano que hace click (pequeña → grande → tap)
```css
.tap-hand { position:absolute; top:14px; left:30px; color:#fff;
  filter: drop-shadow(0 4px 12px rgba(255,79,216,.7));
  transform-origin: 30% 0%;
  animation: tapHand 2.2s cubic-bezier(.5,.1,.2,1) infinite; }
@keyframes tapHand {
  0%   { opacity:0; transform: translate(28px,34px) scale(.3); }
  18%  { opacity:1; transform: translate(20px,24px) scale(.55); }
  52%  { opacity:1; transform: translate(0,0) scale(1); }
  62%  { opacity:1; transform: translate(-2px,-2px) scale(1.12); } /* lift */
  72%  { opacity:1; transform: translate(2px,4px) scale(.88); }    /* press */
  82%  { opacity:1; transform: translate(0,0) scale(1); }
  100% { opacity:0; transform: translate(0,0) scale(1); }
}
/* ripple en el impacto: pseudo ::after, 2.2s, scale .3→2.4 a partir del 68% */
```
SVG mano:
```svg
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 11V6a2 2 0 0 1 4 0v5"/><path d="M13 9a2 2 0 0 1 4 0v3"/>
  <path d="M17 10a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-1l-3-3a2 2 0 0 1 3-3l2 2"/>
</svg>
```

---

## Timeline del loop (5s)
| % (tiempo) | Evento |
|---|---|
| 0–2% | reposo (cursor/popup/flecha ocultos) |
| 4% (~0.2s) | flecha empieza a verse |
| 8% | cursor circle fade-in |
| 10–18% | popup scale-in |
| 26% (~1.3s) | flecha totalmente dibujada |
| (loop 2.2s aparte) | mano sube, crece y hace click + ripple |
| 86% | todo se mantiene |
| 94–100% | fade-out de la demo y reinicio |

Caption + divider + botón copiar = **siempre visibles**, no entran en el loop.

Easings:
- Flecha: `cubic-bezier(.5, 0, .2, 1)`
- Popup: `cubic-bezier(.5, .1, .2, 1)`
- Mano: `cubic-bezier(.5, .1, .2, 1)`
- Cursor: `cubic-bezier(.55, .05, .25, 1)`

---

## Pantalla de redirección ("Abriendo producto oficial…") — ULTRA RÁPIDA

El cliente quiere reducirla al mínimo. Recomendación de implementación:

1. **Dispara la redirección inmediatamente**, no esperes al spinner:
   ```js
   // En cuanto carga la pantalla de redirect:
   const dest = getDestinationUrl();
   // intento inmediato
   window.location.replace(dest);
   ```
2. **Sin spinner largo.** Mostrar solo un fade de ~300ms del logo + "Abriendo producto oficial…". El spinner circular **solo debe aparecer como fallback si pasan >800ms** sin que la navegación ocurra:
   ```js
   const t = setTimeout(() => { showSpinner(); showManualLink(); }, 800);
   window.addEventListener('pagehide', () => clearTimeout(t));
   ```
3. **Fade de entrada 300ms** (no más):
   ```css
   .redirect-screen { animation: fadeIn .3s ease both; }
   @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
   ```
4. Mantén el link manual de rescate **"¿No redirige? Toca aquí"** pero oculto hasta el fallback de 800ms (que no aparezca de entrada para no transmitir lentitud).
5. Si el destino es una app con deep-link (Shopify, etc.), intenta el deep-link y cae a la web tras 1.2s.

Objetivo: que el usuario perciba la redirección como **instantánea**. La pantalla de redirect es un "por si acaso", no un paso obligatorio visible.

---

## Reglas de implementación (SDK)
- **Vanilla JS**, sin frameworks. Inyecta el overlay al `<body>` como un único `tokproof-overlay.js` (<10KB min).
- Detección TikTok WebView:
  ```js
  const isTikTok = /(?:TikTok|musical_ly|Bytedance|Bytelocale)/i.test(navigator.userAgent);
  if (isTikTok && !sessionStorage.getItem('tkp_dismissed')) mount();
  ```
- `z-index: 2147483646`. El overlay **no bloquea** el contenido (`pointer-events:none` salvo en el botón copiar).
- `prefers-reduced-motion: reduce` → mostrar estado final estático (cursor + popup + flecha dibujada) sin animar.
- Copy i18n configurable (ES / EN / PT).
- Cargar Inter solo si no está; fallback `system-ui`.

## Files
- `Tokproof Exit Guide Overlay.html` — referencia visual v2 (HTML + CSS autocontenido, sin JS para la animación).

---

## Prompt sugerido para Claude Code
> Lee `design_handoff_tokproof_exit_overlay/README.md`. Aplica las 7 correcciones del checklist a mi overlay actual del Exit Guide: centrar el bloque con flex en vez de offsets fijos, acelerar la flecha (~0.2s delay), eliminar el botón "Ya estoy en el navegador", convertir "Copiar enlace" en botón secundario pequeño, añadir el separador "o", mejorar spacing, y optimizar la pantalla de redirección para que sea casi instantánea (sin spinner salvo fallback >800ms). El HTML adjunto es la referencia visual exacta. No cambies colores, branding ni la lógica del flow.
