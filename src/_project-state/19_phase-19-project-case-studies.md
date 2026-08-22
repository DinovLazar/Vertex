# Phase 19 — Project case studies (2026-08-22)

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

## ⚠️ Conflict with the em-dash sweep — flagged, not resolved

**The commit immediately before this one (`14ea8aa`, 2026-08-22) removed every
em dash from all site copy. This phase's copy reintroduces 89 of them into
`messages/{en,mk}.json`** (40 EN + 49 MK) — every em dash now in either file is
inside `projects.items.*.caseStudy`; nothing else regressed.

This was done deliberately: the phase brief states the copy is final and must be
inserted verbatim, with only technical transformations permitted, which the
sweep's rewrite rules are not. The two instructions genuinely conflict and the
newer, more specific one won.

**The site is no longer em-dash-free.** If the zero-dash rule is the standing
policy, the case-study copy needs a rewrite pass under the sweep's own rules
(colon / comma / full stop / parentheses / restructure — see
`session-em-dash-sweep_2026-08-22.md`), which is a copy decision, not a code one.
The regression guards on the two AI writers (`chatWidget.ts`,
`contentGenerator/buildPrompt.ts`) are untouched and still hold.

## Files changed
| File | What |
|---|---|
| `messages/en.json` | `projects.items.<slug>.caseStudy` added for all 5 projects (+ `statusNote` on `fk-belasica-archive`). Nothing else touched. |
| `messages/mk.json` | Same 5, MK copy. MK quotations use `„ ”`; `'рбетот` keeps its apostrophe. |
| `src/types/index.ts` | New `ProjectCaseStudy` type, documented, placed after `ContentSection` which it reuses. |
| `src/app/[locale]/(site)/projects/[slug]/page.tsx` | Reads + renders `caseStudy`; keeps the "Coming soon" branch as fallback; `AnimateIn amount={0}`; header doc comment rewritten (▼ SLOT 1 is gone, ▼ SLOT 2 / gallery remains). |
| `src/app/globals.css` | `.prose-flush-top` modifier (3 lines + why-it-cannot-be-a-utility comment), placed just above the Session C accessibility block. |

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
