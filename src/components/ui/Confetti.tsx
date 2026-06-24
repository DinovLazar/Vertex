'use client'

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useTheme } from '@/components/global'

// Grayscale only, theme-aware. Dark fires light particles on the dark page;
// light fires dark particles on the light page. No hue, ever.
const PALETTES = {
  dark: ['#F5F5F5', '#C9C9C9', '#A3A3A3'],
  light: ['#0A0B12', '#4B5563', '#9AA0AD'],
} as const

// pop-settle bezier. Single cubic-bezier applied across each keyframe segment.
const POP_SETTLE = [0.2, 0.7, 0.3, 1] as const

/**
 * A dependency-free, grayscale particle burst that fans up from its centered
 * anchor in a 74° cone with light gravity, then fades. Mount it (e.g. on a
 * success state) inside a `position: relative` container; it overlays as a
 * pointer-events-none layer and bursts once. Returns null under reduced
 * motion.
 */
export default function Confetti({ count = 18 }: { count?: number }) {
  const prefersReduced = useReducedMotion()
  const { theme } = useTheme()
  const colors = PALETTES[theme === 'light' ? 'light' : 'dark']

  const pieces = useMemo(() => {
    const HALF_CONE = (74 / 2) * (Math.PI / 180) // centered straight up
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.random() * 2 - 1) * HALF_CONE
      const v = 40 + Math.random() * 70 // 40–110px launch
      const ex = Math.sin(angle) * v
      const ey = -Math.cos(angle) * v // negative = up
      const gravity = 60 + Math.random() * 40 // +60–100px
      const rot = (Math.random() * 2 - 1) * 420 // ±420°
      const size = 3 + Math.random() * 4 // 3–7px
      const square = i % 2 === 0 // ~50% square / round
      const dur = 0.9 * (0.7 + Math.random() * 0.5) // 900ms × 0.7–1.2
      return { id: i, ex, ey, gravity, rot, size, square, dur, color: colors[i % 3] }
    })
  }, [count, colors])

  if (prefersReduced) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: [0, p.ex * 0.6, p.ex],
            y: [0, p.ey * 0.7, p.ey + p.gravity],
            rotate: [0, p.rot * 0.5, p.rot],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.dur, ease: POP_SETTLE, times: [0, 0.55, 1] }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.square ? 1 : '50%',
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}
