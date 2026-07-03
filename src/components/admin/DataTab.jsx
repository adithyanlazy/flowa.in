import { useRef, useState } from 'react'
import { AlertTriangle, Download, Upload } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext.jsx'

export default function DataTab() {
  const { exportData, importData, resetAll } = useAdmin()
  const fileRef = useRef(null)
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowa-site-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importData(reader.result)
        setMessage('Import successful ✓')
      } catch {
        setMessage('Could not read that file — is it valid JSON exported from here?')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-5 shadow-soft">
        <h2 className="font-display text-lg text-plum-900">Backup & restore</h2>
        <p className="mt-1 text-sm text-plum-800/60">
          All customizations live in this browser's storage only. Export a backup before clearing your browser data,
          or to move your changes to another device.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={download} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-plum-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blush-600">
            <Download size={15} /> Export JSON
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-plum-800 shadow-soft transition-colors hover:bg-blush-100">
            <Upload size={15} /> Import JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} className="hidden" />
        </div>
        {message && <p className="mt-3 text-sm font-semibold text-plum-800">{message}</p>}
      </div>

      <div className="rounded-3xl border-2 border-red-100 bg-red-50/50 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg text-red-700">
          <AlertTriangle size={18} /> Reset everything
        </h2>
        <p className="mt-1 text-sm text-red-700/70">
          Removes all product edits, custom products, reviews, FAQs, site text and theme colors — back to the original demo content. Cannot be undone.
        </p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-4 cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-bold text-red-700 shadow-soft transition-colors hover:bg-red-100"
          >
            Reset all customizations
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-red-700">Are you sure?</span>
            <button
              onClick={() => {
                resetAll()
                setConfirmReset(false)
              }}
              className="cursor-pointer rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              Yes, reset
            </button>
            <button onClick={() => setConfirmReset(false)} className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-bold text-plum-800 shadow-soft">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
