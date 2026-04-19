# Phase 11 — Shared Pages (About, Contact, Blog)

## What was built
Complete About page (story, values, team, timeline), Contact page (form + details + embedded map), Blog listing with division filter, and Blog post template with dynamic routing. Created 5 new section components (`ContactForm`, `TeamGrid`, `CompanyTimeline`, `ValuesGrid`, `BlogCard`) and a mock blog data layer in `src/lib/blog.ts` with 3 full-length draft posts. All four previously-stub pages (`/about`, `/contact`, `/blog`, `/blog/[slug]`) are now production. The section library is now 18 components.

## Files created
| File | Purpose |
|------|---------|
| `src/components/sections/ContactForm.tsx` | Contact form with client-side validation (name, email, phone optional, division select, message). 1.2s placeholder submit → success card. Button colors pull from `--division-accent` / `--division-bg` so it adapts per division. |
| `src/components/sections/TeamGrid.tsx` | About-page 4-card grid. Shows Goran (consulting, gray indicator) + Lazar/Petar/Andrej (marketing, `#B490F0` indicator + lavender-tinted avatar ring + hover glow). |
| `src/components/sections/CompanyTimeline.tsx` | Vertical dotted timeline of 4 milestones (2018 founded → 2020 IT consulting → 2023 AI consulting → 2026 Marketing division). Uses `--division-accent` for dots and year overlines. |
| `src/components/sections/ValuesGrid.tsx` | 2×2 grid of 4 company values with lucide icons (Handshake/Target/Zap/Shield). Uses `staggerContainer` + `staggerItem`. |
| `src/components/sections/BlogCard.tsx` | Blog listing card. Shows division indicator dot (gray/purple/blue for consulting/marketing/shared), date (locale-formatted), read-time with `Clock` icon, title, excerpt (3-line clamp), author, read arrow. `motion.article` with `whileHover={{ y: -4 }}`. |
| `src/lib/blog.ts` | Blog data layer. `BlogPost` interface, `mockPosts` array (3 posts), and helpers: `getAllPosts()` (date-desc), `getPostBySlug(slug)`, `getPostsByDivision(division)`, `getRelatedPosts(slug, limit=2)`. |
| `src/app/(site)/about/AboutPageClient.tsx` | About page client component. 4 `<Section>`s + custom `CTABanner`. |
| `src/app/(site)/contact/ContactPageClient.tsx` | Contact page client component. 3 sections: header, form+info 5-col grid, embedded Google Maps iframe with dark-theme CSS filter. |
| `src/app/(site)/blog/BlogListingClient.tsx` | Blog listing client component. 4 filter pills, responsive 3/2/1-col post grid, empty-state card, default `CTABanner`. Keyed `<motion.div>` on filter to re-trigger stagger. |
| `src/app/(site)/blog/[slug]/BlogPostClient.tsx` | Blog post client component. Back link, header, author block, prose content, related posts (up to 2 same-division), default `CTABanner`, `BlogPosting` JSON-LD. |

## Files modified
| File | What changed |
|------|-------------|
| `src/app/(site)/about/page.tsx` | Replaced `<div>About</div>` stub with server component exporting metadata and rendering `<AboutPageClient />`. |
| `src/app/(site)/contact/page.tsx` | Replaced stub with server component exporting metadata and rendering `<ContactPageClient />`. |
| `src/app/(site)/blog/page.tsx` | Replaced stub with server component exporting metadata and rendering `<BlogListingClient />`. |
| `src/app/(site)/blog/[slug]/page.tsx` | Replaced stub with server component that awaits `params` (Next 16 async), exports `generateStaticParams` (all 3 mock slugs) and `generateMetadata`, and renders `<BlogPostClient />`. Calls `notFound()` for missing slugs. |
| `src/components/sections/index.ts` | Added 5 new exports — now 18 total: original 13 plus `ContactForm`, `TeamGrid`, `CompanyTimeline`, `ValuesGrid`, `BlogCard`. |
| `src/app/globals.css` | Appended `.prose-blog` styles before the reduced-motion block. Different from `.prose-consulting` and `.prose-marketing`: bigger line-height (1.8 vs 1.7), larger font-size (1.0625rem), larger h3 (1.25rem vs 1.125rem), looser `ul` padding, deeper `text-underline-offset` (3px vs 2px), larger block margins. Uses `--division-accent` for links and `--division-text-primary` for `strong`. |
| `src/_project-state/current-state.md` | Marked Phase 11 complete; replaced stub bullets with 7 new entries describing the pages, form, data layer, and known placeholders. |
| `src/_project-state/file-map.md` | Updated — see file-map.md diff. |
| `src/_project-state/README.md` | Phase 11 checkbox checked; "actual vs. expected state" paragraph updated to reflect all 16 content pages live. |

## Key technical decisions
- **Next 16 async params.** The plan's `{ params: { slug: string } }` signature would have errored at build-time because Next 15+ passes `params` as a `Promise`. Adapted `generateMetadata` and `BlogPostPage` to `params: Promise<{ slug: string }>` + `await params`. Verified `generateStaticParams` still works as-is (it prerenders all 3 slugs).
- **`ContactPageClient` reads `siteConfig` strictly.** The plan had defensive `typeof …=== 'string'` checks against hypothetical string vs object shapes, but because `siteConfig` is declared `as const`, TypeScript narrows those branches at compile time and the fallback code is unreachable. Replaced with direct reads: `siteConfig.address.{street,city,country}`, `siteConfig.contact.{phone,emailInfo,emailMarketing}`, `siteConfig.hours`. No `as any` needed. Division emails panel reads `emailInfo` + `emailMarketing` directly.
- **Blog post content renderer is a 20-line regex affair.** Splits on `\n\n`, treats `## …` as `<h2>`, everything else as `<p dangerouslySetInnerHTML>` after transforming `**bold**` → `<strong>` and `[text](href)` → `<a href>`. Safe because we 100% control mock data. Phase 13's Sanity integration should replace this with `@portabletext/react`.
- **`BlogCard` applies marketing-only hover glow.** `isMarketing ? 'hover:border-[#B490F040] hover:shadow-[0_0_30px_rgba(180,144,240,0.08)]' : 'hover:border-white/15'`. Consulting + shared posts get a plain white-tint border hover.
- **`TeamGrid` cross-cuts division theming.** Goran is rendered with gray `#A3A3A3` indicator + white accents even when the card itself sits inside `data-division="shared"`. Lazar/Petar/Andrej get `#B490F0` indicators + lavender avatar rings regardless of page division. Division is a per-member property, not a page-level property.
- **Google Maps iframe gets a dark-mode CSS filter.** `filter: grayscale(30%) invert(92%) contrast(83%) hue-rotate(180deg)` recolors the default light map into a muted blue-grey that blends with the shared theme. Accepted trade-off: roads look slightly desaturated and brand colors on businesses shift hue. Removing the filter is a one-line change if it reads poorly on launch.
- **`BlogListingClient` uses `animate="visible"` (not `whileInView`) on its stagger parent.** Because the filter buttons re-key the motion div (`key={filter}`), the stagger should play immediately on mount, not wait for intersection. This is why the plan had us drop `whileInView` on that specific container.
- **`ContactForm` submit is intentionally placeholder.** `await new Promise(resolve => setTimeout(resolve, 1200))` then flip to `success`. The real fetch call is commented inline at the call-site. Wiring happens when Resend + Telegram are integrated (probably Phase 12 or alongside it).
- **`generateStaticParams` uses mock data directly.** When Phase 13 swaps `src/lib/blog.ts` for Sanity queries, this function will switch from sync to `async`/`await` but the return shape stays `{ slug: string }[]`.
- **Cross-division related-posts.** `getRelatedPosts()` filters by same division, so posts in different divisions never appear as "related" to each other. Current mock data has exactly one post per division, so the related-posts section never renders with the current dataset — the `related.length > 0 &&` guard handles this gracefully. When Phase 13 adds more posts, related will start appearing.

## Component inventory added
- **ContactForm** — Client, no props. 5 fields, client-side validation, 1.2s placeholder submit → success card.
- **TeamGrid** — Client, no props. Hard-codes all 4 members; division per member drives color tokens.
- **CompanyTimeline** — Client, no props. Hard-codes 4 milestones.
- **ValuesGrid** — Client, no props. Hard-codes 4 values + lucide icons.
- **BlogCard** — Client, takes `post: BlogPost`. Wraps a `<Link>` in a `motion.article`.

## Exports
`src/components/sections/index.ts` now exports (18 total):
`HeroSection`, `DivisionSplit`, `ServicesOverview`, `SocialProof`, `CTABanner`, `ProcessSteps`, `FAQAccordion`, `ConsultingServicesGrid`, `LeaderIntro`, `ConsultingServicePage`, `MarketingServicesGrid`, `TeamShowcase`, `MarketingServicePage`, `ContactForm`, `TeamGrid`, `CompanyTimeline`, `ValuesGrid`, `BlogCard`.

## Verification
- `npm run build` — **compiled successfully in 5.6s**; TypeScript OK; **25/25 static pages generated**. `/blog/[slug]` shown as `●` (SSG) with all 3 mock posts prerendered. All other routes static (`○`) except the 3 API stubs (`ƒ`).
- `/about` — 200. h1 "A Macedonian consultancy built on practical results.", `data-division="shared"` (brand blue accents). Values grid shows 4 cards. Team grid shows `GD` (CONSULTING indicator) + `L`/`P`/`A` (all with MARKETING indicator). Timeline shows all 4 years.
- `/contact` — 200. h1 "Let's talk about your business." All 6 form inputs present (name, email, phone, division select, message, submit). Division select shows 4 options. Map iframe rendered. Division-specific emails show `info@vertexconsulting.mk` and `marketing@vertexconsulting.mk`.
- `/blog` — 200. h1 "Insights from the field." 4 filter pills render (`All posts`, `Consulting`, `Marketing`, `General`). 3 post titles render in descending date order: AI tools 2026 (2026-04-05), web site costing customers (2026-03-22), workflow overhaul (2026-03-15). Each card links to `/blog/<slug>`.
- `/blog/five-signs-your-business-needs-a-workflow-overhaul` — 200. h1 matches post title. 6 `<h2>` elements render inside `.prose-blog` (5 numbered sections + "What to do next"). BlogPosting JSON-LD is parseable (`@type: BlogPosting`). Inline Markdown link `[Workflow Restructuring service](/consulting/workflow-restructuring)` renders as anchor. Related posts section hidden (no other consulting-division posts in mock data — correct behavior).
- No console errors on any of the 4 new routes.

## What the next phase should know
- All 16 content pages are now live. Nothing is a stub anymore.
- Blog content is in `src/lib/blog.ts` as typed mock data. Phase 13 must preserve these function signatures (`getAllPosts`, `getPostBySlug`, `getPostsByDivision`, `getRelatedPosts`, `BlogPost` interface) so consumer components don't need changes — only the data source.
- When swapping to Sanity, also replace `renderContent` in `BlogPostClient.tsx` with `@portabletext/react` — the current 20-line regex renderer handles only `## h2`, `**bold**`, and `[link](href)`.
- The Contact form submit handler is the hook where Phase 12 (or later) should wire up the `/api/contact` route with Resend email + Telegram notifications. The `fetch('/api/contact', ...)` call is commented inline at the `handleSubmit` call-site.
- The About page timeline includes a 2026 Vertex Marketing milestone — verify the exact year/wording with Goran before launch.
- `TeamGrid` and `TeamShowcase` both use initials — still waiting on real photos and polished bios for all 4 team members.
- Next 16's async `params` pattern was needed in `/blog/[slug]/page.tsx`. Use the same pattern (`params: Promise<{ slug: string }>` + `await params`) for any future dynamic routes (Sanity category pages, tag pages, etc.).
