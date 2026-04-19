# Phase 15D — Marketing Division Translations

## What was built
Mirror of Phase 15C for the marketing division. Marketing landing + all 4 marketing service pages (`/marketing`, `/marketing/web-design`, `/marketing/social-media`, `/marketing/it-infrastructure`, `/marketing/ai-development`) now read through `getTranslations` on the server and `useTranslations` on the client. `/mk/marketing/*` renders fully in Macedonian — hero, body prose (~800 words each, 4 sections per page), bullet lists (both plain and the `<strong>term</strong> — description` variant), **inline `**bold**` emphasis in paragraphs** (new for 15D), process steps, FAQ (with FAQPage JSON-LD in MK), related-services chips, and CTA banner.

`MarketingServicePage.tsx` was restructured to match the 15C `ConsultingServicePage` architecture — `content: ContentSection[]`, server component, prop-driven chrome labels. `MarketingServicesGrid.tsx` and `TeamShowcase.tsx` are now prop-driven. Each service `page.tsx` is an async server component that awaits `params`, calls `setRequestLocale`, and feeds the template from `marketing.<service>.*` keys plus the shared `marketing.serviceCommon.*` chrome.

## Files created
| File | Purpose |
|------|---------|
| `src/lib/renderInlineMarkdown.tsx` | Small React helper that splits paragraph strings on `**…**` markers and renders `<strong>` elements. Used by `MarketingServicePage` for paragraphs that carry inline emphasis like "We use **Next.js**" or "what the industry calls **vibe coding**". Safe — no HTML interpretation, just marker-based split. 15E/15F can reuse it if blog post bodies or About story copy need inline bold. |

## Files modified
| File | What changed |
|------|-------------|
| `messages/en.json` | Added `marketing.*` namespace: `meta` (landing metadata), `landing.*` (hero, services.overline/sectionHeadline/sectionSubtext + 4 per-service descriptions, team.overline/sectionHeadline/sectionSubtext + 3 member name/role/bio/initials, ctaBanner), `serviceCommon.*` (overline, process/faq/related section titles + overlines, default CTA banner strings), and 4 service namespaces (`webDesign`, `socialMedia`, `itInfrastructure`, `aiDevelopment`) each carrying `meta`, `hero`, `sections[]` (with plain + term bullets + inline `**markdown**` paragraphs), `process.steps[]`, `faq.items[]`, `related.links[]`. |
| `messages/mk.json` | Translated every new key. ~3,000 words of Macedonian marketing prose. FAQPage JSON-LD emits Macedonian questions + answers on every marketing service page. Flagged judgment calls in `TRANSLATION_NOTES.md`. |
| `src/components/sections/MarketingServicePage.tsx` | Full rewrite to mirror 15C's `ConsultingServicePage`. No more `'use client'` — server component. `content: ContentSection[]` prop. Paragraphs run through `renderInlineMarkdown()` so translation strings can carry `**bold**` emphasis inline. Bullets still support optional `term` for the `<strong>…</strong> — description` pattern. All chrome strings (overline, process/faq overlines + section titles, related section title, CTA banner) are passed in as props from the caller. |
| `src/components/sections/MarketingServicesGrid.tsx` | Rewrote as pure prop-driven. `services: { title, description, href, icon }[]` required. Hardcoded in-file array removed. |
| `src/components/sections/TeamShowcase.tsx` | Rewrote as pure prop-driven. `members: { name, role, bio, initials }[]` required. Names passed in from the caller (so Latin-script names like "Lazar" / "Petar" / "Andrej" carry through unchanged); roles, bios, and initials come from translation. |
| `src/app/[locale]/(site)/marketing/MarketingLandingClient.tsx` | Reads from `marketing.landing.*`. Services array built from a local `SERVICES` map of `{ key, href, icon }` pairs, with titles pulled from `nav.dropdown.*` (one source of truth for the 4 service names across every surface) and descriptions from `marketing.landing.services.*.description`. Team members array built from `TEAM_KEYS` ∈ `['lazar', 'petar', 'andrej']` with name/role/bio/initials from `marketing.landing.team.members.*`. |
| `src/app/[locale]/(site)/marketing/page.tsx` | Converted to async server component. `generateMetadata` awaits `params`, resolves via `getTranslations({ locale, namespace: 'marketing.meta' })`, passes `locale` through to `generatePageMetadata`. Default export awaits params, calls `setRequestLocale(locale)`, renders the client. |
| `src/app/[locale]/(site)/marketing/web-design/page.tsx` | Async server component. Namespace: `marketing.webDesign`. Same pattern as the 15C consulting service pages — `t.raw()` for structured arrays (sections, process.steps, faq.items, related.links), `tCommon` for the shared `marketing.serviceCommon.*` chrome. |
| `src/app/[locale]/(site)/marketing/social-media/page.tsx` | Same pattern. Namespace: `marketing.socialMedia`. Includes 6 term+description bullets for the "What includes" section. |
| `src/app/[locale]/(site)/marketing/it-infrastructure/page.tsx` | Same pattern. Namespace: `marketing.itInfrastructure`. Includes 6 term+description bullets for "What we set up and manage". Cross-division related link to `/consulting/it-systems`. |
| `src/app/[locale]/(site)/marketing/ai-development/page.tsx` | Same pattern. Namespace: `marketing.aiDevelopment`. Includes 6 term+description bullets for "What we build" + inline `**vibe coding**` emphasis in section 3. Cross-division related link to `/consulting/ai-consulting`. |

## Files NOT modified
| File | Why |
|------|-----|
| `ProcessSteps.tsx`, `FAQAccordion.tsx`, `HeroSection.tsx`, `CTABanner.tsx` | Already prop-driven / generic enough from earlier phases. |
| `TeamGrid.tsx` | Separate component used by `/about`. TeamShowcase (marketing-only) is the only one that got the prop-driven refactor. 15E may revisit TeamGrid when About-page bios translate. |
| `ConsultingServicePage.tsx` | 15C refactored this. Did not backport the `renderInlineMarkdown` helper to it since no consulting body copy uses inline `**bold**`. Could be applied later for consistency without behavior change. |

## Key technical decisions
- **Inline `**bold**` in translation strings.** Four of the marketing pages have paragraphs with bold emphasis inside them (e.g. Web Design section 3: "We use **Next.js** as our primary framework…"; AI Development section 3: "what the industry calls **vibe coding**"). Rather than encode HTML in JSON or split sentences into multiple translation keys, I added a tiny `renderInlineMarkdown` helper that splits paragraph strings on `**…**` markers and renders `<strong>` elements. Safe — no raw HTML interpretation. Applied to both `paragraphs[]` and `paragraphsAfterBullets[]` in the service-page template.
- **TeamShowcase now takes `members` as a prop.** In 15B the three members (Lazar / Petar / Andrej) were hardcoded in-component. 15D moves them to `marketing.landing.team.members.*` in the message files, with **name in Latin on both locales** (name is a personal proper noun, transliteration isn't natural). The caller (MarketingLandingClient) passes translated roles + bios; initials are stored as a translation too so the three-letter avatars match the name choice.
- **Service-name keys reuse `nav.dropdown.*` consistently.** On `/mk/marketing` landing, the 4 service grid titles come from `nav.dropdown.webDesign` / `socialMedia` / `itInfrastructure` / `aiDevelopment` — same keys the navbar and footer use. The service page hero titles live separately under `marketing.<service>.hero.title` because they can be longer (e.g. "Web Design & Development" / "Веб дизајн и развој"). Related-services chips use whatever exact title the author wants — typically the nav-dropdown-short form to save space.
- **`IT & Systems (Consulting)` remains English parenthetical in both locales.** The related-services chip on `/marketing/it-infrastructure` linking to `/consulting/it-systems` shows "IT & Systems (Consulting)" on EN and "IT и системи (Консалтинг)" on MK. The "(Consulting)" qualifier makes clear this is the cross-division link. Flagged in `TRANSLATION_NOTES.md`.
- **Marketing CTA banner defaults use `Start a Project` / `Започни проект`** — different from consulting's "Contact Us" / "Контактирајте нѐ" because marketing's voice is more direct-project-oriented. Each per-service page uses the default from `marketing.serviceCommon.defaultCtaBanner*`. If Goran wants to unify, flip either's `defaultCta*` keys to match.
- **Stays consistent with 15C conventions.** Same file shape, same namespace naming, same `ContentSection[]` / `Bullet[]` / `ProcessStep[]` / `FAQItem[]` / `RelatedServiceLink[]` types.

## Translation notes — flagged for Goran
See `TRANSLATION_NOTES.md` for the full Phase 15D entry. Highlights:
- **Marketing service-name translations (locked in 15B, verified for 15D)**: Веб дизајн / Социјални медиуми / IT инфраструктура / AI развој. Used identically on navbar dropdown, footer marketing column, homepage services grid, `/mk/marketing` services grid, and every service page hero + related-services chip.
- **"vibe coding" stays in Latin on MK** — it's an industry term / product name. Bolded inline on both `/en/marketing/ai-development` and `/mk/marketing/ai-development` via the `**vibe coding**` marker.
- **"mobile-first"**, **"Next.js"**, **"React"**, **"Tailwind CSS"**, **"Cloudflare CDN"**, **"Google Lighthouse"** — all stay in Latin in MK prose. Tech brand / product names.
- **"конверзија" for "conversion"** consistently (marketing sense).
- **Team roles**: "Веб развој и AI" / "Дизајн и социјални медиуми" / "IT инфраструктура". Names (Lazar / Petar / Andrej) stay Latin on both locales.
- **"(Consulting)" / "(Консалтинг)" parenthetical** on the cross-division related chip from `/marketing/it-infrastructure` → `/consulting/it-systems`.

## Verification
- `npm run build` — **compiled successfully in 15.4s**; TypeScript OK; **45 static pages prerendered**.
- **Every `/mk/marketing/*` URL** renders Macedonian `<title>` + `<h1>`. Checked via curl:
  - `/mk/marketing` → "Маркетинг услуги | Vertex Consulting" / "Креативно дигитално присуство што конвертира."
  - `/mk/marketing/web-design` → "Веб дизајн и развој | Vertex Consulting" / "Веб дизајн и развој"
  - `/mk/marketing/social-media` → "Управување со социјални медиуми | Vertex Consulting" / "Управување со социјални медиуми"
  - `/mk/marketing/it-infrastructure` → "IT инфраструктура | Vertex Consulting" / "IT инфраструктура"
  - `/mk/marketing/ai-development` → "AI развој | Vertex Consulting" / "AI развој"
- **Inline `**bold**` rendering**: `<strong>Next.js</strong>` on `/mk/marketing/web-design` (translated paragraph); `<strong>vibe coding</strong>` on `/mk/marketing/ai-development` (translated paragraph). All 6 term-bullets on ai-development render with MK term text. All 6 term-bullets on it-infrastructure render with MK term text. All 6 term-bullets on social-media render with MK term text.
- **FAQPage JSON-LD emits Macedonian** — verified on `/mk/marketing/web-design`: `"@type":"Question","name":"Колку трае да се изгради веб страница?"` etc.
- **Cross-division related links**:
  - `/mk/marketing/ai-development` → `/mk/consulting/ai-consulting` with chip title "AI консалтинг". ✓
  - `/mk/marketing/it-infrastructure` → `/mk/consulting/it-systems` with chip title "IT и системи (Консалтинг)". ✓
  - Reverse directions verified in 15C (`/mk/consulting/ai-consulting` → `/mk/marketing/ai-development` and `/mk/consulting/it-systems` → `/mk/marketing/it-infrastructure` — all links preserve `/mk/` prefix because `@/i18n/navigation` `Link` prepends current locale).
- **hreflang alternates** on `/mk/marketing/web-design`: `en` + `mk` + `x-default` all present.
- **Team showcase** on `/mk/marketing`: Lazar / Petar / Andrej names (Latin) + MK roles ("Веб развој и AI", "Дизајн и социјални медиуми", "IT инфраструктура") + MK bios + section headline "Млади, смели и неуморни".
- **Services grid** on `/mk/marketing`: 4 titles match nav.dropdown.* verbatim — "Веб дизајн" / "Социјални медиуми" / "IT инфраструктура" / "AI развој".
- **`/en/marketing/*`** unchanged — `/en/marketing` renders "Marketing Services" / "Creative digital presence that converts." No regressions.
- **No console errors** on any of the 5 `/mk/marketing/*` pages.

## What the next phase (15E — About / Contact / Blog chrome) should know
- **`TeamGrid.tsx`** on `/about` still has hardcoded member names, roles, and bios — 4 members vs the 3 on TeamShowcase. 15E refactors the same way: extract to `about.team.members.*` in translations, refactor TeamGrid to take a `members` prop.
- **About page story sections** (hero, values overlines — values grid items are already translated in 15B, just the chrome around them), company narrative in `AboutPageClient.tsx`, timeline — all need the same treatment. About has a simpler prose structure than service pages so likely no `ContentSection[]` needed — plain `headline + paragraphs` is probably enough.
- **Contact page**: header, form field labels + placeholders, info-panel labels (Phone / Email / Hours), Google Maps iframe — the iframe URL stays as-is, but the section around it translates.
- **Blog listing page**: header h1, lede, 4 filter pills (All posts / Consulting / Marketing / General), empty state.
- **Blog post template chrome** — back link, author block labels, related-posts section title. Post bodies themselves (title, excerpt, content) stay English until Phase 15F.
- **Privacy + Thank-you pages** — decision point: translate privacy policy body (13 sections × 400 words = ~5000 words) or leave as EN-only with a note? Privacy has legal weight. Thank-you is trivial.
- **`renderInlineMarkdown` helper** is available for any paragraph-level inline bold need. Blog posts in 15F may want it.
- **Two complete divisions done.** Homepage + consulting + marketing + global chrome all translate. The architecture pattern is now proven across 10 pages. 15E/15F finish by translating the remaining 6 page types (About, Contact, Privacy, Thank-you, Blog listing, Blog post) and wiring up per-page metadata localization.
- **Cyrillic font is STILL unresolved.** 15D added ~3,000 more words of MK prose — consulting + marketing now collectively have ~6,500 words of Macedonian rendering in the OS fallback sans. Strongly recommend the font swap BEFORE 15E adds any more MK prose, and definitely before launch.
