'use client'

import { Plus, Trash2, Star } from 'lucide-react'
import type { TrafficSource, TrafficPlatform } from '@/types/landing'

// Design tokens — match EditorClient / SimplePageEditorClient exactly
const T = {
  ink:        '#171717',
  ink2:       '#6B7280',
  ink3:       '#9CA3AF',
  pink:       '#F647A9',
  purple:     '#7B61FF',
  green:      '#1AA960',
  greenBg:    '#E6F9EE',
  border:     'rgba(123,97,255,0.10)',
  border2:    'rgba(123,97,255,0.16)',
  bg:         '#FBF9FC',
  card:       '#FFFFFF',
  softPurple: '#F4F0FF',
  softPink:   '#FFF5FA',
  warn:       '#92400E',
  warnBg:     '#FFFBEB',
  warnBorder: 'rgba(245,158,11,.35)',
}

// Platforms the user can choose from
const PLATFORM_META: Array<{
  key:       TrafficPlatform
  label:     string
  emoji:     string
  useHandle: boolean       // true → show @ prefix
  placeholder: string
}> = [
  { key: 'tiktok',    label: 'TikTok',    emoji: '🎵', useHandle: true,  placeholder: 'tucuenta'                      },
  { key: 'instagram', label: 'Instagram', emoji: '📸', useHandle: true,  placeholder: 'tucuenta'                      },
  { key: 'youtube',   label: 'YouTube',   emoji: '▶️',  useHandle: true,  placeholder: 'tucanal'                       },
  { key: 'pinterest', label: 'Pinterest', emoji: '📌', useHandle: true,  placeholder: 'tuperfil'                      },
  { key: 'facebook',  label: 'Facebook',  emoji: '👥', useHandle: false, placeholder: 'Nombre de página o grupo'      },
  { key: 'amazon',    label: 'Amazon',    emoji: '📦', useHandle: false, placeholder: 'Amazon Store o lista'          },
  { key: 'other',     label: 'Otro',      emoji: '🔗', useHandle: false, placeholder: 'Blog, Telegram, WhatsApp…'     },
]

function getMeta(platform: TrafficPlatform) {
  return PLATFORM_META.find(p => p.key === platform) ?? PLATFORM_META[6]
}

// Strip leading @ before storing (we show it as a prefix in the UI)
function stripAt(v: string) {
  return v.replace(/^@+/, '').trim()
}

// ─── Single source card ────────────────────────────────────────────────────────
function SourceCard({
  source, total,
  onChange, onDelete, onMakePrimary,
}: {
  source:       TrafficSource
  total:        number
  onChange:     (patch: Partial<TrafficSource>) => void
  onDelete:     () => void
  onMakePrimary: () => void
}) {
  const meta     = getMeta(source.platform)
  const hasValue = source.handle.trim().length > 0

  return (
    <div style={{
      padding: '10px 12px',
      background: source.isPrimary ? T.softPink : T.bg,
      border: `1px solid ${source.isPrimary ? 'rgba(246,71,169,.22)' : T.border}`,
      borderRadius: 10,
      marginBottom: 8,
    }}>
      {/* Row 1: Platform select + star + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <select
          value={source.platform}
          onChange={e => {
            const p = e.target.value as TrafficPlatform
            // Reset handle when platform changes (@ semantics differ)
            onChange({ platform: p, handle: '' })
          }}
          style={{
            flex: 1, padding: '6px 8px', borderRadius: 8,
            border: `1px solid ${T.border2}`, background: T.card,
            fontSize: 12, color: T.ink, outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          {PLATFORM_META.map(p => (
            <option key={p.key} value={p.key}>{p.emoji} {p.label}</option>
          ))}
        </select>

        {/* Star — make primary */}
        <button
          onClick={onMakePrimary}
          title={source.isPrimary ? 'Fuente principal' : 'Marcar como principal'}
          style={{
            width: 28, height: 28, borderRadius: 7, border: 'none', flexShrink: 0,
            background: source.isPrimary ? 'rgba(246,71,169,.14)' : '#F3F4F6',
            cursor: source.isPrimary ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Star
            size={12}
            fill={source.isPrimary ? T.pink : 'none'}
            stroke={source.isPrimary ? T.pink : T.ink3}
          />
        </button>

        {/* Delete — only if more than one source */}
        {total > 1 && (
          <button
            onClick={onDelete}
            title="Eliminar fuente"
            style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              border: '1px solid rgba(239,68,68,.2)',
              background: 'rgba(239,68,68,.06)', color: '#EF4444',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>

      {/* Row 2: Handle input */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {meta.useHandle && (
          <span style={{
            padding: '6px 7px',
            background: T.softPurple,
            border: `1px solid ${T.border2}`, borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            fontSize: 12, fontWeight: 600, color: T.ink3,
            lineHeight: 1, display: 'flex', alignItems: 'center', flexShrink: 0,
          }}>
            @
          </span>
        )}
        <input
          type="text"
          value={source.handle}
          placeholder={meta.placeholder}
          onChange={e =>
            onChange({ handle: meta.useHandle ? stripAt(e.target.value) : e.target.value })
          }
          style={{
            flex: 1, padding: '6px 10px',
            borderRadius: meta.useHandle ? '0 8px 8px 0' : 8,
            border: `1px solid ${T.border2}`,
            background: T.card, fontSize: 12, color: T.ink, outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Primary badge */}
      {source.isPrimary && (
        <div style={{ marginTop: 6, fontSize: 10.5, color: T.pink, fontWeight: 700, letterSpacing: '.02em' }}>
          ★ Fuente principal
        </div>
      )}
    </div>
  )
}

// ─── Main exported component ───────────────────────────────────────────────────
interface Props {
  sources:  TrafficSource[]
  onChange: (next: TrafficSource[]) => void
}

export default function TrafficSourcesSection({ sources, onChange }: Props) {
  const hasSources    = sources.length > 0
  const hasValidSource = sources.some(s => s.handle.trim().length > 0)

  function addSource() {
    const newSource: TrafficSource = {
      platform:  'tiktok',
      handle:    '',
      isPrimary: sources.length === 0,  // first source is always primary
    }
    onChange([...sources, newSource])
  }

  function updateSource(idx: number, patch: Partial<TrafficSource>) {
    onChange(sources.map((s, i) => i === idx ? { ...s, ...patch } : s))
  }

  function deleteSource(idx: number) {
    const wasPrimary = sources[idx].isPrimary
    const next = sources.filter((_, i) => i !== idx)
    if (wasPrimary && next.length > 0) {
      next[0] = { ...next[0], isPrimary: true }
    }
    onChange(next)
  }

  function makePrimary(idx: number) {
    onChange(sources.map((s, i) => ({ ...s, isPrimary: i === idx })))
  }

  return (
    <div>
      {/* Description card */}
      <div style={{
        padding: '10px 12px',
        background: 'linear-gradient(135deg,rgba(246,71,169,.07),rgba(123,97,255,.05))',
        border: '1px solid rgba(246,71,169,.14)',
        borderRadius: 10, marginBottom: 14,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
          Fuente de tráfico
        </div>
        <div style={{ fontSize: 11, color: T.ink2, lineHeight: 1.55 }}>
          Indica dónde vas a compartir esta página para mejorar tus analytics y recomendaciones.
        </div>
      </div>

      {/* Empty state */}
      {!hasSources && (
        <div style={{
          padding: '18px 12px', textAlign: 'center',
          border: `1.5px dashed ${T.border2}`, borderRadius: 10, marginBottom: 10,
        }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>📡</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginBottom: 3 }}>
            Sin fuente de tráfico
          </div>
          <div style={{ fontSize: 11, color: T.ink3, lineHeight: 1.4 }}>
            Necesaria para publicar
          </div>
        </div>
      )}

      {/* Source cards */}
      {sources.map((src, i) => (
        <SourceCard
          key={i}
          source={src}
          total={sources.length}
          onChange={patch => updateSource(i, patch)}
          onDelete={() => deleteSource(i)}
          onMakePrimary={() => makePrimary(i)}
        />
      ))}

      {/* Add button */}
      <button
        onClick={addSource}
        style={{
          width: '100%', padding: '8px 0',
          borderRadius: 8, border: `1.5px dashed ${T.border2}`,
          background: 'transparent', color: T.purple,
          fontSize: 12, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          marginBottom: 10,
        }}
      >
        <Plus size={13} />
        {hasSources ? 'Añadir otra fuente' : 'Añadir fuente de tráfico'}
      </button>

      {/* Publish requirement notice */}
      {!hasValidSource && (
        <div style={{
          padding: '8px 10px', borderRadius: 8,
          background: T.warnBg, border: `1px solid ${T.warnBorder}`,
          fontSize: 11, color: T.warn, lineHeight: 1.5,
        }}>
          ⚠ Requerida para publicar. No afecta al guardar borrador.
        </div>
      )}
    </div>
  )
}
