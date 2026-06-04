import { createClient } from '@/lib/supabase/client'
import type { Plan } from '@/lib/plans'

export const BUCKET = 'page-assets'

export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_EXT  = ['jpg', 'jpeg', 'png', 'webp'] as const

export const IMAGE_LIMITS: Record<Plan, { maxImages: number; maxSizeMB: number }> = {
  free: { maxImages: 5,   maxSizeMB: 2 },
  pro:  { maxImages: 100, maxSizeMB: 5 },
}

export type UploadResult =
  | { ok: true;  url: string; storagePath: string; assetId: string }
  | { ok: false; error: string; isLimitError?: boolean }

// ─── Dev logging ─────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development'

function log(action: string, data?: Record<string, unknown>) {
  if (isDev) console.log(`[imageUpload] ${action}`, data ?? '')
}

function logError(action: string, err: unknown, data?: Record<string, unknown>) {
  console.error(`[imageUpload] ${action}`, err, data ?? '')
}

// ─── Count images uploaded by this user ──────────────────────────────────────
export async function getImageCount(userId: string): Promise<number> {
  const sb = createClient()
  log('getImageCount', { userId })

  const { count, error } = await sb
    .from('image_assets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    logError('getImageCount failed', error, { userId })
    return 0
  }

  log('getImageCount result', { userId, count })
  return count ?? 0
}

// ─── Canvas WebP conversion ───────────────────────────────────────────────────
async function toWebP(file: File): Promise<{ blob: Blob; filename: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objUrl = URL.createObjectURL(file)

    img.onload = () => {
      try {
        const MAX = 2048
        let w = img.naturalWidth
        let h = img.naturalHeight
        if (w > MAX || h > MAX) {
          if (w >= h) { h = Math.round((h / w) * MAX); w = MAX }
          else        { w = Math.round((w / h) * MAX); h = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(objUrl); reject(new Error('No canvas context')); return }
        ctx.drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(objUrl)
        canvas.toBlob(
          blob => {
            if (!blob) { reject(new Error('canvas.toBlob returned null')); return }
            resolve({ blob, filename: file.name.replace(/\.[^.]+$/, '') + '.webp' })
          },
          'image/webp', 0.85,
        )
      } catch (e) { URL.revokeObjectURL(objUrl); reject(e) }
    }
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Image load failed')) }
    img.src = objUrl
  })
}

// ─── Upload ───────────────────────────────────────────────────────────────────
export async function uploadImage(opts: {
  file: File
  userId: string
  pageId?: string
  blockId?: string
  plan: Plan
}): Promise<UploadResult> {
  const { file, userId, pageId, blockId, plan } = opts
  const limits = IMAGE_LIMITS[plan]

  log('uploadImage start', {
    userId, pageId: pageId ?? null, plan,
    fileName: file.name, fileSize: file.size, fileType: file.type,
  })

  // ── Validate extension ──
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!(ALLOWED_EXT as readonly string[]).includes(ext)) {
    logError('uploadImage: unsupported extension', null, { ext })
    return { ok: false, error: 'Unsupported file type. Use JPG, PNG or WebP.' }
  }

  // ── Validate MIME ──
  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
    logError('uploadImage: unsupported MIME type', null, { mimeType: file.type })
    return { ok: false, error: 'Unsupported file type. Use JPG, PNG or WebP.' }
  }

  // ── Validate size ──
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > limits.maxSizeMB) {
    logError('uploadImage: file too large', null, { sizeMB, maxSizeMB: limits.maxSizeMB })
    return { ok: false, error: `Image too large. Max ${limits.maxSizeMB} MB for ${plan === 'free' ? 'Free' : 'Pro'} plan.` }
  }

  // ── Check upload count limit ──
  const count = await getImageCount(userId)
  log('uploadImage count check', { userId, count, maxImages: limits.maxImages })
  if (count >= limits.maxImages) {
    return {
      ok: false,
      isLimitError: true,
      error: plan === 'free'
        ? `You've reached the Free image upload limit (${limits.maxImages} images). Upgrade to Pro to upload more images.`
        : `Image limit reached (${limits.maxImages}).`,
    }
  }

  // ── Convert to WebP ──
  let blob: Blob
  let filename: string
  try {
    const result = await toWebP(file)
    blob = result.blob; filename = result.filename
    log('uploadImage WebP conversion ok', { filename, blobSize: blob.size })
  } catch (convErr) {
    logError('uploadImage WebP conversion failed — using original file', convErr, { fileName: file.name })
    blob = file; filename = file.name
  }

  // ── Build storage path ──
  const safePageId = pageId && pageId !== 'demo' ? pageId : null
  const folder     = safePageId ? `${userId}/${safePageId}` : `${userId}/uploads`
  const storagePath = `${folder}/${Date.now()}_${filename}`
  const contentType = blob instanceof File ? blob.type : 'image/webp'

  log('uploadImage storage upload start', { userId, pageId: safePageId, storagePath, contentType })

  const sb = createClient()

  // ── Step 1: Upload to Storage ──────────────────────────────────────────────
  const { error: uploadError } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, blob, { contentType, upsert: false })

  if (uploadError) {
    logError('uploadImage: Storage upload failed', uploadError, { storagePath })
    return { ok: false, error: `Upload failed: ${uploadError.message}` }
  }

  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  log('uploadImage storage ok', { storagePath, publicUrl })

  // ── Step 2: INSERT into image_assets ───────────────────────────────────────
  const { data: asset, error: insertError } = await sb
    .from('image_assets')
    .insert({
      user_id:      userId,
      page_id:      safePageId,
      block_id:     blockId ?? null,
      url:          publicUrl,
      storage_path: storagePath,
      file_size:    blob.size,
      mime_type:    'image/webp',
    })
    .select('id')
    .single()

  if (insertError) {
    logError('uploadImage: image_assets INSERT failed — rolling back storage file', insertError, {
      userId, pageId: safePageId, storagePath, publicUrl,
    })

    // Atomic rollback: delete the file we just uploaded so we leave no orphans
    const { error: rollbackErr } = await sb.storage.from(BUCKET).remove([storagePath])
    if (rollbackErr) {
      logError('uploadImage: storage rollback ALSO failed — orphan file in storage', rollbackErr, { storagePath })
    } else {
      log('uploadImage: storage rollback ok', { storagePath })
    }

    return {
      ok: false,
      error: `Could not register the image (${insertError.message}). The file has been removed. Please try again.`,
    }
  }

  const assetId = asset?.id ?? ''
  log('uploadImage complete', { userId, pageId: safePageId, storagePath, publicUrl, assetId })

  return { ok: true, url: publicUrl, storagePath, assetId }
}

// ─── Delete by storage path (when path is known) ──────────────────────────────
export async function deleteImage(opts: {
  storagePath: string
  assetId?: string
  userId: string
}): Promise<void> {
  const { storagePath, assetId, userId } = opts

  if (!storagePath.startsWith(`${userId}/`)) {
    logError('deleteImage: blocked — path does not belong to user', null, { userId, storagePath })
    return
  }

  log('deleteImage start', { userId, storagePath, assetId: assetId ?? null })

  const sb = createClient()

  // Step 1: Delete from Storage first
  const { error: storageErr } = await sb.storage.from(BUCKET).remove([storagePath])
  if (storageErr) {
    logError('deleteImage: Storage remove failed — DB record preserved', storageErr, { storagePath })
    // Do NOT delete DB record: the file still exists. Keep DB as source of truth.
    return
  }
  log('deleteImage: Storage remove ok', { storagePath })

  // Step 2: Delete DB record only after Storage confirmed deleted
  if (assetId) {
    const { error: dbErr } = await sb.from('image_assets').delete()
      .eq('id', assetId)
      .eq('user_id', userId)
    if (dbErr) {
      logError('deleteImage: DB delete failed — Storage deleted but record remains (orphan row)', dbErr, {
        assetId, userId, storagePath,
      })
    } else {
      log('deleteImage complete', { assetId, storagePath })
    }
  }
}

// ─── Delete by public URL — no storagePath needed in block data ───────────────
export async function deleteImageByUrl(opts: {
  url: string
  userId: string
}): Promise<void> {
  const { url, userId } = opts
  if (!url) return

  log('deleteImageByUrl start', { userId, url })

  const sb = createClient()

  // Look up record (RLS ensures we only see our own rows)
  const { data, error: lookupErr } = await sb
    .from('image_assets')
    .select('id, storage_path')
    .eq('url', url)
    .eq('user_id', userId)
    .maybeSingle()

  if (lookupErr) {
    logError('deleteImageByUrl: lookup failed', lookupErr, { userId, url })
    return
  }
  if (!data) {
    log('deleteImageByUrl: URL not found in image_assets (external URL or already deleted)', { url })
    return
  }

  log('deleteImageByUrl: record found', { assetId: data.id, storagePath: data.storage_path })

  // Step 1: Delete from Storage first
  const { error: storageErr } = await sb.storage.from(BUCKET).remove([data.storage_path])
  if (storageErr) {
    logError('deleteImageByUrl: Storage remove failed — DB record preserved', storageErr, {
      storagePath: data.storage_path,
    })
    // Don't delete DB record — file still in storage, keep DB as source of truth
    return
  }
  log('deleteImageByUrl: Storage remove ok', { storagePath: data.storage_path })

  // Step 2: Delete DB record only after Storage confirmed deleted
  const { error: dbErr } = await sb.from('image_assets').delete()
    .eq('id', data.id)
    .eq('user_id', userId)

  if (dbErr) {
    logError('deleteImageByUrl: DB delete failed — Storage deleted but row remains (orphan)', dbErr, {
      assetId: data.id, userId,
    })
  } else {
    log('deleteImageByUrl complete', { assetId: data.id, url })
  }
}
