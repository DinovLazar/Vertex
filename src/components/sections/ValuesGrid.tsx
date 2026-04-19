import { getTranslations } from 'next-intl/server'
import { StaggerContainer, StaggerItem } from '@/components/global'
import { Handshake, Target, Zap, Shield, type LucideIcon } from 'lucide-react'

const VALUE_KEYS = [
  { key: 'directAndHonest', icon: Handshake },
  { key: 'practicalResults', icon: Target },
  { key: 'moveFast', icon: Zap },
  { key: 'longTermThinking', icon: Shield },
] as const satisfies ReadonlyArray<{ key: string; icon: LucideIcon }>

export default async function ValuesGrid() {
  const t = await getTranslations('sections.values')

  return (
    <StaggerContainer
      amount={0.1}
      className="grid grid-cols-1 sm:grid-cols-2 gap-5"
    >
      {VALUE_KEYS.map((value) => {
        const Icon = value.icon
        return (
          <StaggerItem
            key={value.key}
            className="p-6 rounded-card border border-[var(--division-border)] bg-[var(--division-card)]"
          >
            <div className="w-11 h-11 rounded-lg bg-[var(--division-accent)]/15 flex items-center justify-center mb-4">
              <Icon size={20} className="text-[var(--division-accent)]" />
            </div>
            <h3 className="text-h3 text-[var(--division-text-primary)]">
              {t(`${value.key}.title`)}
            </h3>
            <p className="mt-2 text-small text-[var(--division-text-secondary)]">
              {t(`${value.key}.description`)}
            </p>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}
