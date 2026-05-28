'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PageType } from '@/types'

interface NewLandingModalProps {
  open: boolean
  onClose: () => void
  userId: string
  username: string | null
  canPublishMore: boolean
}

export default function NewLandingModal({
  open, onClose, userId, username, canPublishMore,
}: NewLandingModalProps) {
  const router = useRouter()
  const [type, setType] = useState<PageType>('trust')
  const [creating, setCreating] = useState(false)

  if (!open) return null

  async function handleCreate() {
    setCreating(true)
    const supabase = createClient()
    const { data: page } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        username,
        type,
        status: 'draft',
        title: type === 'trust' ? 'Nueva Trust Page' : 'Nueva Simple Page',
        settings: {},
      })
      .select()
      .single()

    onClose()
    router.push(`/dashboard/editor/${page?.id}`)
  }

  return (
    <div
      className="nl-overlay open"
      onClick={e => { if (e.currentTarget === e.target) onClose() }}
    >
      <div className="nl-modal">
        <h2 className="nl-modal-title">New landing page</h2>
        <p className="nl-modal-sub">Elige el formato que mejor encaja con tu producto.</p>

        <div className="nl-type-grid">
          <div
            className={`nl-type-card ${type === 'trust' ? 'selected' : ''}`}
            onClick={() => setType('trust')}
          >
            <div className="nl-type-ico">🛡</div>
            <div style={{ flex: 1 }}>
              <div className="nl-type-name">Trust Page</div>
              <div className="nl-type-desc">1 producto · social proof · CTA directo a Shopify. Ideal para TikTok Shop.</div>
              <div className="nl-type-tags">
                <span className="pt-tag">reviews</span>
                <span className="pt-tag">Shopify</span>
                <span className="pt-tag">social proof</span>
              </div>
              <a href={`/@${username}`} className="nl-type-preview" target="_blank" onClick={e => e.stopPropagation()}>Ver ejemplo →</a>
            </div>
          </div>

          <div
            className={`nl-type-card ${type === 'simple' ? 'selected' : ''}`}
            onClick={() => setType('simple')}
          >
            <div className="nl-type-ico">🔗</div>
            <div style={{ flex: 1 }}>
              <div className="nl-type-name">Simple Page</div>
              <div className="nl-type-desc">Múltiples links y productos · Linktree premium para creadores.</div>
              <div className="nl-type-tags">
                <span className="pt-tag">links</span>
                <span className="pt-tag">WhatsApp</span>
                <span className="pt-tag">creator</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flexShrink: 0 }}>Cancelar</button>
          <button className="btn btn-primary btn-full" onClick={handleCreate} disabled={creating}>
            {creating ? 'Creando...' : 'Crear página →'}
          </button>
        </div>
      </div>
    </div>
  )
}
