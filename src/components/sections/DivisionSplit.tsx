'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'motion/react'
import { Briefcase, Megaphone, ArrowRight, type LucideIcon } from 'lucide-react'

// Locale-neutral division metadata — i18n keys, icons, and hrefs live here;
// every piece of display copy resolves through `home.divisionSplit.*`. Colors
// come from the `--division-*` token system; post-grayscale refactor both
// divisions render identically, so no per-division color fields are needed.
const DIVISION_KEYS = [
  {
    id: 'consulting',
    href: '/consulting',
    icon: Briefcase,
  },
  {
    id: 'marketing',
    href: '/marketing',
    icon: Megaphone,
  },
] as const satisfies ReadonlyArray<{
  id: 'consulting' | 'marketing'
  href: string
  icon: LucideIcon
}>

export default function DivisionSplit() {
  const t = useTranslations('home.divisionSplit')
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {DIVISION_KEYS.map((division, index) => {
        const Icon = division.icon
        const services = t.raw(`${division.id}.services`) as string[]
        return (
          <motion.div
            key={division.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={division.href}
              onMouseEnter={() => setHoveredDivision(division.id)}
              onMouseLeave={() => setHoveredDivision(null)}
              className="group block relative overflow-hidden rounded-card p-8 lg:p-10 h-full transition-all duration-500 focus-ring"
              style={{
                backgroundColor:
                  hoveredDivision === division.id ? 'var(--division-bg)' : 'var(--division-card)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor:
                  hoveredDivision === division.id
                    ? 'rgba(245, 245, 245, 0.19)'
                    : 'var(--division-border)',
              }}
            >
              {/* Icon */}
              <div
                className="relative z-10 w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-colors duration-300"
                style={{
                  backgroundColor: 'rgba(245, 245, 245, 0.08)',
                }}
              >
                <Icon size={24} style={{ color: 'var(--division-accent)' }} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-h3 text-[var(--division-text-primary)] group-hover:text-white transition-colors">
                  {t(`${division.id}.title`)}
                </h3>
                <p
                  className="mt-1 font-heading text-small font-medium transition-colors duration-300"
                  style={{ color: 'var(--division-accent)' }}
                >
                  {t(`${division.id}.subtitle`)}
                </p>
                <p className="mt-4 text-small text-[var(--division-text-secondary)]">
                  {t(`${division.id}.description`)}
                </p>

                {/* Service tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {services.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 rounded-full text-micro font-medium transition-colors duration-300"
                      style={{
                        backgroundColor: 'rgba(245, 245, 245, 0.06)',
                        color: 'rgba(245, 245, 245, 0.8)',
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>

                {/* Arrow CTA */}
                <div className="mt-8 flex items-center gap-2 text-small font-medium text-[var(--division-text-muted)] group-hover:text-white transition-colors">
                  <span>{t(`${division.id}.cta`)}</span>
                  <ArrowRight
                    size={16}
                    className="transform group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
