import { siteConfig } from '@/config/site'
import { routing, type Locale } from '@/i18n/routing'

/**
 * Structured-data builders (schema.org JSON-LD).
 *
 * Everything the site emits is keyed off stable `@id` anchors so Google — and
 * LLM crawlers that parse JSON-LD — can resolve one connected entity graph
 * instead of a pile of unrelated blobs:
 *
 *   {url}/#organization   the legal entity (ВЕРТЕКС КОНСАЛТИНГ ДООЕЛ)
 *   {url}/#localbusiness  the physical, visitable business in Strumica
 *   {url}/#website        the site itself
 *   {url}/#goran          Goran Dinov, the founder
 *   {url}/{locale}{path}#service   one node per service page
 *
 * Never hand-write JSON-LD in a component. Add it here so the `@id`s stay
 * consistent and a change to siteConfig propagates everywhere at once.
 */

/** Filter out placeholder social links so we never publish a dead `sameAs`. */
function sameAs(): string[] {
  return Object.values(siteConfig.social).filter(
    (url) =>
      typeof url === 'string' &&
      url.startsWith('https://') &&
      // `https://linkedin.com` is the current placeholder — drop it until a
      // real company page exists. A `sameAs` that 404s hurts entity trust.
      url !== 'https://linkedin.com',
  )
}

function langTag(locale: Locale): string {
  return locale === 'mk' ? 'mk-MK' : 'en-US'
}

function abs(locale: Locale, path: string): string {
  return `${siteConfig.url}/${locale}${path === '/' ? '' : path}`
}

// ---------------------------------------------------------------------------
// Site-wide entities
// ---------------------------------------------------------------------------

/**
 * Organization + ProfessionalService + WebSite + founder Person, emitted once
 * per page as a single `@graph`. One script tag, four linked entities.
 */
export function buildSiteGraph(locale: Locale) {
  const orgId = `${siteConfig.url}/#organization`
  const bizId = `${siteConfig.url}/#localbusiness`
  const siteId = `${siteConfig.url}/#website`
  const goranId = `${siteConfig.url}/#goran`
  const logo = `${siteConfig.url}/opengraph-image`

  const postalAddress = {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.city,
    postalCode: siteConfig.address.postalCode,
    addressRegion: siteConfig.address.city,
    addressCountry: siteConfig.address.countryCode,
  }

  const goran = {
    '@type': 'Person',
    '@id': goranId,
    name: siteConfig.owner,
    jobTitle: 'Founder & Business Consultant',
    worksFor: { '@id': orgId },
    url: `${siteConfig.url}/${locale}/about`,
    knowsLanguage: ['mk', 'en'],
    knowsAbout: [
      'Business consulting',
      'Workflow restructuring',
      'Operational efficiency',
      'AI tool integration',
      'IT systems',
    ],
  }

  const organization = {
    '@type': 'Organization',
    '@id': orgId,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    alternateName: ['Vertex', 'Vertex Marketing', 'Вертекс Консалтинг'],
    url: siteConfig.url,
    logo: { '@type': 'ImageObject', url: logo, width: 1200, height: 630 },
    image: logo,
    description: siteConfig.divisions.consulting.description,
    slogan: siteConfig.tagline,
    foundingDate: String(siteConfig.founded),
    founder: { '@id': goranId },
    address: postalAddress,
    email: siteConfig.contact.emailInfo,
    telephone: siteConfig.contact.phone,
    sameAs: sameAs(),
    areaServed: [
      { '@type': 'Country', name: 'North Macedonia' },
      { '@type': 'City', name: 'Strumica' },
    ],
    knowsAbout: [
      'Business consulting',
      'Workflow restructuring',
      'IT systems assistance',
      'AI consulting and tool integration',
      'Web design and development',
      'Social media management',
      'IT infrastructure',
      'AI-assisted development',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: siteConfig.contact.emailInfo,
        telephone: siteConfig.contact.phone,
        areaServed: 'MK',
        availableLanguage: ['Macedonian', 'English'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: siteConfig.contact.emailMarketing,
        areaServed: 'MK',
        availableLanguage: ['Macedonian', 'English'],
      },
    ],
  }

  // ProfessionalService is a LocalBusiness subtype — this is the node that
  // makes the business eligible for Google's local pack and map results.
  const localBusiness = {
    '@type': 'ProfessionalService',
    '@id': bizId,
    name: siteConfig.name,
    parentOrganization: { '@id': orgId },
    url: siteConfig.url,
    image: logo,
    description:
      'Business consulting and digital marketing agency in Strumica, North Macedonia. Two divisions: Vertex Consulting (business advisory, workflow restructuring, IT systems, AI consulting) and Vertex Marketing (web design, social media, IT infrastructure, AI-assisted development).',
    address: postalAddress,
    // No `geo` node. The coordinates previously published here were an
    // approximation of the town centre, not a surveyed position for this
    // office — publishing invented coordinates as structured data is a claim
    // we cannot stand behind. The PostalAddress is authoritative; Google
    // geocodes it, and a verified Business Profile is the correct source of a
    // map pin.
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.emailInfo,
    priceRange: '$$',
    currenciesAccepted: 'MKD, EUR',
    sameAs: sameAs(),
    areaServed: [
      { '@type': 'Country', name: 'North Macedonia' },
      { '@type': 'City', name: 'Strumica' },
    ],
    // Read from siteConfig rather than hardcoded, so the hours shown in the
    // footer and on the contact page cannot drift away from the hours we
    // publish to search engines.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [...siteConfig.openingHours.days],
        opens: siteConfig.openingHours.opens,
        closes: siteConfig.openingHours.closes,
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Vertex services',
      itemListElement: SERVICE_CATALOG.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${abs(locale, s.path)}#service`,
          name: s.name,
          url: abs(locale, s.path),
        },
      })),
    },
  }

  const website = {
    '@type': 'WebSite',
    '@id': siteId,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.tagline,
    publisher: { '@id': orgId },
    inLanguage: routing.locales.map(langTag),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, localBusiness, website, goran],
  }
}

// ---------------------------------------------------------------------------
// Service catalog — the single source of truth for schema + llms.txt
// ---------------------------------------------------------------------------

export interface ServiceEntry {
  slug: string
  division: 'consulting' | 'marketing'
  path: string
  /** English name. Localized names come from the translation files at render. */
  name: string
  /** English one-liner, used in llms.txt and as a schema fallback. */
  summary: string
  serviceType: string
}

export const SERVICE_CATALOG: ServiceEntry[] = [
  {
    slug: 'business-consulting',
    division: 'consulting',
    path: '/consulting/business-consulting',
    name: 'Business Consulting',
    summary:
      'Hands-on business advisory for Macedonian companies — diagnosing operational problems, then fixing them alongside the team rather than delivering a report.',
    serviceType: 'Business consulting',
  },
  {
    slug: 'workflow-restructuring',
    division: 'consulting',
    path: '/consulting/workflow-restructuring',
    name: 'Workflow Restructuring',
    summary:
      'Mapping how work actually moves through a business, removing the handoffs that waste time, and rebuilding the process so it holds.',
    serviceType: 'Business process improvement',
  },
  {
    slug: 'it-systems',
    division: 'consulting',
    path: '/consulting/it-systems',
    name: 'IT & Systems Assistance',
    summary:
      'Choosing, connecting and maintaining the software a company runs on — CRM, accounting, file storage, internal tooling.',
    serviceType: 'IT consulting',
  },
  {
    slug: 'ai-consulting',
    division: 'consulting',
    path: '/consulting/ai-consulting',
    name: 'AI Consulting & Tool Integration',
    summary:
      'Identifying where AI genuinely saves a business time, then integrating the tools into existing workflows and training the staff who use them.',
    serviceType: 'AI consulting',
  },
  {
    slug: 'web-design',
    division: 'marketing',
    path: '/marketing/web-design',
    name: 'Web Design & Development',
    summary:
      'Custom-built, fast, modern websites for Macedonian businesses — real builds on Next.js, not template installs.',
    serviceType: 'Web design and development',
  },
  {
    slug: 'social-media',
    division: 'marketing',
    path: '/marketing/social-media',
    name: 'Social Media Management',
    summary:
      'Content, scheduling, community management and paid social for businesses that need a consistent presence without hiring in-house.',
    serviceType: 'Social media marketing',
  },
  {
    slug: 'it-infrastructure',
    division: 'marketing',
    path: '/marketing/it-infrastructure',
    name: 'IT Infrastructure',
    summary:
      'Hosting, domains, email, DNS, backups and the operational plumbing that keeps a business online.',
    serviceType: 'IT infrastructure services',
  },
  {
    slug: 'ai-development',
    division: 'marketing',
    path: '/marketing/ai-development',
    name: 'AI-Assisted Development',
    summary:
      'Building custom software and internal tools with AI-assisted workflows — faster delivery at a price small businesses can actually reach.',
    serviceType: 'Custom software development',
  },
]

export function getServiceBySlug(slug: string): ServiceEntry | undefined {
  return SERVICE_CATALOG.find((s) => s.slug === slug)
}

// ---------------------------------------------------------------------------
// Per-page entities
// ---------------------------------------------------------------------------

/**
 * `Service` node for one service page. Provider points at the local-business
 * `@id` so the service inherits location, hours and contact details rather
 * than duplicating them.
 */
export function buildServiceSchema(args: {
  slug: string
  locale: Locale
  /** Localized service name (from the translation files). */
  name: string
  /** Localized description (the page's meta description). */
  description: string
}) {
  const entry = getServiceBySlug(args.slug)
  const path = entry?.path ?? `/${args.slug}`
  const url = abs(args.locale, path)

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: args.name,
    description: args.description,
    serviceType: entry?.serviceType ?? args.name,
    url,
    inLanguage: langTag(args.locale),
    provider: { '@id': `${siteConfig.url}/#localbusiness` },
    brand: { '@id': `${siteConfig.url}/#organization` },
    areaServed: [
      { '@type': 'Country', name: 'North Macedonia' },
      { '@type': 'City', name: 'Strumica' },
    ],
    audience: {
      '@type': 'BusinessAudience',
      name: 'Small and medium-sized businesses',
    },
  }
}

/**
 * FAQPage node for a page that carries an FAQ block.
 *
 * Previously hand-rolled inside the FAQAccordion client component, which left
 * it with no `@id` and no `url` — an unaddressable island that could not be
 * referenced from the rest of the graph — and serialised it with a raw
 * JSON.stringify that did not escape `<`. Building it here keeps every `@id`
 * in one file (see this module's docblock) and lets the server templates emit
 * it through <JsonLd>, which escapes correctly and keeps the blob out of the
 * client bundle.
 */
export function buildFaqSchema(args: {
  locale: Locale
  /** Locale-neutral path of the page the FAQ lives on. */
  path: string
  items: Array<{ question: string; answer: string }>
}) {
  const url = abs(args.locale, args.path)

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    inLanguage: langTag(args.locale),
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: { '@id': `${url}#service` },
    mainEntity: args.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/**
 * BreadcrumbList for a page. `trail` is ordered ancestor-first and excludes
 * the home item, which is prepended automatically.
 */
export function buildBreadcrumbSchema(args: {
  locale: Locale
  homeLabel: string
  trail: Array<{ name: string; path: string }>
}) {
  const items = [
    { name: args.homeLabel, path: '/' },
    ...args.trail,
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(args.locale, item.path),
    })),
  }
}

/** AboutPage / ContactPage / CollectionPage wrapper for a non-service page. */
export function buildWebPageSchema(args: {
  locale: Locale
  path: string
  type: 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'WebPage'
  name: string
  description: string
}) {
  const url = abs(args.locale, args.path)
  return {
    '@context': 'https://schema.org',
    '@type': args.type,
    '@id': `${url}#webpage`,
    url,
    name: args.name,
    description: args.description,
    inLanguage: langTag(args.locale),
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: { '@id': `${siteConfig.url}/#organization` },
  }
}
