// Batch-generate real AI photos via Pollinations (free, no key) and save to public/images.
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'images')
mkdirSync(path.join(outDir, 'products'), { recursive: true })

const jobs = [
  {
    file: 'hero.jpg',
    w: 1200,
    h: 960,
    seed: 101,
    prompt:
      'editorial flat lay product photography, soft blush pink and lavender pastel background, a stack of premium cotton sanitary pads wrapped in elegant paper, a small brown chocolate bar, a sprig of dried flowers, soft natural window light, minimal shadows, high-end skincare brand aesthetic, no text, no logo, no people',
  },
  {
    file: 'about-story.jpg',
    w: 1000,
    h: 1000,
    seed: 202,
    prompt:
      'warm lifestyle photo of two hands wrapping a soft pink gift box with ribbon on a wooden table, cozy natural light, blush and cream tones, cotton fabric texture, gentle and caring mood, shallow depth of field, no text, no logo, no faces',
  },
  {
    file: 'contact.jpg',
    w: 1000,
    h: 750,
    seed: 303,
    prompt:
      'cozy flat lay photo of a smartphone showing a chat bubble icon, a cup of chamomile tea, a soft pink blanket, dried flowers, warm soft lighting, pastel pink and lavender tones, customer care mood, no text, no logo, no faces',
  },
  {
    file: 'products/complete-care-kit.jpg',
    w: 900,
    h: 900,
    seed: 11,
    prompt:
      'product photography of an elegant pastel pink box open showing neatly folded cotton pads, a small dark chocolate bar, and hand sanitizer bottle, soft studio lighting, blush pink background, minimal premium skincare packaging style, no text, no logo',
  },
  {
    file: 'products/comfort-plus-combo.jpg',
    w: 900,
    h: 900,
    seed: 12,
    prompt:
      'product photography of a soft lavender purple gift box with herbal patches and a small roll-on bottle beside dried lavender sprigs, soft studio lighting, light purple background, premium wellness packaging, no text, no logo',
  },
  {
    file: 'products/cramp-relief-gift-box.jpg',
    w: 900,
    h: 900,
    seed: 13,
    prompt:
      'luxurious rose pink gift box with an elegant satin ribbon bow, surrounded by dried rose petals and a small warm compress pouch, soft studio lighting, blush background, premium gifting product photography, no text, no logo',
  },
  {
    file: 'products/relief-5in1-kit.jpg',
    w: 900,
    h: 900,
    seed: 14,
    prompt:
      'product photography of a small cotton drawstring pouch open showing herbal patches, a mini heat pack, and tea sachets, warm amber and cream tones, soft studio lighting, minimal background, no text, no logo',
  },
  {
    file: 'products/duo-period-combo.jpg',
    w: 900,
    h: 900,
    seed: 15,
    prompt:
      'product photography of two identical soft green boxes stacked neatly with cotton pads visible, fresh leaf sprig accent, soft studio lighting, pastel mint background, premium eco packaging, no text, no logo',
  },
  {
    file: 'products/cotton-xl-pads.jpg',
    w: 900,
    h: 900,
    seed: 16,
    prompt:
      'product photography of a stack of individually wrapped cotton sanitary pads with soft blue packaging, cotton flower accent, soft studio lighting, light blue pastel background, clean minimal skincare style, no text, no logo',
  },
  {
    file: 'products/cramp-relief-patches.jpg',
    w: 900,
    h: 900,
    seed: 17,
    prompt:
      'product photography of small round herbal relief patches fanned out on a soft lilac surface, mint leaf accents, soft studio lighting, pastel purple background, minimal wellness product shot, no text, no logo',
  },
  {
    file: 'products/teen-first-period-kit.jpg',
    w: 900,
    h: 900,
    seed: 18,
    prompt:
      'product photography of a friendly soft orange box with cotton pads and a small illustrated guide booklet, warm cheerful tones, soft studio lighting, pastel peach background, gentle approachable packaging, no text, no logo',
  },
]

async function generate(job) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(job.prompt)}?width=${job.w}&height=${job.h}&nologo=true&model=flux&seed=${job.seed}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${job.file}: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 5000) throw new Error(`${job.file}: suspiciously small (${buf.length}b)`)
  writeFileSync(path.join(outDir, job.file), buf)
  console.log('OK', job.file, buf.length, 'bytes')
}

for (const job of jobs) {
  let ok = false
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      await generate(job)
      ok = true
    } catch (e) {
      console.error(`attempt ${attempt} failed:`, e.message)
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000))
    }
  }
  if (!ok) console.error('GAVE UP on', job.file)
}
