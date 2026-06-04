'use client'

import { useEffect } from 'react'
import { getSessionId } from '@/lib/session'

interface Props {
  pageId: string
  slug: string
}

export default function PageViewTracker({ pageId, slug }: Props) {
  useEffect(() => {
    const payload = {
      pageId,
      slug,
      eventType: 'page_view',
      sessionId: getSessionId(),
      metadata: { referer: document.referrer },
    }
    // DEBUG: temporary log — remove after analytics confirmed working
    console.log('[tracker] sending page_view', { pageId, slug, endpoint: '/api/track' })

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async res => {
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          console.error('[tracker] page_view FAILED', { status: res.status, body: json })
        } else {
          console.log('[tracker] page_view OK', json)
        }
      })
      .catch(err => console.error('[tracker] page_view fetch error:', err))
  }, [pageId, slug])

  return null
}
