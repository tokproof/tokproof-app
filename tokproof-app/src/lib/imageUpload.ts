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

// ─── Debug logging — always on until image_assets issue is resolved ───────────
// TODO: set DEBUG_UPLOADS = false once confirmed working in production
const DEBUG_UPLOADS = true

function log(label: string, data?: Record<string, unknown>) {
  if (DEBUG_UPLOADS) console.log(`[imageUpload] ${label}`, data ?? '')
}
function logErr(label: string, err: unknown, data?: Record<string, unknown>) {
  console.error(`[imageUpload] ${label}`, err, data ?? '')
}

// ─── Count images uploaded by this user ──────────────────────────────────────
export async function getImageCount(userId: string): Promise<number> {
  const sb = createClient()
  log('getImageCount →', { userId })

  const { count, error } = await sb
    .from('image_assets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    logErr('getImageCount FAILED', error, { userId, code: (error as any).code, hint: (error as any).hint })
    return 0
  }

  log('getImageCount ←', { userId, count })
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
        let w = img.naturalWidth, h = img.naturalHeight
        if (w > MAX || h > MAX) {
          if (w >= h) { h = Math.round((h / w) * MAX); w = MAX }
          else        { w = Math.round((w / h) * MAX); h = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(objUrl); reject(new Error('No 2d context')); return }
        ctx.drawImage(img, 0, 0, w, h)
        URL.revokeObjectURL(objUrl)
        canvas.toBlob(
          blob => {
            if (!blob) { reject(new Error('toBlob returned null')); return }
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

  // ── 1. Start log ──
  log('━━━━ uploadImage START ━━━━', {
    userId,
    pageId:   pageId ?? '(none)',
    plan,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })

  // ── 2. Validate ──
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!(ALLOWED_EXT as readonly string[]).includes(ext)) {
    logErr('validation: unsupported extension', null, { ext })
    return { ok: false, error: 'Unsupported file type. Use JPG, PNG or WebP.' }
  }
  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
    logErr('validation: unsupported MIME', null, { mimeType: file.type })
    return { ok: false, error: 'Unsupported file type. Use JPG, PNG or WebP.' }
  }
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > limits.maxSizeMB) {
    logErr('validation: file too large', null, { sizeMB, maxSizeMB: limits.maxSizeMB })
    return { ok: false, error: `Image too large. Max ${limits.maxSizeMB} MB.` }
  }

  // ── 3. Count check ──
  const count = await getImageCount(userId)
  log('count check', { count, maxImages: limits.maxImages, willBlock: count >= limits.maxImages })
  if (count >= limits.maxImages) {
    return {
      ok: false, isLimitError: true,
      error: plan === 'free'
        ? `You've reached the Free image upload limit (${limits.maxImages} images). Upgrade to Pro to upload more images.`
        : `Image limit reached (${limits.maxImages}).`,
    }
  }

  // ── 4. Convert to WebP ──
  let blob: Blob, filename: string
  try {
    const r = await toWebP(file)
    blob = r.blob; filename = r.filename
    log('WebP conversion OK', { filename, blobSize: blob.size })
  } catch (convErr) {
    logErr('WebP conversion FAILED — using original', convErr, { fileName: file.name })
    blob = file; filename = file.name
  }

  // ── 5. Build path ──
  const safePageId  = pageId && pageId !== 'demo' ? pageId : null
  const folder      = safePageId ? `${userId}/${safePageId}` : `${userId}/uploads`
  const storagePath = `${folder}/${Date.now()}_${filename}`
  const contentType = blob instanceof File ? blob.type : 'image/webp'

  log('storage path built', { storagePath, contentType, bucket: BUCKET })

  const sb = createClient()

  // ── 6. Verify auth before proceeding ──
  const { data: { user: authUser }, error: authErr } = await sb.auth.getUser()
  log('auth check', {
    authenticated: !!authUser,
    authUserId: authUser?.id ?? null,
    matchesUserId: authUser?.id === userId,
    authError: authErr?.message ?? null,
  })
  if (!authUser) {
    logErr('auth check FAILED — user not authenticated', authErr, { userId })
    return { ok: false, error: 'Not authenticated. Please refresh and try again.' }
  }

  // ── 7. Upload to Storage ──
  log('storage upload →', { bucket: BUCKET, storagePath })
  const { error: uploadError } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, blob, { contentType, upsert: false })

  if (uploadError) {
    logErr('storage upload FAILED', uploadError, {
      storagePath,
      code: (uploadError as any).statusCode,
      error: (uploadError as any).error,
    })
    return { ok: false, error: `Upload failed: ${uploadError.message}` }
  }

  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(storagePath)
  log('storage upload OK', { storagePath, publicUrl })

  // ── 8. INSERT into image_assets ──
  const insertPayload = {
    user_id:      userId,
    page_id:      safePageId,
    block_id:     blockId ?? null,
    url:          publicUrl,
    storage_path: storagePath,
    file_size:    blob.size,
    mime_type:    'image/webp',
  }
  log('image_assets INSERT payload →', insertPayload)

  const { data: asset, error: insertError } = await sb
    .from('image_assets')
    .insert(insertPayload)
    .select('id')
    .single()

  log('image_assets INSERT result ←', {
    asset,
    insertError: insertError
      ? {
          message: insertError.message,
          code:    (insertError as any).code,
          details: (insertError as any).details,
          hint:    (insertError as any).hint,
        }
      : null,
  })

  if (insertError) {
    logErr('image_assets INSERT FAILED — rolling back storage', insertError, { storagePath, insertPayload })

    // Atomic rollback: remove the just-uploaded file
    const { error: rollbackErr } = await sb.storage.from(BUCKET).remove([storagePath])
    if (rollbackErr) {
      logErr('storage rollback ALSO FAILED — orphan file left in storage', rollbackErr, { storagePath })
    } else {
      log('storage rollback OK', { storagePath })
    }

    return {
      ok: false,
      error: `DB error (${(insertError as any).code ?? 'unknown'}): ${insertError.message}`,
    }
  }

  const assetId = asset?.id ?? ''
  log('━━━━ uploadImage COMPLETE ━━━━', { storagePath, publicUrl, assetId })

  return { ok: true, url: publicUrl, storagePath, assetId }
}

// ─── Delete by storage path ────────────────────────────────────────────────────
export async function deleteImage(opts: {
  storagePath: string
  assetId?: string
  userId: string
}): Promise<void> {
  const { storagePath, assetId, userId } = opts

  if (!storagePath.startsWith(`${userId}/`)) {
    logErr('deleteImage: blocked — path does not belong to user', null, { userId, storagePath })
    return
  }

  log('deleteImage →', { userId, storagePath, assetId: assetId ?? null })

  const sb = createClient()

  const { error: storageErr } = await sb.storage.from(BUCKET).remove([storagePath])
  if (storageErr) {
    logErr('deleteImage: storage remove FAILED — DB record preserved', storageErr, { storagePath })
    return
  }
  log('deleteImage: storage OK', { storagePath })

  if (assetId) {
    const { error: dbErr } = await sb.from('image_assets').delete()
      .eq('id', assetId).eq('user_id', userId)
    if (dbErr) {
      logErr('deleteImage: DB delete FAILED — storage deleted but row remains (orphan)', dbErr, { assetId })
    } else {
      log('deleteImage complete', { assetId })
    }
  }
}

// ─── Delete by URL (no storagePath needed in block data) ──────────────────────
export async function deleteImageByUrl(opts: {
  url: string
  userId: string
}): Promise<void> {
  const { url, userId } = opts
  if (!url) return

  log('deleteImageByUrl →', { userId, url })

  const sb = createClient()

  const { data, error: lookupErr } = await sb
    .from('image_assets')
    .select('id, storage_path')
    .eq('url', url)
    .eq('user_id', userId)
    .maybeSingle()

  if (lookupErr) {
    logErr('deleteImageByUrl: lookup FAILED', lookupErr, { userId, url })
    return
  }
  if (!data) {
    log('deleteImageByUrl: URL not in image_assets (external or already deleted)', { url })
    return
  }

  log('deleteImageByUrl: record found', { assetId: data.id, storagePath: data.storage_path })

  const { error: storageErr } = await sb.storage.from(BUCKET).remove([data.storage_path])
  if (storageErr) {
    logErr('deleteImageByUrl: storage remove FAILED — DB record preserved', storageErr, {
      storagePath: data.storage_path,
    })
    return
  }
  log('deleteImageByUrl: storage OK', { storagePath: data.storage_path })

  const { error: dbErr } = await sb.from('image_assets').delete()
    .eq('id', data.id).eq('user_id', userId)
  if (dbErr) {
    logErr('deleteImageByUrl: DB delete FAILED — storage deleted but row remains (orphan)', dbErr, {
      assetId: data.id,
    })
  } else {
    log('deleteImageByUrl complete', { assetId: data.id })
  }
}
