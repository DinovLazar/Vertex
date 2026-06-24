'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { heroHeadline, heroSubtitle, heroCTA } from '@/lib/animations'
import { Link } from '@/i18n/navigation'
import MagneticButton from '@/components/ui/MagneticButton'

/**
 * Personal hero for /lazar. Two columns on desktop (text left, avatar right);
 * single column on mobile with the avatar leading visually, while the DOM keeps
 * text first for screen-reader / SEO order. Animate-on-mount, so this is the
 * page's one client component.
 *
 * The avatar is a background-removed portrait (/public/lazar.png) composited onto
 * the gradient tile via next/image fill + object-cover object-top. Swap the file
 * to update; keep the head near the top of the frame so the square crop keeps it.
 * Note: after replacing lazar.png in dev, clear .next/dev/cache/images or the
 * optimizer may keep serving the old crop.
 */
export default function LazarHero() {
  const t = useTranslations('lazar.hero')

  return (
    <section className="relative overflow-hidden bg-[var(--division-bg)]">
      {/* soft radial glow, top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[10%] right-[8%] h-[640px] w-[640px] rounded-full"
        style={{ background: 'radial-gradient(circle, var(--division-glow), transparent 62%)' }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-20 md:pt-32 md:pb-28">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Text */}
          <motion.div
            className="order-2 lg:order-1"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.p variants={heroSubtitle} className="overline text-[var(--division-text-muted)] mb-6">
              {t('overline')}
            </motion.p>
            <motion.h1
              variants={heroHeadline}
              className="font-heading text-display"
              style={{ color: 'var(--division-text-primary)' }}
            >
              {t('name')}
            </motion.h1>
            <motion.p variants={heroSubtitle} className="mt-4 text-body-lg text-[var(--division-text-muted)]">
              {t('role')}
            </motion.p>
            <motion.p
              variants={heroSubtitle}
              className="mt-5 max-w-[520px] text-body-lg text-[var(--division-text-secondary)]"
            >
              {t('tagline')}
            </motion.p>
            <motion.div variants={heroCTA} className="mt-9 flex flex-wrap gap-4">
              <MagneticButton>
                <a
                  href="#work"
                  className="focus-ring cta-sheen inline-flex min-h-[44px] items-center justify-center rounded-button bg-[var(--division-accent)] px-7 py-3.5 font-heading text-small font-medium text-[var(--division-bg)] transition-all hover:brightness-110"
                >
                  {t('ctaPrimary')}
                </a>
              </MagneticButton>
              <Link
                href="/contact"
                className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-button border border-[var(--division-border)] px-7 py-3.5 font-heading text-small font-medium text-[var(--division-text-primary)] transition-all hover:bg-[var(--nav-hover-bg)]"
              >
                {t('ctaSecondary')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Avatar */}
          <motion.div
            className="order-1 flex justify-center lg:order-2"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="relative aspect-square w-[clamp(240px,30vw,340px)]">
              <div
                aria-hidden="true"
                className="absolute -inset-3.5 rounded-[28px]"
                style={{ background: 'radial-gradient(circle at 50% 40%, var(--division-glow), transparent 68%)' }}
              />
              <div
                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-[var(--division-border)]"
                style={{
                  background: 'linear-gradient(160deg, var(--division-card), var(--division-surface))',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.5)',
                }}
              >
                {/* Background-removed portrait composited onto the gradient tile.
                    Swap the file at /public/lazar.png to update. */}
                <Image
                  src="/lazar.png"
                  alt={t('name')}
                  fill
                  sizes="(max-width: 1024px) 240px, 340px"
                  priority
                  className="object-cover object-top"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
