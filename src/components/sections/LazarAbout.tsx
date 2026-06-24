import { getTranslations } from 'next-intl/server'
import { Section, AnimateIn } from '@/components/global'

export default async function LazarAbout() {
  const t = await getTranslations('lazar.about')
  const paragraphs = t.raw('paragraphs') as string[]
  const chips = t.raw('chips') as string[]

  return (
    <Section className="bg-[var(--division-surface)] border-y border-[var(--division-border)]">
      <div className="max-w-3xl">
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-4">{t('overline')}</p>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-7">{t('heading')}</h2>
          <div className="space-y-4 text-body-lg leading-relaxed text-[var(--division-text-secondary)]">
            {paragraphs.map((p, i) => (
              <p key={i} className="max-w-[660px]">{p}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-[var(--division-border)] bg-[var(--division-bg)] px-3.5 py-2 text-small text-[var(--division-text-muted)]"
              >
                {c}
              </span>
            ))}
          </div>
        </AnimateIn>
      </div>
    </Section>
  )
}
