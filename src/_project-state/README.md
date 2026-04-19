# Vertex Consulting — Project State Documentation

This folder is the project's persistent memory. It exists so that every new Claude Code session can understand the full state of the project before making any changes.

## Rules for Every Session

### Before starting ANY work:
1. Read `current-state.md` first — it has the full project snapshot
2. Read the phase file for the phase you're about to work on (e.g., `06_phase-06-navbar.md`)
3. Read `file-map.md` if you need to find a specific file
4. Read `00_stack-and-config.md` for tech stack details

### After finishing ANY work:
1. Update `current-state.md` with what changed
2. Create a new phase file (e.g., `07_phase-07-footer.md`) documenting:
   - What was built
   - Every file created or modified (with full paths)
   - Key decisions made
   - Any issues encountered and how they were resolved
   - What the next phase should know
3. Update `file-map.md` with any new files

### File naming convention:
- Phase files: `XX_phase-XX-short-name.md` (e.g., `06_phase-06-navbar.md`)
- Always use two-digit numbering
- Keep descriptions factual, not aspirational — document what IS, not what SHOULD BE

## Current Phase Status
- [x] Phase 1 — Project Setup
- [x] Phase 2 — Design System
- [x] Phase 3 — Background Components
- [x] Phase 4 — Animation System
- [x] Phase 5 — Layout Structure
- [x] Phase 6 — Navbar Component  *(already implemented in `src/components/global/Navbar.tsx`)*
- [x] Phase 7 — Footer Component  *(implemented in `src/components/global/Footer.tsx`)*
- [x] Phase 8 — Homepage Sections  *(5 sections live on `/`; components under `src/components/sections/`)*
- [x] Phase 9 — Consulting Pages  *(landing rebuilt; 4 service pages use shared `ConsultingServicePage` template with FAQPage JSON-LD)*
- [x] Phase 10 — Marketing Pages  *(landing rebuilt with Plasma hero/services grid/team showcase; 4 service pages use shared `MarketingServicePage` template with FAQPage JSON-LD and `.prose-marketing` body)*
- [x] Phase 11 — Shared Pages (About, Contact, Blog)  *(all 4 stub routes replaced with production pages; 5 new sections + mock blog data layer + `.prose-blog` styles + BlogPosting JSON-LD)*
- [ ] Phase 12 — AI Chat Widget  *(lib stubs exist, widget not built)*
- [ ] Phase 13 — Sanity CMS  *(client + queries are empty stubs)*
- [ ] Phase 14 — SEO & Structured Data
- [x] Phase 15A — i18n Infrastructure  *(`next-intl` wired end-to-end; `/en` + `/mk` prefixed routes; language toggle functional; 45 static pages prerendered)*
- [x] Phase 15B — Global UI + Homepage Translations  *(navbar, footer, homepage, ValuesGrid, CompanyTimeline, BlogCard chrome fully Macedonian on `/mk`; Option A nav config refactor; `TRANSLATION_NOTES.md` created)*
- [x] Phase 15C — Consulting Pages Translations  *(landing + 4 service pages fully Macedonian on `/mk/consulting/*`; ConsultingServicePage rewritten around `ContentSection[]`; per-service async server components)*
- [x] Phase 15D — Marketing Pages Translations  *(landing + 4 service pages fully Macedonian on `/mk/marketing/*`; MarketingServicePage/Grid/TeamShowcase refactored to prop-driven; `renderInlineMarkdown` helper for `**bold**` in paragraphs; cross-division related links verified on both locales)*
- [x] Phase 15E — Shared Pages Translations  *(About / Contact / Blog listing / Blog post chrome / Thank-you all fully MK on `/mk/*`; ContactForm + TeamGrid refactored; Privacy body stays EN with conditional MK notice banner — full MK policy deferred to lawyer review)*
- [x] Phase 15F — Blog Post Content + Final SEO Polish  *(all 3 blog posts fully MK; blog.ts locale-keyed; sitemap.xml + robots.txt + locale-aware 404; inLanguage on JSON-LD; Phase 15 overall complete)*
- [ ] Phase 16 — Performance Audit & Launch

## Notes on actual vs. expected state
When reading `current-state.md`, note that some items you might expect to be "placeholder" are actually implemented, and vice-versa. The Navbar and Footer are both fully built with division-aware theming, animations, and responsive layouts. The page shell (navbar + main + footer) is complete. As of Phase 11, all 16 content pages are live: homepage, `/about`, `/contact`, `/blog`, 3 mock blog post pages, 2 division landing pages, 8 division service pages, `/privacy`, and `/thank-you`. As of Phase 15A, every route is served under `/en/...` and `/mk/...` — the folder tree was moved from `src/app/(site)/` to `src/app/[locale]/(site)/`, next-intl is configured, and the language toggle works; translation *content* is still Phase 15B's job. Blog content currently comes from `src/lib/blog.ts` mock data — Phase 13 swaps this for Sanity CMS using the same function signatures. The contact form is wired to the real `/api/contact` route (Session B). Always trust the documentation over assumptions.
