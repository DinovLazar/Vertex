'use client'

import { useState, useEffect, useId, useRef } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'motion/react'
import { Menu, X, ChevronDown, Globe } from 'lucide-react'
import { mainNavItems } from '@/config/navigation'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  // Namespace-less translator so we can resolve any fully-qualified labelKey
  // that comes off mainNavItems (e.g. `nav.dropdown.businessConsulting`).
  const tAll = useTranslations()
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const uniqueId = useId()
  const hamburgerId = `${uniqueId}-hamburger`
  const disclosureRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const wasMobileOpen = useRef(false)

  const otherLocale = locale === 'en' ? 'mk' : 'en'
  const toggleLocale = () => {
    router.replace(pathname, { locale: otherLocale })
  }

  const { scrollY } = useScroll()

  // Hide on scroll-down past 100px, show on scroll-up. The old `atTop`
  // state was used to toggle the backdrop on/off — now the backdrop is
  // always-on (`.glass-nav`), so we only need the hide-on-scroll-down.
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 100) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  // Close mobile menu + any open desktop dropdown on route change
  useEffect(() => {
    setMobileOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  // Lock body scroll + apply inert to <main>/<footer> while mobile menu is
  // open. The <header> stays interactive so the user can close via the X
  // button or tab to the logo. On close, return focus to the hamburger if
  // focus was inside the dismissed overlay.
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      const main = document.querySelector('main')
      const footer = document.querySelector('footer')
      if (main) main.inert = true
      if (footer) footer.inert = true
    } else {
      document.body.style.overflow = ''
      const main = document.querySelector('main')
      const footer = document.querySelector('footer')
      if (main) main.inert = false
      if (footer) footer.inert = false
      if (wasMobileOpen.current) {
        // Menu just closed — pull focus back to the hamburger so the user
        // doesn't end up focused on a now-inert background element.
        const hamburger = document.getElementById(hamburgerId)
        hamburger?.focus()
      }
    }
    wasMobileOpen.current = mobileOpen
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen, hamburgerId])

  // Escape closes the mobile menu
  useEffect(() => {
    if (!mobileOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const closeDropdown = (key: string) => {
    setActiveDropdown((prev) => (prev === key ? null : prev))
  }

  return (
    <>
      <motion.header
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
          // Always-on backdrop. Lightning CSS strips raw `backdrop-filter`
          // from utility-layer CSS, so we use Tailwind's `backdrop-blur-md`
          // utility (which goes through Tailwind's pipeline) alongside the
          // `.glass-nav` background/border.
          'glass-nav backdrop-blur-md'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 md:h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="font-heading font-bold text-body-lg tracking-tight focus-ring"
              style={{ color: 'var(--division-text-primary)' }}
              aria-label={`${siteConfig.name} ${tCommon('logoAriaSuffix')}`}
            >
              VERTEX
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label={t('primaryAria')}
            >
              {mainNavItems.map((item) => {
                const active = isActive(item.href)
                const hasChildren = !!item.children?.length

                if (!hasChildren) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'relative inline-flex items-center min-h-[44px] md:min-h-0 md:py-2 px-3 text-sm font-medium transition-colors focus-ring',
                        active
                          ? ''
                          : 'hover:text-[var(--division-text-primary)]'
                      )}
                      style={{
                        color: active
                          ? 'var(--division-accent)'
                          : 'var(--division-text-secondary)',
                      }}
                    >
                      {tAll(item.labelKey)}
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-3 right-3 -bottom-0.5 h-[2px]"
                          style={{ backgroundColor: 'var(--division-accent)' }}
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  )
                }

                const isOpen = activeDropdown === item.labelKey
                const menuId = `${uniqueId}-menu-${item.labelKey.replace(/\./g, '-')}`
                const label = tAll(item.labelKey)

                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.labelKey)}
                    onMouseLeave={(e) => {
                      // Don't close on mouse-leave if keyboard focus is still
                      // inside the dropdown — the user opened it via click /
                      // Enter and is tab-traversing the children.
                      if (
                        typeof document !== 'undefined' &&
                        e.currentTarget.contains(document.activeElement)
                      ) {
                        return
                      }
                      setActiveDropdown(null)
                    }}
                    onBlur={(e) => {
                      // Close when focus leaves the wrapper entirely.
                      if (
                        !e.currentTarget.contains(e.relatedTarget as Node | null)
                      ) {
                        closeDropdown(item.labelKey)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && isOpen) {
                        e.preventDefault()
                        e.stopPropagation()
                        setActiveDropdown(null)
                        disclosureRefs.current[item.labelKey]?.focus()
                      }
                    }}
                  >
                    <div className="relative flex items-center">
                      <Link
                        href={item.href}
                        className={cn(
                          'inline-flex items-center min-h-[44px] md:min-h-0 md:py-2 pl-3 pr-1 text-sm font-medium transition-colors focus-ring',
                          active
                            ? ''
                            : 'hover:text-[var(--division-text-primary)]'
                        )}
                        style={{
                          color: active
                            ? 'var(--division-accent)'
                            : 'var(--division-text-secondary)',
                        }}
                      >
                        {label}
                      </Link>
                      <button
                        type="button"
                        ref={(el) => {
                          disclosureRefs.current[item.labelKey] = el
                        }}
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                        aria-controls={menuId}
                        aria-label={t('submenuToggleAria', { label })}
                        onClick={() =>
                          setActiveDropdown(isOpen ? null : item.labelKey)
                        }
                        className={cn(
                          'inline-flex items-center justify-center min-h-[44px] md:min-h-0 md:py-2 pl-1 pr-3 text-sm font-medium transition-colors focus-ring cursor-pointer',
                          active
                            ? ''
                            : 'hover:text-[var(--division-text-primary)]'
                        )}
                        style={{
                          color: active
                            ? 'var(--division-accent)'
                            : 'var(--division-text-secondary)',
                        }}
                      >
                        <ChevronDown
                          size={14}
                          aria-hidden="true"
                          className={cn(
                            'transition-transform duration-200',
                            isOpen && 'rotate-180'
                          )}
                        />
                      </button>
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-3 right-6 -bottom-0.5 h-[2px]"
                          style={{ backgroundColor: 'var(--division-accent)' }}
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </div>

                    <AnimatePresence>
                      {isOpen && item.children && (
                        <motion.div
                          id={menuId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute top-full left-0 mt-2 w-56 py-2 rounded-lg glass"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setActiveDropdown(null)}
                              className={cn(
                                'block px-4 py-2 text-sm transition-colors hover:bg-white/5 focus-ring',
                                isActive(child.href)
                                  ? ''
                                  : 'hover:text-[var(--division-text-primary)]'
                              )}
                              style={{
                                color: isActive(child.href)
                                  ? 'var(--division-accent)'
                                  : 'var(--division-text-secondary)',
                              }}
                            >
                              {tAll(child.labelKey)}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </nav>

            {/* Right: lang + CTA + hamburger */}
            <div className="flex items-center gap-2">
              {/* Language toggle (desktop) */}
              <Button
                type="button"
                variant="ghost"
                onClick={toggleLocale}
                className="hidden md:inline-flex items-center min-h-[44px] gap-1.5 h-auto px-3 py-1.5 rounded-full text-sm font-medium hover:bg-white/5"
                style={{ color: 'var(--division-text-secondary)' }}
                aria-label={t('languageToggleAria')}
              >
                <Globe size={14} aria-hidden="true" />
                <span className="uppercase">{otherLocale}</span>
              </Button>

              {/* CTA (desktop) */}
              <Link
                href="/contact"
                className="hidden md:inline-flex items-center px-4 py-2 min-h-[44px] rounded-button text-sm font-heading font-medium transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-ring"
                style={{
                  backgroundColor: 'var(--division-accent)',
                  color: 'var(--division-bg)',
                }}
              >
                {t('cta')}
              </Link>

              {/* Hamburger (mobile) */}
              <Button
                type="button"
                id={hamburgerId}
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden h-11 w-11 relative z-50 hover:bg-white/5"
                style={{ color: 'var(--division-text-primary)' }}
                aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
                aria-expanded={mobileOpen}
                aria-controls={`${uniqueId}-mobile-menu`}
              >
                {mobileOpen ? (
                  <X size={24} aria-hidden="true" />
                ) : (
                  <Menu size={24} aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id={`${uniqueId}-mobile-menu`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ backgroundColor: 'var(--division-bg)' }}
          >
            <div className="flex flex-col items-center gap-5 h-full overflow-y-auto pt-24 pb-10 px-6">
              {mainNavItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'inline-flex items-center min-h-[44px] px-2 font-heading text-2xl font-semibold transition-colors focus-ring'
                    )}
                    style={{
                      color: isActive(item.href)
                        ? 'var(--division-accent)'
                        : 'var(--division-text-primary)',
                    }}
                  >
                    {tAll(item.labelKey)}
                  </Link>
                  {item.children && (
                    <div className="mt-3 flex flex-col items-center gap-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="inline-flex items-center min-h-[44px] px-2 text-sm transition-colors focus-ring"
                          style={{
                            color: isActive(child.href)
                              ? 'var(--division-accent)'
                              : 'var(--division-text-secondary)',
                          }}
                        >
                          {tAll(child.labelKey)}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  delay: mainNavItems.length * 0.08,
                  duration: 0.3,
                }}
              >
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 inline-flex items-center min-h-[44px] px-6 py-3 rounded-button font-heading font-medium text-base transition-colors focus-ring"
                  style={{
                    backgroundColor: 'var(--division-accent)',
                    color: 'var(--division-bg)',
                  }}
                >
                  {t('cta')}
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: (mainNavItems.length + 1) * 0.08 }}
                className="mt-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setMobileOpen(false)
                    toggleLocale()
                  }}
                  className="inline-flex items-center min-h-[44px] gap-1.5 h-auto px-3 py-2 text-sm hover:bg-white/5"
                  style={{ color: 'var(--division-text-muted)' }}
                  aria-label={t('languageToggleAria')}
                >
                  <Globe size={14} aria-hidden="true" />
                  <span className="uppercase">{otherLocale}</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
