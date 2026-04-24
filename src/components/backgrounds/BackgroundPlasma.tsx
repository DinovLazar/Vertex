'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/global'

const Plasma = dynamic(() => import('./Plasma'), { ssr: false })

interface BackgroundPlasmaProps {
  /** Override color explicitly. If omitted, the component uses theme-aware defaults. */
  color?: string
  speed?: number
  direction?: 'forward' | 'reverse' | 'pingpong'
  scale?: number
  opacity?: number
  mouseInteractive?: boolean
  className?: string
}

// Theme-aware default colors (Phase L3). Override via the `color` prop at the
// call site if needed. Dark matches the pre-phase marketing-hero value
// (#F5F5F5 bright-on-black flow); light flips to a mid-gray dark-on-white flow
// that preserves the same opacity/scale aesthetic with inverted contrast.
// NOTE: Plasma's internal effect deps include `color`, so a theme flip
// tears down and rebuilds the OGL canvas (brief visual reset). Acceptable
// for the marketing hero since theme flips are rare explicit user actions;
// if a flash-free swap is required later, Plasma.tsx would need a split
// between renderer-setup effect and uniform-update effect.
const PLASMA_COLOR_DARK = '#F5F5F5'
const PLASMA_COLOR_LIGHT = '#2A2D33'

export default function BackgroundPlasma({
  color,
  speed = 0.6,
  direction = 'forward',
  scale = 1.1,
  opacity = 0.7,
  mouseInteractive = true,
  className = '',
}: BackgroundPlasmaProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldAnimate(!mq.matches)
    const handler = (e: MediaQueryListEvent) => setShouldAnimate(!e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolvedColor = color ?? (theme === 'light' ? PLASMA_COLOR_LIGHT : PLASMA_COLOR_DARK)

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      {shouldAnimate ? (
        <Plasma
          color={resolvedColor}
          speed={speed}
          direction={direction}
          scale={scale}
          opacity={opacity}
          mouseInteractive={mouseInteractive}
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
