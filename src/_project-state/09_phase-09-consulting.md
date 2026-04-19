# Phase 9 — Consulting Division Pages

## What was built
Complete Consulting division: landing page with GridMotion background and 4 individual service pages. Created 5 new reusable section components (`ProcessSteps`, `FAQAccordion`, `ConsultingServicesGrid`, `LeaderIntro`, `ConsultingServicePage` template). All service pages include 800+ words of draft content, process steps, FAQ with FAQPage JSON-LD schema, related services cross-links, and CTA banners.

## Files created
| File | Purpose |
|------|---------|
| `src/components/sections/ProcessSteps.tsx` | Reusable numbered timeline/steps component with scroll-in stagger |
| `src/components/sections/FAQAccordion.tsx` | Expandable FAQ — one item open at a time — with inline FAQPage JSON-LD `<script>` |
| `src/components/sections/ConsultingServicesGrid.tsx` | 4-card consulting-only services grid, 2×2 on desktop |
| `src/components/sections/LeaderIntro.tsx` | Founder/leader introduction with initials avatar + bio |
| `src/components/sections/ConsultingServicePage.tsx` | Template that composes hero, prose, process, FAQ, related, CTA for consulting service pages |
| `src/app/(site)/consulting/ConsultingLandingClient.tsx` | Client component for consulting landing (UI + `"use client"`) |
| `src/app/(site)/consulting/business-consulting/page.tsx` | Business consulting service page |
| `src/app/(site)/consulting/workflow-restructuring/page.tsx` | Workflow restructuring service page |
| `src/app/(site)/consulting/it-systems/page.tsx` | IT & Systems service page |
| `src/app/(site)/consulting/ai-consulting/page.tsx` | AI consulting service page |

## Files modified
| File | What changed |
|------|-------------|
| `src/app/(site)/consulting/page.tsx` | Replaced stand-alone placeholder with a server component that exports metadata and renders `<ConsultingLandingClient />` |
| `src/components/sections/index.ts` | Added 5 new exports (ProcessSteps, FAQAccordion, ConsultingServicesGrid, LeaderIntro, ConsultingServicePage) |
| `src/app/globals.css` | Appended `.prose-consulting` styles (h2, h3, p, ul, li, strong, a) before the reduced-motion block |

## Key technical decisions
- **Template pattern.** A single `ConsultingServicePage` component enforces consistent structure across all 4 service pages. Each page file supplies page-specific props; the template handles layout, animation, and schema.
- **Server/client split for landing.** `page.tsx` is a server component so it can export `metadata`; UI lives in `ConsultingLandingClient.tsx`. Service pages stay as server components because `ConsultingServicePage` itself is a client component that can be rendered as a child of a server component.
- **Inline FAQPage JSON-LD.** `FAQAccordion` embeds its own `<script type="application/ld+json">` — no separate `FAQSchema` component was needed. Verified present in the rendered HTML for all 4 service pages.
- **Landing hero uses plain white.** `HeroSection`'s `headlineClassName="text-[var(--division-text-primary)]"` overrides the default `gradient-text-brand`. Consulting division is intentionally colorless.
- **AI Consulting cross-links to `/marketing/ai-development`.** All other "related services" links point within `/consulting/*`; this one is the only cross-division link (for internal SEO).
- **Plan deviation — dropped unused `cn` import.** The plan's `ConsultingServicePage` imported `cn` but never used it; left out to satisfy ESLint in production build.

## Component inventory
- **ProcessSteps** — Reusable. Props: `steps: { title, description }[]`. Numbered 01-NN timeline in a 2-col grid.
- **FAQAccordion** — Reusable. Props: `items: { question, answer }[]`. Accordion + FAQPage JSON-LD. First item open by default.
- **ConsultingServicesGrid** — Consulting only. No props; renders the 4 fixed consulting services as monochrome cards.
- **LeaderIntro** — Reusable. Props: `name`, `role`, `bio`. Derives 2-letter initials from `name`.
- **ConsultingServicePage** — Reusable template. Props: `title`, `subtitle`, `content` (ReactNode), `processSteps`, `faqItems`, `relatedServices`.

## Exports
`src/components/sections/index.ts` now exports: `HeroSection`, `DivisionSplit`, `ServicesOverview`, `SocialProof`, `CTABanner`, `ProcessSteps`, `FAQAccordion`, `ConsultingServicesGrid`, `LeaderIntro`, `ConsultingServicePage`.

## Verification
- `npm run build` — compiled successfully in 5.8s; TypeScript OK; 22/22 static pages generated. All 5 consulting routes prerender as static (`○`).
- Preview server confirmed: landing page h1 color `rgb(245, 245, 245)` (plain white, no gradient), `data-division="consulting"`, 4 service cards, Goran leader section, CTA link.
- `/consulting/business-consulting` rendered with title "Business Consulting | Vertex Consulting", 5 `<h2>` in prose, 10 paragraphs, 4 process steps, FAQPage JSON-LD with `@type: "FAQPage"`.
- Other 3 service pages: status 200, correct `<title>`, FAQPage JSON-LD present (4 / 4 / 5 items respectively).

## What the next phase should know
- `ProcessSteps`, `FAQAccordion`, and the `ConsultingServicePage` template pattern are ready to be reused / adapted for the marketing division. A `MarketingServicePage` template can copy the shape but swap the overline ("Vertex Marketing" instead of "Vertex Consulting") and possibly introduce a `.prose-marketing` CSS class.
- A `MarketingServicesGrid` should be built as a direct analogue of `ConsultingServicesGrid`.
- Content across all 4 consulting pages is draft quality. Needs client review before launch — especially FAQ answers and process-step descriptions.
- `ConsultingServicePage` is a client component (`"use client"`). This is intentional so that `FAQAccordion` (stateful) works. Pages that consume it stay as server components and get metadata.
- Stale browser console logs during preview verification came from pre-existing earlier failed compiles; Footer is already fixed (inline SVGs for brand icons).
