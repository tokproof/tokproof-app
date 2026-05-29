'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Search, Plus, ExternalLink, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CreatePersonalBrandModal from '@/components/dashboard/CreatePersonalBrandModal'
import type { Page, Profile } from '@/types'
import { getPublicPageDisplay, getPublicPageUrl } from '@/lib/urls'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEffectivePageType(page: Page): 'creator_page' | 'simple_page' {
  const t = page.settings._pageType as string | undefined
  if (t === 'creator_page') return 'creator_page'
  return 'simple_page'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Hoy'
  if (d === 1) return 'Hace 1 día'
  if (d < 7)  return `Hace ${d} días`
  if (d < 14) return 'Hace 1 semana'
  if (d < 30) return `Hace ${Math.floor(d / 7)} semanas`
  return `Hace ${Math.floor(d / 30)} meses`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Page thumbnail ───────────────────────────────────────────────────────────

function PageThumb({ page }: { page: Page }) {
  const type = getEffectivePageType(page)
  const bg = type === 'creator_page'
    ? 'linear-gradient(170deg,#D9FFE8,#C7E8D7)'
    : 'linear-gradient(170deg,#D9E8FF,#C7D7FF)'
  const mediaUrl = page.settings.media_url ?? page.settings.avatar_url
  return (
    <div className="pm-thumb" style={{ background: bg }}>
      {mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', padding: '8px 7px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,.4)', margin: '0 auto 4px' }} />
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(16,185,129,.3)', width: '60%', margin: '0 auto' }} />
          <div style={{ height: 4, borderRadius: 3, background: 'rgba(16,185,129,.2)', width: '80%', margin: '0 auto' }} />
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(16,185,129,.35)', marginTop: 4 }} />
        </div>
      )}
    </div>
  )
}

// ─── Type chip ────────────────────────────────────────────────────────────────

function TypeChip({ page }: { page: Page }) {
  const type = getEffectivePageType(page)
  if (type === 'creator_page') return <span className="pm-type-chip pm-type-creator">⭐ Creator Page</span>
  return <span className="pm-type-chip pm-type-simple">🔗 Simple Page</span>
}

// ─── Row menu ─────────────────────────────────────────────────────────────────

function RowMenu({ page, onDeleted }: { page: Page; onDeleted: (id: string) => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const publicUrl = page.username ? getPublicPageUrl(page.username) : null

  async function handleDelete() {
    if (!confirm('¿Eliminar esta página?')) return
    const supabase = createClient()
    await supabase.from('pages').delete().eq('id', page.id)
    onDeleted(page.id)
    setOpen(false)
  }

  async function handleDuplicate() {
    const supabase = createClient()
    const { data } = await supabase.from('pages').insert({
      user_id: page.user_id,
      username: page.username,
      type: page.type,
      status: 'draft',
      title: `${page.title} (copia)`,
      settings: page.settings,
    }).select().single()
    if (data) router.push(`/dashboard/editor/${data.id}`)
    setOpen(false)
  }

  const items = [
    page.username && page.status === 'published'
      ? { icon: '👁', label: 'Ver página', onClick: () => { window.open(`/u/${page.username}`, '_blank'); setOpen(false) } }
      : null,
    { icon: '✏', label: 'Editar', onClick: () => { router.push(`/dashboard/editor/${page.id}`); setOpen(false) } },
    publicUrl && page.status === 'published'
      ? { icon: '🔗', label: 'Copiar link', onClick: () => { navigator.clipboard?.writeText(publicUrl); setOpen(false) } }
      : null,
    { icon: '⧉', label: 'Duplicar', onClick: handleDuplicate },
    { icon: '🗑', label: 'Eliminar', onClick: handleDelete, danger: true },
  ].filter(Boolean) as { icon: string; label: string; onClick: () => void; danger?: boolean }[]

  return (
    <div style={{ position: 'relative' }}>
      <button className="pm-menu-btn" onClick={e => { e.stopPropagation(); setOpen(v => !v) }}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div className="pm-menu-dropdown">
            {items.map((item, i) => (
              <button key={i} className={`pm-menu-item${item.danger ? ' danger' : ''}`} onClick={item.onClick}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E4E7F0', overflow: 'hidden' }}>
      <div className="pm-empty">
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(16,185,129,.12),rgba(6,182,212,.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <User size={44} color="#10B981" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="pm-empty-title">Aún no tienes páginas de Marca Personal</h2>
        <p className="pm-empty-sub">
          Crea una página para compartir tus enlaces, servicios, redes y contenido.
        </p>
        <div className="pm-empty-actions">
          <button className="btn btn-primary" style={{ minWidth: 220, justifyContent: 'center', background: 'linear-gradient(135deg,#10B981,#06B6D4)' }} onClick={onCreateClick}>
            <Plus size={16} /> Crear mi primera página
          </button>
          <button className="btn btn-ghost" style={{ minWidth: 220, justifyContent: 'center', fontSize: 13 }}>
            Ver ejemplos
          </button>
        </div>
        <div className="pm-empty-benefits">
          {[
            { icon: '🔗', label: 'Links en una sola página', desc: 'Todos tus enlaces en un lugar.' },
            { icon: '📱', label: 'Redes sociales',            desc: 'Conecta todas tus redes.' },
            { icon: '💼', label: 'Servicios y reservas',      desc: 'Muestra lo que ofreces.' },
            { icon: '✨', label: 'Diseño profesional',         desc: 'Personalizado con tu marca.' },
          ].map(b => (
            <div key={b.label} className="pm-benefit">
              <div className="pm-benefit-icon" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.1),rgba(6,182,212,.1))' }}>
                {b.icon}
              </div>
              <div className="pm-benefit-label">{b.label}</div>
              <div className="pm-benefit-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  profile: Profile
  allPages: Page[]
}

type TypeFilter   = 'all' | 'creator_page' | 'simple_page'
type StatusFilter = 'all' | 'published' | 'draft'

export default function PersonalBrandClient({ profile, allPages }: Props) {
  const pbPages = allPages.filter(p => p.settings._category === 'personal_brand')

  const [pageList,     setPageList]     = useState<Page[]>(pbPages)
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search,       setSearch]       = useState('')
  const [createOpen,   setCreateOpen]   = useState(false)

  const filtered = pageList
    .filter(p => typeFilter === 'all' || getEffectivePageType(p) === typeFilter)
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => {
      if (!search) return true
      const q = search.toLowerCase()
      return p.title?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)
    })

  return (
    <div className="pm-page">
      <div className="pm-main">

        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="pm-header-icon" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.12),rgba(6,182,212,.12))' }}>
              <User size={26} color="#10B981" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="pm-header-title">Marca Personal</h1>
              <p className="pm-header-sub">
                {pageList.length === 0
                  ? 'Crea páginas para compartir tus enlaces, servicios, redes y contenido.'
                  : 'Gestiona tus páginas de enlaces, servicios y contenido.'}
              </p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg,#10B981,#06B6D4)', boxShadow: 'none' }} onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> Nueva página
          </button>
        </div>

        {/* Filters */}
        {pageList.length > 0 && (
          <div className="pm-filters">
            <div className="pm-filter-group">
              {([
                { key: 'all',          label: 'Todas'         },
                { key: 'creator_page', label: 'Creator Pages' },
                { key: 'simple_page',  label: 'Simple Pages'  },
              ] as const).map(f => (
                <button key={f.key} className={`pm-filter-btn ${typeFilter === f.key ? 'active' : ''}`}
                  onClick={() => setTypeFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            <div className="pm-status-group">
              {([
                { key: 'all',       label: 'Todas'        },
                { key: 'published', label: '● Publicadas' },
                { key: 'draft',     label: '● Borradores' },
              ] as const).map(f => (
                <button key={f.key} className={`pm-filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            <div className="pm-search-box">
              <Search size={13} color="#9CA3AF" />
              <input
                placeholder="Buscar páginas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {pageList.length === 0 ? (
          <EmptyState onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <div className="pm-table">
            <div className="pm-table-header">
              <div className="pm-table-th pm-col-page">Página</div>
              <div className="pm-table-th pm-col-type">Tipo</div>
              <div className="pm-table-th pm-col-status">Estado</div>
              <div className="pm-table-th pm-col-score" style={{ visibility: 'hidden' }}>Score</div>
              <div className="pm-table-th pm-col-date">Última edición</div>
              <div className="pm-table-th pm-col-action" />
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                No hay páginas que coincidan con los filtros.
              </div>
            ) : filtered.map(page => {
              const display = page.username ? getPublicPageDisplay(page.username) : null
              return (
                <div key={page.id} className="pm-table-row">
                  <div className="pm-table-cell pm-col-page">
                    <PageThumb page={page} />
                    <div>
                      <div className="pm-page-name">{page.title ?? 'Sin título'}</div>
                      {display && (
                        <div className="pm-page-url" style={{ color: '#10B981' }}>
                          <ExternalLink size={10} />{display}
                        </div>
                      )}
                      <div className="pm-page-date">
                        Creada el {new Date(page.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="pm-table-cell pm-col-type"><TypeChip page={page} /></div>
                  <div className="pm-table-cell pm-col-status">
                    {page.status === 'published'
                      ? <span className="pm-status-pub">● Publicada</span>
                      : <span className="pm-status-draft">● Borrador</span>}
                  </div>
                  <div className="pm-table-cell pm-col-score" />
                  <div className="pm-table-cell pm-col-date">
                    <div>
                      <div className="pm-date-main">{timeAgo(page.updated_at)}</div>
                      <div className="pm-date-sub">{formatDate(page.updated_at)}</div>
                    </div>
                  </div>
                  <div className="pm-table-cell pm-col-action" style={{ justifyContent: 'flex-end' }}>
                    <RowMenu page={page} onDeleted={id => setPageList(prev => prev.filter(p => p.id !== id))} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CreatePersonalBrandModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        userId={profile.user_id}
        username={profile.username}
      />
    </div>
  )
}
