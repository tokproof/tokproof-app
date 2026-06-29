# Handoff: Tokproof Dashboard

## Overview
Dashboard SaaS de **Tokproof** — plataforma de trust pages que convierte tráfico de TikTok hacia tiendas Shopify. La vista principal muestra: saludo, 4 stats con sparklines, módulo "TikTok Rescue" con mockup de iPhone + Exit Guide toggle, panel de links copiables, y tabla de páginas con filtros.

Estética: ultra clean, femenina-tech, minimal premium. Fondo lila muy suave, cards blancas flotantes con sombra suave, gradiente oficial rosa→púrpura.

## About the Design Files
El archivo `Tokproof Dashboard.html` es una **referencia de diseño** construida en HTML/CSS — un prototipo que muestra la apariencia y el comportamiento deseados, **no código de producción para copiar tal cual**.

Tu trabajo es **recrear este diseño en el entorno del proyecto destino** (Next.js / React / Vue / etc.) usando los patrones, librería de componentes y design system ya establecidos. Si el proyecto está vacío, elige el stack más apropiado (recomendado: **Next.js 14 + Tailwind CSS + shadcn/ui + lucide-react** — encaja perfecto con esta estética).

## Fidelity
**High-fidelity (hifi)**. Colores, tipografía, spacing, radios, sombras y micro-interacciones son finales. Recrear pixel-perfect con la librería de componentes del codebase.

---

## Design Tokens

### Colores
```css
--bg:           #FBF9FC;   /* fondo de la app */
--card:         #FFFFFF;   /* fondo de cards */
--ink:          #171717;   /* texto principal */
--ink-2:        #6B7280;   /* texto secundario */
--ink-3:        #9CA3AF;   /* texto terciario / labels */
--pink:         #F647A9;   /* rosa fuerte (active state, switch) */
--pink-2:       #FF4FD8;   /* rosa secundario */
--purple:       #7B61FF;   /* púrpura principal */
--border:       rgba(123,97,255,0.08);
--border-2:     rgba(123,97,255,0.14);
--soft-pink:    #FFE6F8;   /* chip / hover suave */
--soft-pink-2:  #FFF1FA;   /* fondos pastel rosa */
--soft-purple:  #ECE6FF;
--soft-purple-2:#F4F0FF;
--success:      #1AA960;   /* chip "Publicada" */
--success-bg:   #E6F9EE;
```

### Gradientes
```css
--grad:      linear-gradient(135deg, #F647A9 0%, #7B61FF 100%);  /* botón principal, brand mark, profile card */
--grad-side: linear-gradient(180deg, #FEF5FA 0%, #F4EDFE 100%);  /* sidebar background */
```

### Sombras
```css
--shadow-card: 0 8px 30px rgba(123,97,255,0.06);     /* todas las cards */
--shadow-btn:  0 10px 25px rgba(255,79,216,0.20);    /* botón principal */
--shadow-phone:0 24px 40px -18px rgba(40,20,80,.35), 0 4px 12px rgba(20,10,40,.18);
```

### Radios
- Cards grandes: `28px`
- Cards medianas (toggle, tip, link input): `14–18px`
- Pills / buttons: `999px`
- Nav items: `14px`
- Brand mark / stat icons: `11–16px`

### Tipografía
- Fuente: **Inter** (Google Fonts), pesos 400, 500, 600, 700
- `letter-spacing: -0.005em` global, `-0.02em` en títulos grandes
- `font-feature-settings: 'ss01','cv11'`
- Escala:
  | uso | size | weight | line-height |
  |---|---|---|---|
  | H1 saludo | 30px | 700 | 1.2 |
  | Card title | 18px | 700 | 1.2 |
  | Stat value | 28px | 700 | 1.1 |
  | Body | 14.5px | 400-500 | 1.5 |
  | Label | 13px | 500 | 1.4 |
  | Caption | 12.5px | 500 | 1.4 |
  | Nav label uppercase | 11px | 600 | letter-spacing: 0.12em |

### Spacing
- Sidebar width: `260px`
- Main padding: `32px 40px 56px`
- Card gap (stats / rows): `20–24px`
- Card padding: `24–28px`
- Topbar margin-bottom: `28px`

---

## Layout

Grid de 2 columnas: `260px 1fr`. Sidebar sticky a viewport. Main con `max-width: 1280px`.

```
┌─────────────┬─────────────────────────────────────┐
│             │  Topbar (saludo + 3 botones)        │
│   SIDEBAR   ├─────────────────────────────────────┤
│             │  4 × Stat Cards                     │
│   sticky    ├─────────────────────────────────────┤
│             │  TikTok Rescue (1.55fr) | Links 1fr │
│             ├─────────────────────────────────────┤
│             │  Pages (tabs + table)               │
└─────────────┴─────────────────────────────────────┘
```

---

## Screens / Components

### 1. Sidebar
- **Background**: gradiente vertical `#FEF5FA → #F4EDFE`
- **Border-right**: `1px solid rgba(123,97,255,0.08)`
- **Padding**: `28px 18px 22px`
- **Brand**: cuadrado 36×36, radius 11, fondo con `--grad`, icono escudo blanco. Texto "Tokproof" 19px/700.
- **Nav items**:
  - Padding `11px 14px`, radius 14, font 14.5px/500, color `#4B5563`
  - Icono outline 20px (lucide), color `#9AA0AE`
  - Hover: bg `rgba(123,97,255,0.05)`, icono `--purple`
  - **Active**: bg `#FFEAF8`, texto + icono `--pink`
  - Badge "PRO": 10px/700, color `--purple`, bg `--soft-purple`, padding `3px 8px`, radius 999
- **Items**:
  1. Dashboard (active)
  2. Analytics
  3. TikTok Rescue [PRO]
  4. Templates
  5. (label) **CUENTA**
  6. Billing [PRO]
  7. Settings
  8. Integraciones
  9. Help
  10. Cerrar sesión
- **Profile card** (bottom): radius 22, padding `16px 14px 14px`, bg `--grad`, sombra `0 10px 24px rgba(255,79,216,.22)`.
  - Avatar 44×44 circular con borde blanco
  - Crown icon top-right 22×22 con bg `rgba(255,255,255,.22)`
  - "Paula Núñez" 14px/600 + "Plan Pro" 12px opacity .85
  - CTA "Ver mi perfil →" full-width, bg `rgba(255,255,255,.18)`, border 1px `rgba(255,255,255,.28)`, radius 12, padding `9px 12px`

### 2. Topbar
- Flex space-between, gap 24
- Hello: H1 "Hola, Paula 👋" (con animación wave en el emoji) + "Aquí tienes un resumen de tu actividad y rendimiento." 15px ink-2
- Acciones (3 botones, gap 10):
  - **"Copiar mi link"** — botón blanco con borde sutil, texto e icono **con gradiente** (background-clip:text + SVG `stroke="url(#gradLink)"`)
  - **"Vista previa"** — botón blanco ghost, icono ojo púrpura
  - **"Nueva landing"** — botón primario gradiente, sombra rosa, icono +

### 3. Stat Cards (4 columnas)
Cada card padding `24px 26px 22px`, grid `52px 1fr` + fila bottom.
- Stat icon 52×52, radius 16, bg pastel (`--soft-pink-2` o `--soft-purple-2`), icono outline 22px
- Label 13px ink-2 + valor 28px/700
- Bottom: delta (`+18.2%` en rosa o púrpura, 13px/600) + sparkline SVG 110×34, stroke 2

Stats:
1. **Vistas totales** — 12.4K, +18.2% (pink, icon: eye)
2. **Clicks totales** — 3.8K, +22.6% (purple, icon: arrow-undo)
3. **CTR promedio** — 30.6%, +14.5% (pink, icon: trending-up)
4. **Rescates exitosos** — 1.2K, +27.8% (purple, icon: shield-check)

### 4. TikTok Rescue Card
Grid `1.55fr 1fr` con la card de links. Padding `26px 28px 22px`.

- Head: "TikTok Rescue" 18px/700 + badge "PRO"
- Body grid `220px 1fr` gap 28
- **iPhone mockup** (200×408): bezel `#111` con notch oscuro arriba (88×22), pantalla con radius 30 y gradiente `170deg, #FF8FD9 → #C77BFF → #7B61FF`. Sombra premium.
  - Shield glass 122×122, radius 28, bg `rgba(255,255,255,.22)` + backdrop-filter blur 6, borde blanco semitransparente. Icono escudo 56px con check.
  - Caption inferior: "Exit Guide activo" 14/600 + "Protegiendo tus clics desde TikTok" 11.5
- **Right column** gap 18:
  - "Protege tus clics desde TikTok" 18px/700
  - Desc 13.5 ink-2
  - 3 metrics (icon 28×28 pastel rosa + label + valor bold derecha):
    - Guías mostradas — 2.4K
    - Aperturas en navegador — 1.6K
    - Tasa de éxito — 66.7%
  - **Exit Toggle**: bg `#FFE3F1`, radius 16, padding `14px 16px`. Label "Exit Guide activo" en `--pink`/600. Switch a la derecha: 46×26, **fondo `#F647A9` cuando ON**, `#E5E7EB` cuando OFF. Thumb 20×20 blanco con sombra suave.

### 5. Tu link principal Card
Padding `26px 28px`, flex column gap 14.
- H3 "Tu link principal" 18/700
- 2 inputs estilo "pill suave": bg `--soft-pink-2`, radius 14, padding `14px 16px`, texto rosa 14/500, botón copy 28×28 a la derecha (bg `rgba(255,255,255,.7)`, hover blanco)
  - "Enlace principal" → `tokproof.app/@mibrand`
  - "Enlace Direct Exit" → `tokproof.app/@mibrand/go`
- Tip card al final: bg `--soft-pink-2`, radius 18, grid `36px 1fr` gap 14
  - Icon box 36×36 bg blanco con icono bombilla/idea en rosa
  - "Usa tu enlace /go en TikTok" 14/600
  - Texto pequeño 12px line-height 1.45 ink-2

### 6. Pages Card
Padding `26px 28px 8px`.
- Head: H3 "Tus páginas" + tabs + (margin-left:auto) search + sort
- **Tabs**: pills 7×14, 13.5/500
  - Active: bg `--soft-pink-2`, color `--pink`, badge count en rosa `rgba(255,79,216,.18)`
  - Inactive: ink-2, hover bg `#F3F0F9`
  - Items: Todas (3) · Publicadas (2) · Borradores (1)
- **Search**: pill blanco con borde sutil, icono lupa + input "Buscar"
- **Sort**: pill blanco "Ordenar ▼"

**Page row** (grid `84px 1fr auto auto`, padding `18px 6px`, border-top sutil):
1. **Thumb** 64×96: bezel negro radius 14, inner radius 10 con degradado pastel + 2 barras + card blanca
2. **Info**:
   - Title 15/700 + chip "TRUST PAGE" (purple) o "SIMPLE PAGE" (pink) + chip "● Publicada" (verde)
   - Subtítulo "glowlab.myshopify.com" 13 ink-2
   - Meta "📅 Creada el 10 ene 2025" 12.5 ink-3
   - 2 link pills `--soft-pink-2` con iconos
3. **Stats** (3 columnas centradas): Vistas / Clicks / CTR — label 12 + valor 18/700
4. **Right**: pill "Direct Exit" + badge ON (gradiente) u OFF (gris), botón más (36×36 blanco)

Filas:
- Row 1: **Crema Hidratante Premium** | TRUST PAGE | 2.4K · 840 · 34.8% · Direct Exit ON
- Row 2: **Bundle Skincare x 3** | SIMPLE PAGE | 1.7K · 620 · 36.5% · Direct Exit OFF

---

## Interactions & Behavior

- **Copy buttons** (`[data-copy]`): copia al portapapeles, anima copy-btn (bg → pink, color → white) por 1s, muestra toast `#1a1a1a` que aparece desde abajo durante 1.6s
- **Tabs**: clic cambia active sin cambiar contenido (filtrar al recrear)
- **Sidebar nav**: clic cambia active
- **Exit Switch**: toggle ON↔OFF, muestra toast "Exit Guide activado/desactivado"
- **Wave 👋**: animación CSS keyframes 2.6s infinite ease-in-out
- **Hover botones**: ghost → bg `#FBFAFF`; primario → `translateY(-1px)` + sombra más profunda
- Transiciones: 0.15s ease para color/bg, 0.18s para thumb del switch

## State (sugerido en el codebase destino)
```ts
type Page = { id; title; type:'TRUST'|'SIMPLE'; status:'PUBLISHED'|'DRAFT'; shop; createdAt; views; clicks; ctr; directExit:boolean; links:{primary; go} }
const [tab, setTab] = useState<'all'|'pub'|'draft'>('all')
const [search, setSearch] = useState('')
const [exitGuide, setExitGuide] = useState(true)
const [toast, setToast] = useState<string|null>(null)
```
Fetch en server component (`/api/dashboard` → stats + pages). Copy con `navigator.clipboard.writeText`. Toast con `sonner` o componente custom.

## Assets / Icons
Todos los iconos son **outline lucide-react**. Sustituciones directas:
- Sidebar: `Home`, `BarChart3`, `ShieldCheck`, `LayoutGrid`, `CreditCard`, `Settings`, `Link2`, `HelpCircle`, `LogOut`
- Topbar: `Link2`, `Eye`, `Plus`
- Stats: `Eye`, `MousePointerClick` (o `Undo2`), `TrendingUp`, `ShieldCheck`
- Rescue metrics: `LayoutGrid`, `ExternalLink`, `Clock`
- Tip: `Lightbulb`
- Pages: `Search`, `ChevronDown`, `Calendar`, `Link2`, `MoreHorizontal`
- Profile: `Crown`, `ArrowRight`

Avatar e iPhone son SVG inline en el HTML — sustituir avatar por foto real, iPhone mockup puede reusarse o reemplazarse por componente de Figma/imagen.

## Files
- `Tokproof Dashboard.html` — diseño completo, 1 archivo autocontenido (Inter desde Google Fonts, todos los SVG inline, JS vanilla para interacciones)

---

## Recomendaciones para Claude Code

1. **Stack sugerido**: Next.js 14 (app router) + Tailwind + shadcn/ui + lucide-react + sonner (toasts).
2. **Configurar Tailwind** con los tokens de arriba (`tailwind.config.ts` → extend colors + boxShadow + borderRadius).
3. **Componetizar**:
   - `<Sidebar/>`, `<NavItem active pro/>`, `<ProfileCard/>`
   - `<StatCard icon label value delta variant="pink|purple" sparkline/>`
   - `<RescueCard/>` con `<PhoneMockup/>` y `<MetricRow/>`
   - `<LinkInputCopyable label url/>`
   - `<PagesTable tabs filters rows/>` con `<PageRow/>`
   - `<GradientButton/>`, `<GhostButton gradientText/>`
4. **Mantén** el gradiente y la sombra premium del botón primario y profile card — son la firma visual del producto.
5. **No introduzcas** sidebar oscura, iconos sólidos, sombras duras ni bordes pesados. La estética es **airy, soft, femenina-tech**.
