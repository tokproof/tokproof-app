'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPublicExitDisplay } from '@/lib/urls'
import type { Page } from '@/types'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  /** Profile username — becomes the /@username/go slug automatically */
  username: string
  /** Pass an existing page to edit it */
  editing?: Page | null
  onSaved: (page: Page) => void
}

export default function QuickExitModal({ open, onClose, userId, username, editing, onSaved }: Props) {
  const isEditing = !!editing

  const [name,          setName]          = useState('')
  const [destUrl,       setDestUrl]       = useState('')
  const [tiktokProfile, setTiktokProfile] = useState('')
  const [urlError,      setUrlError]      = useState('')
  const [tiktokError,   setTiktokError]   = useState('')
  const [saving,        setSaving]        = useState(false)

  // Pre-fill when editing
  useEffect(() => {
    if (!open) return
    if (editing) {
      const cfg = (editing.settings as Record<string, unknown>)?._landingConfig as Record<string, unknown> | undefined
      setName(editing.title ?? '')
      setDestUrl((cfg?.destinationUrl as string) ?? '')
      setTiktokProfile((cfg?.tiktokProfile as string) ?? '')
      setTiktokError('')
    } else {
      setName(''); setDestUrl(''); setTiktokProfile('')
      setUrlError(''); setTiktokError('')
    }
  }, [open, editing])

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

    setSaving(true)
    const supabase = createClient()
    const cleanHandle = tiktokProfile.replace(/^@/, '').trim()

    const landingConfig = {
      pageType: 'quick_exit',
      title: name,
      slug: username,
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
        .insert({ user_id: userId, username, type: 'simple', status: 'published', title: name, settings: { _category: 'ecommerce', _pageType: 'quick_exit', _landingConfig: landingConfig } })
        .select().single()
      page = data as Page | null
    }

    setSaving(false)
    if (page) { onSaved(page); onClose() }
  }

  if (!open) return null

  const tikOk     = tiktokProfile.replace(/^@/, '').trim().length > 0
  const canSubmit = name.trim() && destUrl && tikOk && !saving

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(10,10,20,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.currentTarget === e.target) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(10,10,30,.22)', animation: 'cmSlideUp .2s ease', fontFamily: 'Inter,system-ui,sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#F647A9,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14 }}>🛡️</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-.02em' }}>
                {isEditing ? 'Editar Exit Rápido' : 'Crear Exit Rápido'}
              </h2>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
              Pega la URL de tu producto o tienda y Tokproof generará un enlace preparado para TikTok.
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, border: '1px solid #E4E7F0', background: '#F9FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', flexShrink: 0, marginLeft: 12 }}>
            <X size={14} />
          </button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Mi Marca"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E4E7F0', fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        {/* Read-only URL */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>Tu enlace TikTok Rescue</label>
          <div style={{ padding: '9px 12px', background: 'rgba(123,97,255,.06)', borderRadius: 10, border: '1.5px solid rgba(123,97,255,.15)', fontSize: 13, color: '#7B61FF', fontFamily: 'monospace', fontWeight: 600 }}>
            🔗 {getPublicExitDisplay(username)}
          </div>
        </div>

        {/* Destination URL */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>URL de destino</label>
          <input value={destUrl} onChange={e => { setDestUrl(e.target.value); if (urlError) validateUrl(e.target.value) }} onBlur={() => validateUrl(destUrl)}
            placeholder="https://tu-tienda.com/products/producto" type="url"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${urlError ? '#FCA5A5' : '#E4E7F0'}`, fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: urlError ? '#FFF5F5' : '#fff' }} />
          {urlError && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5, marginBottom: 0 }}>{urlError}</p>}
        </div>

        {/* TikTok Profile */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#6B7280', marginBottom: 5 }}>
            Cuenta de TikTok
          </label>
          <div style={{ display: 'flex' }}>
            <span style={{ padding: '9px 10px', background: '#F3F4F6', border: `1.5px solid ${tiktokError ? '#FCA5A5' : '#E4E7F0'}`, borderRight: 'none', borderRadius: '10px 0 0 10px', fontSize: 13, fontWeight: 600, color: '#9CA3AF', display: 'flex', alignItems: 'center', flexShrink: 0 }}>@</span>
            <input
              value={tiktokProfile}
              onChange={e => { setTiktokProfile(e.target.value.replace(/^@+/, '')); if (tiktokError) setTiktokError('') }}
              onBlur={() => { if (tiktokProfile) validateTikTok(tiktokProfile) }}
              placeholder="tucreador"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '0 10px 10px 0', border: `1.5px solid ${tiktokError ? '#FCA5A5' : '#E4E7F0'}`, borderLeft: 'none', fontSize: 14, color: '#111827', outline: 'none', fontFamily: 'inherit', background: tiktokError ? '#FFF5F5' : '#fff' }}
            />
          </div>
          {tiktokError
            ? <p style={{ fontSize: 12, color: '#EF4444', marginTop: 5, marginBottom: 0, lineHeight: 1.45 }}>{tiktokError}</p>
            : <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 5, marginBottom: 0 }}>Perfil donde compartirás este enlace</p>
          }
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 46, borderRadius: 12, border: '1.5px solid #E4E7F0', background: '#fff', color: '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!canSubmit}
            style={{ flex: 2, height: 46, borderRadius: 12, border: 'none', background: canSubmit ? 'linear-gradient(135deg,#F647A9,#7B61FF)' : '#E4E7F0', color: canSubmit ? '#fff' : '#9CA3AF', fontSize: 14, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: canSubmit ? '0 8px 24px rgba(246,71,169,.3)' : 'none', transition: 'all .15s' }}>
            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear Exit →'}
          </button>
        </div>
      </div>
    </div>
  )
}
