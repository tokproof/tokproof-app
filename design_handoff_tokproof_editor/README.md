# Handoff: Tokproof — Editor de Landing

## Overview
Editor visual de landing pages de **Tokproof** (trust pages para tráfico TikTok → Shopify). Pantalla de escritorio con: nav principal a la izquierda, panel de secciones (acordeón), mini-rail flotante (Secciones/Estilos/Ajustes), barra superior full-width con acciones, y un canvas central con el preview del móvil + toolbar de zoom.

Dos mecánicas clave de layout:
1. **Sidebar colapsable** — la nav principal se contrae a solo iconos (botón ‹).
2. **Focus mode** — oculta la nav + el panel de secciones para que el editor ocupe todo el ancho (botón con flechas de expansión en la barra superior).

> NOTA: el panel de estadísticas derecho del mockup original fue **eliminado** en esta versión para dar más espacio al editor. No lo reintroduzcas salvo que se pida.

## About the Design Files
`Tokproof Editor.html` es una **referencia de diseño** (HTML/CSS/JS vanilla). No es código de producción. Recréalo en el stack del codebase destino (recomendado: **Next.js 14 + Tailwind + shadcn/ui + lucide-react**), reutilizando componentes y design system existentes.

## Fidelity
**High-fidelity.** Colores, tipografía, spacing, radios, sombras e interacciones son finales.

---

## Design Tokens
```css
--bg:#FBF9FC;            /* fondo app/editor */
--card:#FFFFFF;
--ink:#171717;           /* texto principal */
--ink-2:#6B7280;         /* secundario */
--ink-3:#9CA3AF;         /* terciario/labels */
--pink:#F647A9;          /* rosa fuerte (activos, switch) */
--pink-2:#FF4FD8;        /* rosa secundario (gradiente) */
--purple:#7B61FF;
--green:#1AA960;  --green-bg:#E6F9EE;   /* estado Publicado */
--border:rgba(123,97,255,0.10);
--border-2:rgba(123,97,255,0.16);
--soft-pink:#FFF1FA;  --soft-pink-2:#FFE3F1;
--soft-purple:#F4F0FF;
--grad:linear-gradient(135deg,#FF4FD8 0%, #7B61FF 100%);
--grad-side:linear-gradient(180deg,#FEF5FA 0%, #F4EDFE 100%); /* nav bg */
--shadow-card:0 8px 30px rgba(123,97,255,0.06);
--shadow-pop:0 18px 50px -12px rgba(40,20,80,.18);   /* popovers/mini-rail */
--shadow-btn:0 10px 25px rgba(255,79,216,0.22);
```

### Tipografía (Inter)
- Título landing (topbar): **17px / 700**, trunca con ellipsis
- Panel head "General": **14.5px / 700** en `--pink`
- Section rows: **13.5px / 500**
- Botones: **13px / 500–600**
- Labels de campo: **12px / 600**

### Radios
- Cards de panel: `18px` · botones/pills: `999px` · nav items: `13px` · inputs: `11–12px` · mini-rail / popovers: `18px` · teléfono: `46px` (bezel) / `38px` (screen).

---

## Layout — 4 columnas (flex row, height:100vh)
```
[ NAV 210 ][ SECTIONS 290 ][ MAIN (flex:1) ][ ]
                                │
                                ├─ TOPBAR (full-width sobre el editor)
                                └─ WORK → CANVAS (editor + preview)
```
- **NAV** (`.nav`, 210px): gradiente `--grad-side`, border-right sutil. Colapsa a **72px icono-only** con `.editor.nav-collapsed`.
- **SECTIONS** (`.sectionsWrap` → `.sections`, 290px): panel General + lista de secciones acordeón + "Añadir sección". Contiene el botón ‹ de colapso y la **mini-rail flotante**.
- **MAIN**: `flex:1; flex-direction:column`. Topbar arriba (full-width), `.work` debajo con el `.canvas`.

> El topbar va en `.main`, NO dentro del canvas — así abarca todo el ancho disponible.

### Mini-rail flotante (Secciones / Estilos / Ajustes)
- `position:absolute; top:96px; right:-74px;` relativa a `.sectionsWrap` → flota en el gutter del canvas, **separada de la línea divisoria** y del panel.
- Card blanca, `box-shadow:var(--shadow-pop)`, items verticales con icono (34×34, bg `#F5F2FB`) + label 10.5px. Item activo: icono bg `--soft-pink-2`, texto `--pink`.

---

## Topbar (full-width)
Orden de elementos: `[back] [título + ✎] [estado Publicado] [spacer flex:1] [acciones]`
- **back**: botón 38×38, bg blanco, border sutil.
- **título**: `flex:0 1 auto; min-width:0`, texto en `<span class="ttxt">` con `overflow:hidden; text-overflow:ellipsis; white-space:nowrap`. **El título trunca; los botones nunca se cortan.**
- **estado**: pill verde (`--green-bg`/`--green`) "Publicado ▾".
- **spacer**: `<div>` con `flex:1 1 12px` → empuja las acciones a la derecha y permite que el título encoja en overflow (NO usar `margin-left:auto` en las acciones — interfiere con el shrink).
- **acciones** (`flex:0 0 auto`, gap 8): 
  1. **Focus** (icono-only, flechas de expansión) — toggle Focus mode
  2. **Copiar link** (ghost, icono+texto rosa)
  3. **Vista previa** (ghost)
  4. **Guardar** (ghost)
  5. **Publicar cambios** (primary gradient, sombra rosa)

### Iconos Focus mode (expansión)
- Inactivo (expandir): 4 esquinas hacia afuera
  ```svg
  <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
  ```
- Activo (colapsar): 4 esquinas hacia adentro
  ```svg
  <path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/>
  ```
- Cuando Focus está activo, el botón pasa de `btn-ghost` a `btn-primary` (gradiente).

---

## Canvas / Preview
- Toggle **Móvil / Escritorio** (segmented pill, activo blanco con sombra).
- **iPhone mockup** 312×642: bezel `linear-gradient(160deg,#23202b,#0c0b12)`, notch, screen blanco con: status bar 9:41, header GLOWLAB + ⋯, hero con placeholder de producto + play + badge ★4.9/5, título "Crema Hidratante **Premium**" (Premium en `--pink`), descripción, chips (Envío gratis / Garantía 30 días / Hecho en…), botón "Comprar ahora · 29,90€" (gradiente), "Más información", social proof "+2.4K personas", comentario TikTok @sofi_beauty.
- **Toolbar inferior** (`.canvas-tools`): undo/redo, preview (ojo), pantalla, zoom −/+ (50–150%, escala el preview vía `transform:scale`).

---

## Estados de layout (CSS)

### Sidebar colapsada
```css
.editor.nav-collapsed .nav{width:72px;flex-basis:72px;}
/* ocultar labels, badges PRO, perfil expandido; nav-items centrados */
```
Botón ‹ (`#navToggle`) hace `editor.classList.toggle('nav-collapsed')` y rota 180°.

### Focus mode
```css
.editor.focus .nav,
.editor.focus .sectionsWrap{display:none;}
```
Botón Focus (`#focusToggle`) hace `editor.classList.toggle('focus')`, cambia icono expandir↔colapsar, swap ghost↔primary, y muestra brevemente una tarjeta flotante "Focus mode / Oculta la sidebar para concentrarte en el editor" (`.focus-card`, ~2.2s).

Transiciones: `transition:width .28s cubic-bezier(.5,.1,.2,1)` en nav/sections.

---

## Interacciones (JS vanilla, replicar con estado en React)
- **Colapsar sidebar** (‹) — toggle clase
- **Focus mode** — toggle clase + swap icono/estilo + toast + tarjeta
- **Móvil/Escritorio** — toggle activo
- **Mini-rail** Secciones/Estilos/Ajustes — toggle activo
- **Acordeones** de secciones — `.sec-row.open` muestra `.sec-body`
- **Zoom** −/+ — `transform:scale(zoom/100)` sobre `#phoneZoom`, rango 50–150
- **Copiar** (`[data-copy]`) — `navigator.clipboard.writeText` + toast
- Estado select "Publicado", switches, etc.

### Estado sugerido (React)
```ts
const [navCollapsed,setNavCollapsed]=useState(false)
const [focus,setFocus]=useState(false)
const [device,setDevice]=useState<'movil'|'escritorio'>('movil')
const [zoom,setZoom]=useState(100)
const [activeTool,setActiveTool]=useState<'secciones'|'estilos'|'ajustes'>('secciones')
const [openSections,setOpenSections]=useState<Set<string>>(new Set())
```

## Iconos (lucide-react)
Nav: `Home, BarChart3, ShieldCheck, LayoutGrid, CreditCard, Settings, Link2, HelpCircle, LogOut`. 
Topbar: `ArrowLeft, Pencil, ChevronDown, Maximize2/Minimize2 (focus), Link2, Eye, UploadCloud, Plus`. 
Secciones: `PlusCircle, User, Box, Image, DollarSign, MessageSquare, Star, HelpCircle, MousePointerClick, BarChart3, ShieldCheck, Search`. 
Toolbar: `Undo2, Redo2, Eye, Monitor, Minus, Plus`. 
Mini-rail: `LayoutGrid (Secciones), Palette (Estilos), Settings (Ajustes)`.

## Files
- `Tokproof Editor.html` — referencia visual completa, autocontenida.

---

## Prompt para Claude Code
> Lee `design_handoff_tokproof_editor/README.md` y recrea el **editor de landing de Tokproof** en este codebase usando sus componentes y design system. El HTML adjunto es la referencia visual exacta (no lo copies literal). Stack: Next.js 14 + Tailwind + shadcn/ui + lucide-react si el proyecto está vacío.
>
> Requisitos clave: (1) layout de columnas nav + panel de secciones + editor full-width con topbar arriba; (2) **sidebar colapsable** a icono-only con el botón ‹; (3) **Focus mode** que oculta nav + panel de secciones para que el editor ocupe todo el ancho, con icono de flechas de expansión que cambia a flechas hacia dentro al activarse; (4) topbar responsiva donde el título trunca con ellipsis y los botones nunca se cortan (usa un spacer flex, no margin-left:auto); (5) mini-rail flotante Secciones/Estilos/Ajustes separada de la divisoria; (6) acordeones de secciones, toggle Móvil/Escritorio, zoom del preview y copiar enlaces. No reintroduzcas el panel de estadísticas derecho. Respeta colores, tipografía Inter y la estética premium/minimal.
