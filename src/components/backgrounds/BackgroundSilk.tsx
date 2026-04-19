'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Silk = dynamic(() => import('./Silk'), { ssr: false })

interface BackgroundSilkProps {
  color?: string
  speed?: number
  scale?: number
  noiseIntensity?: number
  rotation?: number
  className?: string
}

export default function BackgroundSilk({
  color = '#2A2D33',
  speed = 5,
  scale = 1,
  noiseIntensity = 1.5,
  rotation = 0,
  className = '',
}: BackgroundSilkProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

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

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      {shouldAnimate ? (
        <Silk
          color={color}
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
