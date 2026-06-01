# Handoff: Admin Panel — Usuarios (Tokproof)

## Overview
The **Usuarios** (Users) management screen of the **Tokproof** admin panel. Admins see KPI stats, browse/search/filter a paginated users table, and inspect a selected user in a right-side detail drawer with quick plan-management actions and recent activity.

## About the Design Files
The file in this bundle (`Admin Panel - Usuarios.html`) is a **design reference created in HTML** — a prototype of the intended look and behavior, **not production code to ship directly**. Recreate it in the target codebase's existing environment (React, Vue, etc.) using its components, data layer, and design tokens. If no environment exists yet, choose the most appropriate framework. User avatars are CSS gradient placeholders — wire to real profile images.

## Fidelity
**High-fidelity (hifi).** Final colors, type, spacing, and layout. Build it pixel-closely with the codebase's UI library; replace gradient avatars and mocked data with real data.

## Screens / Views

### Screen: Usuarios (Admin)
- **Purpose**: Administer all users — view KPIs, search/filter/export, open a user's detail, change plans, impersonate ("Entrar como usuario").
- **Layout**: App shell = sidebar + content. Content = topbar + two-column body (`main` flex-1 + right rail `332px`).
  - **Sidebar**: `230px` wide, sticky, full height, bg `linear-gradient(190deg,#fef0f7 0%,#ffffff 28%)` (subtle pink wash at top), right border `1px #eceaf0`, padding `24px 16px 18px`, flex column.
  - **Content**: flex-1, padding `24px 30px 30px`, page bg `#f2f1f6`.
  - **Body**: `display:flex; gap:22px; align-items:flex-start`. Left `.col-main` flex-1 column (gap `22px`); right `.col-side` `332px` column (gap `18px`).

#### Sidebar components
- **Brand**: wordmark "Tok**proof**" (the "proof" part in pink `#ec3b8e`), weight 800 `21px`, letter-spacing `-.03em`; pill badge "ADMIN" — `10px`/800, letter-spacing `.08em`, color `#a855f7`, bg `#f1e6fc`, padding `3px 7px`, radius `6px`.
- **Nav** (gap `2px`): icon `19px` + label weight 600, padding `11px 12px`, radius `11px`, color `#5d6376`.
  - Order: Overview, **Usuarios (active)**, Planes, Páginas, Quick Exits, Analytics, Soporte, Configuración.
  - Active = bg `#fcdcec`, pink text/icon, weight 700. Hover = faint pink tint.
- **"Acciones rápidas" side card** (`margin-top:auto`): white, `1px` border `#ecebf1`, radius `14px`, padding `15px 14px`. Heading weight 700 `13px`. Three links (icon `16px` `#8b90a0` + label `13px`/600 `#5d6376`, hover pink): "Entrar como usuario", "Ver Analytics globales", "Exportar usuarios".
- **User chip** (below card, margin-top `14px`): white, bordered, radius `14px`, padding `10px 12px`. Circular avatar `34px` with purple gradient `linear-gradient(135deg,#b14ce6,#8b5cf6)` + initial "G"; name "Gema" (700 `13.5px`) + role "Admin" (`11.5px` muted); chevron-down right.

#### Topbar
- Flex space-between, align-items flex-start, margin-bottom `22px`.
- **Left**: "Usuarios" `27px`/800, letter-spacing `-.03em`; subtitle "Gestiona todos los usuarios de Tokproof." `14px`/500 muted `#8b90a0`, margin-top `5px`.
- **Right** (gap `12px`):
  - **Search**: white, `1px` border `#e9e9ef`, radius `11px`, padding `11px 14px`, width `280px`. Magnifier icon `17px` `#9aa0b0`, placeholder "Buscar usuario...", trailing kbd chip "⌘ K" (`12px`/600 `#9aa0b0`, bg `#f3f3f7`, radius `6px`).
  - **"Entrar como usuario"** button (`.btn-line`): white bg, `1.5px` border `#e4d6f5`, purple text `#8b5cf6` weight 700 `13.5px`, padding `11px 16px`, radius `11px`, leading "impersonate" icon. Hover bg `#faf6ff`.
  - **User menu**: avatar `38px` (gradient, photo placeholder) + name "Gema" (700 `14px`) / role "Admin" (`12px` muted) + chevron.

#### Stats card (`.col-main` first item)
- White card, radius `18px`, `1px` border `#eeedf3`, shadow `0 18px 40px -28px rgba(40,30,60,.4)`.
- Inner: `display:grid; grid-template-columns:repeat(5,1fr); padding:22px 8px`. Each `.stat` padding `0 18px`; dividers via `border-left:1px solid #f0eff4` on all but first.
- **Each stat**: icon chip `40px` radius `12px` (margin-bottom `16px`, icon `21px` stroke 2) → label `13.5px`/600 muted → value `30px`/800 (letter-spacing `-.02em`, margin `3px 0 9px`) → delta row (`12.5px`/700 green `#19b877` with up-right arrow `13px`, followed by muted "vs mes anterior").
- **Stat data** (label · value · delta · icon-chip color):
  1. Usuarios totales · **127** · ↗ 12% · purple chip (bg `#f1ecfd`, icon `#8b5cf6`, users icon)
  2. Usuarios Free · **119** · ↗ 9% · blue chip (bg `#e9f1fe`, icon `#3b82f6`, user-plus icon)
  3. Usuarios Pro · **8** · ↗ 33% · pink chip (bg `#fde6f1`, icon `#ec3b8e`, crown icon)
  4. MRR · **$152** · ↗ 18% · green chip (bg `#e4f6ee`, icon `#19b877`, dollar-circle icon)
  5. Páginas creadas · **248** · ↗ 15% · amber chip (bg `#fdf0dc`, icon `#e8930c`, document icon)

#### Users table card (`.col-main` second item)
- White card, padding `22px 24px 8px`.
- **Heading** "Todos los usuarios" `18px`/800, margin-bottom `16px`.
- **Tools row** (flex, gap `12px`, margin-bottom `6px`):
  - Search `300px`: placeholder "Buscar por email, nombre o ID..." (same style as topbar search, no kbd).
  - Two `.select` dropdowns: "Todos los planes" and "Todas las fechas" — white, `1px` border `#e9e9ef`, radius `10px`, padding `11px 14px`, weight 600 `13.5px` `#4a4f5e`, chevron `15px`.
  - **"Exportar CSV"** (`margin-left:auto`): white, bordered, radius `10px`, padding `11px 16px`, weight 700 `13.5px`, download icon `16px` `#7b8194`.
- **Table**: full width, `border-collapse`.
  - **Head th**: left-aligned, `#9aa0b0`, `12.5px`/700, padding `10px 8px`, bottom border `1px #f0eff4`. Columns: Usuario (30%), Plan, Páginas (with sort caret), Quick Exits (with sort caret), Registro, Último acceso, Acciones (right-aligned).
  - **Body td**: padding `14px 8px`, bottom border `1px #f3f2f7`; last row no border; row hover bg `#faf9fc`.
  - **User cell**: avatar `36px` circle (gradient placeholder) + name (700 `13.5px`, with optional "Tú" tag) + email (`12.5px` muted). "Tú" tag = `10px`/800 purple on `#f1ecfd`, radius `6px`.
  - **Plan badge**: `11px`/800, padding `4px 10px`, radius `7px`. `PRO` = bg `#f1ecfd` text `#8b5cf6`; `FREE` = bg `#f1f2f5` text `#8b90a0`.
  - **Number cells**: weight 700 `#3a3f4e`.
  - **Registro**: date weight 700 `#3a3f4e`.
  - **Último acceso**: status dot `7px` (green `#19b877` = active / gray `#cfd3dc` = idle) + text `13px`/600 `#5a5f6e`.
  - **Acciones**: right-aligned, two buttons gap `8px` — "Ver" (`#4a4f5e`) and "Editar" (pink `#ec3b8e`); both white, `1px` border `#e7e7ee`, radius `9px`, padding `7px 16px`, weight 700 `13px`.
- **Row data** (name · email · plan · páginas · quick exits · registro · último acceso · dot):
  1. Gema [Tú] · gema@gmail.com · PRO · 4 · 2 · 30 may 2026 · Hace 5 min · green
  2. Juan Pérez · juanperez@gmail.com · FREE · 1 · 1 · 29 may 2026 · Hace 2 horas · green
  3. Marta López · martalopez@gmail.com · FREE · 2 · 0 · 28 may 2026 · Hace 1 día · green
  4. Pedro Sánchez · pedro.sanchez@gmail.com · FREE · 1 · 1 · 27 may 2026 · Hace 2 días · green
  5. Laura Gómez · lauragomez@gmail.com · PRO · 3 · 2 · 26 may 2026 · Hace 3 días · green
  6. Carlos Ruiz · carlosruiz@gmail.com · FREE · 1 · 0 · 25 may 2026 · Hace 4 días · gray
  7. Álvaro Díaz · alvarodiaz@gmail.com · FREE · 0 · 0 · 25 may 2026 · Hace 4 días · gray
- **Footer** (flex space-between, padding `16px 0`, muted `13px`/600): left "Mostrando 1 a 7 de 127 usuarios"; right pager — prev `‹`, pages `1`(active) `2` `3` `…` `18`, next `›`. Page button `34px` min, radius `9px`, `1px` border `#e9e9ef`; **active** bg `#f1ecfd`, border `#dcd0f7`, text `#8b5cf6`; `…` is non-interactive.

#### Right rail (`.col-side`, three stacked cards)
**1) "Detalle del usuario" card** (padding `20px`)
- Header: title `16.5px`/800 + close "X" button (`28px` rounded square, bg `#f4f3f7`, icon `#8b90a0`).
- Top block: avatar `60px` radius `14px` (gradient placeholder) + name "Gema" (800 `16px`) with PRO badge + email "gema@gmail.com" (`13px` muted) + ID row "ID: 12345678-1234-1234-123456789abc" (`11px` `#a7adba`) with copy icon `13px`.
- Detail rows (each: flex space-between, padding `11px 0`, top border `1px #f2f1f6`, `13.5px`; key muted/600, value weight 700):
  - Miembro desde → 30 may 2026
  - Último acceso → green dot + "Hace 5 minutos"
  - Plan actual → PRO badge
  - Páginas creadas → 4
  - Quick Exits → 2
  - Enlaces públicos → 4

**2) "Acciones rápidas" card** (padding `20px`)
- Heading weight 800 `14.5px`.
- 2-col grid (gap `10px`): **"Cambiar a Free"** (bg `#f1ecfd`, text `#8b5cf6`, user-plus icon) + **"Cambiar a Pro"** (bg `#fde6f1`, text `#ec3b8e`, crown icon). Buttons: weight 700 `13px`, padding `12px`, radius `11px`.
- Full-width line buttons (white, `1px` border `#eceaf0`, `#4a4f5e`, icon `#8b90a0`): **"Entrar como usuario"** (impersonate icon), **"Ver dashboard del usuario"** (external-link icon).

**3) "Actividad reciente" card** (padding `20px`)
- Heading weight 800 `14.5px`.
- Tabs (gap `20px`, bottom border `1px #f0eff4`): "Páginas" (active), "Quick Exits", "Enlaces". Inactive `#a7adba`/700; active purple `#8b5cf6` with 2px purple underline.
- Activity rows (flex, gap `10px`, padding `11px 0`, bottom border `1px #f6f5f9`): color icon swatch `18px` radius `6px` + name (700 `13px`) + type chip (`11px`/700 `#a7adba` on `#f4f3f7`, radius `6px`) + status (right):
  1. 🟡 RevHair · Trust Page · **Publicada** (green text)
  2. 🩷 Beauty Product · Simple Page · **Publicada**
  3. 🟣 Creator Links · Links Page · **Borrador** (amber chip: text `#e8930c`, bg `#fdf0dc`, radius `7px`)
  4. 🟢 Pet Product · Product Page · **Publicada**
- Footer link "Ver todas las páginas (4) →": purple `#8b5cf6`, weight 700 `13.5px`, arrow icon, margin-top `14px`.

## Interactions & Behavior
- **Pagination**: clicking a numbered page sets it active (purple style); prev/next and `…` behave accordingly; wire to real paging/query.
- **Activity tabs**: single-select; active underline; switches the list source (Páginas / Quick Exits / Enlaces).
- **Search / filters / Exportar CSV**: filter the dataset and export current view.
- **Row "Ver"** opens the right detail rail for that user; **"Editar"** opens edit. The right rail reflects the selected user; "X" closes/clears it.
- **"Entrar como usuario"** = impersonation flow; **"Cambiar a Free/Pro"** = plan change with confirmation; **"Ver dashboard del usuario"** = open user's dashboard in a new context.
- Hover states: nav/links tint pink; rows tint `#faf9fc`; buttons faint tint.

## State Management
- `users[]` (each `{ id, name, email, avatar, plan, pages, quickExits, registeredAt, lastAccess, online }`).
- `searchQuery`, `planFilter`, `dateFilter`, `page`, `pageSize`, `total`.
- `selectedUserId` → drives the right detail rail (detail fields + recent activity).
- `activityTab`: `pages | quickExits | links`.
- KPI stats can be a separate summary fetch.

## Design Tokens
**Colors**
- Ink: `#1d2230`; muted `#8b90a0`; soft `#aab0bf`
- Page bg: `#f2f1f6`
- Card border: `#eeedf3` / `#ecebf1`; hairlines `#f0eff4` / `#f3f2f7`
- Primary pink: `#ec3b8e`; purple: `#8b5cf6` (badge accent `#a855f7`)
- Success green: `#19b877`; amber: `#e8930c`
- Active nav bg: `#fcdcec`; purple-tint bg `#f1ecfd`; pink-tint bg `#fde6f1`
- Stat chip bgs: purple `#f1ecfd`, blue `#e9f1fe`, pink `#fde6f1`, green `#e4f6ee`, amber `#fdf0dc`
- Sidebar gradient: `linear-gradient(190deg,#fef0f7 0%,#ffffff 28%)`

**Typography**: Plus Jakarta Sans (400/500/600/700/800). Page title `27px`/800; stat value `30px`/800; section headings `14.5–18px`/800; body `13–14px`; labels/badges `10–12.5px`.

**Radius**: cards `18px`; side cards `14px`; inputs/selects `10–11px`; buttons `9–11px`; badges `6–7px`.

**Shadows**: card `0 18px 40px -28px rgba(40,30,60,.4)`; inputs `0 3px 10px -8px rgba(0,0,0,.25)`.

**Spacing**: sidebar `230px`; right rail `332px`; content padding `24px 30px`; body gap `22px`; rail gap `18px`; card paddings `20–24px`.

## Assets
- **Icons**: inline stroke SVGs (feather-style) — users, user-plus, crown, dollar-circle, document, layout-grid, zap, bar-chart, life-buoy, settings, search, impersonate, download, chevrons, copy, external-link, arrow-right, check. Map to the codebase's icon set (lucide/heroicons).
- **Avatars**: CSS gradient circles as placeholders for user photos — wire to real images; the sidebar/user-menu "Gema" uses a purple gradient with initial "G".
- **Activity swatches**: small colored squares standing in for page/site favicons or thumbnails.

## Files
- `Admin Panel - Usuarios.html` — full self-contained prototype (HTML + CSS + small scripts for tab and pagination toggling). Inspect for exact markup, colors, and spacing.
