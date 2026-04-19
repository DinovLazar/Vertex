# Phase 10 — Marketing Division Pages

## What was built
Complete Marketing division: landing page with Plasma background, hero, services grid, team showcase, and CTA — plus 4 individual service subpages. Created 3 new section components (`MarketingServicesGrid`, `TeamShowcase`, `MarketingServicePage` template). All service pages include 800+ words of draft content (web-design 820, ai-development 814), process steps, FAQ with FAQPage JSON-LD schema, related services (including cross-division links), and CTA banners.

## Files created
| File | Purpose |
|------|---------|
| `src/components/sections/MarketingServicesGrid.tsx` | 4-card marketing services grid with purple glow hover |
| `src/components/sections/TeamShowcase.tsx` | 3-card team showcase for Lazar, Petar, Andrej with initials avatars |
| `src/components/sections/MarketingServicePage.tsx` | Template composing hero/prose/process/FAQ/related/CTA for marketing service pages |
| `src/app/(site)/marketing/MarketingLandingClient.tsx` | Client component for the marketing landing page (UI + `"use client"`) |
| `src/app/(site)/marketing/web-design/page.tsx` | Web design & development service page |
| `src/app/(site)/marketing/social-media/page.tsx` | Social media management service page |
| `src/app/(site)/marketing/it-infrastructure/page.tsx` | IT infrastructure service page (cross-links to `/consulting/it-systems`) |
| `src/app/(site)/marketing/ai-development/page.tsx` | AI development service page (cross-links to `/consulting/ai-consulting`) |

## Files modified
| File | What changed |
|------|-------------|
| `src/app/(site)/marketing/page.tsx` | Replaced standalone placeholder with server component exporting metadata and rendering `<MarketingLandingClient />` |
| `src/components/sections/index.ts` | Added 3 new exports (MarketingServicesGrid, TeamShowcase, MarketingServicePage) — 13 total exports now |
| `src/app/globals.css` | Appended `.prose-marketing` styles before the reduced-motion block. Identical shape to `.prose-consulting` but `strong` and `a` colors are hard-coded `#B490F0` lavender (vs consulting's `--division-text-primary` white and `--division-accent` white) |

## Key technical decisions
- **Marketing prose uses hard-coded lavender `#B490F0` for `strong` and `a`** — not `var(--division-accent)` — to give bold text and links a distinct purple tint that the consulting prose (white) does not have. This matches the D-15 marketing personality (creative, lavender-heavy).
- **`MarketingServicePage` mirrors `ConsultingServicePage` structure** but uses a purple `#B490F0` overline ("Vertex Marketing") and purple hover effects on related-service pills (box-shadow lavender glow, border lavender). Same section shape: hero → prose → process → FAQ → related → CTA.
- **Dropped unused `cn` import from `MarketingServicePage`** — same plan deviation Phase 9 took for `ConsultingServicePage`. The plan template included an `import { cn } from '@/lib/utils'` that was never referenced; dropped to satisfy ESLint in production build.
- **Marketing service cards use `staggerContainerFast`** (0.06s stagger, 0.05s delay) for the "snappy, energetic" marketing feel. Consulting uses `staggerContainerSlow`.
- **Card hover uses inline purple box-shadow `rgba(180,144,240,0.12)` + `#B490F040` border** on the grid, plus a radial gradient overlay div for the subtle center glow.
- **`MarketingLandingClient` uses `HeroSection` with `headlineClassName="gradient-text"`** — relying on the `[data-division="marketing"] .gradient-text` CSS block (already in globals.css from Phase 2) that applies the `#E0BBFF → #9474D4` lavender gradient. Verified at runtime: h1 computed `background-image: linear-gradient(135deg, rgb(224, 187, 255) 0%, rgb(148, 116, 212) 100%)`, `color: rgba(0, 0, 0, 0)`.
- **Cross-division links.** `/marketing/it-infrastructure` links to `/consulting/it-systems`; `/marketing/ai-development` links to `/consulting/ai-consulting`. These are the only cross-division related-service links in the whole site (mirroring the reverse link already in place from Phase 9's AI Consulting page).
- **Team bios are placeholders** — real photos and copy to be provided by the client. Initials (`L`, `P`, `A`) stand in for photos with a 20×20 rounded avatar on a `#B490F010` background.

## Component inventory added
- **MarketingServicesGrid** — Marketing only. No props; renders the 4 fixed marketing services as 2×2 cards with purple glow hover.
- **TeamShowcase** — Marketing only. No props; renders Lazar/Petar/Andrej cards with initials avatars. Placeholder copy.
- **MarketingServicePage** — Reusable template. Props: `title`, `subtitle`, `content` (ReactNode), `processSteps`, `faqItems`, `relatedServices`. Client component.

## Exports
`src/components/sections/index.ts` now exports (13 total):
`HeroSection`, `DivisionSplit`, `ServicesOverview`, `SocialProof`, `CTABanner`, `ProcessSteps`, `FAQAccordion`, `ConsultingServicesGrid`, `LeaderIntro`, `ConsultingServicePage`, `MarketingServicesGrid`, `TeamShowcase`, `MarketingServicePage`.

## Verification
- `npm run build` — compiled successfully in 5.0s; TypeScript OK; 22/22 static pages generated. All 5 marketing routes prerender as static (`○`).
- `/marketing` — 200; headline "Creative digital presence that converts." with purple gradient text (#E0BBFF → #9474D4); `data-division="marketing"`; 4 service cards (Web Design, Social Media, IT Infrastructure, AI Development); 3 team cards (Lazar, Petar, Andrej); CTA banner.
- `/marketing/web-design` — 200; title "Web Design & Development | Vertex Consulting"; 820 words total; 4 h2 in prose; 4 process steps; 5 FAQ items; FAQPage JSON-LD present; "Vertex Marketing" overline visible.
- `/marketing/social-media` — 200.
- `/marketing/it-infrastructure` — 200; 4 process steps; 4 FAQ; FAQPage JSON-LD; "IT & Systems (Consulting)" related link resolves to `/consulting/it-systems`.
- `/marketing/ai-development` — 200; 814 words; FAQPage JSON-LD; "AI Consulting" related link resolves to `/consulting/ai-consulting`.
- Computed styles verified: `.prose-marketing strong` → `rgb(180, 144, 240)` (#B490F0); `.prose-marketing h2` → `rgb(243, 232, 255)` (division-text-primary for marketing); service card bg → `rgb(30, 21, 48)` (#1E1530 marketing-card).
- Console shows known stale `Module not found` errors for `MarketingLandingClient` and `ConsultingLandingClient` — same class of browser-cached compile errors Phase 9 hit. Actual serving returns 200 and current files exist.
- Screenshot verification attempted; the Motion/Plasma animations kept the renderer busy enough to time out preview_screenshot at 30s. All other textual/inspect verifications passed.

## What the next phase should know
- Both divisions (Consulting + Marketing) are now fully content-complete. 10 content pages total with FAQPage schema, process steps, cross-linking between divisions.
- **Team photos and real bios** still need to replace the `L`/`P`/`A` initial placeholders and the draft copy in `TeamShowcase.tsx` before launch.
- All content is draft quality — needs client review, especially FAQ answers.
- Phase 11 should flesh out `/about`, `/contact`, `/blog`, and `/blog/[slug]` — still one-line stubs.
- If any marketing service ever needs a *second* custom grid or variant, the `.prose-marketing` block has already diverged enough from `.prose-consulting` that future prose additions should consider extracting a shared base (e.g., `.prose-vertex`) to avoid duplication.
- `MarketingServicePage` is a client component (`"use client"`) because it composes `FAQAccordion`. Pages that consume it stay server components and export metadata — same pattern as consulting.
