'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  username: string | null
}

type PBType = 'creator_page' | 'simple_page'

export default function CreatePersonalBrandModal({ open, onClose, userId, username }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<PBType>('creator_page')
  const [creating, setCreating] = useState(false)

  if (!open) return null

  async function handleCreate() {
    setCreating(true)
    const supabase = createClient()
    const title = selected === 'creator_page' ? 'Nueva Creator Page' : 'Nueva Simple Page'
    const legacyType = selected === 'simple_page' ? 'simple' : 'trust'

    const { data: page } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        username,
        type: legacyType,
        status: 'draft',
        title,
        settings: {
          _category: 'personal_brand',
          _pageType: selected,
        },
      })
      .select()
      .single()

    onClose()
    if (page?.id) router.push(`/dashboard/editor/${page.id}`)
  }

  const options: Array<{
    key: PBType
    icon: string
    title: string
    desc: string
    tags: string[]
  }> = [
    {
      key: 'creator_page',
      icon: '⭐',
      title: 'Creator Page',
      desc: 'Página completa para presentar tu marca, servicios, redes, contenido, testimonios y enlaces importantes.',
      tags: ['Perfil', 'Servicios', 'Redes', 'Contenido'],
    },
    {
      key: 'simple_page',
      icon: '🔗',
      title: 'Simple Page',
      desc: 'Página rápida de links para compartir WhatsApp, Instagram, calendario, recursos, contenido o web.',
      tags: ['Links', 'WhatsApp', 'Redes', 'Booking'],
    },
  ]

  return (
    <div className="cm-overlay" onClick={e => { if (e.currentTarget === e.target) onClose() }}>
      <div className="cm-modal">
        <h2 className="cm-title">Crear página de Marca Personal</h2>
        <p className="cm-sub">Elige cómo quieres presentar tu marca, servicios o contenido.</p>

        {options.map(opt => (
          <div
            key={opt.key}
            className={`cm-card ${selected === opt.key ? 'selected' : ''}`}
            onClick={() => setSelected(opt.key)}
          >
            <div className="cm-card-ico">{opt.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="cm-card-title">{opt.title}</div>
              <div className="cm-card-desc">{opt.desc}</div>
              <div className="cm-tags">
                {opt.tags.map(t => (
                  <span key={t} className="cm-tag" style={{ background: '#E6F9EE', color: '#1AA960' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="cm-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ flexShrink: 0 }}>
            Cancelar
          </button>
          <button className="btn btn-primary btn-full" onClick={handleCreate} disabled={creating}>
            {creating ? 'Creando...' : 'Crear página →'}
          </button>
        </div>
      </div>
    </div>
  )
}
