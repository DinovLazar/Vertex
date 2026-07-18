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
// Screenshots + live URLs reuse the real assets already wired in
// src/config/projects.ts. Per-project label + description are translated
// in messages/*.json under `lazar.work.projects.{index}`.
export interface LazarProject {
  name: string
  image: string | null
  href: string | null
}

export const lazarProjects: LazarProject[] = [
  { name: "Northgate Dental", image: "/projects/northgate.png", href: "https://northgate.optimind000.com/en" },
  { name: "Sunset Services", image: "/projects/sunset.png", href: "https://sunsetservices.us" },
  { name: "Dalibor Plečić — Author", image: "/projects/daliborac.png", href: "https://daliborplecic.com" },
  { name: "IQ UP!", image: "/projects/iqup.png", href: "https://iqup.vertexconsulting.mk/" },
]
