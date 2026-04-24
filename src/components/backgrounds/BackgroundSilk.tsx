'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/global'

const Silk = dynamic(() => import('./Silk'), { ssr: false })

interface BackgroundSilkProps {
  /** Override color explicitly. If omitted, the component uses theme-aware defaults. */
  color?: string
  speed?: number
  scale?: number
  noiseIntensity?: number
  rotation?: number
  className?: string
}

// Theme-aware default colors. Dark matches the pre-L3 live value. Light
// retuned in L6 from #CDD1D7 → #D8DCE2 so the dampened shader output (see
// --silk-opacity below) still reads as visible flow texture instead of
// near-invisible pale. The shader multiplies uColor by a pattern ~0.2–1.0,
// so the wrapper's opacity: var(--silk-opacity) is what actually mutes the
// canvas in light mode — the color tuning is a complementary nudge.
const SILK_COLOR_DARK = '#2A2D33'
const SILK_COLOR_LIGHT = '#D8DCE2'

export default function BackgroundSilk({
  color,
  speed = 5,
  scale = 1,
  noiseIntensity = 1.5,
  rotation = 0,
  className = '',
}: BackgroundSilkProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldAnimate(!mq.matches)
    const handler = (e: MediaQueryListEvent) => setShouldAnimate(!e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Nudge R3F's use-measure to recompute after the dynamic Canvas mounts.
  useEffect(() => {
    if (!shouldAnimate) return
    const id = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    return () => window.clearTimeout(id)
  }, [shouldAnimate])

  const resolvedColor = color ?? (theme === 'light' ? SILK_COLOR_LIGHT : SILK_COLOR_DARK)

  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      style={{ opacity: 'var(--silk-opacity, 1)' }}
    >
      {shouldAnimate ? (
        <Silk
          color={resolvedColor}
          speed={speed}
          scale={scale}
          noiseIntensity={noiseIntensity}
          rotation={rotation}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ backgroundColor: 'var(--division-bg)' }}
        />
      )}
    </div>
  )
}
