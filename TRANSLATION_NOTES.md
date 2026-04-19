# Translation Notes — Vertex Consulting

Strings flagged during the MK translation effort where the Macedonian phrasing is a judgment call and deserves Goran's eyeball before launch. Not an error log — these are working guesses, not bugs.

Last updated: 2026-04-17 (Phase 15F — Phase 15 complete).

---

## TOP 20 native-speaker review priorities

The MK translations were LLM-drafted (proficient but not native). These are the 20 decisions most likely to need a native-speaker polish pass. Work top-to-bottom; each item links to its full entry below.

**Blog post bodies (highest impact — these are read linearly):**
1. **Post 1 — "Пет знаци..." full body** (~1000 words). Specific calls-out: "племенско знаење" (tribal knowledge, #15F-A), "Меморијата пропаѓа, системите не." (rhythm, #15F-B), "Зафатено не е исто што и продуктивно." (#15F-C).
2. **Post 2 — "Зошто вашата бизнис веб страница..." full body** (~1000 words). "mobile-first" and tech brand names stay Latin (#19).
3. **Post 3 — "Практичен водич за AI алатки..." full body** (~1000 words).
4. Blog post **author roles**: "Сопственик и директор, Vertex Consulting" (Goran), "Веб развој и AI, Vertex Marketing" (Lazar). #15F-D.
5. Blog post **tags**: "процеси", "операции", "консалтинг", "веб дизајн", "маркетинг", "перформанси", "AI", "технологија", "стратегија". Short; easy to retouch.

**Chrome / recurring phrases (seen on every page):**
6. **"Get in Touch" → "Контактирајте нѐ"** (#1). Alternative "Да се слушнеме" more casual. CTA appears on nav + homepage + consulting CTA defaults.
7. **Navbar top-level labels** "Консалтинг" / "Маркетинг" (Cyrillic, #2). Could argue for Latin since they're brand-adjacent.
8. **Service-name translations** (#15): Бизнис консалтинг, Преструктуирање на процеси, IT и системи, AI консалтинг, Веб дизајн, Социјални медиуми, IT инфраструктура, AI развој. These appear in 4+ places each.
9. **Form validation error register** (#25): "Ве молиме..." polite form. Alternative: shorter imperative ("Внесете име").
10. **Marketing vs Consulting default CTA** (#23): "Започни проект" vs "Контактирајте нѐ". Intentional voice difference.

**Body-copy style calls:**
11. **"Move fast, stay sharp" → "Работи брзо, остани острo"** (#5). Trailing Latin `o` for rhythm.
12. **"hands-on" → "директно" / "рамо до рамо"** depending on context (#16). Used 10+ times in consulting copy.
13. **"no jargon, no fluff"** → "Без жаргон, без комплицирање" (#8, #15F body copy).
14. **"(Consulting) / (Консалтинг)" parenthetical** on cross-division IT chip (#22). Asymmetric — reverse direction has no parenthetical.
15. **"Vertex Блог"** overline on blog listing (#27). Mixed-script. Could be "Блогот на Vertex" or "Vertex Blog".

**Specific tricky strings:**
16. **"Client-First Approach" → "Клиентот на прво место"** (#6). Stat label on homepage.
17. **"IT & Systems" nav vs "Поддршка за IT и системи" service page title mismatch** (#14). Pre-existing EN inconsistency.
18. **Team roles** on /mk/about and /mk/marketing TeamShowcase (#10, #30). Roles like "Веб развој и AI — Vertex Marketing" — mixed-script with Latin brand.
19. **Office hours "Понеделник – петок, 09:00 – 17:00"** (#26). Could be "од понеделник до петок..." more natural spoken.
20. **"Email" chip label → "Е-мејл"** (#9). Alternative: "Email" (Latin) or "Е-пошта".

Estimated review time: **30–60 minutes**. The goal isn't to reword everything — it's to catch the handful of strings that sound "almost right but slightly strange" to a native ear. Those are the ones that make a site feel amateurish in a local market.

---

## Launch blockers vs polish items

**Launch blockers** (must fix before public launch):
- **Cyrillic font swap** — Sora + DM Sans lack Cyrillic; ~10,000 words of MK prose currently render in OS fallback (Segoe UI on Windows, SF Pro on macOS). Visually off-brand. Recommended: Manrope (headings) + Inter (body).
- **Native-speaker MK review** (the 20 items above). Not optional for a bilingual site.

**Launch-adjacent** (can soft-launch, finalize in week 1–2):
- **Privacy policy MK translation** (#24). `/mk/privacy` currently shows a notice banner + English body. Needs a Macedonian lawyer to translate + certify.

**Polish items** (non-blocking):
- **Node ICU date fallback** (#29). `/mk` blog dates render "March 14, 2026". Fix with `full-icu` npm package or a custom MK month-name formatter.
- **Any strangenesses** the native-speaker review flags below the top-20.

---

## Open decisions (Goran to review)

### 1. "Get in Touch" CTA → "Контактирајте нѐ"
- Used on the navbar CTA, homepage CTA banner, and the shared `sections.ctaBanner.defaultCta` fallback.
- Alternative considered: "Да се слушнеме" (more casual, literal "let's hear each other").
- Locked to "Контактирајте нѐ" for consistency across every page. If Goran prefers the more casual version, change `nav.cta`, `home.ctaBanner.cta`, and `sections.ctaBanner.defaultCta` together.

### 2. "Consulting" / "Marketing" as navbar top-level labels
- Translated to "Консалтинг" / "Маркетинг" (Cyrillic). Plan hinted these could stay in Latin since they're the division brand names ("Vertex Consulting", "Vertex Marketing").
- Chose Cyrillic for the navbar because the nav labels are reading as activities ("what do you do?"), not as the brand proper. Brand names "Vertex Consulting" / "Vertex Marketing" stay Latin wherever they appear as titles (e.g. DivisionSplit card titles).

### 3. "Workflow Restructuring" → "Преструктуирање на процеси"
- Literal: "Restructuring of processes".
- Alternative: "Преструктуирање на работни процеси" ("work processes") — more precise but longer and may wrap awkwardly on service cards.
- Going with the shorter form for UI fit.

### 4. "Social Media" → "Социјални медиуми"
- Standard Macedonian term. Uncontroversial. Flagged only because "социјални мрежи" ("social networks") is arguably more common in everyday speech.

### 5. Value card: "Move fast, stay sharp" → "Работи брзо, остани острo"
- "острo" uses Latin-script o at the end deliberately to keep the original's snappy rhythm. Goran may prefer the fully-Cyrillic "остри" (adjective form, "stay sharp ones") or "остар" (singular). This is a style call.

### 6. Stat label: "Client-First Approach" → "Клиентот на прво место"
- Literal: "The client in first place". Natural idiom. If Goran prefers "Пристап со клиентот на прво место" (more literal) that fits too but is longer.

### 7. Founder quote: "roll up our sleeves" → "ги засукуваме ракавите"
- Direct translation; the idiom exists in Macedonian with the same meaning. Safe but worth confirming tone matches how Goran actually talks.

### 8. About-page values: "No jargon, no fluff, no overselling"
- Translated as "Без жаргон, без комплицирање, без претерување" — "комплицирање" (complicating) replaces "fluff" (which has no single direct translation). "Претерување" (overstating) replaces "overselling".
- Natural but loses some of the English blunt cadence. Could be tightened further.

### 9. Footer social chip for "Email" → "Е-мејл"
- Macedonian convention varies between "Е-мејл", "Е-пошта", and the Latin "Email". Using hyphenated Cyrillic which is the current Macedonian government style.

### 10. "No jargon, no fluff — just practical results" pattern
- Goran's original English prose repeats this phrasing across pages. Not in current Phase 15B scope (that prose is division-page content for 15C/15D), but when 15C lands make sure the same MK phrasing is reused, not re-translated inconsistently.

## Font / rendering follow-ups

### 11. Sora heading font has no Cyrillic subset on Google Fonts
- The `/mk` homepage headings render in the OS fallback sans (Windows: Segoe UI). This is noticeable next to body copy, which renders slightly more cleanly.
- Screenshot from /mk taken during Phase 15B shows the Cyrillic text is readable but not in the brand typography.
- Decision pending: swap Sora → Manrope (close visual match, Cyrillic support), or accept the fallback for launch.

### 12. DM Sans body font also lacks Cyrillic
- Body text on /mk also uses OS fallback. Same decision point.

### 13. Blog card dates fall back to English format on /mk
- `BlogCard.tsx` uses `useFormatter().dateTime()` which on this Windows + Node runtime emits "Apr 4, 2026" regardless of the active locale — Node's ICU data isn't shipping full Macedonian formatting here.
- Fixed the hydration mismatch by using next-intl's formatter (server and client agree). Native MK format "4 апр. 2026 г." only renders if Node ICU is upgraded (e.g. `full-icu` package) or dates are manually translated via a custom formatter.
- Acceptable for now — dates on a blog listing are low-risk. Phase 15F revisits.

## Phase 15C additions (consulting pages)

### 14. IT Systems page title mismatch between navbar and hero
- `nav.dropdown.itSystems` renders as "IT и системи" (short form, matches English "IT & Systems" in the nav dropdown).
- But the service page hero on `/mk/consulting/it-systems` renders as "Поддршка за IT и системи" (long form, matches English "IT & Systems Assistance" which the page file still declares).
- This mirrors a pre-existing English inconsistency in the codebase — Goran can decide: (a) change the nav + footer to "IT & Systems Assistance" everywhere, (b) change the service page hero to "IT & Systems" to match the shorter form, or (c) keep the split as the long form is more descriptive on the service page itself.

### 15. Consulting service-name translations (authoritative for 15D–F)
Locked in 15C and must be used word-for-word anywhere these service names appear across the site:
- "Business Consulting" → **"Бизнис консалтинг"**
- "Workflow Restructuring" → **"Преструктуирање на процеси"**
- "IT & Systems" → **"IT и системи"** (navbar / footer / landing card)
- "IT & Systems Assistance" → **"Поддршка за IT и системи"** (service page hero only, if kept)
- "AI Consulting" → **"AI консалтинг"**

Same list for marketing (locked 15B, reusable in 15D):
- "Web Design" → **"Веб дизајн"**
- "Social Media" → **"Социјални медиуми"**
- "IT Infrastructure" → **"IT инфраструктура"**
- "AI Development" → **"AI развој"**

### 16. Consulting body-copy idiom choices
- "No jargon, no fluff — just practical results." → **"Без жаргон, без комплицирање — само практични резултати."** (used on the consulting landing hero). Matches the homepage CTA banner phrasing from 15B.
- "hands-on" (appears 6+ times across consulting copy) → translated as **"директно"** or **"рамо до рамо"** depending on context. Both carry the "not delegated, not remote" sense.
- "tribal knowledge" (Workflow Restructuring section 1) → **"племенско знаење"**. Literal. Sounds slightly unusual in Macedonian business writing but the meaning lands. Alternative "неформално знаење" ("informal knowledge") would be safer but loses the punchiness.
- "putting out fires" (Workflow Restructuring section 4) → **"гасење пожари"**. Direct translation; the idiom exists in Macedonian.
- "pilot implementation" (AI Consulting process) → **"пилот имплементација"**. Could be "пилот проект" but the English source uses "implementation" and the MK term is equally understood.
- "honest" / "straight" (appears often in the consulting voice) → consistent use of **"искрено"** / **"директно"**. Avoided "фер" (English loanword) which would clash with the register.

### 17. "Goran" vs "Горан" — keeping Goran in the bio header
- On `/mk/consulting`, LeaderIntro renders name="**Goran Dinov**" (Latin) and role="**Сопственик и директор — Vertex Consulting**" (Cyrillic). In body copy, "Goran" becomes "Горан" — see the consulting landing bio ("Со повеќе од 8 години директно искуство…, Горан носи практичен пристап…") and the process descriptions ("…Горан работи рамо до рамо со вашиот тим…").
- Reason for the split: the name under the initials avatar should match the initials ("GD"), which are computed from the Latin name. If we rendered "Горан Динов" there, initials would be "ГД" — off-brand. Keep the name header Latin, translate references in running prose.

## Phase 15D additions (marketing pages)

### 18. Team member names stay in Latin on both locales
- Lazar / Petar / Andrej rendered in Latin characters on both `/en/marketing` and `/mk/marketing`. Personal names; direct transliteration ("Лазар" / "Петар" / "Андреј") reads fine but fragments the personal identity — Goran's call, easy to change by editing `marketing.landing.team.members.*.name` in `messages/mk.json` if he prefers Cyrillic.
- Team roles ARE translated ("Веб развој и AI" / "Дизајн и социјални медиуми" / "IT инфраструктура") — those are job descriptions, not proper nouns.

### 19. Tech brand / product names stay in Latin in MK prose
Applied consistently to every marketing service page:
- **Next.js**, **React**, **Tailwind CSS**, **Vercel**, **Cloudflare**, **Cloudflare CDN**, **Proxmox**, **Ubuntu**, **Ubuntu Server**, **Google Lighthouse**, **Notion**, **Asana**, **Monday**, **Slack**, **Teams**, **Google Workspace**, **Dropbox**, **LinkedIn**, **Facebook**, **Instagram**, **TikTok**, **Make**, **Zapier**, **ChatGPT**, **Claude**, **GPT**, **Vertex** — all stay Latin.
- Standards / protocols: **DNS**, **SSL**, **SPF**, **DKIM**, **DMARC**, **DDoS**, **VPS**, **CRM**, **CMS**, **CDN** — all stay Latin. Standard convention for MK tech writing.

### 20. Inline emphasis via `**bold**` markers
Used in four places on the marketing pages:
- `/marketing/web-design` section 3 paragraph 2: "We use **Next.js** as our primary framework…" / "Користиме **Next.js** како примарна рамка…"
- `/marketing/ai-development` section 3 paragraph 1: "what the industry calls **vibe coding**" / "она што индустријата го нарекува **vibe coding**"
- Not used elsewhere in 15D. Could be applied to 15C's consulting pages retroactively if any paragraph-level emphasis is desired there.
- The `renderInlineMarkdown` helper at `src/lib/renderInlineMarkdown.tsx` handles this — any `**text**` becomes `<strong>text</strong>`. Safe, no HTML interpretation.

### 21. Marketing idiom choices
- "landing страна" / "приземна страна" — not needed in 15D (no "landing page" references in body copy).
- "конверзија" / "конвертираат" used consistently for conversion-sense marketing vocabulary.
- "импресивни демоа" for "impressive demos" (lit. "demos" — loanword accepted in MK tech writing).
- "инка" for "funnel" — not needed in 15D body copy.
- "mobile-first" → kept Latin in MK prose (`"mobile-first"` in section 1 of web-design MK) — industry term, reads better than "прво-мобилно".
- "vibe coding" → Latin, **bold** on both locales — industry slang / brand-voice term.
- **Pricing answers** use identical cadence across both locales. English "Pricing depends on…" consistently becomes "Цената зависи од…" — this is locked for consistency with the consulting FAQs from 15C.

### 22. Cross-division chip wording
- On `/mk/marketing/it-infrastructure`, the related chip to `/consulting/it-systems` reads **"IT и системи (Консалтинг)"** — the `(Консалтинг)` parenthetical disambiguates from the marketing division's own "IT инфраструктура". EN equivalent: "IT & Systems (Consulting)". This is a style call — alternatives like "IT и системи · Консалтинг" or just "IT и системи" (implicit from context) would also work. Flagged for Goran to eyeball.
- Reverse direction (`/mk/consulting/it-systems` → `/marketing/it-infrastructure`) does not use a parenthetical — the related chip there just reads "IT инфраструктура" because marketing is the default expectation when you click an unqualified infra link from the consulting IT page. Asymmetric but reads naturally.

### 23. Marketing CTA default differs from consulting
- Consulting default CTA: "Контактирајте нѐ" (Contact Us).
- Marketing default CTA: "Започни проект" (Start a Project).
- Intentional — marketing's voice is more direct-project-oriented. If Goran wants one unified CTA across both divisions, flip `marketing.serviceCommon.defaultCtaBannerCta` to match `consulting.serviceCommon.defaultCtaBannerCta`.

## Phase 15E additions (shared pages)

### 24. Privacy policy body stays English on both locales
- Session A produced a full 13-section, ~5,000-word GDPR + Macedonian-law privacy policy. The 15E plan assumed it was still a placeholder; it isn't.
- Translating legal copy without counsel review is the wrong trade-off. `/mk/privacy` shows a **conditional notice banner** at the top explaining that the Macedonian translation, reviewed by a lawyer, will be published before launch. The 13-section body renders identically in English on both locales.
- **Action needed pre-launch:** engage a Macedonian lawyer to review the EN policy and produce the MK version. Then strip the notice banner and migrate the full policy text into `messages/*.json` under `privacy.body.*` or similar.

### 25. Form validation error register
- Used polite Macedonian ("Ве молиме…") across all 4 form errors, matching the English "Please enter…" tone. Feels closer to brand voice than an imperative register ("Внесете име") would.
- Alternative: shorter "Име е потребно" / "Невалидна е-мејл адреса" for tighter mobile layout. Flagged — style call. Current locked copy works fine in the viewport tested.

### 26. Office hours format on /mk/contact
- Rendered as "Понеделник – петок, 09:00 – 17:00" — EM dash between days and times, matching the English source.
- Alternative phrasing: "од понеделник до петок, од 09:00 до 17:00" ("from X to Y") is more natural spoken MK. Current form is more compact and matches the visual pattern of the EN source.

### 27. Blog listing overline: "Vertex Блог"
- Mixed-script — Latin brand name + Cyrillic noun. Acceptable because "Vertex" is the brand. Goran may prefer all-Latin "Vertex Blog" or all-Cyrillic "Блогот на Vertex".

### 28. Blog post back-link phrasing
- Translated as "Назад до сите објави" (full phrase). Could shorten to just "Назад" if mobile layout becomes cramped on long post titles. Currently fits fine at tested breakpoints.

### 29. Node ICU locale fallback still affects /mk blog dates
- Dates on `/mk/blog` cards and `/mk/blog/[slug]` posts render in English format ("March 14, 2026") because Node 20 on this Windows runtime ships a limited ICU that falls back to EN for mk-MK month names. Both server and client agree (no hydration mismatch).
- Fix options: ship with `full-icu` npm package, or build a small custom formatter that looks up translated month names from a `blog.months.*` dictionary. Deferred to Phase 15F.

### 30. Team member names stay Latin on /mk/about
- Goran Dinov / Lazar / Petar / Andrej all render in Latin characters on `/mk/about` TeamGrid. Consistent with `/mk/marketing` TeamShowcase from 15D. Initials under avatars (GD / L / P / A) match the Latin-name spelling — switching to Cyrillic names would require changing initials too.

## Phase 15F additions (blog posts + final SEO)

### 15F-A. "tribal knowledge" → "племенско знаење"
- Used in Post 1 section intro. Direct calque of the English idiom. Understood in MK tech writing but rare — native speakers may prefer "неформално знаење" (informal knowledge) or "неписано знаење" (unwritten knowledge).
- Kept "племенско знаење" because it preserves the English source's slight bluntness. Flagged for Goran's review.

### 15F-B. "Memory breaks, systems do not." → "Меморијата пропаѓа, системите не."
- Punchy short sentence that closes section 3 of Post 1. Rhythm matters — the EN is 4 + 4 syllables with parallel subjects.
- Alt: "Меморијата се крши, системите не." ("breaks" → "crumbles/cracks") slightly sharper. "пропаѓа" ("fails/collapses") reads warmer.

### 15F-C. "Busy is not the same as productive." → "Зафатено не е исто што и продуктивно."
- Safe translation, ~same rhythm. Alternative "Не секој зафатен е и продуктивен" ("Not every busy person is productive") is more idiomatic but changes structure.

### 15F-D. Blog post authorRole translations
- Goran: "Сопственик и директор, Vertex Consulting" (matches the About-page TeamGrid role for him).
- Lazar: "Веб развој и AI, Vertex Marketing" (matches the Marketing landing TeamShowcase role).
- Consistency locked — if Goran renames either role, update all occurrences: `blog.ts` (both locales) + `about.team.members.*.role` + `marketing.landing.team.members.*.role`.

### 15F-E. Inline blog post link labels
- Post 1: `[услуга Преструктуирање на процеси](/consulting/workflow-restructuring)` — MK label is longer than EN ("Workflow Restructuring service"). Fits in flow.
- Post 2: `[нашата услуга Веб дизајн](/marketing/web-design)` — same pattern. The possessive "нашата" feels natural in MK introductions to a service.
- Post 3: `[услуга AI консалтинг](/consulting/ai-consulting)` + `[AI развој](/marketing/ai-development)` — both match the nav-dropdown service names verbatim (convention #13 from 15C/15D).

### 15F-F. Blog tag translations
- `["процеси", "операции", "консалтинг"]` for Post 1.
- `["веб дизајн", "маркетинг", "перформанси"]` for Post 2.
- `["AI", "технологија", "стратегија"]` for Post 3. `AI` stays Latin per convention #19.

### 15F-G. Not-found ("notFound") namespace
- Title: "Страницата не е пронајдена" / "Page not found"
- Description: "Страницата што ја барате не постои — или е преместена." / "The page you're looking for doesn't exist — or has moved."
- CTA: "Назад на почетната" / "Back to home" — same phrasing as Thank-you page CTA for consistency.

## Conventions locked during this phase

- "Струмица" (not "Strumica") when written in Macedonian body copy. Site address in footer (from `siteConfig`) still reads "Strumica" because `siteConfig` is single-source — decide later whether to split `siteConfig.address` per locale.
- Brand names "Vertex Consulting", "Vertex Marketing", "VERTEX" (logo wordmark) stay in Latin everywhere, including MK pages.
- Proper names "Goran Dinov" / "Lazar" / "Petar" / "Andrej" stay in Latin (in /mk/about TeamGrid they currently render in Latin; team bios will be translated in Phase 15E, names stay Latin).
- Numbers stay as Arabic numerals (8+, 50+, 100%, 2018-2026). No Cyrillic numerals anywhere.
- Service product names (translation keys under `nav.dropdown.*`): "Бизнис консалтинг" / "Преструктуирање на процеси" / "IT и системи" / "AI консалтинг" / "Веб дизајн" / "Социјални медиуми" / "IT инфраструктура" / "AI развој". The "IT" and "AI" prefixes stay Latin per Macedonian tech-writing convention. **Phase 15C must use these exact strings in consulting-page titles so the nav dropdown, homepage services grid, and service-page hero all match word-for-word.**
