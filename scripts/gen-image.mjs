// One-off Gemini image generation helper. Usage: node scripts/gen-image.mjs "<prompt>" <outputPath> [aspectRatio]
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')
let apiKey = process.env.GEMINI_API_KEY
if (!apiKey && existsSync(envPath)) {
  const line = readFileSync(envPath, 'utf8').split('\n').find((l) => l.startsWith('GEMINI_API_KEY='))
  if (line) apiKey = line.slice('GEMINI_API_KEY='.length).trim()
}
if (!apiKey) {
  console.error('No GEMINI_API_KEY found')
  process.exit(1)
}

const [, , prompt, outPath, aspectRatio = '1:1'] = process.argv
if (!prompt || !outPath) {
  console.error('Usage: node gen-image.mjs "<prompt>" <outputPath> [aspectRatio]')
  process.exit(1)
}

const model = 'gemini-2.5-flash-image'
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    responseModalities: ['IMAGE'],
    imageConfig: { aspectRatio },
  },
}

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
  body: JSON.stringify(body),
})

const text = await res.text()
if (!res.ok) {
  console.error('HTTP', res.status, text.slice(0, 2000))
  process.exit(1)
}

let json
try {
  json = JSON.parse(text)
} catch {
  console.error('Non-JSON response:', text.slice(0, 2000))
  process.exit(1)
}

const parts = json?.candidates?.[0]?.content?.parts || []
const imgPart = parts.find((p) => p.inlineData?.data)
if (!imgPart) {
  console.error('No image in response:', JSON.stringify(json).slice(0, 2000))
  process.exit(1)
}

writeFileSync(outPath, Buffer.from(imgPart.inlineData.data, 'base64'))
console.log('Saved', outPath, imgPart.inlineData.mimeType)
