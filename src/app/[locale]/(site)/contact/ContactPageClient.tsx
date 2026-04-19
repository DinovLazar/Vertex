'use client'

import { useTranslations } from 'next-intl'
import { Section, AnimateIn } from '@/components/global'
import { ContactForm } from '@/components/sections'
import { siteConfig } from '@/config/site'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPageClient() {
  const t = useTranslations('contact')

  // Flatten the address object into a single string
  const addressString = `${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.country}`
  const email = siteConfig.contact.emailInfo
  const phone = siteConfig.contact.phone

  return (
    <>
      {/* Header. `md:pb-0` actually zeroes desktop bottom so the form
          section below flows with normal spacing instead of a ~100px gap. */}
      <Section className="pt-16 md:pt-24 pb-0 md:pb-0">
        <AnimateIn>
          <p className="overline text-[var(--division-accent)] mb-4">
            {t('hero.overline')}
          </p>
          <h1 className="text-h1 text-[var(--division-text-primary)] max-w-3xl">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 text-body-lg text-[var(--division-text-secondary)] max-w-2xl">
            {t('hero.subtitle')}
          </p>
        </AnimateIn>
      </Section>

      {/* Form + Info side-by-side */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimateIn>
              <h2 className="text-h3 text-[var(--division-text-primary)] mb-6">
                {t('form.sectionTitle')}
              </h2>
            </AnimateIn>
            <AnimateIn delay={0.1}>
              <ContactForm />
            </AnimateIn>
          </div>

          {/* Contact details */}
          <div className="lg:col-span-2">
            <AnimateIn delay={0.15}>
              <h2 className="text-h3 text-[var(--division-text-primary)] mb-6">
                {t('info.sectionTitle')}
              </h2>

              <div className="space-y-5">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(addressString)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-small text-[var(--division-text-secondary)] hover:text-[var(--division-text-primary)] transition-colors"
                >
                  <MapPin size={18} className="mt-0.5 shrink-0 text-[var(--division-accent)]" />
                  <div>
                    <p className="font-heading font-semibold text-[var(--division-text-primary)] mb-0.5">{t('info.officeLabel')}</p>
                    <span>{addressString}</span>
                  </div>
                </a>

                <a
                  href={`tel:${phone}`}
                  className="flex items-start gap-3 text-small text-[var(--division-text-secondary)] hover:text-[var(--division-text-primary)] transition-colors"
                >
                  <Phone size={18} className="mt-0.5 shrink-0 text-[var(--division-accent)]" />
                  <div>
                    <p className="font-heading font-semibold text-[var(--division-text-primary)] mb-0.5">{t('info.phoneLabel')}</p>
                    <span className="tabular-nums">{phone}</span>
                  </div>
                </a>

                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-3 text-small text-[var(--division-text-secondary)] hover:text-[var(--division-text-primary)] transition-colors"
                >
                  <Mail size={18} className="mt-0.5 shrink-0 text-[var(--division-accent)]" />
                  <div>
                    <p className="font-heading font-semibold text-[var(--division-text-primary)] mb-0.5">{t('info.emailLabel')}</p>
                    <span>{email}</span>
                  </div>
                </a>

                <div className="flex items-start gap-3 text-small text-[var(--division-text-secondary)]">
                  <Clock size={18} className="mt-0.5 shrink-0 text-[var(--division-accent)]" />
                  <div>
                    <p className="font-heading font-semibold text-[var(--division-text-primary)] mb-0.5">{t('info.hoursLabel')}</p>
                    <span className="tabular-nums">{t('info.hoursValue')}</span>
                  </div>
                </div>
              </div>

              {/* Division emails */}
              <div className="mt-8 pt-6 border-t border-[var(--division-border)]">
                <p className="overline text-[var(--division-text-muted)] mb-4">
                  {t('info.divisionContactOverline')}
                </p>
                <div className="space-y-3 text-small">
                  <div>
                    <p className="font-heading font-semibold text-[var(--division-text-primary)]">{t('info.consultingLabel')}</p>
                    <a
                      href={`mailto:${siteConfig.contact.emailInfo}`}
                      className="text-[var(--division-text-secondary)] hover:text-[var(--division-accent)] transition-colors"
                    >
                      {siteConfig.contact.emailInfo}
                    </a>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-[var(--division-text-primary)]">{t('info.marketingLabel')}</p>
                    <a
                      href={`mailto:${siteConfig.contact.emailMarketing}`}
                      className="text-[var(--division-text-secondary)] hover:text-[var(--division-accent)] transition-colors"
                    >
                      {siteConfig.contact.emailMarketing}
                    </a>
                  </div>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </Section>

      {/* Map. `md:pt-0` so the map flows tight under the form above. */}
      <Section className="pt-0 md:pt-0">
        <AnimateIn>
          <div className="rounded-card overflow-hidden border border-[var(--division-border)]">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(addressString)}&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0, filter: 'grayscale(30%) invert(92%) contrast(83%) hue-rotate(180deg)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('map.iframeTitle')}
            />
          </div>
        </AnimateIn>
      </Section>
    </>
  )
}
