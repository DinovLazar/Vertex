# Phase 15B — Global UI + Homepage Translations

## What was built
Every piece of chrome on the Vertex site — navbar, footer, homepage (all 5 sections), About-page values grid, About-page timeline, BlogCard — now reads through `useTranslations`, and `/mk` renders those surfaces in real Macedonian (not a duplicate of English). Division landings, service pages, About story, About team bios, Contact, and blog post bodies still render English on `/mk` — those are 15C / 15D / 15E / 15F.

Added four new namespaces to `messages/en.json` + `messages/mk.json`:
- **`nav.dropdown.*`** — 8 service-name keys (4 consulting + 4 marketing).
- **`footer.*`** — full set: newsletter headline / subtext / placeholder / submit / submitting / success / error / aria labels / honeypot label; column headings; company link labels; social aria labels; back-to-top label; copyright.
- **`home.*`** — hero (headline/subtitle/ctaPrimary/ctaSecondary), divisionSplit (section headline/subtext + two cards each with title/subtitle/description/services array/cta), servicesOverview (overline/sectionHeadline/sectionSubtext + 8 service title+description pairs + division labels), socialProof (4 stat value/suffix/label triples + quote text/attribution), ctaBanner (headline/subtext/cta).
- **`sections.*`** — ctaBanner defaults; faq.sectionTitle; blog (readTimeSuffix, readMoreAria, authorBy, readLabel, divisionLabels.consulting/marketing/shared); team (consultingBadge, marketingBadge); leader.overline; backToTop.ariaLabel; values (4 cards with title+description); timeline (4 milestones with year+title+description).

`common.tagline` was populated on both locales (Phase 15A stubbed it with "We help businesses grow smarter.").

## Files created
| File | Purpose |
|------|---------|
| `TRANSLATION_NOTES.md` | Project-root doc listing every MK phrasing decision that deserves Goran's review. 10 open translation decisions + 3 font/rendering follow-ups + locked conventions. |
| `src/_project-state/13_phase-15b-global-ui-homepage.md` | This file. |

## Files modified
| File | What changed |
|------|-------------|
| `messages/en.json` | Added `nav.dropdown`, full `footer.*`, full `home.*`, and `sections.*` namespaces. Filled in `common.tagline`. |
| `messages/mk.json` | Translated every key added to `en.json`. |
| `src/config/navigation.ts` | Option A refactor. `NavItem.label: string` → `NavItem.labelKey: string` (fully-qualified message key). `mainNavItems` and `footerNavItems.{consulting,marketing,company}` all carry message keys; the consulting/marketing groups reuse `nav.dropdown.*` keys so navbar and footer render the same translated service names. Footer's company group uses distinct `footer.company.*` keys (e.g. "Privacy Policy" isn't in the navbar dictionary). |
| `src/components/global/Navbar.tsx` | Removed `t(item.label.toLowerCase())` trick. Now resolves labels via `useTranslations()` (namespace-less `tAll`) + `tAll(item.labelKey)` — this handles both top-level keys like `nav.consulting` and nested keys like `nav.dropdown.webDesign` in the same call site. Aria labels wired to `t('primaryAria')` / `t('logoAriaSuffix')`. Dropdown tracking uses `item.labelKey` as the stable ID (was `item.label`). |
| `src/components/global/Footer.tsx` | Every string migrated: newsletter headline/subtext/placeholder/submit button states/errors/success, column headings, all link labels via `footerNavItems[*].labelKey` resolved through a namespace-less `tAll`, social aria labels, back-to-top (used twice — visible text and aria-label), copyright via `t('copyright', { year })`. Tagline reads from `common.tagline` (shared with other consumers). |
| `src/components/global/BackToTop.tsx` | Floating FAB's aria-label moved to `sections.backToTop.ariaLabel`. |
| `src/components/sections/CTABanner.tsx` | Props now optional. When `headline` / `subtext` / `buttonText` aren't passed, falls back to `sections.ctaBanner.default*` via `useTranslations`. Consumer pages (homepage, consulting service pages) can override per-page copy; shared divisions get the default MK translation for free on `/mk`. |
| `src/components/sections/BlogCard.tsx` | Division label derived via `t('divisionLabels.${post.division}')`. `readTimeSuffix`, `authorBy`, `readLabel` all pulled from `sections.blog`. `aria-label` on the wrapper link pulls `readMoreAria`. Date formatting switched from `Date.prototype.toLocaleDateString` to next-intl's `useFormatter().dateTime()` to kill a hydration mismatch (see Key decisions). |
| `src/components/sections/ValuesGrid.tsx` | Full refactor. Hardcoded 4-item array is now a `VALUE_KEYS` array of `{ key, icon }` pairs; titles and descriptions read from `sections.values.${key}.title` / `.description`. |
| `src/components/sections/CompanyTimeline.tsx` | Same pattern as ValuesGrid. `MILESTONE_KEYS` array of 4 keys; year + title + description all read from `sections.timeline.milestones.${key}.*`. |
| `src/components/sections/TeamGrid.tsx` | Only the division chip label translates (`sections.team.consultingBadge` / `.marketingBadge`). Member names, roles, and bios stay hardcoded inside the component — Phase 15E moves them to a proper data layer and translates the bios. |
| `src/components/sections/TeamShowcase.tsx` | No changes in 15B (no chrome strings; member data hardcoded until 15E). |
| `src/components/sections/LeaderIntro.tsx` | Added optional `overline` prop. Defaults to `sections.leader.overline` ("Meet the team" / "Запознајте го тимот"). Consulting landing in Phase 15C can pass a division-specific override. |
| `src/components/sections/DivisionSplit.tsx` | Refactored. In-component hardcoded `divisions` array is now `DIVISION_KEYS` — just `{ id, href, icon, accentColor, bgColor }`. Titles, subtitles, descriptions, services arrays, and CTAs all resolve through `home.divisionSplit.${id}.*`. Services array uses `t.raw()` since next-intl's `t()` doesn't return arrays. |
| `src/components/sections/ServicesOverview.tsx` | Same pattern. `SERVICE_KEYS` array of `{ key, href, icon, division }`. Title + description read from `home.servicesOverview.services.${key}.*`; division chip reads from `home.servicesOverview.divisionLabels.${division}`. |
| `src/components/sections/SocialProof.tsx` | Stats array replaced with `STAT_KEYS` of 4 string IDs. `AnimatedCounter` target + suffix come from `home.socialProof.stats.${key}.value` / `.suffix` via `t.raw()`; the label is a plain `t()` call. The founder quote (text + attribution) resolves via `home.socialProof.quote.*`. |
| `src/app/[locale]/(site)/page.tsx` | Homepage now calls `useTranslations('home')`. Every prop passed to `HeroSection` / `CTABanner` and every wrapper-section headline reads from `t()`. |

## Files NOT modified (but touched by translation)
| File | Why not |
|------|---------|
| `ProcessSteps.tsx` | All display strings come from the caller's `steps` prop. No chrome to translate. |
| `FAQAccordion.tsx` | All display strings (question/answer) come from props. `sections.faq.sectionTitle` is in the dictionary for callers — no component consumes it in 15B. |
| `HeroSection.tsx` | Prop-driven reusable. Left it prop-driven (plan agreed). Homepage caller supplies translated strings. |
| `ConsultingLandingClient.tsx`, `MarketingLandingClient.tsx`, all `consulting/*/page.tsx` and `marketing/*/page.tsx` | Division pages — Phase 15C (consulting) and 15D (marketing). Their content stays English until then. Their navbar/footer are now Macedonian on `/mk` because the nav + footer translate per this phase. |
| `AboutPageClient.tsx`, `ContactPageClient.tsx`, `BlogListingClient.tsx`, `BlogPostClient.tsx`, `privacy/page.tsx`, `thank-you/page.tsx` | Shared pages — Phase 15E. Navbar + footer + the ValuesGrid + CompanyTimeline render in MK on `/mk/about` already because those components were refactored in 15B. The story, team bios, contact form body, map, and blog post content stay English. |
| `ContactForm.tsx` | Shared-page body content. Phase 15E. |

## Key technical decisions
- **Option A refactor with fully-qualified labelKeys.** Instead of giving `NavItem` a `key` that resolves against a fixed namespace, every `labelKey` is a full dotted path (`nav.consulting`, `nav.dropdown.businessConsulting`, `footer.company.privacy`). Consumer components call `useTranslations()` (no namespace) and `t(item.labelKey)` handles any key. This lets a single `footerNavItems` array mix `nav.dropdown.*` service names (so they stay word-for-word identical to the navbar dropdown) with `footer.company.*` link labels (which have different wording — "Privacy Policy" is longer than any nav entry).
- **Namespace-less `useTranslations()` works alongside scoped ones.** Navbar uses both `t = useTranslations('nav')` (for CTA, aria labels) and `tAll = useTranslations()` (for the dynamic `labelKey` resolution). Footer does the same. This keeps individual-string accesses terse while letting dynamic keys work.
- **BlogCard date hydration fix.** The first cut used `Date.prototype.toLocaleDateString(locale === 'mk' ? 'mk-MK' : 'en-US', {...})`. This broke hydration on `/mk/blog`: Node's Intl on this Windows runtime lacks full mk-MK data and rendered English, while the browser rendered Macedonian. Switching to next-intl's `useFormatter().dateTime()` makes server and client agree. Side effect: dates currently render in English format on `/mk` too — Node's ICU fallback wins. Flagged in `TRANSLATION_NOTES.md` #13. Acceptable trade-off for Phase 15B scope.
- **Stat values stored as numbers in JSON, not strings.** `home.socialProof.stats.yearsExperience.value = 8`, not `"8+"`. The `AnimatedCounter` needs a number to animate to; the suffix (`+` / `%` / empty) is a separate string. This keeps the animation behavior intact while letting the label and quote translate.
- **Service-name translation keys match consumer keys.** `nav.dropdown.webDesign` is the same key used by the navbar dropdown, footer marketing column, and homepage ServicesOverview card. Translating once updates every surface. Phase 15C service pages will reference these via `consulting.*.meta.title` / `consulting.*.hero.title` — those will be duplicated strings that must match the `nav.dropdown.*` values word-for-word, which is called out in `TRANSLATION_NOTES.md` convention #13.
- **Cyrillic fonts — no action this phase.** Per the 15A deferral and my 15B-opening check-in, Sora and DM Sans are still configured with `subsets: ['latin']`. Macedonian text falls back to the OS sans. Working as expected; swap is a separate focused change.

## Translation notes — flagged for Goran
See `TRANSLATION_NOTES.md` for the full list. Summary of the most important:
- "Get in Touch" → **"Контактирајте нѐ"** (locked; alt: "Да се слушнеме")
- Navbar "Consulting" / "Marketing" → Cyrillic **"Консалтинг" / "Маркетинг"** (not Latin)
- "Workflow Restructuring" → **"Преструктуирање на процеси"** (shorter form, not "работни процеси")
- Value card "Move fast, stay sharp" → **"Работи брзо, остани острo"** (trailing Latin `o` kept for rhythm)
- Stat label "Client-First Approach" → **"Клиентот на прво место"**
- 8 service product names locked for consistency across nav/home/division pages/service pages — `TRANSLATION_NOTES.md` convention #13 is the authoritative list.

## Verification
- `npm run build` — **compiled successfully in 7.4s**; TypeScript OK; **45 static pages prerendered** (same route count as 15A — no new routes, just translated content).
- `/mk` homepage: h1 "Помагаме на бизнисите да растат попаметно.", section h2s "Две дивизии. Една мисија." / "Бизнис услуги од целиот спектар" / "Подготвени сте да го развиете вашиот бизнис?". All 8 service cards in Macedonian. All 4 stat labels Macedonian. Founder quote Macedonian ("— Горан Динов, основач и директор"). CTA "Контактирајте нѐ".
- `/mk` navbar: Консалтинг / Маркетинг / За нас / Блог / Контакт; CTA button "Контактирајте нѐ"; toggle shows "en".
- `/mk` footer: column headings Консалтинг / Маркетинг / Компанија; newsletter headline "Останете во тек" / placeholder "Вашиот е-мејл" / submit "Претплати се"; copyright "© 2026 Vertex Consulting. Сите права задржани.".
- `/mk/about`: all 4 value cards Macedonian titles; all 4 timeline milestones Macedonian; team names stay Latin (expected). The story h1 ("A Macedonian consultancy built on practical results.") stays English — Phase 15E.
- `/mk/blog`: BlogCard chips show "Општо" / "Маркетинг" / "Консалтинг"; "8 мин читање"; "Од Goran Dinov"; "Читај" read-more label. (Post titles/excerpts stay English — Phase 15F.)
- `/en` homepage, navbar, footer, about, blog: unchanged. No regressions observed.
- Language toggle on `/mk` → `/en` and back preserves the full path. Verified on `/mk/about` and `/mk/blog`.
- No console errors on `/mk`, `/mk/about`, or `/mk/blog` after the BlogCard date fix. The historical hydration error in the dev-server buffer is pre-fix.

## What the next phase (15C) should know
- `nav.dropdown.*` keys are the canonical translations for the 8 service product names. Phase 15C's `consulting.*` namespace should reference these keys for every place a service name appears (landing services grid titles, service-page hero titles, cross-links in related-services blocks). Use `t('nav.dropdown.businessConsulting')` from the namespace-less translator rather than re-translating — keeps them consistent if Goran later revises one.
- `CTABanner` now falls back to `sections.ctaBanner.default*` when props are omitted. Consulting service pages can pass their own `headline` / `subtext` / `buttonText` through the existing prop API; nothing changed there except the defaults can now translate.
- `LeaderIntro` takes an optional `overline` prop. Phase 15C can pass a more specific overline on the consulting landing (e.g. "Запознајте го основачот") if the generic "Meet the team" feels off for a page where only Goran is shown.
- `messages/mk.json` uses Cyrillic throughout except for the brand names and the prefixes "IT" / "AI". Keep that convention.
- **Cyrillic font is still unresolved.** If 15C writes more than a hero's worth of Macedonian copy (it will — ~800 words per service page), the fallback font will become very visible. Revisit before 15C starts writing MK translations, not after.
- **BlogCard dates currently render in English on `/mk`.** This is a hydration-safe fallback from the Node ICU limitation. 15F will address when per-post metadata localization lands.
