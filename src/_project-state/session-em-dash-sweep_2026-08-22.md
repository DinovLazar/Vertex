# Session — Em-dash sweep across all site copy (2026-08-22)

## What was asked
"Remove most em dashes from text on the website."

## What IS now

**Every public route renders zero em dashes except one deliberate keeper.** Verified by curling all 36 locale routes (18 paths × en/mk) against `npm run dev` and counting `—` in the served HTML: every route returns 0 except `/en` and `/mk`, which return exactly 1 — the attribution mark in front of the homepage pull quote (`SocialProof.tsx:121`), which is standard typography for a quote credit and is the "most" the request left room for. The newsletter welcome email keeps the same convention on its `— Goran Dinov` sign-off.

### Counts
| Surface | Before | After |
|---|---|---|
| `messages/en.json` | 119 | 0 |
| `messages/mk.json` | 127 | 0 |
| Source files (user-facing strings/JSX) | 58 | 1 (`SocialProof` attribution mark) |

Everything still containing `—` under `src/` is a **code comment, a `console.*`/log string, a Sanity Studio label, or an `/admin` label** — none of it reaches a visitor. Those were left alone on purpose.

### How each dash was replaced
Not a blanket `s/—/,/`. Each of the ~300 instances was rewritten by hand into whichever mark the sentence actually wanted:
- **Colon** where the dash introduced a list or a restatement: `"Two divisions, one mission: your growth."`, `"Task delegation: who does what, when, and how they know it is done"`, `"IT infrastructure for Macedonian businesses: hosting, business email, DNS…"`.
- **Comma** for appositives and trailing qualifiers: `"…fix it with your team, not just a report."`, `"…что носат вистински резултати, претворајќи посетители во клиенти."`
- **Full stop** where both halves were independent clauses (a comma there would have been a splice): `"We don't just advise. We roll up our sleeves…"`, `"Most companies do not have broken workflows. They have workflows that were never designed in the first place."`
- **Parentheses** for the paired/parenthetical dashes: `"…modern technologies (Next.js, React, Tailwind CSS) because templates limit…"`, `"…community interactions (comments, messages, and mentions) to keep…"`
- **Restructured** where no mark fit: `"Not templates — custom builds."` → `"Custom builds, not templates."`; MK `"проблемот не се луѓето — системот во кој работат е тој што не чини."` → `"проблемот не се луѓето, туку системот во кој работат."`
- **Meta titles** took a colon so the `%s | Vertex` template still reads cleanly: `"About Us: Founded 2018 in Strumica | Vertex"`, `"Contact: Strumica, North Macedonia"`, `"Blog: Business, Marketing & AI Insights"`, `"Lazar Dinov: Portfolio"`.
- **Select option** followed its siblings' parenthetical style: `"Both — I need help with both"` → `"Both (I need help with both)"` (siblings are `"Vertex Consulting (business consulting)"`).

### Bug fixed on the way
`SocialProof.tsx:121` renders `— {t('quote.attribution')}`, and both message files stored the attribution **with its own leading dash** (`"— Goran Dinov, Founder & Director"`). The homepage was therefore shipping **`— — Goran Dinov, Founder & Director`**. The dash now lives only in the component; the message value is the bare name and role.

### Term/description bullets changed shape
`ConsultingServicePage.tsx` and `MarketingServicePage.tsx` rendered `<strong>{bullet.term}</strong> — {bullet.description}`. Both now render `<strong>{bullet.term}:</strong> {bullet.description}`. 24 bullets across the service pages use the `term` field. `/llms-full.txt` already emitted `Term: description` for the same data (`route.ts:60`), so the two surfaces are now consistent; the stale comment at `route.ts:25` describing the old `**Term** — description` shape was corrected.

### Regression guard — the two AI writers
Both prompts that generate *published* site text were de-dashed (so the model has no in-context examples to imitate) **and** given an explicit rule:
- `src/lib/chatWidget.ts` — new BEHAVIOR RULE 9: *"Never use em dashes (—). Use a comma, a colon, or a separate sentence instead. This applies in both English and Macedonian."*
- `src/lib/contentGenerator/buildPrompt.ts` — new bullet under Concrete rules covering the post body, title, excerpt, meta description and both social captions, in both languages. The three reference passages, the Facebook tone example and the Instagram sign-off line (`"Повеќе на vertexconsulting.mk, линкот е во био."`) were rewritten dash-free; `toolSchema.ts` carries the same sign-off, updated to match.

Without this, `/admin/generate` would have re-seeded em dashes into the blog on the next run.

## Worked on a stale clone — rebased before pushing
The sweep was written against `4a572a9`, which turned out to be **ten commits behind `origin/main`**: the a11y/WCAG 2.2 remediation, the VERTEX brand mark, the light-mode rebuild, the `/projects` section, the Trajanov + FK Belasica project entries and a fourth blog post had all landed remotely. The push was rejected non-fast-forward, so the commit was replayed onto the current tip. Six files conflicted (`messages/{en,mk}.json`, `src/config/{projects,lazar}.ts`, `current-state.md`, `TRANSLATION_NOTES.md`); each took the **upstream** side and the sweep was re-run over it, which is also what caught the new copy:
- The `/projects` grid and detail pages had added **six more dashes per locale** (`projects.description`, `projects.subtitle`, `caseStudyBody` with a paired pair, and the Trajanov + FK Belasica card descriptions). All rewritten under the same rules.
- `viewProjectAria` had been renamed and rewritten upstream; the dash now lives in `visitSiteAria`, fixed to `"Open the live {name} website (opens in a new tab)"` / `"…{name} (се отвора во нов прозорец)"`.
- Two new code-built strings were swept: the `/projects/[slug]` meta title (`` `${project.name}: ${label}` ``, was ` — `) and the project line in `/llms.txt` (`route.ts:55`).
- `src/config/projects.ts` was re-patched for `"Dalibor Plečić, Author"`; `src/config/lazar.ts` no longer carries that entry after the upstream refactor, so it needed nothing.

## Files changed
`messages/en.json`, `messages/mk.json`, `src/app/[locale]/(site)/privacy/page.tsx`, `src/app/api/newsletter/route.ts`, `src/app/layout.tsx`, `src/app/llms-full.txt/route.ts`, `src/app/not-found.tsx`, `src/app/opengraph-image.tsx`, `src/components/sections/ConsultingServicePage.tsx`, `src/components/sections/ContactForm.tsx`, `src/components/sections/MarketingServicePage.tsx`, `src/config/projects.ts`, `src/app/llms.txt/route.ts`, `src/app/[locale]/(site)/projects/[slug]/page.tsx`, `src/lib/chatWidget.ts`, `src/lib/contentGenerator/buildPrompt.ts`, `src/lib/contentGenerator/toolSchema.ts`, `src/lib/metadata.ts`, `src/lib/schema.ts`. No files added or removed, so `file-map.md` needs no new entries.

## Verification
- `npm run lint` — clean.
- `npm run build` — succeeds; every `(site)` route still SSG, route table unchanged.
- EN/MK key parity re-checked after editing: identical key sets, both files valid JSON.
- Dev-server sweep of all 40 routes: 0 em dashes everywhere except the single homepage attribution mark.
- `/en/consulting/ai-consulting` DOM check: bullets read `"Document processing: automating data extraction from invoices, contracts, and forms"`. No console errors.

## Not done — needs env this machine does not have
**Published blog posts in Sanity were not audited.** There is no `.env.local` here, and the Sanity MCP session only exposes an unrelated project (`f8rmnfry` / "belasica"), not the Vertex dataset. Any em dashes inside existing post bodies, titles, excerpts or meta descriptions are still live at `/en/blog/*` and `/mk/blog/*`. That is a content edit in Studio, not a code change. From here it is one GROQ pass over `post` documents plus a Portable Text rewrite; the generator will no longer add new ones.
