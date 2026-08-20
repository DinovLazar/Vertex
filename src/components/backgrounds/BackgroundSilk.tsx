'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useTheme } from '@/components/global'
import { useShouldAnimate } from '@/lib/useMediaQuery'

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
  // Reduced-motion gate. useSyncExternalStore keeps the SSR and hydration
  // renders identical (false => inert div, no shader module downloaded)
  // without the cascading re-render a useState+useEffect pair causes.
  const shouldAnimate = useShouldAnimate()
  const { theme } = useTheme()


  // Nudge R3F's use-measure to recompute after the dynamic Canvas mounts.
  useEffect(() => {
    if (!shouldAnimate) return
    const id = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 50)
    return () => window.clearTimeout(id)
  }, [shouldAnimate])

  const resolvedColor = color ?? (theme === 'light' ? SILK_COLOR_LIGHT : SILK_COLOR_DARK)

  return (
    <>
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

      {/* Legibility scrim — mirrors the one the consulting hero draws over
          GridMotion. A sibling of the canvas wrapper rather than a child, so
          --silk-opacity does not also dim the scrim itself. z-[1] puts it
          above the z-0 canvas and below HeroSection's z-10 content. Both
          tokens are `transparent` in dark mode, so this paints nothing there.
          See --silk-scrim-* in globals.css for the measurements. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 60% at 50% 52%, var(--silk-scrim-center) 0%, var(--silk-scrim-mid) 55%, transparent 95%)',
        }}
      />
    </>
  )
}
