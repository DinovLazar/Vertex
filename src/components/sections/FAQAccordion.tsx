'use client'

import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

/**
 * Expandable FAQ list. Only one item is open at a time.
 *
 * Presentation only. The FAQPage JSON-LD that used to be emitted from here now
 * comes from `buildFaqSchema` in `src/lib/schema.ts`, rendered by the server
 * templates through <JsonLd>. That gives the node a real `@id`, escapes `<`
 * properly, and keeps the structured data out of the client bundle.
 */
export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const uniqueId = useId()

  return (
    <>
      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index
          const triggerId = `${uniqueId}-trigger-${index}`
          const panelId = `${uniqueId}-panel-${index}`
          return (
            <div
              key={item.question}
              className={cn(
                'rounded-card border border-[var(--division-border)] bg-[var(--division-card)] overflow-hidden elevation-1',
                'transition-colors',
                isOpen && 'border-[var(--division-text-muted)]'
              )}
            >
              <Button
                type="button"
                id={triggerId}
                variant="ghost"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full h-auto justify-between whitespace-normal gap-4 px-6 py-5 rounded-none font-heading text-body font-semibold text-left text-[var(--division-text-primary)] hover:bg-[var(--nav-hover-bg)] [&>span]:flex-1 [&_svg]:size-[18px]"
              >
                <span>{item.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-shrink-0 text-[var(--division-text-muted)]"
                  aria-hidden="true"
                >
                  <ChevronDown size={18} aria-hidden="true" />
                </motion.span>
              </Button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
                aria-hidden={!isOpen}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 text-small text-[var(--division-text-secondary)]">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
