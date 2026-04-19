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
