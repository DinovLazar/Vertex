'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// Mirrors the --magnetic-* tokens in globals.css (kept in sync by hand —
// motion needs the numbers in JS, CSS keeps them for documentation parity).
const PULL = 0.3 // --magnetic-pull
const MAX_SHIFT = 12 // --magnetic-max (px)
const SQUISH = 0.94 // --magnetic-squish
const ACTIVATION_PAD = 80 // px beyond the button edge before the pull engages

/**
 * Wraps a button/Link so it eases toward the cursor when the pointer is
 * within `max(w,h)/2 + 80px`, by 0.30× the offset, clamped to 12px, and
 * springs back on leave (stiffness 170 / damping 26 / mass 1). A 0.94 squish
 * fires on press. The wrapper hugs its child (`inline-flex`) so the magnetic
 * rect matches the button, not a full-width block. Pass `className` for
 * responsive visibility on the wrapper (e.g. `hidden md:inline-flex`); it is
 * merged so a `hidden` override wins over the default `inline-flex`.
 *
 * Under reduced motion the listener never attaches and the squish flattens to
 * a no-op, so the button is a static element. `<MotionConfig
 * reducedMotion="user">` elsewhere can't cover the manual pointer math, hence
 * the explicit guard.
 *
 * The wrapper is decorative: the child it wraps (a `<Link>`, `<a>` or
 * `<button>`) owns the role, the accessible name and the focus ring, so the
 * span is held out of the tab order with `tabIndex={-1}`.
 */
export default function MagneticButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReduced = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 170, damping: 26, mass: 1 })
  const springY = useSpring(y, { stiffness: 170, damping: 26, mass: 1 })

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    function onMove(e: PointerEvent) {
      const r = el!.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const radius = Math.max(r.width, r.height) / 2 + ACTIVATION_PAD
      if (Math.hypot(dx, dy) < radius) {
        let tx = dx * PULL
        let ty = dy * PULL
        const mag = Math.hypot(tx, ty)
        if (mag > MAX_SHIFT) {
          const k = MAX_SHIFT / mag
          tx *= k
          ty *= k
        }
        x.set(tx)
        y.set(ty)
      } else {
        x.set(0)
        y.set(0)
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [prefersReduced, x, y])

  return (
    <motion.span
      ref={ref}
      style={{ x: springX, y: springY }}
      // Squish by value, never by prop presence: motion derives
      // `tabIndex={0}` at render time from the mere existence of `whileTap`
      // (framer-motion's useHTMLProps). `prefersReduced` is null during SSR
      // and the real preference on the client's first render, so toggling the
      // prop off made server and client markup disagree on `tabindex` — a
      // hydration mismatch on every reduced-motion visitor. `scale: 1` is a
      // visual no-op, so the markup is now identical either way.
      whileTap={{ scale: prefersReduced ? 1 : SQUISH }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      // Belt and braces for the above, and an accessibility fix in its own
      // right: an explicit tabIndex stops motion injecting one (both at render
      // and via the press gesture's `element.tabIndex = 0`), which otherwise
      // left a nameless, roleless tab stop in front of every CTA that Enter
      // could not activate. The child stays keyboard-reachable on its own.
      tabIndex={-1}
      className={cn('inline-flex', className)}
    >
      {children}
    </motion.span>
  )
}
