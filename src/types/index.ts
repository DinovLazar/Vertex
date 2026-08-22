/**
 * Shared content types used by translated page templates.
 *
 * `ContentSection` is how a long-form service-page body (consulting and
 * marketing) is stored in the translation files — a flat array the template
 * can map over to render headings, paragraphs, and bullet lists without any
 * inline JSX.
 *
 * A bullet can be a plain description, or a `term + description` pair that
 * renders as **term** — description. The latter is what the AI Consulting
 * page uses for its categorized list.
 */

export type Bullet = {
  /** Optional bold lead-in rendered as `<strong>` before the description. */
  term?: string
  description: string
}

export type ContentSection = {
  heading: string
  paragraphs: string[]
  bullets?: Bullet[]
  /** Paragraphs rendered after the bullet list, still inside the same section. */
  paragraphsAfterBullets?: string[]
}

/**
 * A project case study, stored per locale under
 * `projects.items.<slug>.caseStudy` in `messages/{en,mk}.json` and read with
 * `t.raw()` on `/projects/[slug]`.
 *
 * Reuses `ContentSection` so the write-up renders through the same
 * heading + paragraphs shape the service pages already use. `statusNote` is
 * a short line shown above the first section for a project whose write-up is
 * knowingly incomplete (today: the FK Belasica archive, which opens
 * 30 August 2026).
 *
 * The field is optional on a project: a project with no `caseStudy` key falls
 * back to the "coming soon" panel on its detail page.
 */
export type ProjectCaseStudy = {
  statusNote?: string
  sections: ContentSection[]
}

export type ProcessStep = {
  title: string
  description: string
}

export type FAQItem = {
  question: string
  answer: string
}

export type RelatedServiceLink = {
  title: string
  href: string
}

/** @deprecated Use the canonical NavItem from `@/config/navigation`. */
export type NavItem = {
  label: string
  href: string
}
