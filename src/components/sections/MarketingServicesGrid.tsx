import { Link } from '@/i18n/navigation'
import { Globe, Share2, Server, Cpu, type LucideIcon } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/global'
import { staggerContainerFast } from '@/lib/animations'
import BorderGlow from '@/components/ui/BorderGlow'

export interface MarketingService {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

interface MarketingServicesGridProps {
  services: MarketingService[]
}

/**
 * Marketing-only services grid. 2×2 on desktop, single column on mobile.
 * Fully prop-driven — the caller supplies translated titles/descriptions
 * and chooses the icons.
 */
export default function MarketingServicesGrid({ services }: MarketingServicesGridProps) {
  return (
    <StaggerContainer
      variants={staggerContainerFast}
      amount={0.2}
      className="grid grid-cols-1 sm:grid-cols-2 gap-5"
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
                className="group block relative p-7 h-full focus-ring"
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 group-hover:bg-white/10 transition-colors duration-300">
                    <Icon size={20} className="text-[var(--division-text-secondary)] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-h3 text-[var(--division-text-primary)] group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-small text-[var(--division-text-muted)]">
                    {service.description}
                  </p>
                </div>
              </Link>
            </BorderGlow>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}

export { Globe, Share2, Server, Cpu }
