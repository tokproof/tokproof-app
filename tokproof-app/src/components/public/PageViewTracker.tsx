'use client'

import { useEffect } from 'react'
import { getSessionId } from '@/lib/session'

interface Props {
  pageId: string
  slug: string
}

export default function PageViewTracker({ pageId, slug }: Props) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageId,
        slug,
        eventType: 'page_view',
        sessionId: getSessionId(),
        metadata: { referer: document.referrer },
      }),
    }).catch(() => {})
  }, [pageId, slug])

  return null
}
