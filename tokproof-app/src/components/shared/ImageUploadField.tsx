'use client'

import { useState, useRef } from 'react'
import { uploadImage, deleteImageByUrl, IMAGE_LIMITS } from '@/lib/imageUpload'
import type { Plan } from '@/lib/plans'
import { toast as fireToast } from '@/lib/toast'

interface ImageUploadFieldProps {
  label?: string
  value: string
  onChange: (url: string) => void
  pageId?: string
  userId: string
  plan: Plan
  helperText?: string
  allowUrlInput?: boolean
  placeholder?: string
  /** 'square' | 'wide' | 'portrait' — controls preview aspect ratio */
  aspectHint?: 'square' | 'wide' | 'portrait'
}

// ─── Design tokens (matches editor panel) ────────────────────────────────────
const C = {
  pink:    '#F647A9',
  purple:  '#7B61FF',
  ink:     '#171717',
  ink2:    '#6B7280',
  ink3:    '#9CA3AF',
  border:  'rgba(123,97,255,0.16)',
  softPurple: '#F4F0FF',
  softPink:   '#FFE3F1',
  card:    '#FFFFFF',
  bg:      '#FEFBFF',
  red:     '#EF4444',
  redBg:   'rgba(239,68,68,.06)',
  violet:  '#7C3AED',
}

function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: 14, height: 14, border: `2px solid ${C.border}`, borderTopColor: C.purple, borderRadius: '50%', animation: 'imgFieldSpin .7s linear infinite', flexShrink: 0 }} />
  )
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  pageId,
  userId,
  plan,
  helperText,
  allowUrlInput = true,
  placeholder = 'https://...',
  aspectHint = 'wide',
}: ImageUploadFieldProps) {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [isLimitErr, setIsLimitErr] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const limits = IMAGE_LIMITS[plan]

  const previewHeight = aspectHint === 'square' ? 120 : aspectHint === 'portrait' ? 160 : 90

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so re-selecting same file works
    if (inputRef.current) inputRef.current.value = ''

    setLoading(true)
    setError(null)
    setIsLimitErr(false)

    const result = await uploadImage({ file, userId, pageId, plan })

    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      setIsLimitErr(result.isLimitError ?? false)
      return
    }

    // Warn in UI if file uploaded but DB record failed (debug mode)
    if (result.ok && !result.assetId) {
      setError(`⚠ File uploaded but not registered in DB. Check console for details.`)
    }

    onChange(result.url)
    fireToast('Imagen subida ✓', 'success', 2000)
  }

  async function handleRemove() {
    // Attempt to clean up storage + DB record (no-op for external URLs)
    if (value) {
      await deleteImageByUrl({ url: value, userId })
    }
    onChange('')
    setError(null)
    setIsLimitErr(false)
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <style>{`
        @keyframes imgFieldSpin { to { transform: rotate(360deg); } }
        @keyframes imgFadeIn { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {label && (
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.ink2, marginBottom: 4 }}>
          {label}
        </label>
      )}

      {/* ── Preview ── */}
      {value && (
        <div style={{
          position: 'relative', marginBottom: 8,
          borderRadius: 10, overflow: 'hidden',
          border: `1px solid ${C.border}`,
          height: previewHeight, background: '#f8f6ff',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={value}
            src={value}
            alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'imgFadeIn .35s ease' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <button
            onClick={handleRemove}
            title="Remove image"
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 24, height: 24, borderRadius: 6,
              border: 'none', background: 'rgba(0,0,0,.45)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── URL input ── */}
      {allowUrlInput && (
        <input
          type="url"
          value={value}
          onChange={e => { onChange(e.target.value); setError(null); setIsLimitErr(false) }}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '7px 10px',
            borderRadius: 8, fontSize: 12,
            border: `1px solid ${C.border}`,
            background: C.card, color: C.ink,
            outline: 'none', marginBottom: 6,
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* ── Upload button ── */}
      <label style={{ display: 'block', cursor: loading ? 'wait' : 'pointer' }}>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFile}
          disabled={loading}
        />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '7px 0', borderRadius: 8,
          border: `1.5px dashed ${loading ? C.ink3 : C.purple}`,
          background: loading ? C.bg : C.softPurple,
          color: loading ? C.ink3 : C.purple,
          fontSize: 11.5, fontWeight: 600,
          transition: 'all .13s',
          minHeight: 36,
        }}>
          {loading ? (
            <><Spinner /> Uploading…</>
          ) : (
            <>📷 {value ? 'Replace image' : 'Upload image'}</>
          )}
        </div>
      </label>

      {/* ── Size hint ── */}
      {!error && (
        <p style={{ fontSize: 10, color: C.ink3, margin: '4px 0 0', lineHeight: 1.4 }}>
          JPG, PNG, WebP · Max {limits.maxSizeMB} MB
          {plan === 'free' && ` · ${limits.maxImages} images on Free`}
        </p>
      )}

      {/* ── Error / Limit message ── */}
      {error && (
        <div style={{
          marginTop: 6, padding: '9px 11px', borderRadius: 8,
          background: isLimitErr ? '#FFF9F0' : C.redBg,
          border: `1px solid ${isLimitErr ? '#FDE68A' : 'rgba(239,68,68,.2)'}`,
        }}>
          <p style={{ fontSize: 11, color: isLimitErr ? '#92400E' : C.red, margin: 0, lineHeight: 1.5 }}>
            {error}
          </p>
          {isLimitErr && plan === 'free' && (
            <a
              href="/dashboard/billing"
              style={{
                display: 'inline-block', marginTop: 7,
                padding: '5px 12px', borderRadius: 7,
                background: 'linear-gradient(135deg,#F647A9,#7B61FF)',
                color: '#fff', fontSize: 11, fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Upgrade to Pro
            </a>
          )}
        </div>
      )}

      {helperText && !error && (
        <p style={{ fontSize: 10, color: C.ink3, margin: '4px 0 0', lineHeight: 1.4 }}>
          {helperText}
        </p>
      )}
    </div>
  )
}
