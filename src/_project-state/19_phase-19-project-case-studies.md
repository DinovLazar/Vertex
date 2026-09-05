# Phase 19 — Project case studies (2026-08-22)

> **Superseded for FK Belasica (2026-09-05).** The archive was presented on 30 August 2026, so the
> deliberately incomplete parts this phase shipped for `fk-belasica-archive` are gone: the
> `statusNote` key is deleted in both locales, and all three sections are rewritten for a live
> archive. Everything else in this document still describes what is. See
> `session-belasica-archive-live_2026-09-05.md`.

Replaces the "Coming soon" case-study placeholder on all five `/projects/<slug>`
detail pages with the finished bilingual write-ups. This closes the last big
content gap in the Work section.

## What was asked
Ship the final EN + MK case-study copy (supplied verbatim, "do not rewrite") as
three headed sections per project — **The brief / The build / What it changed**
(EN), **Задачата / Изградбата / Што се промени** (MK) — plus a visible status
note on FK Belasica only. Everything else on the detail page (hero, At a Glance,
prev/next, CTA, JSON-LD, listing cards) explicitly out of scope.

## What IS now

**All ten case-study URLs render the three sections in their own locale.**
`/en/projects/{iq-up, sunset-services, dalibor-plecic, trajanov,
fk-belasica-archive}` and the same five under `/mk/`. The dashed "Coming soon"
panel renders on none of them, and its code path is still there as the fallback.

### Storage — extended the existing mechanism, no new one
Per-locale case-study content lives in `messages/{en,mk}.json` under the
namespace the projects section already owns:

```
projects.items.<slug>.caseStudy = {
  statusNote?: string           // FK Belasica only
  sections: ContentSection[]    // exactly 3, heading + paragraphs
}
```

`caseStudy` sits alongside the `label` / `description` that were already there,
so a project is still "one config entry + its translated strings". Section
headings are stored **with** the content (each `ContentSection` already carries
its own `heading`) rather than as separate message keys — that is how the
service pages do it, and it keeps a project's whole write-up in one object.

`ContentSection` is reused verbatim from `src/types/index.ts`, which is what
lets the write-up render through the same `.prose-marketing` shape the eight
service pages use. The new type is a four-line alias:

```ts
export type ProjectCaseStudy = {
  statusNote?: string
  sections: ContentSection[]
}
```

### Rendering
`src/app/[locale]/(site)/projects/[slug]/page.tsx`, still a server component.
The write-up is read with `t.raw()`, guarded by `t.has()`:

```ts
const caseStudy = t.has(`items.${slug}.caseStudy`)
  ? (t.raw(`items.${slug}.caseStudy`) as ProjectCaseStudy)
  : null
```

`t.has()` is what keeps the fallback honest — it is a per-locale check, so a
project could ship its EN write-up before its MK one and each locale would
degrade independently (verified, see below).

- **`caseStudy` present** → optional status note, then the three sections inside
  a `.prose-marketing .prose-flush-top` wrapper. Section headings are the page's
  `<h2>`s.
- **`caseStudy` absent** → the original dashed-border panel with its own
  "Case study" `<h2>` and the `Coming soon` chip. Untouched.

### Heading outline
`h1` (project name) → `h2` × 3 (the case-study sections) → `h2` ("At a glance")
→ `h2` (CTA). Measured `1,2,2,2,2,2` on every one of the ten pages, no skipped
levels — the generic "Case study" `<h2>` is dropped when a real write-up exists,
because it would otherwise sit at the same level as its own sections. It stays
in the fallback branch, where it is the only heading.

## Three things that needed deciding

**1. The `AnimateIn` threshold trap — this was a real bug, caught in review.**
The first build shipped the case study inside a bare `<AnimateIn>`. Its default
`amount = 0.2` is an IntersectionObserver threshold, and a full case study is
~1200px tall against a 720px viewport, so **the threshold is mathematically
unreachable and the entire write-up stayed at `opacity: 0` forever.** This is
the exact failure `ConsultingServicePage` / `MarketingServicePage` already carry
a comment about. Fixed with `<AnimateIn amount={0}>` plus a comment pointing at
the precedent. Now verified at 1280×720 **and** 390×640.

*Lesson for the next phase: any `AnimateIn` wrapping long-form prose needs
`amount={0}`. There is no lint rule for this; it fails silently and invisibly.*

**2. `.prose-flush-top` had to go in `globals.css`, not a Tailwind variant.**
The case-study column sits in a grid row beside the "At a glance" card, and
`.prose-marketing h2 { margin-top: 2.5rem }` pushed the first heading 2.5rem
below the card's top edge. The obvious fix — a Tailwind arbitrary variant —
**does not work**: the `.prose-*` rules in `globals.css` are unlayered, and
unlayered CSS beats anything in `@layer utilities` regardless of specificity.
So the modifier is a three-line rule next to its neighbours, with that reason
written down. Same reason the FK Belasica status note is rendered *outside* the
`.prose-marketing` wrapper: `.prose-marketing p`'s margin would beat `mb-8`.

**3. *Bunike* is not italicised.** The phase allowed italics only if the content
pattern already supported rich text. It does not — `renderInlineMarkdown` handles
`**bold**` and nothing else, and it is shared by all eight service pages, so
teaching it `*em*` for one book title would be a shared-lib change for one word.
Paragraphs still render *through* `renderInlineMarkdown`, so `**bold**` works in
case-study copy if it is ever wanted; it is simply a no-op today.

## Em-dash sweep: conflict raised, then resolved

The copy as supplied carried **89 em dashes** (40 EN + 49 MK) into files the
previous commit (`14ea8aa`) had just swept to zero. Because the brief required
verbatim insertion, the first commit (`c8c4716`) shipped them and flagged the
conflict rather than silently rewriting client-approved copy.

Goran then asked for the dashes out, so a second pass rewrote all 89 under the
**same rules the original sweep used** — not a blanket `s/—/,/`:

- **Colon** where the dash introduced a list or a restatement — *"a family
  company in Aurora, Illinois: hardscape, landscaping…"*, *"на два јазика:
  македонски и српски"*.
- **Comma** for appositives and trailing qualifiers — *"a marketing campaign
  for it, just not the usual kind"*, *"Парчињата излегуваат во спуштања, по
  неколку дизајни одеднаш"*.
- **Full stop** where both halves were independent clauses and a comma would
  have spliced — *"…built for the phone first. The assessment itself runs on a
  phone or tablet…"*, *"…навистина се уште три. Нарачките се ограничени на две
  парчиња…"*.
- **Parentheses** for the paired/parenthetical dashes — *"The practical facts
  (fifteen minutes, free, report by email) sit right next to the button"*,
  *"…(машинерија што обично им припаѓа на многу поголеми streetwear брендови)…"*.
- **Restructured** where no mark fit — *"…gets the full site: every service,
  every town, the quote flow. Not a translated brochure."*

**One rewrite is not punctuation, it is a fact-preserving restructure.** The
Sunset write-up quoted the client's own button copy, `"Get a Free Estimate —
48-Hour Response"`, with the dash *inside the quotation marks*. Swapping the
mark there would have misquoted a live site, so the sentence now describes the
CTA instead of quoting it whole: *"a "Get a Free Estimate" button promising a
48-hour response repeats from the hero to the footer"*. Same treatment in MK.
**If that CTA text ever needs to be quoted verbatim again, this is the sentence
to revisit.**

Every rewrite was written by hand as an explicit old → new pair and applied with
a script that asserted exactly one match each, so nothing was substituted
blindly. MK decisions are logged in `TRANSLATION_NOTES.md` under
*"Project case studies"* (CS-A…CS-E) for the native-speaker pass.

### Where the site stands on em dashes now
A sweep of all 46 public routes (23 paths × 2 locales, all HTTP 200) finds
**42 rendering zero**. The four that do not are **both pre-existing and neither
from this phase**:
- `/en` + `/mk` — 1 each, the homepage pull-quote attribution mark drawn by
  `SocialProof.tsx`. The deliberate keeper from the original sweep.
- `/en/blog` + `/mk/blog` — 4 each, from Sanity blog-post excerpts. Live
  production returns the same 4, confirming these predate this work. This is the
  gap `session-em-dash-sweep_2026-08-22.md` logged as "not done, needs env this
  machine does not have"; the untracked `scripts/strip-em-dashes.ts` was written
  to close it and **has still not been run** (it needs `SANITY_API_WRITE_TOKEN`).

## Files changed
| File | What |
|---|---|
| `messages/en.json` | `projects.items.<slug>.caseStudy` added for all 5 projects (+ `statusNote` on `fk-belasica-archive`). Nothing else touched. |
| `messages/mk.json` | Same 5, MK copy. MK quotations use `„ ”`; `'рбетот` keeps its apostrophe. |
| `src/types/index.ts` | New `ProjectCaseStudy` type, documented, placed after `ContentSection` which it reuses. |
| `src/app/[locale]/(site)/projects/[slug]/page.tsx` | Reads + renders `caseStudy`; keeps the "Coming soon" branch as fallback; `AnimateIn amount={0}`; header doc comment rewritten (▼ SLOT 1 is gone, ▼ SLOT 2 / gallery remains). |
| `src/app/globals.css` | `.prose-flush-top` modifier (3 lines + why-it-cannot-be-a-utility comment), placed just above the Session C accessibility block. |
| `TRANSLATION_NOTES.md` | New "Project case studies" section (CS-A…CS-E) logging the 36 MK punctuation rewrites and what to double-check in the native pass. Added in the second pass. |

No files added or deleted. `src/config/projects.ts` **not touched** — its
"case study coming soon" header comment now describes the fallback rather than
the default, which is still accurate.

## Verification — all run
- `npx tsc --noEmit` clean · `npm run lint` clean · `npm run build` clean, 71
  static pages, all 10 `/projects/[slug]` locale paths prerendered.
- **EN/MK key parity:** identical key sets, 0 keys unique to either file.
  Section counts and per-section paragraph counts match across locales
  (3/3/1, 3/4/1, 2/2/1, 2/3/1, 2/2/1).
- **Headless sweep (Playwright, 10 pages × 2 viewports = 20 checks, all pass):**
  wrapper `opacity: 1`, correct locale headings, heading levels `1,2,2,2,2,2`
  with no skips, no horizontal overflow, no `.border-dashed` placeholder, and
  Belasica's status note present above its first section. The 390×640 pass is
  the one that would have caught the `AnimateIn` bug.
- **Chrome unchanged vs production:** `h1`, the At-a-Glance `<dl>`, the prev/next
  `<nav>`, every `aria-label` and every external `href` extracted from
  `www.vertexconsulting.mk` and from the local build and diffed — byte-identical
  on all ten pages.
- **Language toggle:** clicking "Switch language" on `/en/projects/trajanov`
  lands on `/mk/projects/trajanov` with headings and body both swapped
  (`The brief…` → `Задачата…`), `h1` correctly unchanged (proper noun).
- **Fallback:** deleting `projects.items.trajanov.caseStudy` from `en.json` on
  the dev server brought back the dashed panel + "Coming soon" + the "Case study"
  `<h2>` on `/en`, while `/mk` kept its write-up. Restored; `git status` clean
  of that edit.
- **Encoding:** em dashes, `„ ”`, `ѝ` and `'рбетот` all render correctly; the
  only escaping in the served HTML is React's normal `&#x27;` / `&quot;`.
- **Em-dash sweep of all 46 public routes** (23 paths × 2 locales), all HTTP
  200: 42 render zero. The 4 that do not are the homepage attribution mark and
  the Sanity blog excerpts, both pre-existing (production returns the same
  counts). All 10 case-study pages: zero.
- **Both themes:** light mode checked through the real theme toggle (not
  `prefers-color-scheme` — the site stores an explicit preference, so media
  emulation alone does not flip it). Status-note text measures **4.95:1** on its
  surface, above the 4.5:1 AA floor.

## What the next phase should know
- **FK Belasica is deliberately incomplete.** Its "What it changed" body is the
  single line *"To be written after the archive opens on 30 August 2026."* and
  its `statusNote` says so on the page. There are **no TODO markers in code** —
  the copy itself is the marker. After 30 Aug 2026: rewrite
  `projects.items.fk-belasica-archive.caseStudy` in both locales, drop
  `statusNote`, and at the same time do the two things
  `session-trajanov-replaces-northgate_2026-08-20.md` already flagged (re-capture
  `public/projects/belasica.png`, move the entry to the top of
  `src/config/projects.ts`).
- **The MK copy joins the native-speaker review queue**, same as the rest of
  `messages/mk.json`. Roughly 1,500 words of new MK prose.
- **Adding a project now takes three translated strings, not two** — `label`,
  `description`, and optionally `caseStudy`. Omitting `caseStudy` is a supported
  state, not a broken one. The workflow comment at the top of
  `src/config/projects.ts` still describes the two required ones correctly.
- **The gallery slot (▼ SLOT 2) is still empty** and still renders nothing until
  a project's `gallery` array has entries. Untouched by this phase.
- **Phase 14 owns JSON-LD.** `buildProjectSchema` was not extended with the
  case-study body; if the write-up should feed `CreativeWork.text` or an
  `Article`, that is Phase 14's call.
