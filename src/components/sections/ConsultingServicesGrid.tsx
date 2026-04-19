import { Link } from '@/i18n/navigation'
import { Briefcase, Settings, Monitor, Brain, ArrowRight, type LucideIcon } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/global'
import { staggerContainerSlow } from '@/lib/animations'
import BorderGlow from '@/components/ui/BorderGlow'

export interface ConsultingService {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

interface ConsultingServicesGridProps {
  services: ConsultingService[]
}

/**
 * Consulting-only services grid. 2×2 on desktop, single column on mobile.
 * Fully prop-driven — the caller supplies translated titles/descriptions
 * and chooses the icons.
 */
export default function ConsultingServicesGrid({ services }: ConsultingServicesGridProps) {
  return (
    <StaggerContainer
      variants={staggerContainerSlow}
      amount={0.15}
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      {services.map((service) => {
        const Icon = service.icon
        return (
          <StaggerItem key={service.href} className="h-full">
            <BorderGlow
              className="h-full"
              colors={['#F5F5F5', '#C9C9C9', '#A3A3A3']}
              glowColor="0 0 85"
              backgroundColor="#1C1C1C"
              borderRadius={12}
              glowRadius={40}
              glowIntensity={0.8}
              coneSpread={25}
              animated={false}
            >
              <Link
                href={service.href}
                className="group relative block h-full p-7 focus-ring"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-white/5 border border-[var(--division-border)] transition-colors duration-300 group-hover:bg-white/10">
                    <Icon
                      size={20}
                      className="text-[var(--division-text-secondary)] transition-colors duration-300 group-hover:text-[var(--division-text-primary)]"
                    />
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-[var(--division-text-muted)] transition-all duration-300 group-hover:text-[var(--division-text-primary)] group-hover:translate-x-1"
                  />
                </div>

                <h3 className="mt-6 text-h3 text-[var(--division-text-primary)]">
                  {service.title}
                </h3>
                <p className="mt-2 text-small text-[var(--division-text-secondary)]">
                  {service.description}
                </p>
              </Link>
            </BorderGlow>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}

export { Briefcase, Settings, Monitor, Brain }
