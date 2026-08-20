'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { heroHeadline, heroSubtitle, heroCTA } from '@/lib/animations'
import { Link } from '@/i18n/navigation'
import MagneticButton from '@/components/ui/MagneticButton'

/**
 * Personal hero for /lazar — brutalist re-skin (approved Stitch redesign).
 *
 * A hard-edged bordered frame (`border-2`, sharp corners, full-contrast
 * `--division-text-primary` rails) sits below the fixed navbar. Two columns
 * on desktop split by a vertical rail: technical-label chip + oversized
 * uppercase name + mono role + quoted tagline (left-rule accent) + two square
 * CTAs on the left; the color portrait framed over a dotted technical grid on
 * the right. Animate-on-mount, so this stays the page's one client component.
 *
 * Every colour routes through the grayscale tokens, so the whole frame inverts
 * cleanly between dark and light. The hero photo stays /public/lazar.png
 * (color) via next/image with `priority`.
 *
 * Note: after replacing lazar.png in dev, clear .next/dev/cache/images or the
 * optimizer may keep serving the old crop.
 */
export default function LazarHero() {
  const t = useTranslations('lazar.hero')

  return (
    <section className="bg-[var(--division-bg)] pt-24 md:pt-32">
      <div className="mx-auto max-w-7xl border-2 border-[var(--division-text-primary)]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Text */}
          <motion.div
            className="flex flex-col justify-center gap-6 px-6 py-14 md:px-10 md:py-20 lg:border-r-2 lg:border-[var(--division-text-primary)]"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={heroSubtitle}>
              <span className="inline-flex items-center border border-[var(--division-text-primary)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--division-text-primary)]">
                {t('overline')}
              </span>
            </motion.div>

            <motion.h1
              variants={heroHeadline}
              className="font-heading text-display-lg font-extrabold uppercase leading-[0.9] tracking-[-0.02em] text-[var(--division-text-primary)]"
            >
              {t('name')}
            </motion.h1>

            <motion.p
              variants={heroSubtitle}
              className="font-mono text-small uppercase tracking-[0.2em] text-[var(--division-text-muted)]"
            >
              {t('role')}
            </motion.p>

            <motion.p
              variants={heroSubtitle}
              className="max-w-xl border-l-2 border-[var(--division-text-primary)] pl-5 text-body-lg text-[var(--division-text-primary)]"
            >
              {t('tagline')}
            </motion.p>

            <motion.div variants={heroCTA} className="flex flex-wrap gap-4 pt-3">
              <MagneticButton>
                <a
                  href="#work"
                  className="btn-accent focus-ring cta-sheen inline-flex min-h-[44px] items-center justify-center rounded-none px-8 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em]"
                >
                  {t('ctaPrimary')}
                </a>
              </MagneticButton>
              <Link
                href="/contact"
                className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-none border-2 border-[var(--division-text-primary)] px-8 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--division-text-primary)] transition-colors hover:bg-[var(--division-text-primary)] hover:text-[var(--division-bg)]"
              >
                {t('ctaSecondary')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Photo tile — color portrait over a technical dot-grid */}
          <motion.div
            className="relative min-h-[380px] overflow-hidden border-t-2 border-[var(--division-text-primary)] bg-[var(--division-surface)] sm:min-h-[460px] lg:border-t-0"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(var(--division-border) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(circle at 50% 38%, var(--division-glow), transparent 66%)' }}
            />
            <Image
              src="/lazar.png"
              alt={t('name')}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover object-top"
            />
            {/* Decorative registration mark */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 right-0 flex items-center border-l-2 border-t-2 border-[var(--division-text-primary)] bg-[var(--division-bg)] px-3 py-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--division-text-primary)" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="12" cy="12" r="6" />
                <path d="M12 1v6M12 17v6M1 12h6M17 12h6" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
