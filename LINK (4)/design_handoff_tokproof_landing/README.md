# Handoff: Tokproof — Landing Page

## Overview
Landing de marketing de **Tokproof**, la plataforma all-in-one para vender de forma segura desde TikTok, Instagram y cualquier red social (trust pages + link in bio + analytics + TikTok Exit Guide). Es una landing larga, mobile-first, con **varias animaciones tipo "video"** que son el alma de la página.

## About the Design Files
Los 5 archivos adjuntos son la **referencia de diseño funcional** (HTML + 2 CSS + 2 JS, todo vanilla, autocontenido). Sirven como spec visual EXACTA y como código de partida.

Puedes ir por dos caminos según el proyecto destino:
- **Si el repo es vanilla / Astro / static**: puedes portar el HTML/CSS/JS casi tal cual (recomendado para fidelidad máxima — las animaciones ya están afinadas).
- **Si el repo es Next.js/React + Tailwind**: recrea sección por sección como componentes, conservando tokens, timings y la lógica JS de las animaciones (descrita abajo). Stack recomendado: **Next.js 14 + Tailwind + lucide-react + Framer Motion** (Framer encaja para reveals y los loops).

## Fidelity
**High-fidelity.** Colores, tipografía, spacing, radios, sombras, copy y **todos los timings de animación** son finales. Reprodúcelos.

---

## Files (orden de carga)
```
Tokproof Landing.html      ← markup de todas las secciones
landing.css                ← base: tokens, nav, hero, features, centralize, tiktok, analytics, testimonios, CTA, footer, responsive
landing2.css               ← v2: logos en color, hero phone enriquecido, chat, anotaciones, mockups stats/editor, Exit Guide, mapa, sección editor, creadores
landing.js                 ← reveals (rect-based, NO IntersectionObserver), drag de burbujas, carrusel testimonios, las 2 animaciones del dashboard de analytics
landing2.js                ← chat typing, ciclo de anotaciones, editor auto-click, mapa de puntos, carrusel infinito de creadores
```
> ⚠️ **No usar IntersectionObserver para los reveals.** El proyecto usa un check basado en `getBoundingClientRect()` en scroll/resize/load + un fallback `setTimeout` que fuerza visibilidad a los 2.6s. Mantén ese patrón: IO resultó poco fiable en algunos entornos de preview y dejaba el contenido invisible. Igual para los counters/donut: llevan **fallback `setTimeout`** que fija el estado final por si `requestAnimationFrame` va throttled.

---

## Design Tokens
```css
--bg:#FFFFFF;  --bg-soft:#FBF7FC;
--ink:#15101C;  --ink-2:#6B6577;  --ink-3:#9A93A6;
--pink:#F647A9;     /* rosa fuerte: acentos, activos */
--pink-2:#FF4FD8;   /* rosa del gradiente */
--purple:#7B61FF;
--green:#1AA960;
--grad:linear-gradient(120deg,#FF4FD8 0%, #9B5CFF 100%);
--grad-text:linear-gradient(120deg,#FF2FB8 0%, #7B61FF 100%);  /* para texto con background-clip */
--pink-wash:linear-gradient(180deg,#FDEFF8 0%,#F6ECFD 100%);   /* fondos de cards grandes */
--pink-wash-2:linear-gradient(135deg,#FCE6F4 0%,#EFE6FD 100%);
--border:rgba(123,97,255,0.10);  --border-2:rgba(123,97,255,0.16);
--soft-pink:#FFEFF9;  --soft-purple:#F2ECFF;
--shadow-card:0 10px 34px rgba(123,97,255,.07);
--shadow-pop:0 22px 60px -16px rgba(60,30,90,.22);
--shadow-btn:0 12px 28px rgba(255,79,216,.26);
--maxw:1120px;  --r:24px;
```
- Fuente: **Inter** (400–800), `letter-spacing:-0.011em` global.
- **Verificado azul** (insignias): `#1E73FF` con check blanco. Redondo.
- Color de marca en logos: TikTok `#010101`, Instagram gradiente (`#FEDA75→#FA7E1E→#D62976→#962FBF`), YouTube `#FF0000`, WhatsApp `#25D366`, Facebook `#1877F2`, X `#010101`.

---

## Secciones (en orden) y comportamiento

### 1. Nav (sticky, blur)
Brand + links (Producto, Beneficios, Cómo funciona, Precios, Recursos) + "Iniciar sesión" + CTA gradiente "Comenzar gratis".

### 2. Hero
- Izquierda: pill, H1 con "TikTok, Instagram" en gradiente, lead, 4 checks, 2 botones (primario gradiente + "Ver demo" blanco con play), social proof (avatares + ★ + "+2.4K marcas").
- Derecha: **mockup de teléfono** = página de producto real estilo TikTok (header GLOWLAB 🔥 Trending, imagen de producto, **"Vitamin C Face Serum"**, precio $34.99 tachado $49.99 −30%, ★4.9 · 1,247 vendidos · ✓Oficial, botón "🧴 Ver producto oficial", botón "Ver vídeo en TikTok", comentarios con @skincarebysofia). Basado en la imagen 2 de referencia.
- **`#chatPop`** (burbuja flotante abajo-izq): **texto que se escribe y borra** en loop (`landing2.js` → typing effect, 5 mensajes, caret parpadeante).
- **`#heroAnnot`** (3 pasos a la derecha): **ciclan** resaltándose uno a uno cada 2.2s (clase `.on`, número pasa a gradiente).
- Fondo: chips flotantes de UI + textura de puntos + auras (sin "bolas").

### 3. Logos strip
Tarjeta sobre `--bg-soft`, pills blancas con cada logo **en su color de marca**. Texto "Únete a miles de marcas que ya venden en".

### 4. Features (5 tarjetas)
Hover eleva + el icono escala/rota. Vende sin bloqueos / Multiplica canales / Más confianza / Experiencia rápida / 100% personalizable.

### 5. "Todos tus enlaces en un solo lugar" (`#czStage`)
- 3 teléfonos en abanico: **izquierda = Estadísticas** (vistas 12.4K, KPIs, mini-bars), **centro = lista de enlaces** (el principal), **derecha = Editor** (filas de secciones, una activa, mini-preview).
- **5 burbujas sociales arrastrables** (`.bubble`, drag con mouse + touch en `landing.js`). `--drag` ring aparece al arrastrar.
- Nota "Arrastra los iconos para reorganizar".

### 6. "Optimizado para TikTok, sin miedo a bloqueos"
- Texto + bullets a la derecha.
- Teléfono a la izquierda con la **animación Exit Guide embebida y recoloreada a la marca** (ver detalle abajo) + **insignia azul redonda** (`.tk-badge.verify-blue`) con check.

### 7. "Editor visual fácil y poderoso" (NUEVA — imagen 4)
- Card con copy + bullets a la izquierda, **ventana de editor** a la derecha (barra con brand + breadcrumb + "Publicar cambios", sidebar de secciones, canvas con teléfono).
- **Cursor fantasma** (`.ed-cursor`) baja y la sección activa va cambiando sola (`landing2.js` → editor auto-click, cicla 3 secciones cada 2.33s). Badge de scan abajo-derecha.

### 8. "Entiende tu crecimiento con claridad" (DOS animaciones tipo video)
Shell `#anShell`, arranca al entrar en viewport (rect-based) y **loopa cada 6s**:
- **Izquierda — estadísticas globales en vivo**: KPIs con count-up, ticker "Nueva venta" que cambia de valor cada 2s, y **MAPA MUNDI real** = campo de puntos (`#mapField`) generado en JS (elipses de continentes en espacio 0–100; ~58×26 grid). **Puntos calientes predeterminados en EE. UU., Reino Unido y México** (clase `.hot`) + Brasil `.warm`. Encima, marcadores que pulsan (`.map-dot`) sobre esos 3 países. Ranking lateral: EE. UU. / Reino Unido / México.
- **Derecha — dashboard premium**: 3 mini-stats con count-up, **gráfico de líneas que se dibuja** (stroke-dashoffset + punto cabeza que recorre el path; alterna 2 datasets), **donut que se rellena** (conic-gradient animado por rAF con fallback), **barras de audiencia** que crecen (84/67/48%).
- Dos textos al pie: "Estadísticas globales en tiempo real, gratis." y "Visualización premium de estadísticas."

### 9. Creadores (NUEVA — imagen 6)
**Carrusel infinito automático** (`.cr-track`, CSS `@keyframes crScroll` 36s linear, pausa en hover; contenido duplicado en JS para loop sin saltos, máscara de degradado en los bordes). Cada card: foto (placeholder degradado — sustituir por foto real), nombre + **✓ azul**, handle, fila de redes en color, nº seguidores, nicho.

### 10. CTA final
"Crea tu perfil. Comparte tu link. Empieza a vender." + botones. Chips flotantes reposicionados a las esquinas (`top:16px;right:30%` y `bottom:16px;right:7%`) para **no solapar el texto**.

### 11. Footer
Brand + descripción + redes, 3 columnas de links, barra inferior.

---

## Detalle: animación Exit Guide (sección 6)
Es la versión recoloreada a marca del overlay de TikTok. Dentro del teléfono (`.sc.exit`), con `--EG:6s`:
- `.eg-ghost`: página fantasma de fondo (avatar + líneas + cards) atenuada.
- `.eg-dim`: capa oscura con blur.
- `.eg-top`: barra con `url` (candado + tokproof.app/@glowlab) y los **⋯ con anillo que pulsa** (`@keyframes egRing`).
- `.eg-arrow`: flecha SVG de un solo trazo (punta incluida) que se **dibuja** desde abajo hasta los ⋯ (`stroke-dashoffset 380→0`, `@keyframes egDraw`).
- `.eg-pop`: menú contextual que hace scale-in (`egPop`) con item **"Abrir en el navegador"** resaltado (icono brújula tipo TikTok) + "Copiar enlace".
- `.eg-hand`: mano que sube de pequeña a grande y hace gesto de click sobre el item (`egHand`, 2.4s).
- `.eg-cap`: caption "Para abrir esta página · toca los ⋯ y elige [Abrir en el navegador]".
Colores: rosa `#F647A9` / púrpura `#7B61FF` en glows, anillo y resaltado (en vez del rosa neón original).

---

## Imágenes / assets
Todo son **placeholders** (degradados, SVG inline, jars CSS). Sustituir por reales cuando estén:
- Hero phone: foto del producto (serum).
- Creadores: fotos reales de cada perfil (`.cr-photo` usa `background:<gradiente>` → cambiar a `background-image:url(...)`).
- Avatares de comentarios/testimonios.

## Reglas de implementación
- **Mobile-first**, breakpoints en `landing.css`/`landing2.css` (`1000px`, `680px`).
- Mantener los **fallbacks de animación** (rect-reveal + setTimeout) — no migrar a IntersectionObserver sin probar.
- Todos los iconos son SVG inline → en React, usar **lucide-react** equivalentes salvo los de marca (TikTok/IG/etc. mantener los paths exactos por fidelidad de logo).
- Respetar timings: reveals .7s; hero annot 2.2s; editor 2.33s; analytics loop 6s; sale ticker 2s; creators 36s; chat typing ~55ms/char.

---

## Prompt para Claude Code
> Implementa la **landing de Tokproof** en este repositorio. Te adjunto la referencia de diseño completa y funcional en `design_handoff_tokproof_landing/` (1 HTML + 2 CSS + 2 JS, todo vanilla y autocontenido) y un `README.md` con tokens, secciones, detalle de cada animación y timings exactos.
>
> Quiero una **réplica fiel**: mismos colores, tipografía (Inter), spacing, sombras, copy en español y **todas las animaciones con sus timings tal cual** (hero con chat que se escribe + anotaciones que ciclan, teléfono de producto estilo TikTok, logos en color de marca sobre fondo blanco, sección "todos tus enlaces" con 3 mockups [stats / enlaces / editor] e iconos sociales arrastrables, sección TikTok con la animación Exit Guide recoloreada a la marca + insignia azul redonda, sección "Entiende tu crecimiento" con las DOS animaciones [mapa mundi de puntos con EE.UU./Reino Unido/México destacados + dashboard premium con gráfico que se dibuja, donut y barras], sección nueva "Editor visual" con cursor que clica solo, sección de creadores en carrusel infinito, y CTA final sin que los chips solapen el texto).
>
> **Importante**: mantén el patrón de reveals basado en `getBoundingClientRect()` (NO IntersectionObserver) y los fallbacks `setTimeout` que fijan el estado final de counters/donut por si `requestAnimationFrame` va throttled — están así a propósito. Lee `README.md` antes de empezar. Si el repo es Next.js/React, componetiza por sección conservando la lógica JS de las animaciones (puedes apoyarte en Framer Motion); si es estático, puedes portar el HTML/CSS/JS casi tal cual. Las imágenes son placeholders: déjalas listas para sustituir por fotos reales.
