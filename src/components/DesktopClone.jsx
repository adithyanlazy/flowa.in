import { useEffect, useState } from 'react'

function getViewportWidth() {
  // documentElement.clientWidth is more reliable than window.innerWidth in
  // embedded/emulated viewports (CDP device emulation, etc.) and never
  // briefly reads 0 the way window.innerWidth can before the page settles.
  return (typeof document !== 'undefined' && document.documentElement.clientWidth) || (typeof window !== 'undefined' && window.innerWidth) || 0
}

// Renders children at a fixed desktop width, then shrinks the whole block down
// to fit narrow viewports via CSS `zoom` — so phones see a shrunk clone of the
// desktop layout instead of the normal responsive (stacked) mobile arrangement.
// No-ops at desktop widths so the existing full-bleed desktop layout is
// untouched. Uses `zoom` rather than `transform: scale` because `transform`
// creates a new containing block that breaks `position: sticky`/`fixed`
// descendants (e.g. the sticky navbar) — `zoom` resizes layout directly
// without that side effect.
export default function DesktopClone({ children, width = 1280, disabled = false }) {
  const [narrow, setNarrow] = useState(() => {
    const vw = getViewportWidth()
    return vw > 0 && vw < width
  })
  const [scale, setScale] = useState(() => {
    const vw = getViewportWidth()
    return vw > 0 ? vw / width : 1
  })

  useEffect(() => {
    const update = () => {
      const vw = getViewportWidth()
      if (!vw) return
      setNarrow(vw < width)
      setScale(vw / width)
    }
    update()
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    ro.observe(document.documentElement)
    return () => {
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [width])

  if (disabled || !narrow) return <>{children}</>

  return <div style={{ width, zoom: scale }}>{children}</div>
}
