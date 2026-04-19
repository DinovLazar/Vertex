'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Plasma = dynamic(() => import('./Plasma'), { ssr: false })

interface BackgroundPlasmaProps {
  color?: string
  speed?: number
  direction?: 'forward' | 'reverse' | 'pingpong'
  scale?: number
  opacity?: number
  mouseInteractive?: boolean
  className?: string
}

export default function BackgroundPlasma({
  color = '#737373',
  speed = 0.6,
  direction = 'forward',
  scale = 1.1,
  opacity = 0.7,
  mouseInteractive = true,
  className = '',
}: BackgroundPlasmaProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldAnimate(!mq.matches)
    const handler = (e: MediaQueryListEvent) => setShouldAnimate(!e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      {shouldAnimate ? (
        <Plasma
          color={color}
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
