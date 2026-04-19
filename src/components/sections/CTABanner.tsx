'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'motion/react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTABannerProps {
  /** Override heading; falls back to `sections.ctaBanner.defaultHeadline`. */
  headline?: string
  /** Override subtext; falls back to `sections.ctaBanner.defaultSubtext`. */
  subtext?: string
  /** Override button text; falls back to `sections.ctaBanner.defaultCta`. */
  buttonText?: string
  buttonHref?: string
  className?: string
}

export default function CTABanner({
  headline,
  subtext,
  buttonText,
  buttonHref = '/contact',
  className,
}: CTABannerProps) {
  const t = useTranslations('sections.ctaBanner')
  const resolvedHeadline = headline ?? t('defaultHeadline')
  const resolvedSubtext = subtext ?? t('defaultSubtext')
  const resolvedButtonText = buttonText ?? t('defaultCta')

  return (
    <section
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundColor: 'var(--color-ink)' }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-h1 font-bold text-[var(--division-text-primary)]"
        >
          {resolvedHeadline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 text-body text-[var(--division-text-secondary)] max-w-xl mx-auto"
        >
          {resolvedSubtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <Link
            href={buttonHref}
            className={cn(
              buttonVariants({ size: 'cta' }),
              'text-base hover:brightness-110 hover:scale-[1.02] focus-ring'
            )}
            style={{
              backgroundColor: 'var(--division-accent)',
              color: 'var(--division-bg)',
            }}
          >
            {resolvedButtonText}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
