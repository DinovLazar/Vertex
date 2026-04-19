'use client'

import { motion, type Variants } from 'motion/react'
import { fadeInUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface AnimateInProps {
  children: React.ReactNode
  variants?: Variants
  className?: string
  delay?: number
  once?: boolean
  amount?: number
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

/**
 * Wraps any content in a scroll-triggered animation.
 * Defaults to fade-in-up with spring snap.
 *
 * Usage:
 * <AnimateIn>
 *   <h2>This animates when scrolled into view</h2>
 * </AnimateIn>
 *
 * <AnimateIn variants={fadeInLeft} delay={0.2}>
 *   <p>Slides in from left after 0.2s delay</p>
 * </AnimateIn>
 */
export default function AnimateIn({
  children,
  variants = fadeInUp,
  className,
  delay = 0,
  once = true,
  amount = 0.2,
  as = 'div',
}: AnimateInProps) {
  const Component = motion[as] as typeof motion.div

  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={delay ? { delay } : undefined}
      className={cn(className)}
    >
      {children}
    </Component>
  )
}
