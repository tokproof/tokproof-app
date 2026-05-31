// ─── Types ────────────────────────────────────────────────────────────────────

export type Tint = 'pink' | 'purple' | 'blue' | 'green' | 'orange' | 'red'

export interface Category {
  title:   string
  sub:     string
  tint:    Tint
  icoPath: string
}

export interface FaqItem {
  tint:    Tint
  icoPath: string
  q:       string
  a:       string
}

export interface Resource {
  tint:    Tint
  icoPath: string
  title:   string
  sub:     string
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  {
    title: 'TikTok Rescue', sub: 'Guías y protección de clics', tint: 'pink',
    icoPath: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke-width="1.6"/><path d="M12 8.5l1 2 2.2.3-1.6 1.5.4 2.2L12 13.5l-2 1 .4-2.2L8.8 10.8 11 10.5z" fill="currentColor" stroke="none"/>',
  },
  {
    title: 'Trust Pages', sub: 'Páginas que generan confianza', tint: 'purple',
    icoPath: '<path d="M6 2h9l4 4v16H6z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>',
  },
  {
    title: 'Analytics', sub: 'Métricas y rendimiento', tint: 'blue',
    icoPath: '<line x1="6" y1="20" x2="6" y2="13"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="9"/>',
  },
  {
    title: 'Dominios', sub: 'Conecta tu propio dominio', tint: 'green',
    icoPath: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
  },
  {
    title: 'Facturación', sub: 'Planes y suscripción', tint: 'orange',
    icoPath: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/>',
  },
  {
    title: 'Publicación', sub: 'Cómo compartir tus páginas', tint: 'pink',
    icoPath: '<path d="M5 15c-1 1-2 5-2 5s4-1 5-2"/><path d="M12.5 18.5l-7-7C7 6 12 3 19 3c0 7-3 12-8.5 13.5z"/><circle cx="14.5" cy="8.5" r="1.6"/>',
  },
]

// ─── FAQ items ────────────────────────────────────────────────────────────────
export const FAQS: FaqItem[] = [
  {
    tint: 'pink',
    icoPath: '<circle cx="12" cy="12" r="10"/><path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 2-2.8 2.5-2.8 2.5"/><line x1="12" y1="17" x2="12" y2="17"/>',
    q: '¿Qué es Tokproof?',
    a: 'Tokproof te permite crear páginas optimizadas para tráfico social, medir resultados y proteger tus clics mediante herramientas como TikTok Rescue.',
  },
  {
    tint: 'purple',
    icoPath: '<path d="M6 2h9l4 4v16H6z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/>',
    q: '¿Qué diferencia hay entre una Trust Page y una Simple Page?',
    a: 'Una Trust Page incluye señales de confianza (reseñas, garantías y branding seguro) pensadas para conversión, mientras que una Simple Page es un enlace directo más básico.',
  },
  {
    tint: 'pink',
    icoPath: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    q: '¿Cómo funciona TikTok Rescue?',
    a: 'TikTok Rescue detecta cuando un usuario abre tu enlace en el navegador interno de TikTok y lo guía para abrirlo en un navegador externo, recuperando clics que de otro modo se perderían.',
  },
  {
    tint: 'purple',
    icoPath: '<line x1="6" y1="20" x2="6" y2="13"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="9"/>',
    q: '¿Qué significa la tasa de rescate?',
    a: 'Es el porcentaje de usuarios que, tras hacer clic en TikTok, logran llegar a tu contenido en un navegador externo gracias a TikTok Rescue.',
  },
  {
    tint: 'blue',
    icoPath: '<polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/>',
    q: '¿Qué métricas puedo ver?',
    a: 'Landing Views, visitantes únicos, clicks, CTR, Rescue Rate, Exit Guide Views y Open Browser Clicks, además del rendimiento por país, dispositivo y fuente de tráfico.',
  },
  {
    tint: 'pink',
    icoPath: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/>',
    q: '¿Puedo usar Tokproof con Instagram?',
    a: 'Sí. Tokproof funciona con cualquier fuente de tráfico social, incluyendo Instagram, YouTube y enlaces directos en bio.',
  },
  {
    tint: 'green',
    icoPath: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
    q: '¿Puedo conectar mi propio dominio?',
    a: 'Con el plan Pro puedes conectar un dominio personalizado para que tus páginas usen tu propia marca en lugar de tokproof.app.',
  },
  {
    tint: 'orange',
    icoPath: '<polygon points="12 3 21 8 12 13 3 8"/><polyline points="3 12 12 17 21 12"/><polyline points="3 16 12 21 21 16"/>',
    q: '¿Cuántas páginas puedo crear?',
    a: 'El plan Free permite 1 página publicada. Con Pro puedes crear páginas ilimitadas.',
  },
  {
    tint: 'blue',
    icoPath: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    q: '¿Las estadísticas son en tiempo real?',
    a: 'Los datos se actualizan cada 15 minutos y todas las métricas se muestran en tu hora local.',
  },
  {
    tint: 'purple',
    icoPath: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M12 8.5l1 2 2.2.3-1.6 1.5.4 2.2L12 13.5l-2 1 .4-2.2L8.8 10.8 11 10.5z" fill="currentColor" stroke="none"/>',
    q: '¿Qué es el Safe Link Score?',
    a: 'Es una puntuación que evalúa qué tan seguro y confiable es tu enlace para las plataformas sociales, ayudándote a reducir bloqueos y aumentar la entrega.',
  },
  {
    tint: 'green',
    icoPath: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/>',
    q: '¿Necesito Shopify?',
    a: 'No. Tokproof funciona de forma independiente, pero puedes enlazar tus páginas a tu tienda Shopify o a cualquier otra plataforma si lo deseas.',
  },
]

// ─── Resources ────────────────────────────────────────────────────────────────
export const RESOURCES: Resource[] = [
  {
    tint: 'red', title: 'Videos tutoriales', sub: 'Aprende paso a paso',
    icoPath: '<rect x="3" y="5" width="18" height="14" rx="3"/><polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none"/>',
  },
  {
    tint: 'purple', title: 'Blog y novedades', sub: 'Consejos y actualizaciones',
    icoPath: '<path d="M6 2h9l4 4v16H6z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/>',
  },
  {
    tint: 'green', title: 'Estado del sistema', sub: 'Todo funcionando',
    icoPath: '<circle cx="12" cy="12" r="9"/><polyline points="8.5 12 11 14.5 15.5 9.5"/>',
  },
]
