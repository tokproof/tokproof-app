import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Solo se permiten URLs http/https' }, { status: 400 })
    }

    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Tokproof/1.0; +https://tokproof.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `No se pudo acceder a la página (${res.status})` }, { status: 400 })
    }

    const html = await res.text()
    const imageUrl = extractMetaImage(html, parsedUrl)

    if (!imageUrl) {
      return NextResponse.json({ error: 'No se encontró imagen en la página' }, { status: 404 })
    }

    return NextResponse.json({ imageUrl })
  } catch {
    return NextResponse.json({ error: 'Error al extraer imagen' }, { status: 500 })
  }
}

function extractMetaImage(html: string, base: URL): string | null {
  const patterns = [
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    /name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    /property=["']product:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']product:image["']/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const raw = match[1].trim()
      try {
        return new URL(raw, base).toString()
      } catch {
        return raw
      }
    }
  }

  return null
}
