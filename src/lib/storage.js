import { supabase, supabaseEnabled } from './supabase.js'

const BUCKET = 'product-photos'

// Admin-only write (see "admin upload/update/delete product photos" policies
// in scripts/supabase-schema.sql) — bucket itself is public-read so the
// resulting URL works directly as a product's `photo` field.
export async function uploadProductPhoto(file) {
  if (!supabaseEnabled) return { url: null, error: 'Supabase not configured' }
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) return { url: null, error: uploadError.message }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
