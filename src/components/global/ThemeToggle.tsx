'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { useTheme } from './ThemeProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  /** Extra classes for the outer button (e.g. responsive visibility). */
  className?: string
  /** Icon pixel size. Defaults to 16. */
  iconSize?: number
}

/**
 * Sibling-shape of the language toggle: variant="ghost" + min-h-[44px] +
 * h-auto + px-3 py-1.5 rounded-full. No CVA `size` is applied because the
 * language toggle overrides `size="default"` with hand-tuned className —
 * matching that shape requires matching its className, not its size variant.
 * min-w-[44px] ensures the icon-only button still meets the 44×44 touch
 * target floor (the language toggle gets width from the EN/MK text).
 */
const BUTTON_SHAPE =
  'inline-flex items-center justify-center min-h-[44px] min-w-[44px] h-auto w-auto px-3 py-1.5 rounded-full text-sm font-medium hover:bg-[var(--nav-hover-bg)]'

export default function ThemeToggle({
  className,
  iconSize = 16,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('nav.themeToggle')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keep the outer <Button> className STABLE across the mount boundary so the
  // Button primitive's `transition-all` doesn't trigger a stuck opacity
  // transition when React patches attributes post-mount. Only the inner
  // content swaps: placeholder <span> on SSR + first client paint, real icon
  // after mount. Server and first-client render produce byte-identical
  // outer markup → hydration-clean, no icon flicker.

  const isDark = theme === 'dark'
  // Icon logic: show what the user will GET by clicking.
  // Currently dark → clicking goes to light → show Sun.
  // Currently light → clicking goes to dark → show Moon.
  const Icon = isDark ? Sun : Moon
  const label = isDark ? t('toLight') : t('toDark')

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={mounted ? toggleTheme : undefined}
      aria-label={mounted ? label : undefined}
      aria-hidden={mounted ? undefined : true}
      tabIndex={mounted ? 0 : -1}
      title={mounted ? label : undefined}
      style={{ color: 'var(--division-text-secondary)' }}
      className={cn(BUTTON_SHAPE, 'focus-ring relative overflow-hidden', className)}
    >
      {mounted ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="inline-flex items-center justify-center"
            aria-hidden="true"
          >
            <Icon size={iconSize} strokeWidth={2} />
          </motion.span>
        </AnimatePresence>
      ) : (
        <span
          aria-hidden="true"
          style={{ width: iconSize, height: iconSize }}
        />
      )}
    </Button>
  )
}
