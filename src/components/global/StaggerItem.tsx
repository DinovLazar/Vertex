'use client'

import { motion, type Variants } from 'motion/react'
import { staggerItem } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface StaggerItemProps {
  children: React.ReactNode
  variants?: Variants
  className?: string
  as?: 'div' | 'li' | 'article' | 'section' | 'span'
}

/**
 * Child of `<StaggerContainer>`. Uses the shared `staggerItem` variant by
 * default. Exists as a standalone client component so server-rendered sections
 * can compose stagger animations without importing `motion` directly.
 *
 * Usage:
 * <StaggerContainer>
 *   <StaggerItem>Card 1</StaggerItem>
 *   <StaggerItem>Card 2</StaggerItem>
 * </StaggerContainer>
 */
export default function StaggerItem({
  children,
  variants = staggerItem,
  className,
  as = 'div',
}: StaggerItemProps) {
  const Component = motion[as] as typeof motion.div
  return (
    <Component variants={variants} className={cn(className)}>
      {children}
    </Component>
  )
}
