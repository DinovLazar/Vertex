// src/config/projects.ts
//
// Client projects shown in the "Our Work" section on the homepage.
//
// ─────────────────────────────────────────────────────────────────────────
// HOW TO PUBLISH A SCREENSHOT + LINK LATER (no coding needed):
//
//   1. Drop the screenshot image into the folder:  public/projects/
//      e.g.  public/projects/northgate-dental.jpg
//
//   2. In the matching entry below, set:
//        image: '/projects/northgate-dental.jpg'   // the path you just added
//        href:  'https://northgatedental.com'       // the live site URL
//
//   3. Leaving `image` or `href` as `null` shows a placeholder / "Coming soon".
//
// (If you ever use a screenshot hosted on another website instead of a local
//  file, that needs a one-line tweak in next.config.ts — ask in the chat.)
// ─────────────────────────────────────────────────────────────────────────

export type ProjectDivision = "consulting" | "marketing";

export interface Project {
  /** Display name — a proper noun, shown identically in English and Macedonian. */
  name: string;
  /** Which division delivered the work. Drives the small division tag on the card. */
  division: ProjectDivision;
  /** Screenshot path under /public (e.g. "/projects/optimind.jpg"). null = placeholder. */
  image: string | null;
  /** Live site URL (e.g. "https://optimind.example"). null = "Coming soon", not clickable. */
  href: string | null;
}

export const projects: Project[] = [
  { name: "Northgate Dental", division: "marketing", image: "/projects/northgate.png", href: "https://northgate.optimind000.com/en" },
  { name: "Sunset Services", division: "marketing", image: "/projects/sunset.png", href: "https://sunsetservices.vercel.app/" },
  { name: "Dalibor Plečić — Author", division: "marketing", image: "/projects/daliborac.png", href: "https://daliborac.vertexconsulting.mk/mk" },
];
