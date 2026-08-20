import { getTranslations } from 'next-intl/server'
import { AnimateIn } from '@/components/global'
import { Link } from '@/i18n/navigation'
import MagneticButton from '@/components/ui/MagneticButton'
import { lazarSocials } from '@/config/lazar'
import { siteConfig } from '@/config/site'

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.1-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.3 18.3v-7H6v7h2.3zM7.1 9.9a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM18 18.3v-3.8c0-2-.4-3.6-2.8-3.6-1.1 0-1.9.6-2.2 1.2h-.03v-1H10.8v7h2.3v-3.5c0-.9.2-1.8 1.3-1.8s1.3 1 1.3 1.9v3.4H18z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" />
    </svg>
  )
}

/**
 * Contact — brutalist re-skin. The band INVERTS the page: background takes
 * `--division-text-primary` and content takes `--division-bg`, so in dark mode
 * it reads as a stark white block with black type (matching the approved Stitch
 * design) and in light mode as the clean inverse — a black block with white
 * type. Full-bleed (it breaks out of the bordered document frame above it) and
 * centered: numbered label, oversized headline, square CTA → /contact, the
 * marketing-email mailto, and the three personal socials. Server component.
 */
export default async function LazarContact() {
  const t = await getTranslations('lazar.contact')
  const email = siteConfig.contact.emailMarketing

  const socials = [
    { href: lazarSocials.github, label: t('social.github'), icon: <GithubIcon /> },
    { href: lazarSocials.linkedin, label: t('social.linkedin'), icon: <LinkedinIcon /> },
    { href: lazarSocials.instagram, label: t('social.instagram'), icon: <InstagramIcon /> },
  ]

  return (
    // `[--focus-ring-color:...]` re-points the ring for the whole inverted
    // subtree. `.focus-ring` otherwise draws in --division-accent, which on
    // this band is exactly the background color — a 1:1 ring, i.e. no visible
    // keyboard focus on the CTA or any of the three social buttons.
    <section
      id="contact"
      className="w-full bg-[var(--division-text-primary)] text-[var(--division-bg)] [--focus-ring-color:var(--division-bg)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
        <AnimateIn>
          <span className="mb-10 inline-flex items-center gap-2 border-2 border-[var(--division-bg)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--division-bg)]">
            <span aria-hidden="true" className="opacity-60">04 //</span>
            {t('overline')}
          </span>
          <h2 className="mx-auto max-w-4xl font-heading text-display-lg font-extrabold uppercase leading-[0.9] tracking-[-0.02em] text-[var(--division-bg)]">
            {t('heading')}
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-body-lg text-[var(--division-bg)] opacity-80">
            {t('subtext')}
          </p>
          <div className="mt-10 flex flex-col items-center gap-7">
            <MagneticButton>
              <Link
                href="/contact"
                className="focus-ring cta-sheen inline-flex min-h-[44px] items-center justify-center rounded-none border-2 border-[var(--division-bg)] bg-[var(--division-bg)] px-10 py-4 font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--division-text-primary)] transition-colors hover:bg-transparent hover:text-[var(--division-bg)]"
              >
                {t('cta')}
              </Link>
            </MagneticButton>
            <a
              href={`mailto:${email}`}
              /* NOT `.footer-link`: that class is declared unlayered precisely
                 so it seizes `color` from Tailwind utilities, so it overrode the
                 --division-bg intended here and left 2.6:1 text on this inverted
                 band (in both themes). The underline below reproduces its look
                 with currentColor instead. */
              className="focus-ring inline-flex min-h-[24px] items-center font-mono text-small uppercase tracking-[0.12em] text-[var(--division-bg)] underline decoration-1 underline-offset-4 opacity-80 transition-opacity hover:opacity-100"
            >
              {email}
            </a>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="focus-ring flex h-11 w-11 items-center justify-center rounded-none border-2 border-[var(--division-bg)] text-[var(--division-bg)] transition-colors hover:bg-[var(--division-bg)] hover:text-[var(--division-text-primary)]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
