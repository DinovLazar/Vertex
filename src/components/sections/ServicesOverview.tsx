import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { StaggerContainer, StaggerItem } from '@/components/global'
import BorderGlow from '@/components/ui/BorderGlow'
import {
  Briefcase,
  Settings,
  Monitor,
  Brain,
  Globe,
  Share2,
  Server,
  Cpu,
  type LucideIcon,
} from 'lucide-react'

// Locale-neutral service metadata — the i18n keys, icon, href, and division
// live here; the title and description resolve through `home.servicesOverview.services.*`.
const SERVICE_KEYS = [
  { key: 'businessConsulting', href: '/consulting/business-consulting', icon: Briefcase, division: 'consulting' },
  { key: 'workflowRestructuring', href: '/consulting/workflow-restructuring', icon: Settings, division: 'consulting' },
  { key: 'itSystems', href: '/consulting/it-systems', icon: Monitor, division: 'consulting' },
  { key: 'aiConsulting', href: '/consulting/ai-consulting', icon: Brain, division: 'consulting' },
  { key: 'webDesign', href: '/marketing/web-design', icon: Globe, division: 'marketing' },
  { key: 'socialMedia', href: '/marketing/social-media', icon: Share2, division: 'marketing' },
  { key: 'itInfrastructure', href: '/marketing/it-infrastructure', icon: Server, division: 'marketing' },
  { key: 'aiDevelopment', href: '/marketing/ai-development', icon: Cpu, division: 'marketing' },
] as const satisfies ReadonlyArray<{
  key: string
  href: string
  icon: LucideIcon
  division: 'consulting' | 'marketing'
}>

export default async function ServicesOverview() {
  const t = await getTranslations('home.servicesOverview')

  return (
    <StaggerContainer
      amount={0.1}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {SERVICE_KEYS.map((service) => {
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
                className="group block p-6 h-full focus-ring"
              >
                {/* Division indicator dot — neutral, division is signaled by the label */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--division-text-muted)' }}
                  />
                  <span className="overline text-[var(--division-text-muted)]">
                    {t(`divisionLabels.${service.division}`)}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300 bg-white/5 group-hover:bg-white/10">
                  <Icon
                    size={20}
                    className="transition-colors duration-300 text-gray-400 group-hover:text-white"
                  />
                </div>

                {/* Content */}
                <h3 className="text-h3 text-[var(--division-text-primary)] group-hover:text-white transition-colors">
                  {t(`services.${service.key}.title`)}
                </h3>
                <p className="mt-2 text-small text-[var(--division-text-muted)]">
                  {t(`services.${service.key}.description`)}
                </p>
              </Link>
            </BorderGlow>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}
