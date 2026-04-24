'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'motion/react'
import { Mail, ArrowUp, MapPin, Phone } from 'lucide-react'
import { footerNavItems } from '@/config/navigation'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'

// Brand icons — inline SVG because lucide-react 1.8.0 does not ship brand
// marks. Written to match the lucide API (size prop, currentColor) so they
// are drop-in compatible with the rest of the icons in this file.
type BrandIconProps = { size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }

function LinkedinIcon({ size = 24, className, ...rest }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function InstagramIcon({ size = 24, className, ...rest }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ size = 24, className, ...rest }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const fullAddress = `${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.country}`

export default function Footer() {
  const t = useTranslations('footer')
  const tCommon = useTranslations('common')
  // Namespace-less translator so footerNavItems' fully-qualified labelKeys
  // (nav.dropdown.* and footer.company.*) can resolve in one place.
  const tAll = useTranslations()
  const year = new Date().getFullYear()
  const uniqueId = useId()
  const newsletterEmailId = `${uniqueId}-newsletter-email`
  const newsletterErrorId = `${uniqueId}-newsletter-error`
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterHoneypot, setNewsletterHoneypot] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [newsletterError, setNewsletterError] = useState('')

  const socialLinks = [
    { labelKey: 'social.linkedin', href: siteConfig.social.linkedin, icon: LinkedinIcon },
    { labelKey: 'social.instagram', href: siteConfig.social.instagram, icon: InstagramIcon },
    { labelKey: 'social.facebook', href: siteConfig.social.facebook, icon: FacebookIcon },
    { labelKey: 'social.email', href: `mailto:${siteConfig.contact.emailInfo}`, icon: Mail },
  ] as const

  const handleBackToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterStatus === 'submitting') return

    const email = newsletterEmail.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterError(t('newsletter.errorInvalidEmail'))
      setNewsletterStatus('error')
      return
    }

    setNewsletterStatus('submitting')
    setNewsletterError('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: newsletterHoneypot }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || t('newsletter.errorGeneric'))
      }
      setNewsletterStatus('success')
      setNewsletterEmail('')
    } catch (err) {
      setNewsletterStatus('error')
      setNewsletterError(
        err instanceof Error ? err.message : t('newsletter.errorGeneric')
      )
    }
  }

  return (
    <footer
      role="contentinfo"
      className="relative mt-auto"
      style={{ backgroundColor: 'var(--division-surface)' }}
    >
      {/* Hairline separator at the very top — uses the division-border token
          so it inverts cleanly in light mode. */}
      <div
        aria-hidden="true"
        className="h-px w-full"
        style={{ backgroundColor: 'var(--division-border)' }}
      />

      {/* Newsletter / CTA strip */}
      <div className="border-b border-[var(--division-border)] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-h3 text-[var(--division-text-primary)]">
              {t('newsletter.headline')}
            </h3>
            <p className="mt-1 text-small text-[var(--division-text-secondary)]">
              {t('newsletter.subtext')}
            </p>
          </div>
          <form
            onSubmit={handleNewsletterSubmit}
            aria-label={t('newsletter.ariaLabel')}
            className="flex w-full md:w-auto flex-col gap-2"
          >
            {newsletterStatus === 'success' ? (
              <p className="text-small text-[var(--division-accent)] font-medium md:w-64">
                {t('newsletter.success')}
              </p>
            ) : (
              <>
                <div className="flex w-full gap-3">
                  {/* Honeypot */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                    <label htmlFor="newsletter-website">{t('newsletter.honeypotLabel')}</label>
                    <input
                      type="text"
                      id="newsletter-website"
                      name="website"
                      value={newsletterHoneypot}
                      onChange={(e) => setNewsletterHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <input
                    type="email"
                    id={newsletterEmailId}
                    required
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value)
                      if (newsletterStatus === 'error') {
                        setNewsletterStatus('idle')
                        setNewsletterError('')
                      }
                    }}
                    placeholder={t('newsletter.placeholder')}
                    disabled={newsletterStatus === 'submitting'}
                    aria-invalid={newsletterStatus === 'error'}
                    aria-describedby={
                      newsletterStatus === 'error' && newsletterError
                        ? newsletterErrorId
                        : undefined
                    }
                    className="flex-1 md:w-64 px-4 py-2.5 rounded-button text-small bg-[var(--division-bg)] border border-[var(--division-border)] text-[var(--division-text-primary)] placeholder:text-[var(--division-text-muted)] form-input-focus disabled:opacity-60"
                    aria-label={t('newsletter.emailAriaLabel')}
                  />
                  <Button
                    type="submit"
                    disabled={newsletterStatus === 'submitting'}
                    aria-busy={newsletterStatus === 'submitting'}
                    className="h-auto px-5 py-2.5 rounded-button text-small font-heading font-medium hover:brightness-110"
                    style={{
                      backgroundColor: 'var(--division-accent)',
                      color: 'var(--division-bg)',
                    }}
                  >
                    {newsletterStatus === 'submitting' ? t('newsletter.submitting') : t('newsletter.submit')}
                  </Button>
                </div>
                {newsletterStatus === 'error' && newsletterError && (
                  <p
                    id={newsletterErrorId}
                    role="alert"
                    className="text-micro text-red-400"
                  >
                    {newsletterError}
                  </p>
                )}
              </>
            )}
          </form>
        </div>
      </div>

      {/* Main footer content — 4-column grid */}
      <motion.div
        variants={footerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-16"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">
          {/* Column 1: Logo, tagline, contact info */}
          <motion.div
            variants={columnVariants}
            className="sm:col-span-2 lg:col-span-1"
          >
            <Link
              href="/"
              className="inline-block focus-ring"
              aria-label={`${siteConfig.name} ${tCommon('logoAriaSuffix')}`}
            >
              <span className="font-heading text-2xl sm:text-h3 font-bold tracking-tight text-[var(--division-text-primary)]">
                VERTEX
              </span>
            </Link>
            <p className="mt-2 text-small text-[var(--division-text-secondary)] max-w-xs">
              {tCommon('tagline')}
            </p>

            <div className="mt-6 mb-4 sm:mb-0 space-y-3">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-small text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] transition-colors focus-ring"
              >
                <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{fullAddress}</span>
              </a>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2.5 text-small text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] transition-colors focus-ring"
              >
                <Phone size={14} className="shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{siteConfig.contact.phone}</span>
              </a>
              <a
                href={`mailto:${siteConfig.contact.emailInfo}`}
                className="flex items-center gap-2.5 text-small text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] transition-colors focus-ring"
              >
                <Mail size={14} className="shrink-0" aria-hidden="true" />
                <span>{siteConfig.contact.emailInfo}</span>
              </a>
            </div>
          </motion.div>

          {/* Column 2: Consulting services */}
          <motion.div variants={columnVariants}>
            <h4 className="overline text-[var(--division-text-primary)]">
              {t('columns.consulting')}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerNavItems.consulting.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center min-h-[44px] md:min-h-0 text-small text-[var(--division-text-muted)] hover:text-[var(--division-accent)] transition-colors focus-ring"
                  >
                    {tAll(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Marketing services */}
          <motion.div variants={columnVariants}>
            <h4 className="overline text-[var(--division-text-primary)]">
              {t('columns.marketing')}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerNavItems.marketing.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center min-h-[44px] md:min-h-0 text-small text-[var(--division-text-muted)] hover:text-[var(--division-accent)] transition-colors focus-ring"
                  >
                    {tAll(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Company links */}
          <motion.div variants={columnVariants}>
            <h4 className="overline text-[var(--division-text-primary)]">
              {t('columns.company')}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerNavItems.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center min-h-[44px] md:min-h-0 text-small text-[var(--division-text-muted)] hover:text-[var(--division-accent)] transition-colors focus-ring"
                  >
                    {tAll(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom bar: social + copyright + back to top */}
      <div className="border-t border-[var(--division-border)]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const isMailto = social.href.startsWith('mailto')
              const Icon = social.icon
              const label = t(social.labelKey)
              return (
                <a
                  key={social.labelKey}
                  href={social.href}
                  target={isMailto ? undefined : '_blank'}
                  rel={isMailto ? undefined : 'noopener noreferrer'}
                  aria-label={label}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-3 rounded-full text-[var(--division-text-muted)] hover:text-[var(--division-accent)] hover:bg-[var(--nav-hover-bg)] transition-colors focus-ring"
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              )
            })}
          </div>

          {/* Copyright */}
          <p className="text-micro text-[var(--division-text-muted)]">
            {t('copyright', { year })}
          </p>

          {/* Back to top */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleBackToTop}
            className="min-h-[44px] h-auto py-2 px-3 gap-1.5 text-micro text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] hover:bg-transparent"
            aria-label={t('backToTop')}
          >
            <span>{t('backToTop')}</span>
            <ArrowUp size={12} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </footer>
  )
}
