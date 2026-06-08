'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Clock, ExternalLink, TrendingUp, Copy, Check, Pencil, Trash2, Plus } from 'lucide-react'
import QuickExitModal from './QuickExitModal'
import UpgradeProModal from '@/components/shared/UpgradeProModal'
import type { Page } from '@/types'
import { getPublicExitUrl, getPublicExitDisplay } from '@/lib/urls'
import { getPlanLimits, type Plan } from '@/lib/plans'

interface Props {
  initialExits: Page[]
  userId: string
  username: string
  plan: Plan
  guides?: string
  opens?: string
  rate?: string
}

function useCopyFn(ms = 1500) {
  const [copied, setCopied] = useState(false)
  function copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), ms)
  }
  return { copied, copy }
}

function getDestUrl(page: Page): string {
  const cfg = (page.settings as Record<string, unknown>)?._landingConfig as Record<string, unknown> | undefined
  return (cfg?.destinationUrl as string) ?? ''
}

export default function QuickExitWidget({ initialExits, userId, username, plan, guides, opens, rate }: Props) {
  const [exits,        setExits]        = useState<Page[]>(initialExits)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [limitOpen,    setLimitOpen]    = useState(false)
  const [editing,      setEditing]      = useState<Page | null>(null)
  const cp = useCopyFn()

  const limits  = getPlanLimits(plan)
  const hasExits = exits.length > 0
  const primary  = exits[0] ?? null
  const atLimit  = exits.length >= limits.maxQuickExits

  function openCreate() {
    if (atLimit) { setLimitOpen(true); return }
    setEditing(null); setModalOpen(true)
  }
  function openEdit(page: Page) { setEditing(page); setModalOpen(true) }

  function handleSaved(page: Page) {
    setExits(prev => {
      const idx = prev.findIndex(p => p.id === page.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = page; return next }
      return [...prev, page]
    })
  }

  async function handleDelete(page: Page) {
    if (!confirm(`¿Eliminar "${page.title}"? Esta acción no se puede deshacer.`)) return
    const supabase = createClient()
    await supabase.from('pages').delete().eq('id', page.id)
    setExits(prev => prev.filter(p => p.id !== page.id))
  }

  const exitUrl = primary?.username ? getPublicExitUrl(primary.username) : ''
  const exitDisplay = primary?.username ? getPublicExitDisplay(primary.username) : ''
  const destUrl = primary ? getDestUrl(primary) : ''

  return (
    <>
      <div className="rescue-widget" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Header */}
        <div className="rescue-head" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#F647A9,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={16} color="white" strokeWidth={2} />
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, flex: 1 }}>TikTok Rescue</h3>
          {hasExits && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'rgba(16,185,129,.1)', color: '#10B981' }}>
              ● Activo
            </span>
          )}
        </div>

        {/* Empty state */}
        {!hasExits && (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16, marginTop: 0 }}>
              Ayuda a tus visitantes de TikTok a abrir tu producto fuera del navegador interno y llegar más rápido a tu tienda.
            </p>
            <button onClick={openCreate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#F647A9,#7B61FF)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(246,71,169,.3)', fontFamily: 'inherit' }}>
              <Plus size={15} /> Crear Exit Rápido
            </button>
          </div>
        )}

        {/* Configured state */}
        {hasExits && primary && (
          <div>
            {/* Name + URLs */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{primary.title}</div>
              <div style={{ fontSize: 12, color: '#7B61FF', fontFamily: 'monospace', fontWeight: 600, marginBottom: 3 }}>🔗 {exitDisplay}</div>
              {destUrl && (
                <div style={{ fontSize: 11.5, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                  <ExternalLink size={11} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{destUrl}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button onClick={() => cp.copy(exitUrl)}
                style={{ flex: 1, height: 36, borderRadius: 10, border: '1.5px solid #E4E7F0', background: cp.copied ? '#F0FDF4' : '#fff', color: cp.copied ? '#10B981' : '#374151', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit', transition: 'all .15s' }}>
                {cp.copied ? <Check size={13} /> : <Copy size={13} />}
                {cp.copied ? '¡Copiado!' : 'Copiar link'}
              </button>
              <button onClick={() => openEdit(primary)}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid #E4E7F0', background: '#fff', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pencil size={13} />
              </button>
              <button onClick={() => handleDelete(primary)}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid rgba(239,68,68,.2)', background: 'rgba(239,68,68,.04)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={13} />
              </button>
            </div>

            {/* Stats */}
            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: <Clock size={13} />, label: 'Guías mostradas', val: guides ?? '—' },
                { icon: <ExternalLink size={13} />, label: 'Aperturas en navegador', val: opens ?? '—' },
                { icon: <TrendingUp size={13} />, label: 'Tasa de éxito', val: rate ?? '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#9CA3AF', display: 'flex', flexShrink: 0 }}>{row.icon}</span>
                  <span style={{ flex: 1, fontSize: 12.5, color: '#6B7280' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{row.val}</span>
                </div>
              ))}
            </div>

            {/* Add another / upgrade nudge */}
            {atLimit ? (
              <a href="/dashboard/billing" style={{ marginTop: 12, display: 'flex', width: '100%', height: 34, borderRadius: 9, border: '1.5px dashed rgba(246,71,169,.3)', background: 'rgba(246,71,169,.04)', color: '#F647A9', fontSize: 12, fontWeight: 600, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', gap: 5, textDecoration: 'none', boxSizing: 'border-box' }}>
                ⚡ Crear Exits ilimitados →
              </a>
            ) : (
              <button onClick={openCreate} style={{ marginTop: 12, width: '100%', height: 34, borderRadius: 9, border: '1.5px dashed rgba(123,97,255,.25)', background: 'transparent', color: '#7B61FF', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit' }}>
                <Plus size={12} /> Añadir otro Exit Rápido
              </button>
            )}
          </div>
        )}

        {/* Powered by */}
        <div style={{ marginTop: 14, borderTop: '1px solid #F3F4F6', paddingTop: 10, fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
          Powered by <span style={{ fontWeight: 700 }}>Tokproof</span>
        </div>
      </div>

      <QuickExitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        username={username}
        plan={plan}
        editing={editing}
        onSaved={handleSaved}
      />
      <UpgradeProModal
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        title="Límite alcanzado"
        description="Tu plan Free incluye 1 Exit Rápido activo. Actualiza a Pro para crear exits ilimitados."
      />
    </>
  )
}
