'use client'

import { useRef, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { staggerContainer, staggerItem } from '@/lib/animations'

const STAT_KEYS = ['yearsExperience', 'projectsDelivered', 'expertDivisions', 'clientFirst'] as const

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Detect when the span enters the viewport using a raw IntersectionObserver.
  // Motion's useInView was unreliable here with React 19 + Next 16, so we use
  // the browser API directly. Fires once, then disconnects.
  useEffect(() => {
    const el = ref.current
    if (!el || hasStarted) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasStarted(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasStarted])

  // Run the count-up animation once hasStarted flips true.
  useEffect(() => {
    if (!hasStarted) return

    let start = 0
    const duration = 2000 // 2 seconds
    const increment = target / (duration / 16) // ~60fps

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [hasStarted, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  )
}

export default function SocialProof() {
  const t = useTranslations('home.socialProof')

  return (
    <div>
      {/* Stats grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
      >
        {STAT_KEYS.map((key) => {
          const value = t.raw(`stats.${key}.value`) as number
          const suffix = t.raw(`stats.${key}.suffix`) as string
          const label = t(`stats.${key}.label`)
          return (
            <motion.div key={key} variants={staggerItem} className="text-center">
              <div
                className="font-heading text-display tabular-nums"
                style={{ color: 'var(--division-text-primary)' }}
              >
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <p className="mt-2 text-small text-[var(--division-text-muted)]">{label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Value proposition statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 max-w-3xl mx-auto text-center"
      >
        <blockquote className="text-h2 font-heading font-medium text-[var(--division-text-primary)]">
          &ldquo;{t('quote.text')}&rdquo;
        </blockquote>
        <p className="mt-4 text-small text-[var(--division-text-muted)]">
          {t('quote.attribution')}
        </p>
      </motion.div>
    </div>
  )
}
