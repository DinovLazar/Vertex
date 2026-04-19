import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  fullWidth?: boolean
}

/**
 * Standard page section with consistent padding and max-width.
 *
 * Usage:
 * <Section>
 *   <h2>Section title</h2>
 *   <p>Section content</p>
 * </Section>
 */
export default function Section({
  children,
  className,
  id,
  fullWidth = false,
}: SectionProps) {
  return (
    <section id={id} className={cn('py-20 md:py-28', className)}>
      <div className={cn(fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8')}>
        {children}
      </div>
    </section>
  )
}
