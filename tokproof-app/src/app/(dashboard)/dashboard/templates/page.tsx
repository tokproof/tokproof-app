'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TEMPLATES = [
  { id: 'beauty', name: 'TikTok Beauty', type: 'trust' as const, category: 'Skincare', grad: 'linear-gradient(160deg,#180d14,#0f0f10)', vidBg: 'rgba(255,45,117,.18)', cta: 'var(--grad)' },
  { id: 'fashion', name: 'Fashion Creator', type: 'simple' as const, category: 'Creator', grad: 'linear-gradient(160deg,#0d1220,#0f0f10)', vidBg: 'rgba(59,130,246,.18)', cta: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' },
  { id: 'tech', name: 'Gadgets & Tech', type: 'trust' as const, category: 'Tech', grad: 'linear-gradient(160deg,#0d1a0e,#0f0f10)', vidBg: 'rgba(34,197,94,.16)', cta: 'linear-gradient(90deg,#22c55e,#16a34a)' },
  { id: 'pets', name: 'Pets & Lifestyle', type: 'trust' as const, category: 'Lifestyle', grad: 'linear-gradient(160deg,#1a150c,#0f0f10)', vidBg: 'rgba(245,158,11,.15)', cta: 'linear-gradient(90deg,#f59e0b,#ef4444)' },
  { id: 'info', name: 'Info Product', type: 'trust' as const, category: 'Digital', grad: 'linear-gradient(160deg,#13101a,#0f0f10)', vidBg: 'rgba(168,85,247,.15)', cta: 'linear-gradient(90deg,#a855f7,#7c3aed)' },
  { id: 'minimal', name: 'Minimal Creator', type: 'simple' as const, category: 'Minimal', grad: '#0f0f10', vidBg: 'rgba(255,255,255,.06)', cta: 'rgba(255,255,255,.12)' },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'trust' | 'simple'>('all')
  const [using, setUsing] = useState<string | null>(null)

  const visible = TEMPLATES.filter(t => filter === 'all' || t.type === filter)

  async function useTemplate(tmpl: typeof TEMPLATES[0]) {
    setUsing(tmpl.id)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('profiles').select('username').eq('user_id', user.id).single()

    const { data: page } = await supabase.from('pages').insert({
      user_id: user.id,
      username: profile?.username,
      type: tmpl.type,
      status: 'draft',
      title: tmpl.name,
      settings: {},
    }).select().single()

    router.push(`/dashboard/editor/${page?.id}`)
  }

  return (
    <>
      <div className="db-hero">
        <div className="db-hero-top">
          <div>
            <h1 className="db-title"><span className="gt">Templates</span></h1>
            <p className="db-sub">Empieza con un diseño probado y personalízalo en minutos.</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['all','trust','simple'] as const).map(f => (
          <button
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `Todos (${TEMPLATES.length})` : f === 'trust' ? `Trust (${TEMPLATES.filter(t=>t.type==='trust').length})` : `Simple (${TEMPLATES.filter(t=>t.type==='simple').length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {visible.map(t => (
          <div key={t.id} className="tmpl-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="tmpl-mock" style={{ background: t.grad, height: 200 }}>
              <div style={{ height: '60%', background: `linear-gradient(180deg,${t.vidBg},transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="tmpl-mock-play">▶</div>
              </div>
              <div className="tmpl-mock-body">
                <div className="tmpl-mock-line" style={{ width: '80%' }} />
                <div className="tmpl-mock-line-sm" style={{ width: '55%' }} />
                <div className="tmpl-mock-cta" style={{ background: t.cta, width: '85%' }} />
              </div>
              {/* Hover overlay */}
              <div className="tp-use-overlay">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => useTemplate(t)}
                  disabled={using === t.id}
                >
                  {using === t.id ? 'Creando...' : 'Usar template →'}
                </button>
              </div>
            </div>
            <div className="tmpl-info">
              <div className="tmpl-name">{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={`lc-type-badge ${t.type === 'trust' ? 'lc-type-trust' : 'lc-type-simple'}`} style={{ fontSize: 8, padding: '1px 6px' }}>
                  {t.type === 'trust' ? 'Trust' : 'Simple'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--muted2)' }}>{t.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 52 }} />
    </>
  )
}
