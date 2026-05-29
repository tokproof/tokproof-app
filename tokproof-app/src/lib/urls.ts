// Canonical public domain where user landing pages are served.
// Falls back to https://tokproof.app if the env var is missing.
const PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? 'https://tokproof.app'

/** Full base URL — https://tokproof.app */
export function getPublicBaseUrl(): string {
  return PUBLIC_APP_URL
}

/** Full page URL — https://tokproof.app/@slug */
export function getPublicPageUrl(slug: string): string {
  return `${PUBLIC_APP_URL}/@${slug}`
}

/** Full exit/go URL — https://tokproof.app/@slug/go */
export function getPublicExitUrl(slug: string): string {
  return `${PUBLIC_APP_URL}/@${slug}/go`
}

/** Display form (no scheme) — tokproof.app/@slug */
export function getPublicPageDisplay(slug: string): string {
  return `${PUBLIC_APP_URL.replace(/^https?:\/\//, '')}/@${slug}`
}

/** Display form (no scheme) — tokproof.app/@slug/go */
export function getPublicExitDisplay(slug: string): string {
  return `${PUBLIC_APP_URL.replace(/^https?:\/\//, '')}/@${slug}/go`
}

/** Hostname only — tokproof.app — for URL prefix labels in input fields */
export function getPublicHostname(): string {
  return PUBLIC_APP_URL.replace(/^https?:\/\//, '')
}
