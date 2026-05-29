# Handoff: Modal "Crear nueva página"

## Overview
A centered modal dialog that lets a user choose between two page formats before creating one:
**Página de Confianza** (a mini landing/trust page) and **Página de Links** (a link-in-bio page).
Each option is presented as a card with copy, a feature checklist, and a small phone mockup
previewing the result. The modal sits over a dimmed, blurred dashboard backdrop.

## About the Design Files
The files in this bundle are **design references created in HTML/CSS/JS** — a prototype showing the
intended look and behavior, **not** production code to copy verbatim. The task is to **recreate this
design in the target codebase** using its existing environment and conventions (React, Vue, Svelte,
etc.). If no frontend environment exists yet, pick the most appropriate framework for the project and
implement it there. Reuse the codebase's existing modal/overlay, button, and icon primitives where
they exist; only fall back to the raw CSS below when there's no equivalent.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, and layout are specified. Recreate
the UI pixel-perfectly using the codebase's component library. The two phone mockups are *miniature
illustrative previews* — reproduce them at the given proportions but they don't need to be
real, interactive device frames.

## Screens / Views

### Screen: "Crear nueva página" modal
- **Name:** Create new page modal
- **Purpose:** User picks one of two page formats, then confirms with "Crear página".
- **Layout:**
  - Full-viewport dark overlay (`rgba(18,16,26,.55)` + `backdrop-filter: blur(2px)`) over a dimmed dashboard.
  - Modal centered both axes. `width: 980px; max-width: calc(100vw - 64px); overflow: hidden;`
    `border-radius: 24px; padding: 32px 32px 24px;` white-to-faint-lilac vertical gradient background
    (`linear-gradient(180deg,#ffffff 0%,#fdfbfe 60%,#faf6fd 100%)`), large soft drop shadow.
  - **Header:** sparkle icon (28–32px, pink→lilac gradient) + `h1` title, with an `✕` close button absolutely
    positioned top-right. Subtitle paragraph below (max-width ~540px).
  - **Card grid:** `display:grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap:20px; width:100%;`
    `margin-top:22px`. **The `minmax(0,1fr)` tracks are important** — plain `1fr` lets nowrap/wide content
    blow the track past the modal edge.
  - **Footer actions:** `display:grid; grid-template-columns: 1fr 1.6fr; gap:18px; margin-top:24px;`
    → "Cancelar" (outline) and "Crear página →" (gradient).
  - **Footer note:** centered shield icon + small caption, `margin-top:16px`.

#### Component: Card (shared)
- `border-radius:20px; padding:28px; height:340px; min-width:0; max-width:100%; overflow:hidden; position:relative; cursor:pointer.`
- Hover: `translateY(-2px)` + soft colored shadow. Selected state: visible 2px colored border + soft shadow
  (selection tracked in JS; default selected = trust card).
- Text column: `.card-left { max-width: calc(100% - 175px); min-width:0; }` so it never pushes the phone out.
- Phone mockup is **absolutely positioned** inside the card: `position:absolute; right:18px; top:50%; transform:translateY(-50%); width:145px;`

#### Component: Página de Confianza card (trust)
- Background `linear-gradient(160deg,#fdeef5 0%,#fbe3ef 100%)`, border `2px solid #f4a8cf`.
- Icon tile: 40px, `border-radius:12px`, gradient `linear-gradient(150deg,#f472b6,#db2777)`, white shield icon.
- `h2` "Página de Confianza" (19px / 600 / #1c2029).
- Badge "Recomendada": pill, `background:#fbd7ee; color:#c026a8; font-size:12px; font-weight:600; padding:4px 12px; border-radius:999px; margin-top:8px`.
- Description (12px / #5b6171): *"Crea una mini landing completa y optimizada para generar confianza y convertir más."*
- Feature list (11px, each one line): check in 17px pink (`#ec4899`) circle.
  - Diseño completo y personalizable
  - Reviews, FAQ y beneficios
  - Ideal para productos físicos
  - Incluye apertura en navegador

#### Component: Página de Links card (links)
- Background `linear-gradient(160deg,#f6f1fd 0%,#efe6fb 100%)`, border `2px solid #e3d6f7`.
- Icon tile: gradient `linear-gradient(150deg,#c084fc,#9333ea)`, white link icon.
- `h2` "Página de Links".
- Description: *"Crea una página simple con enlaces directos para enviar tráfico rápidamente a tu web o redes sociales."*
- Feature list (checks in 17px lilac `#a855f7` circle):
  - Enlaces ilimitados
  - Diseño limpio y rápido
  - Ideal para creadores y marcas
  - Incluye exit para abrir en navegador

#### Component: Phone mockup (shared frame)
- `width:145px; border-radius:27px; padding:5px;` dark bezel gradient `linear-gradient(160deg,#2a2a2e,#0e0e10)`.
- `.screen { height:280px; border-radius:23px; overflow:hidden; position:relative; }` → ~145×290 total (real iPhone ratio).
- Top centered notch pill + minimal status-bar dots overlay.

##### Trust phone screen content
- Background pink top-to-bottom: `linear-gradient(180deg,#fde6f0 0%,#fbdbe9 100%)` — **no white bar at top.**
- Flex column. 24px transparent status-bar spacer at top (no brand text).
- Heading (12.5px / 700 / `#e0397f`): "Descubre tu mejor versión ✨" (2 lines).
- Tagline (7.5px / #5b6171): "Skincare coreano para una piel saludable y radiante."
- Product image block: 58px tall, `border-radius:10px` → `assets/product.png`.
- Star row (★ in `#f5b301`): "4.8 (128 reseñas)".
- "¿Por qué te encantará?" label (8.5px / 600), then 3 mini bullets (7.5px, pink dot):
  Ingredientes naturales · Resultados visibles · Envío rápido y seguro.
- "Comprar ahora" button pinned to the **bottom** with auto top-margin (clear gap above bullets):
  `margin:auto 9px 10px; height:26px; border-radius:10px; background:linear-gradient(90deg,#f9388f,#e0266f); color:#fff; font-size:9px; font-weight:600`.

##### Links phone screen content
- Background `linear-gradient(180deg,#9b6cf0 0%,#b388f4 55%,#e9dcfb 100%)`, white text, centered.
- Circular avatar 44px (`assets/avatar.png`), white 2px ring.
- Username "@tuusuario" (11px / 700). Bio "Creadora de contenido | Belleza | Lifestyle" (7px, 85% opacity).
- 3 social glyphs (TikTok, Instagram, YouTube), 12px white.
- Link buttons (7.5px / 600, `#7c3aed` text on `rgba(255,255,255,.92)`, `border-radius:9px; height:22px`):
  - Mi tienda
  - Productos favoritos
  - Descuentos exclusivos
  - Sígueme en TikTok
  *(four buttons only — the former "Contacto / Colaboraciones" was intentionally removed.)*

## Interactions & Behavior
- **Card selection:** clicking a card selects it; selected card shows its colored 2px border + soft shadow.
  Default selected = trust. Only one selected at a time.
- **Close:** `✕` button and "Cancelar" both fade+scale the modal out (`opacity→0; transform:scale(.97)`).
- **Create:** "Crear página →" reads the selected card and (in the prototype) swaps its label to a
  "Creando…" state. In production, wire this to the real create action / route.
- **Hover:** cards lift 2px; "Crear página" brightens + lifts 1px; close button gets a light grey bg.
- No async/loading/error states are modeled.

## State Management
- `selectedFormat: 'trust' | 'links'` (default `'trust'`).
- `isOpen: boolean` for the modal.
- On confirm, emit the chosen format to the parent / navigate.

## Design Tokens
**Colors**
- Pink: `#ec4899` · deep pink `#db2777` · badge text `#c026a8` · badge bg `#fbd7ee`
- Trust heading pink: `#e0397f` · trust card border `#f4a8cf`
- Lilac/purple: `#a855f7` · deep `#9333ea` · links card border `#e3d6f7`
- Gradient (primary button / brand): pink→lilac `#f0339a → #c43cd6 → #9b53f0`
- Ink `#161a23` / `#1c2029` · body `#4f5563` / `#5b6171` · feature text `#3f4452`
- Overlay scrim `rgba(18,16,26,.55)`, blur 2px
- Star `#f5b301`

**Typography:** Poppins (400/500/600/700). h1 28px/600; h2 19px/600; subtitle 15px; description 12px;
feature items 11px; footer note 13.5px.

**Spacing/radius:** modal radius 24px, padding 32/32/24; card radius 20px, padding 28px, height 340px;
grid gap 20px; action gap 18px; phone radius 27px / screen 23px.

**Shadow:** modal `0 40px 90px -20px rgba(20,10,40,.55)`; phone `0 16px 32px -14px rgba(20,10,40,.5)`.

## Assets
- `assets/product.png` — skincare product photo used in the trust phone preview (replaceable).
- `assets/avatar.png` — creator profile photo used in the links phone preview (replaceable).
- All icons (sparkle, shield, link, check, social glyphs, close) are inline SVG — swap for the codebase's
  icon set if one exists.
- Font: Poppins via Google Fonts (or the app's equivalent geometric sans).

## Files
- `Crear nueva pagina.html` — the complete hifi prototype (all CSS in `<style>`, behavior in the trailing `<script>`).
- `assets/product.png`, `assets/avatar.png` — preview images.
