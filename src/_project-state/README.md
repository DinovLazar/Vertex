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
- [x] Phase 12 — AI Chat Widget (core)  *(lead capture deferred to Phase 12B — intent detection, name+email form, `/api/chat/lead`, Telegram, per-IP rate limit)*
- [x] Phase 13A — Sanity CMS Setup & Blog Migration  *(3 original posts live in Sanity; `/studio` mounted; Portable Text renderer replaces regex/dangerouslySetInnerHTML; `/api/revalidate` tag webhook ready for Phase 13B/C automation)*
- [x] Phase 13B — AI Content Generator + Topic Backlog  *(20-topic backlog schema seeded; Claude Opus 4.7 + tool_use + long-output beta produces bilingual EN/MK Portable Text; Pexels images auto-attached; `/admin/generate` dashboard with SSE log streaming, password-gated; full E2E run takes ~95s and produces production-quality drafts; cost ~$0.04/post)*
- [x] Phase 13C — Social Auto-Publishing  *(Hobby-plan-compatible version. Facebook Page + Instagram Business posting via Meta Graph API + Telegram notifications all wired into the same `/admin/generate` button click. Cron path deferred until Vercel Pro — current trigger remains a manual click on localhost. ~2-3 min full pipeline.)*
- [ ] Phase 14 — SEO & Structured Data
- [x] Phase 15A — i18n Infrastructure  *(`next-intl` wired end-to-end; `/en` + `/mk` prefixed routes; language toggle functional; 45 static pages prerendered)*
- [x] Phase 15B — Global UI + Homepage Translations  *(navbar, footer, homepage, ValuesGrid, CompanyTimeline, BlogCard chrome fully Macedonian on `/mk`; Option A nav config refactor; `TRANSLATION_NOTES.md` created)*
- [x] Phase 15C — Consulting Pages Translations  *(landing + 4 service pages fully Macedonian on `/mk/consulting/*`; ConsultingServicePage rewritten around `ContentSection[]`; per-service async server components)*
- [x] Phase 15D — Marketing Pages Translations  *(landing + 4 service pages fully Macedonian on `/mk/marketing/*`; MarketingServicePage/Grid/TeamShowcase refactored to prop-driven; `renderInlineMarkdown` helper for `**bold**` in paragraphs; cross-division related links verified on both locales)*
- [x] Phase 15E — Shared Pages Translations  *(About / Contact / Blog listing / Blog post chrome / Thank-you all fully MK on `/mk/*`; ContactForm + TeamGrid refactored; Privacy body stays EN with conditional MK notice banner — full MK policy deferred to lawyer review)*
- [x] Phase 15F — Blog Post Content + Final SEO Polish  *(all 3 blog posts fully MK; blog.ts locale-keyed; sitemap.xml + robots.txt + locale-aware 404; inLanguage on JSON-LD; Phase 15 overall complete)*
- [ ] Phase 16 — Performance Audit & Launch

## Notes on actual vs. expected state
When reading `current-state.md`, note that some items you might expect to be "placeholder" are actually implemented, and vice-versa. The Navbar and Footer are both fully built with division-aware theming, animations, and responsive layouts. The page shell (navbar + main + footer) is complete. As of Phase 11, all 16 content pages are live: homepage, `/about`, `/contact`, `/blog`, 3 mock blog post pages, 2 division landing pages, 8 division service pages, `/privacy`, and `/thank-you`. As of Phase 15A, every route is served under `/en/...` and `/mk/...` — the folder tree was moved from `src/app/(site)/` to `src/app/[locale]/(site)/`, next-intl is configured, and the language toggle works; translation *content* is still Phase 15B's job. Blog content comes from Sanity CMS (Phase 13A, 2026-04-24): the 3 original posts were migrated from the `src/lib/blog.ts` mock into Sanity documents, `src/lib/blog.ts` is now a thin async adapter over GROQ queries with the same function names, and `/studio` is the editing UI. As of Phase 13B (2026-04-26), Goran can also click "Generate next post" in `/admin/generate` to have Claude Opus 4.7 write a bilingual draft from a 20-item topic backlog (Pexels image auto-attached) — drafts land in Sanity for review and publish through the Studio. As of Phase 13C (2026-05-01), the same button optionally publishes to Facebook + Instagram and pings Goran's phone via Telegram, all in one click — the dashboard exposes 3 checkboxes (Publish, Post to Facebook, Post to Instagram) and renders a token-health banner when the long-lived Meta Page Access Token is approaching expiry. The contact form is wired to the real `/api/contact` route (Session B). Always trust the documentation over assumptions.
