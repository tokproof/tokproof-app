'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Calendar, Link2, MoreHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Page } from '@/types'
import { getPublicPageUrl, getPublicExitUrl, getPublicPageDisplay, getPublicExitDisplay } from '@/lib/urls'

interface PageCardProps {
  page: Page
  pageNumber: number
  onDeleted?: (id: string) => void
  stats?: { views: string; clicks: string; ctr: string }
}

export default function PageCard({ page, pageNumber, onDeleted, stats }: PageCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const isPublished = page.status === 'published'
  const isSimple = page.type === 'simple'
  const deEnabled = page.settings.direct_exit_enabled
  const deUrl = page.settings.direct_exit_url
  const publicUrl     = page.username ? getPublicPageUrl(page.username)     : null
  const publicDisplay = page.username ? getPublicPageDisplay(page.username) : null
  const goUrl         = page.username ? getPublicExitUrl(page.username)     : null
  const goDisplay     = page.username ? getPublicExitDisplay(page.username) : null

  const createdAt = new Date(page.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  async function handlePublish() {
    setPublishing(true)
    try {
      const res = await fetch('/api/publish-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: page.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Error al publicar')
      } else {
        window.location.reload()
      }
    } finally {
      setPublishing(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta página? Esta acción no se puede deshacer.')) return
    const supabase = createClient()
    await supabase.from('pages').delete().eq('id', page.id)
    onDeleted?.(page.id)
  }

  async function handleDuplicate() {
    const supabase = createClient()
    const { data } = await supabase.from('pages').insert({
      user_id: page.user_id,
      username: page.username,
      type: page.type,
      status: 'draft',
      title: `${page.title} (copia)`,
      brand_name: page.brand_name,
      product_name: page.product_name,
      shopify_url: page.shopify_url,
      settings: page.settings,
    }).select().single()
    if (data) window.location.href = `/dashboard/editor/${data.id}`
  }

  const menuItems = [
    { icon: '✏', label: 'Editar', onClick: () => { window.location.href = `/dashboard/editor/${page.id}` } },
    isPublished && page.username ? { icon: '👁', label: 'Ver página', onClick: () => window.open(`/u/${page.username}`, '_blank') } : null,
    { icon: '⧉', label: 'Duplicar', onClick: handleDuplicate },
    publicUrl && isPublished ? { icon: '🔗', label: 'Copiar link', onClick: () => navigator.clipboard?.writeText(publicUrl) } : null,
    !isPublished ? { icon: '🚀', label: publishing ? '...' : 'Publicar', onClick: handlePublish } : null,
    { icon: '🗑', label: 'Eliminar', onClick: handleDelete, danger: true },
  ].filter(Boolean) as { icon: string; label: string; onClick: () => void; danger?: boolean }[]

  return (
    <div className="page-row" onClick={() => menuOpen && setMenuOpen(false)}>

      {/* Thumbnail — mini phone bezel */}
      <div style={{
        width: 64, height: 96, borderRadius: 14,
        background: '#1a1a1a', padding: 5,
        boxShadow: '0 6px 16px rgba(40,20,80,.18)',
        margin: '0 auto', flexShrink: 0,
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden',
          background: isSimple
            ? 'linear-gradient(170deg,#D9E8FF,#C7D7FF)'
            : 'linear-gradient(170deg,#FFD9F0,#E4D7FF)',
          display: 'flex', flexDirection: 'column', padding: 6,
        }}>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(123,97,255,.35)', marginBottom: 4 }} />
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(123,97,255,.2)', width: '50%', marginBottom: 4 }} />
          <div style={{ flex: 1, borderRadius: 6, background: 'white', opacity: .85, marginTop: 4 }} />
        </div>
      </div>

      {/* Info */}
      <div className="page-info">
        <div className="page-info-top">
          <span className="page-info-name">{page.title ?? page.product_name ?? 'Sin título'}</span>
          <span className={`page-badge ${isSimple ? 'page-badge-simple' : 'page-badge-trust'}`}>
            {isSimple ? 'SIMPLE PAGE' : 'TRUST PAGE'}
          </span>
          <span className={`page-badge ${isPublished ? 'page-badge-pub' : 'page-badge-draft'}`}>
            {isPublished ? '● Publicada' : 'Borrador'}
          </span>
        </div>
        {page.shopify_url && (
          <div className="page-info-store">
            {(() => { try { return new URL(page.shopify_url).hostname } catch { return page.shopify_url } })()}
          </div>
        )}
        <div className="page-info-date" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Calendar size={11} />
          Creada el {createdAt}
        </div>
        {publicDisplay && (
          <div className="page-info-links" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="page-link-pill">
              <Link2 size={11} /> {publicDisplay}
            </span>
            {goDisplay && deEnabled && deUrl && (
              <span className="page-link-pill">
                <Link2 size={11} /> {goDisplay}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="page-stats">
        <div className="page-stat">
          <div className="page-stat-l">Vistas</div>
          <div className="page-stat-v">{stats?.views ?? '—'}</div>
        </div>
        <div className="page-stat">
          <div className="page-stat-l">Clicks</div>
          <div className="page-stat-v">{stats?.clicks ?? '—'}</div>
        </div>
        <div className="page-stat">
          <div className="page-stat-l">CTR</div>
          <div className="page-stat-v">{stats?.ctr ?? '—'}</div>
        </div>
      </div>

      {/* Right: DE badge + menu */}
      <div className="page-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className={`page-de-badge ${deEnabled && deUrl ? 'on' : 'off'}`}>
          Direct Exit
          {deEnabled && deUrl
            ? <span className="on-pill">ON</span>
            : <span className="off-pill">OFF</span>
          }
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            className="page-menu-btn"
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
            title="Más opciones"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="page-menu-dropdown" onClick={e => e.stopPropagation()}>
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  className={`page-menu-item${item.danger ? ' danger' : ''}`}
                  onClick={() => { item.onClick(); setMenuOpen(false) }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
