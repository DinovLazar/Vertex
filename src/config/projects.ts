// src/config/projects.ts
//
// The single source of truth for every client project on the site.
//
// Consumed by:
//   • /projects            — the full grid (ProjectsShowcase, no limit)
//   • /projects/[slug]      — one detail page per entry
//   • /            (home)   — the 3 most recent (ProjectsShowcase limit={3})
//   • /marketing            — the same 3 most recent
//   • /lazar                — "Selected work" (src/config/lazar.ts derives from this list)
//   • sitemap.xml, llms.txt — generated from `projects`, so nothing is ever missed
//
// ─────────────────────────────────────────────────────────────────────────
// HOW TO ADD A PROJECT (three small steps, no component changes needed):
//
//   1. Drop the screenshot into  public/projects/   — a 16:9 capture, e.g.
//      public/projects/acme.png  (2560×1440 matches the existing four).
//
//   2. Add an entry to the `projects` array below. NEWEST FIRST — the
//      homepage and the marketing page show the first three.
//
//        {
//          slug: "acme-dental",                    // becomes /projects/acme-dental
//          name: "Acme Dental",                    // proper noun, identical in EN + MK
//          division: "marketing",
//          image: "/projects/acme.png",            // null → lettered placeholder tile
//          href: "https://acmedental.com",         // null → no "Visit live site" button
//        }
//
//   3. Add the two translated strings for it to BOTH message files, under
//      `projects.items.<slug>`:
//
//        messages/en.json →  "acme-dental": { "label": "Website & SEO",
//                                             "description": "One sentence …" }
//        messages/mk.json →  "acme-dental": { "label": "Веб-страница и SEO",
//                                             "description": "Една реченица …" }
//
//      (Brand names and "SEO" stay in Latin script in Macedonian copy.)
//
// Each project's detail page renders a "case study coming soon" panel where
// the write-up will go. Filling it in is a later update — see
// `src/app/[locale]/(site)/projects/[slug]/page.tsx`, which marks the two
// slots (gallery + case-study body) with comments.
//
// A screenshot hosted on another domain (rather than in /public) would need
// that host added to `images.remotePatterns` in next.config.ts; only
// cdn.sanity.io is whitelisted today.
// ─────────────────────────────────────────────────────────────────────────

export type ProjectDivision = "consulting" | "marketing"

export interface Project {
  /**
   * URL segment for the project's own page — `/projects/<slug>`.
   * Also the key its translated copy lives under in
   * `messages/{en,mk}.json` → `projects.items.<slug>`.
   * Lowercase, hyphenated, ASCII only, and never changed once published
   * (changing it breaks the live URL and any inbound links).
   */
  slug: string
  /** Display name — a proper noun, shown identically in English and Macedonian. */
  name: string
  /** Which division delivered the work. Drives the small division tag on the card. */
  division: ProjectDivision
  /** Screenshot path under /public (e.g. "/projects/iqup.png"). null = placeholder. */
  image: string | null
  /** Live site URL (e.g. "https://iqup.vertexconsulting.mk/"). null = no live link. */
  href: string | null
  /**
   * Extra screenshots for the detail page's gallery, in display order.
   * Empty today — the gallery section renders only when this has entries,
   * so leaving it empty costs nothing. Same rules as `image`: 16:9 files
   * under public/projects/.
   */
  gallery?: string[]
}

/**
 * NEWEST FIRST. The homepage and the marketing page render `projects.slice(0, 3)`.
 */
export const projects: Project[] = [
  {
    slug: "iq-up",
    name: "IQ UP!",
    division: "marketing",
    image: "/projects/iqup.png",
    href: "https://iqup.vertexconsulting.mk/",
    gallery: [],
  },
  {
    slug: "sunset-services",
    name: "Sunset Services",
    division: "marketing",
    image: "/projects/sunset.png",
    href: "https://sunsetservices.us",
    gallery: [],
  },
  {
    slug: "dalibor-plecic",
    name: "Dalibor Plečić, Author",
    division: "marketing",
    image: "/projects/daliborac.png",
    href: "https://daliborplecic.com",
    gallery: [],
  },
  {
    // Replaced Northgate Dental in this slot on 2026-08-20. Northgate's host
    // (northgate.optimind000.com) had gone NXDOMAIN, so that card sat here
    // with no live link; Trajanov is live and takes the slot. The retired
    // /projects/northgate-dental URL 308s to /projects — see the redirects()
    // block in next.config.ts.
    slug: "trajanov",
    name: "Trajanov",
    division: "marketing",
    image: "/projects/trajanov.png",
    // The apex 308s to www and the root language-negotiates (MK by default,
    // /en for English), so link the bare domain and let the visitor's browser
    // pick. The screenshot is pinned to /en for a deterministic capture.
    href: "https://www.trajanovv.com",
    gallery: [],
  },
  {
    // Added 2026-08-20. Deliberately LAST rather than first, even though it is
    // the newest build: the live site is still the single "СТРАНИЦАТА Е ВО
    // ИЗРАБОТКА" holding page until the archive is promoted on 30 Aug 2026,
    // and leading the homepage / /marketing top-three with a coming-soon page
    // would be a downgrade. Move this entry to the top of the array once the
    // real archive ships (and re-capture the screenshot — see
    // `node scripts/capture-projects.mjs belasica`).
    slug: "fk-belasica-archive",
    name: "FK Belasica Archive",
    division: "marketing",
    image: "/projects/belasica.png",
    // MK-only site (no locale routing at all); the apex 308s to www.
    href: "https://www.belasicahistory.mk",
    gallery: [],
  },
]

/** Every project slug — used by `generateStaticParams` and the sitemap. */
export const projectSlugs: string[] = projects.map((p) => p.slug)

/** Look one up by slug. Returns undefined for an unknown slug (→ 404). */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

/**
 * The next / previous project in `projects` order, wrapping at both ends, so
 * a detail page can offer "next project" without dead-ending the visitor.
 * Returns `null` for both when there is only one project.
 */
export function getAdjacentProjects(slug: string): {
  prev: Project | null
  next: Project | null
} {
  const i = projects.findIndex((p) => p.slug === slug)
  if (i === -1 || projects.length < 2) return { prev: null, next: null }
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  }
}
