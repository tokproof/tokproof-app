'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Link2, MoreHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Page } from '@/types'
import { getPublicPageUrl, getPublicExitUrl, getPublicPageDisplay, getPublicExitDisplay } from '@/lib/urls'
import PageMiniPreview from '@/components/shared/PageMiniPreview'

interface PageCardProps {
  page: Page
  pageNumber: number
  onDeleted?: (id: string) => void
  stats?: { views: string; clicks: string; ctr: string }
}

export default function PageCard({ page, pageNumber, onDeleted, stats }: PageCardProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; right: number }>({ top: 0, right: 0 })
  const [publishing, setPublishing] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const isPublished = page.status === 'published'
  const isSimple    = page.type === 'simple'
  const deEnabled   = page.settings.direct_exit_enabled
  const deUrl       = page.settings.direct_exit_url
  const publicUrl     = page.username ? getPublicPageUrl(page.username)     : null
  const publicDisplay = page.username ? getPublicPageDisplay(page.username) : null
  const goUrl         = page.username ? getPublicExitUrl(page.username)     : null
  const goDisplay     = page.username ? getPublicExitDisplay(page.username) : null

  const createdAt = new Date(page.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  function openMenu(e: React.MouseEvent) {
    e.stopPropagation()
    if (!btnRef.current) return
    const rect  = btnRef.current.getBoundingClientRect()
    const right = window.innerWidth - rect.right
    const spaceBelow = window.innerHeight - rect.bottom
    if (spaceBelow < 300) {
      setMenuPos({ bottom: window.innerHeight - rect.top + 4, right })
    } else {
      setMenuPos({ top: rect.bottom + 4, right })
    }
    setMenuOpen(v => !v)
  }

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
    { icon: '✏️', label: 'Editar',       onClick: () => { router.push(`/dashboard/editor/${page.id}`); setMenuOpen(false) } },
    isPublished && page.username
      ? { icon: '👁', label: 'Vista previa',  onClick: () => { window.open(`/u/${page.username}`, '_blank'); setMenuOpen(false) } }
      : null,
    { icon: '📊', label: 'Analytics',    onClick: () => { router.push('/dashboard/analytics'); setMenuOpen(false) } },
    { icon: '⧉',  label: 'Duplicar',    onClick: () => { handleDuplicate(); setMenuOpen(false) } },
    publicUrl && isPublished
      ? { icon: '🔗', label: 'Copiar link', onClick: () => { navigator.clipboard?.writeText(publicUrl); setMenuOpen(false) } }
      : null,
    !isPublished
      ? { icon: '🚀', label: publishing ? '...' : 'Publicar', onClick: handlePublish }
      : null,
    { icon: '🗑', label: 'Eliminar',     onClick: handleDelete, danger: true },
  ].filter(Boolean) as { icon: string; label: string; onClick: () => void; danger?: boolean }[]

  const dropdownStyle: React.CSSProperties = {
    position: 'fixed',
    right: menuPos.right,
    zIndex: 1000,
    ...(menuPos.bottom !== undefined ? { bottom: menuPos.bottom } : { top: menuPos.top }),
  }

  return (
    <div className="page-row" onClick={() => menuOpen && setMenuOpen(false)}>

      {/* Thumbnail — real preview from landingConfig */}
      <div style={{
        width: 64, height: 96, borderRadius: 14,
        background: '#1a1a1a', padding: 5,
        boxShadow: '0 6px 16px rgba(40,20,80,.18)',
        margin: '0 auto', flexShrink: 0, overflow: 'hidden',
      }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden' }}>
          <PageMiniPreview page={page} />
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

        {/* Menu — position: fixed dropdown that always escapes overflow */}
        <div style={{ flexShrink: 0 }}>
          <button
            ref={btnRef}
            className="page-menu-btn"
            onClick={openMenu}
            title="Más opciones"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setMenuOpen(false)} />
              <div className="page-menu-dropdown" style={dropdownStyle}>
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    className={`page-menu-item${item.danger ? ' danger' : ''}`}
                    onClick={e => { e.stopPropagation(); item.onClick() }}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
