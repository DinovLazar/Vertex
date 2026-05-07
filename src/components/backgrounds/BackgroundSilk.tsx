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
// has been retuned twice:
//   L6:       #CDD1D7 → #D8DCE2  (paired with --silk-opacity: 0.3)
//   Session — Silk Visibility + Scroll-Resume Fix:
//             #D8DCE2 → #C5CBD3  (paired with --silk-opacity: 0.55)
// The shader multiplies uColor by a pattern ~0.2–1.0, so the wrapper's
// opacity: var(--silk-opacity) and the colour work together. L6 erred on
// the invisible side; this retune brings the pattern back into "visible
// but atmospheric" without letting it compete with the hero headline.
const SILK_COLOR_DARK = '#2A2D33'
// Retuned alongside --silk-opacity bump (0.3 → 0.55) in Session — Silk
// Visibility + Scroll-Resume Fix. At the old 0.3 opacity a near-white
// colour was used to stay subtle; at 0.55 we can afford a slightly
// darker base so the wave pattern's troughs have visible structure
// against the white page background. Still well within "atmospheric"
// territory — headline remains the dominant element.
const SILK_COLOR_LIGHT = '#C5CBD3'

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
