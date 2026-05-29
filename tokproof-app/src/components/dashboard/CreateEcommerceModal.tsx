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

type EcomType = 'trust_page' | 'simple_page'

export default function CreateEcommerceModal({ open, onClose, userId, username }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<EcomType>('trust_page')
  const [creating, setCreating] = useState(false)

  if (!open) return null

  async function handleCreate() {
    setCreating(true)
    const supabase = createClient()
    const title = selected === 'trust_page' ? 'Nueva Trust Page' : 'Nueva Simple Page'
    const legacyType = selected === 'trust_page' ? 'trust' : 'simple'

    const { data: page } = await supabase
      .from('pages')
      .insert({
        user_id: userId,
        username,
        type: legacyType,
        status: 'draft',
        title,
        settings: {
          _category: 'ecommerce',
          _pageType: selected,
        },
      })
      .select()
      .single()

    onClose()
    if (page?.id) router.push(`/dashboard/editor/${page.id}`)
  }

  const options: Array<{
    key: EcomType
    icon: string
    title: string
    desc: string
    tags: string[]
  }> = [
    {
      key: 'trust_page',
      icon: '🛡',
      title: 'Trust Page',
      desc: 'Mini landing de confianza para vender productos, mostrar beneficios, reviews, FAQs y redirigir a tu tienda.',
      tags: ['Shopify', 'Producto', 'Reviews', 'CTA'],
    },
    {
      key: 'simple_page',
      icon: '🔗',
      title: 'Simple Page',
      desc: 'Página rápida para enviar tráfico directamente a tu producto, tienda o web. Ideal para campañas rápidas y enlaces en bio.',
      tags: ['Link rápido', 'Tienda', 'TikTok/Instagram'],
    },
  ]

  return (
    <div className="cm-overlay" onClick={e => { if (e.currentTarget === e.target) onClose() }}>
      <div className="cm-modal">
        <h2 className="cm-title">Crear página de E-commerce</h2>
        <p className="cm-sub">Elige el formato que mejor encaja con tu producto.</p>

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
                {opt.tags.map(t => <span key={t} className="cm-tag">{t}</span>)}
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
