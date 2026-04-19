'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface GridMotionProps {
  items?: (string | React.ReactNode)[]
  /**
   * @deprecated Unused when `variant="panels"`. Retained for back-compat with
   * `variant="text"` callers that might still want a vignette.
   */
  gradientColor?: string
  /**
   * `"text"` (default) renders each cell as text/image. `"panels"` renders each
   * cell as a brushed metallic silver panel — used by the consulting hero.
   */
  variant?: 'text' | 'panels'
}

export default function GridMotion({
  items = [],
  gradientColor = '#141414',
  variant = 'text',
}: GridMotionProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseXRef = useRef(typeof window !== 'undefined' ? window.innerWidth / 2 : 0)

  const totalItems = 28
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`)
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems

  useEffect(() => {
    gsap.ticker.lagSmoothing(0)

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
    }

    const updateMotion = () => {
      const maxMoveAmount = 300
      const baseDuration = 0.8
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount =
            ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto',
          })
        }
      })
    }

    // Pause the GSAP ticker callback when the grid scrolls offscreen or the
    // tab is hidden — `gsap.ticker.add/remove` fully detaches the callback so
    // no per-frame work happens. Resumes cleanly on re-entry; in-flight
    // gsap.to tweens complete or overwrite naturally.
    let tickerAttached = false
    const attach = () => {
      if (tickerAttached) return
      gsap.ticker.add(updateMotion)
      tickerAttached = true
    }
    const detach = () => {
      if (!tickerAttached) return
      gsap.ticker.remove(updateMotion)
      tickerAttached = false
    }

    // Start optimistic (`inView = true`) so the grid animates on first frame;
    // IntersectionObserver callbacks are async and would otherwise leave the
    // rows frozen for one frame before the observer reports visibility.
    let inView = true
    let pageVisible = typeof document !== 'undefined' ? !document.hidden : true
    const apply = () => {
      if (inView && pageVisible) attach()
      else detach()
    }
    apply()

    const gridEl = gridRef.current
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        apply()
      },
      { threshold: 0 }
    )
    if (gridEl) io.observe(gridEl)

    const onVis = () => {
      pageVisible = !document.hidden
      apply()
    }
    document.addEventListener('visibilitychange', onVis)

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      detach()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div
      ref={gridRef}
      style={{ height: '100%', width: '100%', overflow: 'hidden' }}
    >
      <section
        style={{
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Panels mode uses a solid deep-black so the gaps between cells read
          // as sharp black; text mode now also uses a solid `gradientColor`
          // (the old vignette was removed in the grayscale refactor).
          backgroundColor: variant === 'panels' ? '#0E0E0E' : gradientColor,
        }}
      >
        <div
          style={{
            gap: '1rem',
            flex: 'none',
            position: 'relative',
            width: '150vw',
            height: '150vh',
            display: 'grid',
            gridTemplateRows: 'repeat(4, 1fr)',
            gridTemplateColumns: '100%',
            transform: 'rotate(-15deg)',
            transformOrigin: 'center center',
            zIndex: 2,
          }}
        >
          {[...Array(4)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              ref={(el) => { rowRefs.current[rowIndex] = el }}
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(7, 1fr)',
                willChange: 'transform, filter',
              }}
            >
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex]

                // Panels variant: empty brushed-silver tile. The text `items`
                // array is ignored visually but still drives cell count.
                if (variant === 'panels') {
                  return (
                    <div key={itemIndex} style={{ position: 'relative' }}>
                      <div className="metallic-panel" aria-hidden="true" />
                    </div>
                  )
                }

                return (
                  <div key={itemIndex} style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        borderRadius: '10px',
                        backgroundColor: '#1C1C1C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#737373',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 500,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        border: '1px solid #262626',
                      }}
                    >
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundSize: 'cover',
                            backgroundPosition: '50% 50%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            backgroundImage: `url(${content})`,
                          }}
                        />
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', zIndex: 1 }}>
                          {content}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
