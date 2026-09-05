# Session — Trajanov replaces Northgate Dental; FK Belasica Archive added (2026-08-20)

**Ask (two parts, the second mid-session):** "on the work page replace northgate dental with
trajanovv (www.trajanovv.com) — take a screenshot for the photo and read the website for the text",
then "also add www.belasicahistory.mk FK Belasica Archive".

## Why the swap was already overdue

Earlier the same day, `northgate.optimind000.com` was found to be NXDOMAIN (the apex
`optimind000.com` still resolves; the `northgate` subdomain does not). The card had been left in
`src/config/projects.ts` with `href: null`, which hides the "Visit live site" button and the
"Live site" row — a project card with a screenshot of a site nobody can reach. Trajanov is live,
is Vertex-built (its own header reads "Built by Vertex Consulting"), and takes the slot.

## The client, from reading the site

- **Trajanov** — a clothing brand from Strumica, founded 2026. One person: **Vladimir Trajanov**,
  founder and designer, a student at SOU "Nikola Karev" training as a clothing-design technician.
- Product: oversized unisex t-shirts, sold in **drops of 3–5 pieces** with real limited stock.
  Shipping within North Macedonia only, **cash on delivery**.
- In June 2026 he won **first place** in a national t-shirt design competition for secondary-school
  students from North Macedonia's fashion and textile schools (organised by Kreativen den,
  Božilović produkcija, SOU "Taki Daskalo" and the Štip textile company EAM). Prize: 30 t-shirts
  made with his design plus a factory visit. Covered by Трн.мк, Струмица Денес, Бизнис Вести,
  Cultural Chat and Република, 11–12 June 2026.
- The site itself: Next.js on Vercel, bilingual (**MK at the root — `lang="mk"` — EN at `/en`**,
  hreflang `x-default` = MK), catalog + product pages + cart + FAQ + terms/privacy/shipping-returns.
  The apex **308s to `www`**; the root language-negotiates off `Accept-Language`.

That reading is what the two new translated strings are built from — an online store, not a
brochure site, which is why the label is new rather than recycled.

## Changes

| File | Change |
| --- | --- |
| `src/config/projects.ts` | `northgate-dental` entry → `trajanov` (`name: "Trajanov"`, `image: "/projects/trajanov.png"`, `href: "https://www.trajanovv.com"`), swapped **in place**. |
| `messages/en.json` | `projects.items.northgate-dental` → `projects.items.trajanov` — "Website & Online Store" + one-sentence description. |
| `messages/mk.json` | Same key swap — „Веб-страница и онлајн продавница" + description. Rationale logged in `TRANSLATION_NOTES.md` §PR-H / §PR-I. |
| `public/projects/trajanov.png` | New, 2560×1440. |
| `public/projects/northgate.png` | Deleted (`git rm`). |
| `scripts/capture-projects.mjs` | Target swapped to `https://www.trajanovv.com/en`; **new optional slug filter** — `node scripts/capture-projects.mjs trajanov` captures one site instead of re-hitting all four (unknown slug → exit 1 with the known list). Stale "All 3 screenshots captured." message now counts what actually ran. |
| `next.config.ts` | Two new `redirects()` entries for the retired `/projects/northgate-dental`. |
| `TRANSLATION_NOTES.md` | New section for the Trajanov card. |

### Decisions worth keeping

- **In place, not first.** `projects.ts` is ordered NEWEST FIRST and the homepage + `/marketing`
  render `projects.slice(0, 3)`. Putting Trajanov first would have silently pushed IQ UP! off both
  strips — a change nobody asked for. It sits in Northgate's old 4th slot, so `/projects` and
  `/lazar` show all four and the top-three strips are untouched. Moving it to the front is a
  one-line change if that is wanted.
- **`href` is the bare `https://www.trajanovv.com`.** The apex 308s to `www` (so `www` is the
  canonical host, exactly as with vertexconsulting.mk) and the root negotiates locale, so a
  Macedonian visitor lands on MK and an English one on EN. Linking `/en` would have forced English
  on everyone.
- **The capture is pinned to `/en`**, because a screenshot that depends on the capture machine's
  `Accept-Language` is not reproducible. This also matches the old Northgate target (`/en`).
- **The retired URL redirects rather than 404s.** `/projects/northgate-dental` was in `sitemap.xml`
  and had a real page, so it is indexable; it now 308s to `/:locale/projects` (plus an unprefixed
  variant → `/en/projects`), following the existing legacy-OptiMind pattern in the same block.
  Redirects are baked in at build time — `npm run build` is required for them to take effect.
- **No `/lazar` edit was needed.** `lazarProjects` derives from `projects.ts`, and `LazarWork.tsx`
  reads copy by slug from `projects.items.*`, so the "Selected work" grid picked the swap up for
  free. (This is exactly the drift the 2026-08-20 derivation change was meant to prevent.)

## Verification

- `/en/projects` + `/mk/projects` — 4 cards, "4 PROJECTS" count, Trajanov card renders with the
  screenshot, label and description.
- `/en/projects/trajanov` — detail page 200; `_next/image?url=/projects/trajanov.png` 200; "At a
  glance" shows Marketing / Website & Online Store / trajanovv.com; prev = Dalibor, next = IQ UP!.
- `/mk/projects/northgate-dental` → 308 → MK projects grid ("Нашата работа | Vertex").
- `sitemap.xml` lists `projects/{iq-up,sunset-services,dalibor-plecic,trajanov}` and no longer
  lists `northgate-dental`; `llms.txt` carries the new entry with the live URL.
- Browser console and dev-server logs clean on both pages.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean — build prerenders 8
  `/[locale]/projects/[slug]` paths (4 projects × 2 locales).

## Pending

- **Re-capture `trajanov.png` when real product content ships.** trajanovv.com's `/catalog` and
  product pages currently carry an explicit "Design-system preview… product data is placeholder"
  notice and `[PLACEHOLDER: product photo — Vladimir]` slots. The *hero* capture is clean real
  photography, so the card is fine today, but this is the same class of pending item as
  `public/projects/daliborac.png`. Re-run with `node scripts/capture-projects.mjs trajanov`.
- The MK strings are LLM-drafted and want Lazar's native-speaker pass — in particular „спуштања"
  vs „дропови" for *drops* (see `TRANSLATION_NOTES.md` §PR-I).
- A case study for `/projects/trajanov` still renders the shared "coming soon" panel, same as
  every other project.

---

# Part 2 — FK Belasica Archive added as a 5th project

## The client, from reading the site

- **FK Belasica Archive** ([www.belasicahistory.mk](https://www.belasicahistory.mk)) — an
  **unofficial** digital archive of ФК Беласица, the Strumica football club founded in 1922
  (the crest on the page reads „ФК БЕЛАСИЦА · СТРУМИЦА · 1922"). Planned contents, in the site's own
  words: seasons, legends, photographs and results gathered in one place.
- **What is live today is a holding page, not the archive.** One static MK-only HTML page on Vercel
  (no `_next`, no locale routing, Google-Fonts Oswald + Golos Text with a Cyrillic subset): crest,
  „СТРАНИЦАТА Е ВО ИЗРАБОТКА", one paragraph, „ПРОМОЦИЈА НА 30 АВГУСТ 2026", and
  `info@belasicahistory.mk`. The apex 308s to `www`. OG tags are set (`og:locale mk_MK`,
  `og:image` = the crest).

## Changes

| File | Change |
| --- | --- |
| `src/config/projects.ts` | New 5th entry: slug `fk-belasica-archive`, name "FK Belasica Archive", division `marketing`, `image: "/projects/belasica.png"`, `href: "https://www.belasicahistory.mk"`. |
| `messages/{en,mk}.json` | `projects.items.fk-belasica-archive` — "Digital Archive" / „Дигитална архива" + description. See `TRANSLATION_NOTES.md` §PR-J / §PR-K. |
| `public/projects/belasica.png` | New, 2560×1440 — the holding page. |
| `scripts/capture-projects.mjs` | 5th target, with a comment saying to re-capture after the 30 Aug 2026 launch. |

### Decision: last, not first

`projects` is documented NEWEST FIRST and the homepage + `/marketing` render `slice(0, 3)`. Belasica
is the newest build, but its live site is a coming-soon page — putting it first would replace
Dalibor on those strips with a card whose screenshot says "under construction". It is appended last,
where `/projects` and `/lazar` still show it in full, and the config comment says in as many words
to move it to the top when the archive ships. That deviation from strict recency is deliberate and
documented rather than silent.

## Verification (Part 2)

- `/en/projects` renders "5 projects" and the FK Belasica Archive card (`belasica.png`,
  "Digital Archive"); `/mk/projects` renders „Дигитална архива".
- `/en/projects/fk-belasica-archive` → 200; `sitemap.xml` lists all five slugs; `llms.txt` carries
  the new entry with its live URL.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` clean — 10 prerendered
  `/[locale]/projects/[slug]` paths (5 × 2 locales).

## Pending (Part 2)

- ~~**On 30 August 2026, do all three together:** move `fk-belasica-archive` to the top of `projects`,
  re-capture (`node scripts/capture-projects.mjs belasica`), and rewrite both card descriptions —
  they name the launch date and go stale on it.~~ **DONE 2026-09-05**, all three plus the case-study
  rewrite and the `statusNote` deletion. See `session-belasica-archive-live_2026-09-05.md`.
- MK copy is LLM-drafted; wants Lazar's pass. „Неофицијална" must survive that pass — the archive is
  a fan project, not a club product.
