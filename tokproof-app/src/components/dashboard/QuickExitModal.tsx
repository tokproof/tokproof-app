'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPublicExitDisplay } from '@/lib/urls'
import type { Page } from '@/types'
import type { Plan } from '@/lib/plans'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  /** Profile username — auto-used for Free, editable for Pro */
  username: string
  plan: Plan
  /** Pass an existing page to edit it */
  editing?: Page | null
  onSaved: (page: Page) => void
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30)
}

export default function QuickExitModal({ open, onClose, userId, username, plan, editing, onSaved }: Props) {
  const isEditing = !!editing
  const isPro = plan !== 'free'

  const [name,          setName]          = useState('')
  const [slug,          setSlug]          = useState(username)
  const [destUrl,       setDestUrl]       = useState('')
  const [tiktokProfile, setTiktokProfile] = useState('')
  const [slugStatus,    setSlugStatus]    = useState<SlugStatus>('idle')
  const [urlError,      setUrlError]      = useState('')
  const [tiktokError,   setTiktokError]   = useState('')
  const [saving,        setSaving]        = useState(false)
  const [slugTouched,   setSlugTouched]   = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const cfg = (editing.settings as Record<string, unknown>)?._landingConfig as Record<string, unknown> | undefined
      setName(editing.title ?? '')
      setSlug(editing.username ?? username)
      setDestUrl((cfg?.destinationUrl as string) ?? '')
      setTiktokProfile((cfg?.tiktokProfile as string) ?? '')
      setSlugStatus('available')
      setSlugTouched(true)
      setTiktokError('')
    } else {
      setName(''); setSlug(username); setDestUrl(''); setTiktokProfile('')
      setSlugStatus('idle'); setSlugTouched(false); setUrlError(''); setTiktokError('')
    }
  }, [open, editing, username])

  const checkSlug = useCallback(async (s: string) => {
    if (!s || s.length < 2) { setSlugStatus('invalid'); return }
    setSlugStatus('checking')
    const supabase = createClient()
    const query = supabase.from('pages').select('id').eq('username', s)
    if (editing) query.neq('id', editing.id)
    const { data } = await query.limit(1)
    setSlugStatus(data && data.length > 0 ? 'taken' : 'available')
  }, [editing])

  useEffect(() => {
    if (!isPro || !slugTouched || isEditing) return
    const t = setTimeout(() => checkSlug(slug), 500)
    return () => clearTimeout(t)
  }, [slug, slugTouched, checkSlug, isEditing, isPro])

  function handleSlugChange(v: string) {
    setSlugTouched(true)
    setSlug(slugify(v))
  }

  function validateUrl(v: string): boolean {
    if (!v) { setUrlError('La URL es obligatoria'); return false }
    if (!v.startsWith('https://') && !v.startsWith('http://')) {
      setUrlError('La URL debe empezar por https://'); return false
    }
    setUrlError(''); return true
  }

  function validateTikTok(v: string): boolean {
    if (!v.replace(/^@/, '').trim()) {
      setTiktokError('No puedes publicar este Quick Exit sin indicar la cuenta de TikTok donde se utilizará.')
      return false
    }
    setTiktokError(''); return true
  }

  async function handleSave() {
    if (!validateUrl(destUrl)) return
    if (!validateTikTok(tiktokProfile)) return
    const effectiveSlug = isPro ? slug : username
    if (!effectiveSlug || effectiveSlug.length < 2) return
    if (isPro && !isEditing && slugStatus !== 'available') return

    setSaving(true)
    const supabase = createClient()
    const cleanHandle = tiktokProfile.replace(/^@/, '').trim()

    const landingConfig = {
      pageType: 'quick_exit',
      title: name,
      slug: effectiveSlug,
      status: 'published',
      destinationUrl: destUrl,
      tiktokProfile: cleanHandle,
      settings: {
        enableBrowserGuide: true,
        showTokproofBranding: true,
        directExitUrl: destUrl,
        enableTikTokRescue: true,
        seoTitle: name,
        seoDescription: '',
      },
    }

    let page: Page | null = null

    if (isEditing && editing) {
      const { data } = await supabase.from('pages')
        .update({ title: name, settings: { ...(editing.settings as object), _category: 'ecommerce', _pageType: 'quick_exit', _landingConfig: landingConfig } })
        .eq('id', editing.id)
        .select().single()
      page = data as Page | null
    } else {
      const { data } = await supabase.from('pages')
        .insert({ user_id: userId, username: effectiveSlug, type: 'simple', status: 'published', title: name, settings: { _category: 'ecommerce', _pageType: 'quick_exit', _landingConfig: landingConfig } })
        .select().single()
      page = data as Page | null
    }

    setSaving(false)
    if (page) { onSaved(page); onClose() }
  }

  if (!open) return null

  const slugOk    = !isPro || isEditing || slugStatus === 'available'
  const tikOk     = tiktokProfile.replace(/^@/, '').trim().length > 0
  const canSubmit = name.trim() && destUrl && tikOk && slugOk && !saving

  const slugColor = slugStatus === 'available' ? '#10B981' : slugStatus === 'taken' ? '#EF4444' : slugStatus === 'invalid' ? '#EF4444' : '#9CA3AF'
  const slugMsg   = slugStatus === 'available' ? '✓ Disponible' : slugStatus === 'taken' ? '✕ No disponible' : slugStatus === 'checking' ? '…' : ''

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(10,10,20,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.currentTarget === e.target) onClose() }}>
      <div style={{ background: 'var(--card)', borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(10,10,30,.22)', animation: 'cmSlideUp .22s var(--p-ease)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#F647A9,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14 }}>🛡️</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-.02em' }}>
                {isEditing ? 'Editar Exit Rápido' : 'Crear Exit Rápido'}
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              Pega la URL de tu producto o tienda y Tokproof generará un enlace preparado para TikTok.
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted2)', flexShrink: 0, marginLeft: 12 }}>
            <X size={14} />
          </button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Mi Marca"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--text)', background: 'var(--bg2)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        {/* Slug: editable for Pro, read-only for Free */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>
            Tu enlace TikTok Rescue
            {isPro && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(123,97,255,.1)', color: 'var(--purple)' }}>PRO</span>}
          </label>
          {isPro ? (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', position: 'relative' }}>
                <span style={{ padding: '9px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: 'var(--r) 0 0 var(--r)', fontSize: 13, color: 'var(--muted2)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>@</span>
                <input value={slug} onChange={e => handleSlugChange(e.target.value)} placeholder={username} disabled={isEditing}
                  style={{ flex: 1, padding: '9px 12px', paddingRight: slugStatus !== 'idle' && slugMsg ? 112 : 12, borderRadius: '0 var(--r) var(--r) 0', border: '1px solid var(--border)', borderLeft: 'none', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'inherit', background: isEditing ? 'var(--bg)' : 'var(--bg2)' }} />
                {slugStatus !== 'idle' && slugMsg && (
                  <span style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6, pointerEvents: 'none',
                    background: slugStatus === 'available' ? 'rgba(16,185,129,.12)' : slugStatus === 'checking' ? 'rgba(156,163,175,.1)' : 'rgba(239,68,68,.1)',
                    color:      slugStatus === 'available' ? '#059669'              : slugStatus === 'checking' ? '#9CA3AF'               : '#DC2626',
                  }}>{slugMsg}</span>
                )}
              </div>
              {slug && (
                <div style={{ marginTop: 6, padding: '7px 12px', background: 'rgba(123,97,255,.06)', borderRadius: 8, fontSize: 12, color: '#7B61FF', fontFamily: 'monospace', fontWeight: 600 }}>
                  🔗 {getPublicExitDisplay(slug)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '9px 12px', background: 'rgba(123,97,255,.06)', borderRadius: 10, border: '1.5px solid rgba(123,97,255,.15)', fontSize: 13, color: '#7B61FF', fontFamily: 'monospace', fontWeight: 600 }}>
              🔗 {getPublicExitDisplay(username)}
            </div>
          )}
        </div>

        {/* Destination URL */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>URL de destino</label>
          <input value={destUrl} onChange={e => { setDestUrl(e.target.value); if (urlError) validateUrl(e.target.value) }} onBlur={() => validateUrl(destUrl)}
            placeholder="https://tu-tienda.com/products/producto" type="url"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--r)', border: `1px solid ${urlError ? 'rgba(239,68,68,.5)' : 'var(--border)'}`, fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: urlError ? 'rgba(239,68,68,.04)' : 'var(--bg2)' }} />
          {urlError && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 5, marginBottom: 0 }}>{urlError}</p>}
        </div>

        {/* TikTok Profile */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>Cuenta de TikTok</label>
          <div style={{ display: 'flex' }}>
            <span style={{ padding: '9px 10px', background: 'var(--bg)', border: `1px solid ${tiktokError ? 'rgba(239,68,68,.5)' : 'var(--border)'}`, borderRight: 'none', borderRadius: 'var(--r) 0 0 var(--r)', fontSize: 13, fontWeight: 600, color: 'var(--muted2)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>@</span>
            <input
              value={tiktokProfile}
              onChange={e => { setTiktokProfile(e.target.value.replace(/^@+/, '')); if (tiktokError) setTiktokError('') }}
              onBlur={() => { if (tiktokProfile) validateTikTok(tiktokProfile) }}
              placeholder="tucreador"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '0 var(--r) var(--r) 0', border: `1px solid ${tiktokError ? 'rgba(239,68,68,.5)' : 'var(--border)'}`, borderLeft: 'none', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'inherit', background: tiktokError ? 'rgba(239,68,68,.04)' : 'var(--bg2)' }}
            />
          </div>
          {tiktokError
            ? <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 5, marginBottom: 0, lineHeight: 1.45 }}>{tiktokError}</p>
            : <p style={{ fontSize: 11.5, color: 'var(--muted2)', marginTop: 5, marginBottom: 0 }}>Perfil donde compartirás este enlace</p>
          }
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 44, borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background var(--p-base) var(--p-ease)' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!canSubmit}
            style={{ flex: 2, height: 44, borderRadius: 'var(--r)', border: 'none', background: canSubmit ? 'linear-gradient(135deg,#F647A9,#7B61FF)' : 'var(--border)', color: canSubmit ? '#fff' : 'var(--muted2)', fontSize: 14, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: canSubmit ? '0 8px 24px rgba(246,71,169,.3)' : 'none', transition: 'all var(--p-base) var(--p-ease)' }}>
            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear Exit →'}
          </button>
        </div>
      </div>
    </div>
  )
}
