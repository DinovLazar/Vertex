import { Link } from '@/i18n/navigation'
import { Section, AnimateIn } from '@/components/global'
import { ProcessSteps, FAQAccordion, CTABanner } from '@/components/sections'
import type {
  ContentSection,
  ProcessStep,
  FAQItem,
  RelatedServiceLink,
} from '@/types'

interface ConsultingServicePageProps {
  /** Small overline above the h1 — defaults to "Vertex Consulting" per locale. */
  overline: string
  title: string
  subtitle: string
  /** Structured body — each section is heading + paragraphs + optional bullets. */
  content: ContentSection[]

  processOverline: string
  processSectionTitle: string
  processSteps: ProcessStep[]

  faqOverline: string
  faqSectionTitle: string
  faqItems: FAQItem[]

  relatedSectionTitle: string
  relatedServices: RelatedServiceLink[]

  ctaBannerHeadline: string
  ctaBannerSubtext: string
  ctaBannerCta: string
  ctaBannerHref?: string
}

/**
 * Server-component template for consulting service pages. Renders the full
 * page tree — hero, long-form body, process, FAQ, related, and CTA — from
 * translation-driven props.
 */
export default function ConsultingServicePage({
  overline,
  title,
  subtitle,
  content,
  processOverline,
  processSectionTitle,
  processSteps,
  faqOverline,
  faqSectionTitle,
  faqItems,
  relatedSectionTitle,
  relatedServices,
  ctaBannerHeadline,
  ctaBannerSubtext,
  ctaBannerCta,
  ctaBannerHref = '/contact',
}: ConsultingServicePageProps) {
  return (
    <>
      {/* Hero area */}
      <Section className="pt-12 md:pt-20 pb-12 md:pb-16">
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-4">
            {overline}
          </p>
          <h1 className="text-h1 text-[var(--division-text-primary)] max-w-3xl">
            {title}
          </h1>
          <p className="mt-4 text-body-lg text-[var(--division-text-secondary)] max-w-2xl">
            {subtitle}
          </p>
        </AnimateIn>
      </Section>

      {/* Main content */}
      <Section className="pt-0 md:pt-0">
        <AnimateIn>
          <div className="prose-consulting max-w-3xl">
            {content.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, pIdx) => (
                  <p key={`p-${pIdx}`}>{paragraph}</p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul>
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={`b-${bIdx}`}>
                        {bullet.term ? (
                          <>
                            <strong>{bullet.term}</strong> — {bullet.description}
                          </>
                        ) : (
                          bullet.description
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {section.paragraphsAfterBullets?.map((paragraph, pIdx) => (
                  <p key={`pa-${pIdx}`}>{paragraph}</p>
                ))}
              </div>
            ))}
          </div>
        </AnimateIn>
      </Section>

      {/* Process steps */}
      <Section className="bg-[var(--division-surface)]">
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-3">
            {processOverline}
          </p>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-10">
            {processSectionTitle}
          </h2>
        </AnimateIn>
        <ProcessSteps steps={processSteps} />
      </Section>

      {/* FAQ */}
      <Section>
        <AnimateIn>
          <p className="overline text-[var(--division-text-muted)] mb-3">
            {faqOverline}
          </p>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-8">
            {faqSectionTitle}
          </h2>
        </AnimateIn>
        <FAQAccordion items={faqItems} />
      </Section>

      {/* Related services */}
      <Section className="bg-[var(--division-surface)]">
        <AnimateIn>
          <h2 className="text-h2 text-[var(--division-text-primary)] mb-6">
            {relatedSectionTitle}
          </h2>
          <div className="flex flex-wrap gap-3">
            {relatedServices.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-button border border-[var(--division-border)] font-heading text-small font-medium text-[var(--division-text-secondary)] hover:text-[var(--division-text-primary)] hover:bg-white/5 transition-colors focus-ring"
              >
                {service.title}
              </Link>
            ))}
          </div>
        </AnimateIn>
      </Section>

      {/* CTA */}
      <CTABanner
        headline={ctaBannerHeadline}
        subtext={ctaBannerSubtext}
        buttonText={ctaBannerCta}
        buttonHref={ctaBannerHref}
      />
    </>
  )
}
