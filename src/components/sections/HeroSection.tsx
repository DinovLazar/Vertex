'use client'

import { motion } from 'motion/react'
import { Link } from '@/i18n/navigation'
import { heroHeadline, heroSubtitle, heroCTA } from '@/lib/animations'
import { cn } from '@/lib/utils'
import MagneticButton from '@/components/ui/MagneticButton'

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
            {buttons.map((btn) => {
              const cls = cn(
                'inline-flex items-center justify-center min-h-[44px] px-7 py-3.5 rounded-button font-heading text-small font-medium transition-all focus-ring',
                btn.variant === 'primary'
                  ? 'bg-[var(--division-accent)] text-[var(--division-bg)] hover:brightness-110 cta-sheen'
                  : 'border border-[var(--division-border)] text-[var(--division-text-primary)] hover:bg-[var(--nav-hover-bg)]'
              )
              // Internal routes must go through the locale-aware Link or they
              // emit `/consulting` with no `/en`|`/mk` prefix — a full document
              // reload, no prefetch, and a proxy redirect on the site's two
              // primary CTAs. Hashes and absolute URLs stay plain anchors.
              const isExternal =
                btn.href.startsWith('#') || /^[a-z]+:/i.test(btn.href)

              return (
                <MagneticButton key={btn.href}>
                  {isExternal ? (
                    <a href={btn.href} className={cls}>
                      {btn.label}
                    </a>
                  ) : (
                    <Link href={btn.href} className={cls}>
                      {btn.label}
                    </Link>
                  )}
                </MagneticButton>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
