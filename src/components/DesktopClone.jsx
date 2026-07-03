import { useEffect, useRef, useState } from 'react'

function getViewportWidth() {
  // documentElement.clientWidth is more reliable than window.innerWidth in
  // embedded/emulated viewports (CDP device emulation, etc.) and never
  // briefly reads 0 the way window.innerWidth can before the page settles.
  return (typeof document !== 'undefined' && document.documentElement.clientWidth) || (typeof window !== 'undefined' && window.innerWidth) || 0
}

// Renders children at a fixed desktop width, then scales the whole block down
// to fit narrow viewports — so phones see a shrunk clone of the desktop layout
// instead of the normal responsive (stacked) mobile arrangement. No-ops at
// desktop widths so the existing full-bleed desktop layout is untouched.
export default function DesktopClone({ children, width = 1280 }) {
  const innerRef = useRef(null)
  const [narrow, setNarrow] = useState(() => {
    const vw = getViewportWidth()
    return vw > 0 && vw < width
  })
  const [scale, setScale] = useState(() => {
    const vw = getViewportWidth()
    return vw > 0 ? vw / width : 1
  })
  const [height, setHeight] = useState(null)

  // Track viewport width regardless of whether the wrapper is mounted.
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

  // Only runs once the wrapper (and innerRef) actually exists in the DOM,
  // so it never misses attaching because of a same-tick ref race.
  useEffect(() => {
    if (!narrow || !innerRef.current) return
    const el = innerRef.current
    const updateHeight = () => setHeight(el.scrollHeight * scale)
    updateHeight()
    const ro = new ResizeObserver(updateHeight)
    ro.observe(el)
    return () => ro.disconnect()
  }, [narrow, scale])

  if (!narrow) return <>{children}</>

  return (
    <div style={{ width: '100%', overflow: 'hidden', height: height ?? undefined }}>
      <div ref={innerRef} style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}
