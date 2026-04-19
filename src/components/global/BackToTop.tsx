'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { springPop } from '@/lib/animations'
import { Button } from '@/components/ui/button'

export default function BackToTop() {
  const t = useTranslations('sections.backToTop')
  const [visible, setVisible] = useState(false)
  const { scrollY } = useScroll()

  // Show once past 500px, BUT hide again when within 200px of the document
  // bottom so the FAB doesn't cover the footer subscribe form or columns.
  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (typeof window === 'undefined') return
    const viewportH = window.innerHeight
    const docH = document.documentElement.scrollHeight
    const nearBottom = latest + viewportH > docH - 200
    setVisible(latest > 500 && !nearBottom)
  })

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={springPop}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          // z-40 sits above body content (z-auto) but below the navbar (z-50).
          // Bottom offset: generous on mobile (content crowded near bottom),
          // tighter on desktop (more viewport room).
          className="fixed bottom-24 md:bottom-6 right-6 z-40"
        >
          <Button
            size="icon"
            onClick={scrollToTop}
            className="h-11 w-11 rounded-full glass cursor-pointer"
            style={{
              backgroundColor: 'var(--division-accent-muted)',
              color: 'var(--division-accent)',
            }}
            aria-label={t('ariaLabel')}
          >
            <ArrowUp size={18} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
