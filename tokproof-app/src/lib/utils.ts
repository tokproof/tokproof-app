import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const RESERVED_USERNAMES = [
  'admin', 'login', 'dashboard', 'api', 'settings', 'billing',
  'support', 'help', 'terms', 'privacy', 'contact', 'register',
  'signup', 'app', 'tokproof', 'tiktok', 'shopify', 'demo',
  'test', 'user', 'root', 'onboarding', 'u',
]

export function isValidUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) return { valid: false, error: 'Mínimo 3 caracteres' }
  if (username.length > 30) return { valid: false, error: 'Máximo 30 caracteres' }
  if (!/^[a-z0-9_-]+$/.test(username))
    return { valid: false, error: 'Solo letras, números, guión y guión bajo' }
  if (RESERVED_USERNAMES.includes(username))
    return { valid: false, error: 'Username no disponible' }
  return { valid: true }
}

export function getDeviceType(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return 'mobile'
  if (/tablet/i.test(ua)) return 'tablet'
  return 'desktop'
}

export function getBrowser(ua: string): string {
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) return 'Chrome'
  if (/firefox/i.test(ua)) return 'Firefox'
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari'
  if (/edge/i.test(ua)) return 'Edge'
  return 'Other'
}
