'use client'

import { motion, type Variants } from 'motion/react'
import { staggerContainer } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface StaggerContainerProps {
  children: React.ReactNode
  variants?: Variants
  className?: string
  once?: boolean
  amount?: number
  as?: 'div' | 'section' | 'ul' | 'ol'
}

/**
 * Container that staggers children animations.
 * Each direct child should use motion.div with staggerItem variants.
 *
 * Usage:
 * <StaggerContainer>
 *   <motion.div variants={staggerItem}>Card 1</motion.div>
 *   <motion.div variants={staggerItem}>Card 2</motion.div>
 *   <motion.div variants={staggerItem}>Card 3</motion.div>
 * </StaggerContainer>
 */
export default function StaggerContainer({
  children,
  variants = staggerContainer,
  className,
  once = true,
  amount = 0.15,
  as = 'div',
}: StaggerContainerProps) {
  const Component = motion[as] as typeof motion.div

  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={cn(className)}
    >
      {children}
    </Component>
  )
}
