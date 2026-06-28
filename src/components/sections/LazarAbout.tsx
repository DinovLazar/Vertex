import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { AnimateIn } from '@/components/global'

/**
 * About — brutalist re-skin. A bordered document panel (continuing the hero's
 * frame rails) holds a 12-column grid: a sticky left column with the numbered
 * section label, the oversized heading, and the grayscale portrait
 * (/public/lazar-bw.png, the existing B&W crop — color stays on the hero); a
 * right column with the lead paragraph, supporting prose, and the skill chips
 * as hard-edged bordered tags. Server component.
 */
export default async function LazarAbout() {
  const t = await getTranslations('lazar.about')
  const tHero = await getTranslations('lazar.hero')
  const paragraphs = t.raw('paragraphs') as string[]
  const chips = t.raw('chips') as string[]

  return (
    <section className="bg-[var(--division-bg)]">
      <div className="mx-auto max-w-7xl border-x-2 border-b-2 border-[var(--division-text-primary)] px-6 py-16 md:px-12 md:py-24">
        <AnimateIn>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Sticky left — label, heading, portrait */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              <span className="mb-6 inline-flex items-center gap-2 border border-[var(--division-text-primary)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--division-text-primary)]">
                <span aria-hidden="true" className="text-[var(--division-text-muted)]">01 //</span>
                {t('overline')}
              </span>
              <h2 className="mb-8 font-heading text-display font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-[var(--division-text-primary)]">
                {t('heading')}
              </h2>
              <div className="relative aspect-[5/6] w-full max-w-sm border-2 border-[var(--division-text-primary)] bg-[var(--division-surface)]">
                <Image
                  src="/lazar-bw.png"
                  alt={tHero('name')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 380px"
                  className="object-cover object-top grayscale"
                />
              </div>
            </div>

            {/* Right — prose + chips */}
            <div className="flex flex-col gap-8 lg:col-span-7">
              <p className="text-2xl font-light leading-snug text-[var(--division-text-primary)] md:text-3xl">
                {paragraphs[0]}
              </p>
              {paragraphs.slice(1).map((p, i) => (
                <p key={i} className="text-body-lg leading-relaxed text-[var(--division-text-secondary)]">
                  {p}
                </p>
              ))}
              <div className="mt-2 flex flex-wrap gap-3 border-t-2 border-[var(--division-border)] pt-8">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="border-2 border-[var(--division-text-primary)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--division-text-primary)] transition-colors hover:bg-[var(--division-text-primary)] hover:text-[var(--division-bg)]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
