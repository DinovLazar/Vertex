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

/* ---------------------------------------------------------------
   Grid geometry.

   The plate field is a fixed 4 x 7 lattice. Its box used to be a
   plain `150vw x 150vh`, which meant every cell was a fraction of
   the viewport: fine on a desktop (~260 x 288), but on a 375px
   phone the seven columns had to share 562px, squashing each plate
   into a 67px-wide sliver while its height stayed ~292px. The
   panels read as vertical blinds instead of brushed metal sheets.

   The box is now `max(150vw, MIN_GRID_W)` / `max(150vh, MIN_GRID_H)`,
   where the minimums are the lattice at its reference desktop cell
   size. Above ~1277 x 800 nothing changes — the viewport-relative
   size still wins, so the desktop treatment is byte-identical. Below
   it the box stops shrinking, the plates hold their size, and the
   surplus simply overflows the hero's `overflow: hidden` frame:
   a phone sees fewer, correctly-proportioned plates rather than the
   whole lattice crushed to fit. Coverage is never at risk — at the
   floor the rotated box still measures ~2165 x 1656.
   --------------------------------------------------------------- */
const ROWS = 4
const COLS = 7
const GAP_PX = 16
/** Reference desktop cell, measured at a 1280 x 800 viewport. */
const MIN_CELL_W = 260
const MIN_CELL_H = 288
const MIN_GRID_W = COLS * MIN_CELL_W + (COLS - 1) * GAP_PX // 1916
const MIN_GRID_H = ROWS * MIN_CELL_H + (ROWS - 1) * GAP_PX // 1200

export default function GridMotion({
  items = [],
  gradientColor = '#141414',
  variant = 'text',
}: GridMotionProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseXRef = useRef(typeof window !== 'undefined' ? window.innerWidth / 2 : 0)

  const totalItems = ROWS * COLS
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
          // Panels mode consumes `--hero-grid-bg` (Phase L3) so the
          // consulting-hero container flips with the theme. Text mode keeps
          // the legacy `gradientColor` prop path for callers that still use
          // `variant="text"` with a custom vignette color.
          backgroundColor: variant === 'panels' ? 'var(--hero-grid-bg)' : gradientColor,
        }}
      >
        <div
          style={{
            gap: `${GAP_PX}px`,
            flex: 'none',
            position: 'relative',
            width: `max(150vw, ${MIN_GRID_W}px)`,
            height: `max(150vh, ${MIN_GRID_H}px)`,
            display: 'grid',
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            gridTemplateColumns: '100%',
            transform: 'rotate(-15deg)',
            transformOrigin: 'center center',
            zIndex: 2,
          }}
        >
          {[...Array(ROWS)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              ref={(el) => { rowRefs.current[rowIndex] = el }}
              style={{
                display: 'grid',
                gap: `${GAP_PX}px`,
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                willChange: 'transform, filter',
              }}
            >
              {[...Array(COLS)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * COLS + itemIndex]

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
