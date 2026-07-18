# Session — Project Backlinks to Client-Owned Domains (2026-07-18)

## What this session did
Re-pointed two "Our Work" project cards from interim hosting URLs to the clients'
own domains, and realigned the screenshot-capture script's targets to match. This
also **fixes a dead link** — the previous Sunset URL (`*.vercel.app`) now 404s.

## What changed (exact scope)
- `src/config/projects.ts` — two `href` values updated (see mapping below)
- `src/config/lazar.ts` — the **same** two projects on the `/lazar` "Selected work" grid
  repointed to the identical new domains (they reuse the same live URLs), so the two
  surfaces stay consistent and neither links to the dead `*.vercel.app` URL
- `scripts/capture-projects.mjs` — `TARGETS` for `sunset` + `daliborac` repointed to
  the same two domains, so a future re-capture hits the live sites (the script's own
  header documents the invariant "capture the exact page the card links to")
- Docs: `current-state.md` (changelog note + `Last updated`), `file-map.md`
  (`projects.ts`, `capture-projects.mjs`, `sunset.png`, `daliborac.png` entries), this file

Nothing else. **No component change** — `ProjectsShowcase.tsx` already renders every
`href` as `<a target="_blank" rel="noopener noreferrer">`, so the wiring was untouched.
**No screenshot re-capture** — the sites moved domains, they weren't redesigned, so the
existing `public/projects/*.png` binaries are left as-is (see follow-up).

## URL mapping
| Card | Old `href` | New `href` |
|------|-----------|-----------|
| Sunset Services | `https://sunsetservices.vercel.app/` | `https://sunsetservices.us` |
| Dalibor Plečić — Author | `https://daliborac.vertexconsulting.mk/mk` | `https://daliborplecic.com` |

> "baliborplecic.com" in the request was a typo (b→d) for **daliborplecic.com** — the
> author is **D**alibor Plečić. Confirmed: `baliborplecic.com` does not resolve (curl
> `000`); `daliborplecic.com` returns 200. The bare domains resolve via redirect to
> `www.sunsetservices.us/` and `www.daliborplecic.com/en` respectively; linking to the
> bare root keeps the card locale-agnostic and avoids hardcoding a language path.

## Verification performed
- `curl -sI -L` on both destinations → **200** (`sunsetservices.us`, `daliborplecic.com`);
  old `sunsetservices.vercel.app` confirmed **404** (dead), justifying the swap
- Dev server (`vertex-dev`, :3000) `/en` `#work` section — read the live DOM: both cards
  now emit the new hrefs with `target="_blank"` + `rel="noopener noreferrer"` and the
  correct `aria-label`s. `iqup` card unchanged, as expected.
- `/en/lazar` "Selected work" — read the live DOM: the two client links now resolve to
  `https://sunsetservices.us/` + `https://daliborplecic.com/`, with zero stale
  `*.vercel.app` / `daliborac.*` URLs remaining anywhere on the page.

## Follow-ups / notes for the next session
- **Screenshots not re-captured.** `sunset.png` / `daliborac.png` still show the sites as
  captured on 2026-07-12 from the old URLs. Because the clients moved domains rather than
  redesigning, these are expected to still be visually accurate. If either moved site
  differs, refresh with a single command (the `TARGETS` already point at the new domains):
  ```bash
  node scripts/capture-projects.mjs
  ```
- No open threads. Both surfaces that link these two clients (`projects.ts` → homepage
  "Our Work", `lazar.ts` → `/lazar` "Selected work") now backlink to the client-owned
  domains; `capture-projects.mjs` targets match. The only client link left on an interim
  host is **Northgate Dental** (`northgate.optimind000.com`), which is intentional — that
  client has no separate own-domain site and was out of this request's scope.
