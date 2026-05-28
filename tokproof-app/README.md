# Tokproof — Trust pages para TikTok → Shopify

MVP funcional construido con Next.js 14, Supabase y Tailwind.

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Auth + DB:** Supabase (Auth, Postgres, RLS)
- **Estilos:** Tailwind + CSS custom (tokproof.css)
- **Deploy:** Vercel (recomendado)

---

## Instalación local

```bash
git clone <repo>
cd tokproof-app
npm install
cp .env.example .env.local
# Edita .env.local con tus claves de Supabase
npm run dev
```

Abre http://localhost:3000

---

## Variables de entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Encuéntralas en: **supabase.com → tu proyecto → Settings → API**

---

## Setup de Supabase

### 1. Crear proyecto en Supabase
- Ve a https://supabase.com
- Crea un nuevo proyecto
- Copia URL y claves en .env.local

### 2. Ejecutar SQL schema
- En tu proyecto Supabase: **SQL Editor → New query**
- Copia y pega el contenido de `supabase/schema.sql`
- Clic en **Run**

Esto crea todas las tablas, índices, RLS policies y seed de templates.

### 3. Configurar Auth (opcional: Google OAuth)
- En Supabase: **Authentication → Providers → Google**
- Activa Google y añade tu Client ID y Secret
- En Redirect URLs añade: `http://localhost:3000/auth/callback`
- En producción: `https://tudominio.com/auth/callback`

---

## Flujo completo del usuario

1. `/signup` → crea cuenta con email+contraseña
2. `/onboarding` → elige @username → crea primera página en draft
3. `/dashboard/editor/[pageId]` → edita la página
4. Clic en **Publicar** → Safe Link Score determina estado
5. Si score ≥ 50 → `published` → visible en `/u/[username]`
6. Si score 30-49 → `in_review`
7. Si score < 30 → `blocked`

---

## Rutas

### Públicas
| Ruta | Descripción |
|------|-------------|
| `/login` | Login con email o Google |
| `/signup` | Registro |
| `/onboarding` | Setup inicial (username) |
| `/u/[username]` | Página pública del usuario |
| `/privacy` | Política de privacidad |
| `/terms` | Términos de uso |

### Dashboard (privadas)
| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Listado de páginas |
| `/dashboard/editor/[pageId]` | Editor de página |
| `/dashboard/analytics` | Analytics por página |
| `/dashboard/safe-link` | Safe Link Score |
| `/dashboard/templates` | Galería de templates |
| `/dashboard/billing` | Plan y facturación |
| `/dashboard/settings` | Perfil y cuenta |
| `/dashboard/faq` | Ayuda |

### APIs
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/events` | POST | Registra analytics (page_view, button_click, shopify_click) |
| `/api/publish-page` | POST | Publica una página (valida score, límites plan) |
| `/api/safe-score` | POST | Calcula Safe Link Score de un payload |
| `/api/check-username` | GET | Verifica disponibilidad de username |
| `/auth/callback` | GET | Callback OAuth (Google) |

---

## Safe Link Score

Score de 0-100 que determina si una página puede publicarse:

| Score | Estado | Resultado |
|-------|--------|-----------|
| ≥ 50 | Good+ | `published` |
| 30-49 | Medium | `in_review` |
| < 30 | Risky | `blocked` |

Factores evaluados:
- URL Shopify usa HTTPS
- Sin acortadores de URL (bit.ly, tinyurl, etc.)
- Footer legal visible
- Contacto visible (email o WhatsApp)
- CTA no agresivo
- Sin claims engañosos o peligrosos

---

## Límites del Plan Free

- 1 página publicada activa
- Al intentar publicar una segunda, se muestra UpgradeModal

---

## Deploy en Vercel

```bash
npm run build   # verificar que compila
```

1. Conecta el repo a Vercel
2. Añade las variables de entorno en el dashboard de Vercel
3. En NEXT_PUBLIC_APP_URL pon tu URL de producción
4. Despliega

En Supabase Authentication → URL Configuration:
- Site URL: `https://tudominio.com`
- Redirect URLs: `https://tudominio.com/auth/callback`

---

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run type-check   # TypeScript sin compilar
npm run lint         # ESLint
```
