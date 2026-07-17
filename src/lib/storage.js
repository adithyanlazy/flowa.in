import { supabase, supabaseEnabled } from './supabase.js'

const BUCKET = 'product-photos'

// Admin-only write (see "admin upload/update/delete product photos" policies
// in scripts/supabase-schema.sql) — bucket itself is public-read so the
// resulting URL works directly as a product's `photo` or a hero slide's
// `mediaSrc`. Media must always live here as a URL, never inline in
// `store_state` — a single base64 video in that row once ballooned it to
// 18MB, which every visitor had to download and which overflowed the
// localStorage cache on every save.
export async function uploadMedia(blob, ext) {
  if (!supabaseEnabled) return { url: null, error: 'Supabase not configured' }
  const path = `${crypto.randomUUID()}.${ext}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: blob.type || undefined,
  })
  if (uploadError) return { url: null, error: uploadError.message }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

export function uploadProductPhoto(file) {
  return uploadMedia(file, file.name.split('.').pop())
}
