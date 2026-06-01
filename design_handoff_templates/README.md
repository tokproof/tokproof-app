# Handoff: Templates Dashboard (Tokproof)

## Overview
A "Templates" gallery screen for **Tokproof**, a link-in-bio / micro-store SaaS. Users browse pre-built page templates (link pages, stores, profiles), filter them by category, preview each as a phone mockup, and click "Usar template" to start from one. There is also a CTA to build from scratch.

## About the Design Files
The file in this bundle (`Templates Dashboard.html`) is a **design reference created in HTML** — a prototype showing the intended look and behavior, **not production code to copy directly**. The task is to **recreate this design in the target codebase's existing environment** (React, Vue, Svelte, etc.), using its established components, design tokens, and patterns. If no environment exists yet, pick the most appropriate framework and implement it there. The phone mockups inside the cards are illustrative previews — in production they would render real template thumbnails/screenshots.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and layout. Recreate pixel-closely using the codebase's existing UI library. The product/avatar imagery is represented with CSS gradient placeholders — replace with real template preview thumbnails.

## Screens / Views

### Screen: Templates
- **Purpose**: Browse and pick a starting template; filter by category; create a new/custom template.
- **Layout**: Two-column app shell.
  - **Sidebar**: fixed, `248px` wide, full viewport height, sticky. Vertical gradient background `linear-gradient(185deg,#ffffff 0%,#fdeef6 70%,#fbe6f1 100%)`, right border `1px solid #f3e3ee`. Padding `26px 18px 20px`. Flex column; nav at top, "Upgrade" card pinned to bottom (`margin-top:auto`).
  - **Main**: flex-1. Background = soft pink/lavender: `radial-gradient(1200px 500px at 80% -5%, #f7e6f5 0%, transparent 55%), linear-gradient(160deg,#fbeef5 0%,#f4ecfa 100%)`. Padding `30px 40px 38px`.
  - Inside main: page header row (title left, two buttons right) → filter tabs row → 3-column card grid → bottom banner.

#### Sidebar components
- **Brand**: hexagon logo `38×38`, radius `11px`, fill = primary pink gradient (see tokens), white hexagon SVG inside; wordmark "Tokproof" weight 800, `20px`, letter-spacing `-.02em`, gap `11px`.
- **Nav items** (vertical, gap `3px`): icon (`20px`, stroke 1.9) + label (weight 600, `14.5px`), padding `11px 12px`, radius `12px`, color `#5d6376`.
  - Order: Dashboard, Analytics, TikTok Rescue (with PRO badge), **Templates (active)**, Enlaces, Dominios, Audiencia, Configuración, Integraciones, Ayuda, Cerrar sesión.
  - **Active state**: background `#fcdcec`, text + icon = primary pink `#ec3b8e`, weight 700.
  - **Hover**: background `rgba(236,59,142,.07)`, text pink.
  - **PRO badge**: `9.5px`/weight 800, letter-spacing `.06em`, color `#b14ce6`, bg `#f0e2fb`, padding `3px 7px`, radius `6px`, pushed right with `margin-left:auto`.
- **Upgrade card** (bottom): radius `20px`, padding `16px`, bg `linear-gradient(150deg,#ee4aa0 0%,#c44ad0 55%,#9a52e6 100%)`, shadow `0 16px 30px -12px rgba(176,76,200,.65)`, white text.
  - Row: circular avatar `38px` (semi-transparent white bg + 1.5px border) with initial "A"; name "Alex Rivera" (weight 700, `14.5px`) + tiny crown SVG; subtext "Plan Free" (`12px`, opacity .85); crown pushed via avatar layout.
  - Button "Upgrade to Pro": full width, translucent white bg `rgba(255,255,255,.18)` + `1px` border `rgba(255,255,255,.35)`, white text weight 700 `13.5px`, radius `12px`, padding `11px`, trailing arrow icon.

#### Header components
- **Title** "Templates": `33px`, weight 800, letter-spacing `-.03em`.
- **Subtitle**: "Empieza con un diseño probado y personalízalo en minutos." color `#7b8194`, `15px`, weight 500, margin-top `6px`.
- **Buttons** (top right, gap `13px`, padding-top `4px`):
  - **"Ver ejemplos"** (ghost): white bg, text `#3a4051`, `1px` border `#ecdfe8`, eye icon, padding `13px 22px`, radius `13px`, subtle shadow.
  - **"Nueva plantilla"** (primary): pink gradient bg (token), white text, `+` icon (stroke 2.6), shadow `0 12px 24px -10px rgba(224,53,154,.7)`.
  - Both: inline-flex, gap `9px`, weight 700, `14.5px`.

#### Filter tabs (margin `28px 0 24px`, gap `13px`)
- Pill buttons: white bg, `1px` border `#ecdfe8`, text `#5d6376` weight 700 `14.5px`, padding `11px 22px`, radius `11px`.
- **Active tab** ("Todos (10)"): pink gradient bg, white text, no border, shadow `0 10px 20px -9px rgba(224,53,154,.7)`.
- Tabs: `Todos (10)` (active), `Links (3)`, `Tiendas (4)`, `Perfiles (3)`.
- **Behavior**: clicking a tab sets it active and filters cards by `data-cat` (`all` shows everything; otherwise match `links` / `tienda` / `perfil`).

#### Card grid
- `display:grid; grid-template-columns:repeat(3,1fr); gap:22px; align-items:start`.
- Responsive: 2 columns ≤1200px; 1 column ≤820px (sidebar hidden ≤820px).
- **Card** (`.tcard`): white bg, `1px` border `#f0e7ee`, radius `18px`, padding `18px`, shadow `0 14px 34px -22px rgba(60,30,60,.4)`. Internal layout = horizontal flex, gap `16px`: **phone mockup left** + **info panel right**.
  - Hover: `translateY(-3px)` + stronger shadow.
  - **Featured card** (3rd, "Producto destacado"): stronger shadow `0 26px 50px -20px rgba(190,60,140,.45)`, border `#f6dcec`; its phone has negative top margin (`-26px`) so it visually pops above the row.
- **Phone mockup** (`.phone`): `158px` wide, radius `22px`, `5px` solid `#14161d` bezel (dark frame), white bg, overflow hidden, base font `8.5px`. Six unique inner designs (link page, store, product, profile, dark link page, creator) — these are previews; in production swap for real rendered thumbnails.
- **Info panel** (`.info`): flex-1, flex column.
  - **Category badge** (`.cat`): `10.5px` weight 800, letter-spacing `.07em`, padding `4px 10px`, radius `7px`. `links` = bg `#fbe0ef` text `#d6359a`; `tienda`/`perfil` = bg `#ece1fb` text `#8b5cf6`.
  - **Title** (`h3`): `18.5px`, weight 800, letter-spacing `-.02em`, line-height 1.15. (One card uses a pink accent sub-line for "Premium".)
  - **Description** (`.desc`): `#7b8194`, `13.5px`, line-height 1.5, weight 500, margin-top `9px`.
  - **Feature list** (`.feat`): 3 items, gap `11px`, each = check chip (`19px` rounded square, white check icon stroke 3) + label (`13.5px` weight 600 `#3f4453`). Check colors: `green #19c37d` or `pink #ec3b8e` (per card — see content table).
  - **"Usar template" button** (`.use-btn`): pinned to bottom (`margin-top:auto`), full width, white text weight 700 `14px`, padding `13px`, radius `12px`, trailing arrow icon. Variant `pink` = pink gradient; `purple` = `linear-gradient(135deg,#a78bfa,#8b6ff0)`.

#### Card content (exact copy)
| # | Category badge | Title | Description | Check color | Button variant | Features |
|---|---|---|---|---|---|---|
| 1 | LINKS | Enlaces simples | Perfecto para compartir todos tus enlaces importantes en un solo lugar. | green | pink | Lista de enlaces · Iconos personalizables · Estilo limpio y rápido |
| 2 | TIENDA | Tienda TikTokShop | Diseño inspirado en TikTokShop para mostrar tus productos como un pro. | green | purple | Catálogo de productos · Precios y valoraciones · Botón de compra visible |
| 3 (featured) | TIENDA | Producto destacado | Ideal para promocionar un producto estrella con todo el detalle. | green | purple | Foto o video del producto · Beneficios claros · CTA de compra directa |
| 4 | PERFIL | Perfil + botones | Muestra quién eres y dirige a tu comunidad a tus contenidos. | pink | purple | Foto de perfil · Botones personalizados · Redes sociales abajo |
| 5 | LINKS | Link in bio Pro | Un diseño moderno y destacado para centralizar todo tu contenido. | pink | pink | Enlaces destacados · Iconos y colores · 100% personalizable |
| 6 | PERFIL | Creador de contenido | Perfecto para creadores que quieren mostrar su contenido y conectar. | green | purple | Video destacado · Redes sociales · Diseño impactante |

#### Bottom banner
- Margin-top `24px`, bg `linear-gradient(100deg,#fde7f1 0%,#f6e8fa 100%)`, `1px` border `#f6dcec`, radius `18px`, padding `22px 28px`, horizontal flex, gap `16px`.
- Sparkle icon chip: `38px` white rounded square, pink sparkle SVG, soft shadow.
- Text: bold "¿No encuentras lo que buscas?" (`15.5px`/800) + muted "Crea tu template desde cero con nuestro editor visual." (`13.5px`).
- Button "Crear desde cero" (right, `margin-left:auto`): white bg, pink text weight 800, `1px` border `#f6cfe3`, padding `13px 22px`, radius `12px`.

## Interactions & Behavior
- **Tab filtering**: single-select; active tab styled with gradient; cards toggle a `hidden` class based on category match. Counts in tab labels reflect totals (10 / 3 / 4 / 3).
- **Card hover**: lift + shadow increase, `transition .18s`.
- **Button hovers**: ghost → faint pink tint; gradient buttons → `brightness(1.04)`.
- **"Usar template"** would navigate to the editor seeded with that template; **"Nueva plantilla"/"Crear desde cero"** open the blank editor (wire to real routes).
- No async/loading/error states in this static screen.

## State Management
- `activeFilter`: one of `all | links | tienda | perfil`.
- Template list should be data-driven: each template = `{ id, category, title, description, features[], checkColor, buttonVariant, previewType, featured }`. Render cards from this array; derive tab counts from it.

## Design Tokens
**Colors**
- Ink / heading: `#1e2433`
- Muted text: `#7b8194`
- Soft border: `#eef0f4`, card borders `#f0e7ee` / `#ecdfe8`
- Primary pink: `#ec3b8e`
- Primary pink gradient: `linear-gradient(135deg,#fb47a0 0%,#e0359a 60%,#d62f8f 100%)`
- Purple button gradient: `linear-gradient(135deg,#a78bfa 0%,#8b6ff0 100%)`
- Upgrade card gradient: `linear-gradient(150deg,#ee4aa0 0%,#c44ad0 55%,#9a52e6 100%)`
- Active nav bg: `#fcdcec`
- Success/check green: `#19c37d`
- Category chip (links): bg `#fbe0ef` / text `#d6359a`
- Category chip (tienda/perfil): bg `#ece1fb` / text `#8b5cf6`
- Main bg base: `linear-gradient(160deg,#fbeef5,#f4ecfa)` + pink radial glow top-right

**Typography**: Plus Jakarta Sans (400/500/600/700/800). H1 `33px`/800, card title `18.5px`/800, body `13.5–15px`, labels `10.5–11px`/800 uppercase.

**Radius**: cards `18px`, phone `22px`, buttons `12–13px`, pills/tabs `11px`, badges `7px`, check chips `6px`.

**Shadows**: card `0 14px 34px -22px rgba(60,30,60,.4)`; primary button `0 12px 24px -10px rgba(224,53,154,.7)`; upgrade card `0 16px 30px -12px rgba(176,76,200,.65)`.

**Spacing**: sidebar width `248px`; main padding `30px 40px`; grid gap `22px`; card padding `18px`; card inner gap `16px`.

## Assets
- **Icons**: all inline stroke SVGs (feather-style) — nav, eye, plus, arrow, check, sparkle, crown. Use the codebase's icon set (e.g. lucide/heroicons) — names map closely: layout-grid, bar-chart, shield, link, globe, users, settings, plug/git-branch, help-circle, log-out, eye, plus, arrow-right, check, sparkles, crown.
- **Social glyphs** inside mockups (TikTok/Instagram/YouTube/Twitter/LinkedIn): simple colored rounded squares — replace with brand icons.
- **Images**: phone mockup previews use CSS gradients as placeholders. In production, render real template thumbnails/screenshots.

## Files
- `Templates Dashboard.html` — the full self-contained prototype (HTML + CSS + a small filtering script). Open it to inspect exact markup, gradients, and the six phone-mockup designs.
