'use client'

import { motion, useScroll, useSpring } from 'motion/react'

/**
 * Thin progress bar at the top of the page.
 * Color adapts to the current division via CSS variable.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[60]"
      aria-hidden="true"
    >
      <div
        className="w-full h-full"
        style={{ backgroundColor: 'var(--division-accent)' }}
      />
    </motion.div>
  )
}
