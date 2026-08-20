import { projects, type Project } from "./projects"

// src/config/lazar.ts
//
// Configuration for Lazar's personal portfolio page (/lazar).
//
// ─────────────────────────────────────────────────────────────────────────
// SOCIAL LINKS — replace the three URLs below with Lazar's real profiles.
// These are personal links (distinct from the company socials in site.ts).
// ─────────────────────────────────────────────────────────────────────────
export const lazarSocials = {
  github: "https://github.com/DinovLazar",
  linkedin: "https://www.linkedin.com/in/lazar-dinov-8968423b7",
  instagram: "https://www.instagram.com/lazar.dinov/",
} as const

// Curated list of projects shown in the "Selected work" section.
//
// Derived from `src/config/projects.ts` rather than re-listing the same
// clients: the two lists had already drifted apart once (the shared list was
// missing Northgate Dental), and per-project copy now lives in one place —
// `messages/{en,mk}.json` → `projects.items.<slug>`, keyed by slug.
//
// To feature only some projects here, list their slugs in `FEATURED_SLUGS`;
// an empty array means "all of them, newest first".
export type LazarProject = Project

const FEATURED_SLUGS: string[] = []

export const lazarProjects: LazarProject[] =
  FEATURED_SLUGS.length === 0
    ? projects
    : (FEATURED_SLUGS.map((slug) =>
        projects.find((p) => p.slug === slug),
      ).filter(Boolean) as LazarProject[])
