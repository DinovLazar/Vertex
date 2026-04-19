'use client'

import { motion } from 'motion/react'
import { heroHeadline, heroSubtitle, heroCTA } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface HeroButton {
  label: string
  href: string
  variant: 'primary' | 'outline'
}

interface HeroSectionProps {
  headline: string
  subtitle: string
  buttons?: HeroButton[]
  className?: string
  /** Extra Tailwind classes for the headline. Color is set via inline style
   *  because an arbitrary-value color utility here confuses tailwind-merge
   *  and strips `text-display`, collapsing the headline to body font-size. */
  headlineClassName?: string
  children?: React.ReactNode // For background component
}

export default function HeroSection({
  headline,
  subtitle,
  buttons = [],
  className,
  headlineClassName,
  children,
}: HeroSectionProps) {
  return (
    <div className={cn('relative min-h-screen flex items-center justify-center', className)}>
      {/* Background slot */}
      {children}

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <motion.h1
          variants={heroHeadline}
          initial="hidden"
          animate="visible"
          className={cn('font-heading text-display', headlineClassName)}
          style={{ color: 'var(--division-text-primary)' }}
        >
          {headline}
        </motion.h1>

        <motion.p
          variants={heroSubtitle}
          initial="hidden"
          animate="visible"
          className="mt-6 text-body-lg text-[var(--division-text-secondary)] max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>

        {buttons.length > 0 && (
          <motion.div
            variants={heroCTA}
            initial="hidden"
            animate="visible"
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {buttons.map((btn) => (
              <a
                key={btn.href}
                href={btn.href}
                className={cn(
                  'px-7 py-3.5 rounded-button font-heading text-small font-medium transition-all',
                  btn.variant === 'primary'
                    ? 'bg-[var(--division-accent)] text-[var(--division-bg)] hover:brightness-110'
                    : 'border border-[var(--division-border)] text-[var(--division-text-primary)] hover:bg-white/5'
                )}
              >
                {btn.label}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
