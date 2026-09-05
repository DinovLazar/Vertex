# Session — FK Belasica Archive went live (2026-09-05)

## What happened

The archive was **presented on 30 August 2026** by Ace Stojanov, the author of the research and
of the club book behind it, to FK Belasica's president, to former and current players and to
invited guests. `www.belasicahistory.mk` now serves the real archive instead of the single static
„СТРАНИЦАТА Е ВО ИЗРАБОТКА" holding page it had carried since 20 August.

Two files had been carrying the same four-item list since then, both saying to do all of it
together on the launch date: `session-trajanov-replaces-northgate_2026-08-20.md` §Pending (Part 2)
and `19_phase-19-project-case-studies.md`. This session did the four.

## The four changes

**1. `messages/{en,mk}.json` → `projects.items.fk-belasica-archive` rewritten.**
The card `description` lost its launch-date clause („Најавната страница е во живо пред промоцијата
на архивата на 30 август 2026") and gained the archive's real size. All three case-study sections
were rewritten: *The brief* now names Stojanov and what he had been gathering, *The build* describes
the archive that exists rather than one being built, and *What it changed* replaces the placeholder
line "To be written after the archive opens on 30 August 2026." with the presentation and what the
archive changed. First sentence of the description is still the client's own line („сезони, легенди,
фотографии и резултати собрани на едно место"), and „Неофицијална" survives untouched, per PR-K.

**2. The optional `statusNote` key was deleted in both locales.**
`projects/[slug]/page.tsx` renders it as `caseStudy.statusNote && (…)`, so removing the key removes
the bordered panel above the first section with no code change. No project carries a `statusNote`
now; `ProjectCaseStudy` still declares it optional and the renderer still guards on it, so the next
project that ships mid-build can use it. The dashed "Coming soon" fallback branch is likewise
untouched and still unreachable (all five projects have a `caseStudy`).

**3. `public/projects/belasica.png` re-captured.**
`node scripts/capture-projects.mjs belasica`, unchanged spec (viewport 1280×720 @ 2× DPR →
2560×1440, above-the-fold, `reducedMotion: 'reduce'`). The shot is now the archive's navy header
(ПОЧЕТНА / АРХИВА / ЛЕГЕНДИ / СТАТИСТИКА / РАЗНО / ЗА НАС / КОНТАКТ), a full-bleed historical squad
photograph, three club crests and the „НЕОФИЦИЈАЛНА АРХИВА" strap. 2.8 MB against the holding
page's 0.05 MB, and deliberately **not** palette-quantized: the old file was a flat-colour page,
this one is a photograph. The script's `belasica` target comment no longer describes a holding page.

**4. `fk-belasica-archive` moved from last to first in `src/config/projects.ts`.**
The entry had been appended last on 2026-08-20 in explicit deviation from the file's documented
NEWEST FIRST rule, because `slice(0, 3)` feeds the homepage and `/marketing` and leading those with
a coming-soon screenshot would have been a downgrade. That reason is gone, so the deviation is gone.
**The homepage and `/marketing` top three are now Belasica / IQ UP! / Sunset**; Dalibor Plečić drops
off those two strips and still appears on `/projects` and `/lazar`, which render the full list. The
old comment explaining the deviation is replaced by one explaining the promotion.

## The numbers in the copy are counted, not estimated

Queried from the archive's own Sanity dataset (project `f8rmnfry`, dataset `production`):

| Figure | Count | Written as |
|---|---|---|
| `season` documents | 96 | "96 seasons" / „96 сезони" |
| `person` documents | 249 | "249 players and club figures" / „249 играчи и клупски работници" |
| `photo` documents | 1,117 | "more than 1,100 photographs" / „над 1.100 фотографии" |
| `clubRecord` documents | 30 | "30 club records" / „30 клупски рекорди" |

Season `decade` values run 1920 through 2020; titles run from „Беласица 1922-1926" to
„Сезона 2025/26". Several entries cover a span rather than one season, which is why the MK copy
says „записи за сезони" and not „сезони" alone. **Re-count before quoting these again** — the
archive keeps growing, which is the point the copy makes.

## Decisions

- **The presentation date is asserted as 30 August 2026**, the date the holding page announced. It
  appears once per locale, in the first paragraph of "What it changed" / „Што се промени". Logged as
  `TRANSLATION_NOTES.md` §PR-M so it is easy to correct in one place if the event moved.
- **Ace Stojanov is named**, in both locales (`Аце Стојанов` transliterated in MK, matching
  `Трајанов` / `Далибор Плечиќ`). His own „За нас" page says he is the author and editor of the
  archive, the Facebook profile and the club book, so this is his public role, not an inference. The
  copy makes no claim that the club endorses the archive.
- **`Sanity CMS` is named in *The build*.** Same treatment as the Dalibor Plečić write-up, and it
  carries the point the section is making: the archive is added to without touching code.
- **No `statusNote` replacement.** A "presented on…" note above the write-up would duplicate the
  first line of "What it changed" and would itself go stale.
- **No em dashes** in any of the new copy, per the 2026-08-22 sweep. Asserted programmatically
  before the strings were written.

## Verification

- `npx tsc --noEmit` clean · `npm run lint` clean · `npm run build` clean, same page count as before
  (no route added or removed).
- `messages/en.json` / `messages/mk.json` round-trip byte-identical under `json.dumps(indent=2)`,
  so the diff is only the Belasica object (15 lines each) and key order is unchanged.
- EN + MK key parity on the rewritten object, and equal section/paragraph counts per locale.
- `/en/projects/fk-belasica-archive` and `/mk/projects/fk-belasica-archive` render three sections
  and **no** status-note panel; `/en/projects` and `/mk/projects` still render five cards with
  Belasica first; the homepage and `/marketing` strips lead with Belasica.
- Screenshot verified at 2560×1440 and visually confirmed to be the archive, not the holding page.
- No `30 August 2026` / `30 август 2026` strings left in `messages/` other than the deliberate
  presentation sentence.

## Gotcha for the next capture run

`npx playwright install chromium` downloaded the browser but it would not launch: the host was
missing `libXdamage.so.1`, and Playwright's advice (`sudo npx playwright install-deps`) is
unavailable without root. Fix without root:

```
mkdir -p ~/xdeps && cd ~/xdeps
apt-get download libxdamage1 && dpkg-deb -x libxdamage1_*.deb root
export LD_LIBRARY_PATH="$HOME/xdeps/root/usr/lib/aarch64-linux-gnu:$LD_LIBRARY_PATH"
```

Then `node scripts/capture-projects.mjs belasica` runs normally. Recorded in `file-map.md` on the
`capture-projects.mjs` row as well.

## Still pending, unchanged by this session

- **Native-speaker MK pass.** The new Belasica copy is LLM-drafted like the rest of `messages/mk.json`
  and joins the same queue. §PR-L flags two phrases worth a second opinion („клупски работници",
  „записи за сезони").
- **`daliborac.png` / `trajanov.png` re-captures** when those clients' real content ships.
