export const siteConfig = {
  name: "Vertex Consulting",
  legalName: "ВЕРТЕКС КОНСАЛТИНГ ДООЕЛ",
  tagline: "We help businesses grow smarter.",
  /**
   * Display form of the domain — brand copy, never a host for programmatic
   * use. Anything that needs a real hostname derives it from `url` below
   * (see `src/lib/indexnow.ts`), so the two can't drift apart.
   */
  domain: "vertexconsulting.mk",
  /**
   * The canonical base URL. Everything self-referential is built from it:
   * `metadataBase`, canonical + hreflang alternates, sitemap.xml, robots.txt,
   * every JSON-LD `@id` anchor, and both llms.txt routes. No trailing slash.
   *
   * `www`, not the apex: Vercel serves the site on www.vertexconsulting.mk and
   * 308-redirects the apex to it. While this said `https://vertexconsulting.mk`
   * every canonical tag, hreflang alternate and sitemap entry pointed at a URL
   * that immediately redirects — a self-referencing canonical that isn't
   * actually the delivered page. Search engines resolve that, but it wastes
   * the signal. If the apex is ever made the serving host instead, change it
   * back here and nowhere else.
   */
  url: "https://www.vertexconsulting.mk",
  // External client-portal login (separate app on its own subdomain).
  portalUrl: "https://portal.vertexconsulting.mk/login",
  owner: "Goran Dinov",
  founded: 2018,
  address: {
    street: "Str. Mladinska 43",
    city: "Strumica",
    postalCode: "2400",
    // The country's formal name. It was "Macedonia" until 2026-08-14; the
    // state has been North Macedonia since 2019 and the schema.org
    // PostalAddress, the privacy policy and the visible footer must agree.
    country: "North Macedonia",
    /** ISO 3166-1 alpha-2, for schema.org `addressCountry`. */
    countryCode: "MK",
  },
  contact: {
    /** Display form — spaced for legibility. Never use this in an href. */
    phone: "+389 70 214 033",
    /**
     * Dial-safe form. A `tel:` URI must not contain spaces, so every
     * tap-to-call link reads this rather than re-deriving it: the Contact page
     * previously emitted `tel:+389 70 214 033` verbatim, which is invalid.
     */
    phoneHref: "tel:+38970214033",
    emailInfo: "info@vertexconsulting.mk",
    emailMarketing: "marketing@vertexconsulting.mk",
  },
  /**
   * Prose form, consumed by llms.txt, llms-full.txt and the chat system
   * prompt. Kept in sync with `openingHours` below by hand — that structured
   * form is the one the schema and the visible UI both read, so the two can
   * never silently disagree about the actual times.
   */
  hours: "Monday to Friday, 09:00 to 17:00",
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
    timeZone: "Europe/Skopje",
  },
  social: {
    linkedin: "https://linkedin.com",
    instagram: "https://www.instagram.com/vertxsystems.mk",
    facebook: "https://www.facebook.com/share/1CEaD21Asq/",
  },
  divisions: {
    consulting: {
      name: "Vertex Consulting",
      manager: "Goran Dinov",
      team: ["Goran Dinov"],
      description:
        "Business consulting, workflow restructuring, IT & systems assistance, AI consulting & tool integration.",
    },
    marketing: {
      name: "Vertex Marketing",
      manager: "Goran Dinov (oversight)",
      team: ["Lazar", "Petar", "Andrej"],
      description:
        "Website design & development, social media management, IT infrastructure, AI-assisted development.",
    },
  },
} as const
