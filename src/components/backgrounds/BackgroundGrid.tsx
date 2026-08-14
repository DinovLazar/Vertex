'use client'

import dynamic from 'next/dynamic'
import { useShouldAnimate } from '@/lib/useMediaQuery'

const GridMotion = dynamic(() => import('./GridMotion'), { ssr: false })

const consultingItems = [
  'Strategy', 'Operations', 'AI Tools', 'Workflow',
  'Systems', 'Growth', 'Efficiency', 'Planning',
  'Analysis', 'Structure', 'Process', 'Integration',
  'Consulting', 'Optimization', 'Management', 'Solutions',
  'Advisory', 'Development', 'Innovation', 'Technology',
  'Assessment', 'Implementation', 'Transformation', 'Results',
  'Performance', 'Automation', 'Infrastructure', 'Scaling',
]

interface BackgroundGridProps {
  items?: (string | React.ReactNode)[]
  gradientColor?: string
  className?: string
  /**
   * `"panels"` (default) renders brushed metallic silver cells — the consulting
   * hero treatment. `"text"` keeps the legacy text-label rendering.
   */
  variant?: 'text' | 'panels'
}

export default function BackgroundGrid({
  items = consultingItems,
  gradientColor = '#141414',
  className = '',
  variant = 'panels',
}: BackgroundGridProps) {
  // Reduced-motion gate. useSyncExternalStore keeps the SSR and hydration
  // renders identical (false => inert div, no shader module downloaded)
  // without the cascading re-render a useState+useEffect pair causes.
  const shouldAnimate = useShouldAnimate()


  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      style={{ backgroundColor: 'var(--division-bg)' }}
    >
      {shouldAnimate ? (
        <GridMotion items={items} gradientColor={gradientColor} variant={variant} />
      ) : (
        <div className="w-full h-full" style={{ backgroundColor: 'var(--division-bg)' }} />
      )}
    </div>
  )
}
