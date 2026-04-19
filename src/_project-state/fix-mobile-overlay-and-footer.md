# Fix — Mobile Hamburger Overlay + Mobile Footer Layout

Date: 2026-04-19
Type: Surgical bug-fix (not a phase). Two files, five edits, mobile-only behavior.
Scope: `src/components/global/Navbar.tsx`, `src/components/global/Footer.tsx`.

## Bug 1 — Mobile hamburger overlay clipped menu items

### What the user saw
On iPhone-sized viewports (≤ ~400px tall visible area), the top of the menu was cut off when the mobile overlay opened. The "Consulting" parent label and its first child "Business Consulting" were above the visible viewport; the list reappeared part-way down at "Workflow Restructuring". There was no way to scroll inside the overlay.

### Root cause
`src/components/global/Navbar.tsx` — the inner wrapper of the mobile-overlay `motion.div` carried:

```
flex flex-col items-center justify-center h-full gap-6 px-6
```

`h-full` filled the viewport, and `justify-center` vertically centered the list inside it. When the cumulative height of the list (Consulting + 4 sub-links + Marketing + 4 sub-links + About + Blog + Contact + CTA + language toggle) exceeded the viewport, the overflow was clipped equally at the top and bottom — and there was no `overflow-y-auto` to let the user scroll inside the overlay.

### The fix
Replace the inner wrapper with:

```
flex flex-col items-center gap-5 h-full overflow-y-auto pt-24 pb-10 px-6
```

| Token | Job |
|---|---|
| `overflow-y-auto` | Overlay scrolls when content exceeds viewport height. |
| `pt-24` (96 px) | Pushes content below the 56 px fixed header (`h-14` on mobile) so the first item isn't hidden under the hamburger close button. ~40 px clearance. |
| `pb-10` (40 px) | Breathing room at the bottom so the last item (language toggle) isn't flush against the screen edge. |
| `px-6` | Preserved. Horizontal padding so text doesn't touch screen edges. |
| `gap-5` (was `gap-6`) | Slightly tighter vertical rhythm so more items fit before the user has to scroll on common phones. Stays above the 4-unit accessibility floor. |
| Removed `justify-center` | Content now flows from the top — the expected mobile pattern. Was the load-bearing cause of the bug. |
| Preserved `items-center` | Each link is still horizontally centered. |

The body-scroll lock (`document.body.style.overflow = 'hidden'`) and the `inert` toggling on `<main>`/`<footer>` from Session G remain unchanged — they govern body / sibling behavior, not the overlay's internal scroll.

## Bug 2 — Mobile footer felt unbalanced and cramped

### What the user saw
On phone, the first column ("VERTEX" logo + tagline + address/phone/email) felt small and crammed against the top-left corner. The "CONSULTING" and "MARKETING" headers with their underline accents felt disconnected from the brand block above. Visual hierarchy between the contact block and the service columns was lost — everything sat at the same weight and spacing.

### Root cause
On mobile, the 4-col grid collapses to `grid-cols-1`, so the logo column stacks above three equally-weighted service-link sections. The logo `<span>` was rendered at the project's `text-h3` token — fine on desktop (where the brand label sits next to three columns and reads as a column heading by position), but on mobile there's no positional cue to mark it as the "header of the footer." It read as just another section label.

The `gap-10` (40 px) between stacked sections also created a lot of empty vertical space and made the footer feel taller and looser than it needed to.

### The fix — four targeted Footer edits (all mobile-only or responsive)

**2a. Logo size**

```diff
- <span className="font-heading text-h3 font-bold text-[var(--division-text-primary)]">
+ <span className="font-heading text-2xl sm:text-h3 font-bold tracking-tight text-[var(--division-text-primary)]">
    VERTEX
  </span>
```

`text-2xl` on mobile gives the brand the visual weight of a section header in the stacked layout. From `sm:` up the column sits next to siblings, so we restore `text-h3` (the existing desktop value, not a new `text-xl` — preserving "do not touch desktop styles"). `tracking-tight` adds polish at the larger size.

**2b. Tagline spacing + width**

```diff
- <p className="mt-3 text-small text-[var(--division-text-secondary)]">
+ <p className="mt-2 text-small text-[var(--division-text-secondary)] max-w-xs">
```

`mt-2` brings the tagline closer to the logo so the two read as a single header unit. `max-w-xs` prevents the tagline from stretching full-bleed on phones — it now reads like a brand sub-title, not a lonely line of text. `text-small` (the project's existing token) is preserved on every breakpoint.

**2c. Contact-info wrapper bottom margin**

```diff
- <div className="mt-6 space-y-3">
+ <div className="mt-6 mb-4 sm:mb-0 space-y-3">
```

Adds a deliberate gap on mobile (1-column stack) between the contact block and "CONSULTING," so the logo + tagline + contact rows feel like a closed brand-header unit instead of blending into the service columns. `sm:mb-0` removes the gap from `sm:` up where columns sit side-by-side and need no extra bottom space.

**2d. Grid gap on mobile**

```diff
- <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
+ <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">
```

40 px between vertically stacked sections (the original mobile gap) made the footer read as four loose sections. 32 px (`gap-8`) feels cohesive without crowding. Tablet (`sm:gap-10`) and desktop (`lg:gap-8`) keep their original values exactly.

## Files & line summary

| # | File | Change |
|---|---|---|
| 1 | [Navbar.tsx:381](../components/global/Navbar.tsx#L381) | Mobile-overlay inner wrapper: `flex flex-col items-center justify-center h-full gap-6 px-6` → `flex flex-col items-center gap-5 h-full overflow-y-auto pt-24 pb-10 px-6` |
| 2 | [Footer.tsx:285](../components/global/Footer.tsx#L285) | Logo `<span>`: `text-h3` → `text-2xl sm:text-h3 ... tracking-tight` |
| 3 | [Footer.tsx:289](../components/global/Footer.tsx#L289) | Tagline `<p>`: `mt-3` → `mt-2`, added `max-w-xs` |
| 4 | [Footer.tsx:293](../components/global/Footer.tsx#L293) | Contact-info wrapper: added `mb-4 sm:mb-0` |
| 5 | [Footer.tsx:274](../components/global/Footer.tsx#L274) | Grid container: `gap-10 lg:gap-8` → `gap-8 sm:gap-10 lg:gap-8` |

Five edits, two files. Zero new components, zero schema changes, zero translations, zero deps.

## Why each change is desktop-safe

| Change | Why no desktop regression |
|---|---|
| Navbar overlay inner wrapper | Wrapper is inside `motion.div className="... md:hidden"` — never renders ≥`md:`. |
| Logo size | `sm:text-h3` restores the original desktop value at every viewport ≥640 px. |
| Tagline `mt-2` + `max-w-xs` | `mt-2` is unconditional but visually invisible at desktop widths where the column is bounded by the grid. `max-w-xs` (320 px) is wider than the desktop column itself, so no clipping; on phone it caps the line length. |
| Contact `mb-4 sm:mb-0` | `sm:mb-0` zeros the margin from 640 px up — column-sibling spacing is unchanged. |
| Grid gap `gap-8 sm:gap-10 lg:gap-8` | `sm:gap-10` and `lg:gap-8` reproduce the prior tablet/desktop values exactly. Only the mobile (<640 px) gap shrinks 40 → 32. |

## Verification

### Source-level (completed)
Both files re-read after editing:
- `Navbar.tsx:381` confirmed as the new wrapper string.
- `Footer.tsx:274,285,289,293` confirmed as the four edited lines.
- No collateral changes elsewhere in either file.

### Runtime (deferred — see "Outstanding")
The user's prompt asks for live DevTools verification at iPhone 13 mini / iPhone 14 Pro on both locales and all three division themes, plus `npm run build` and `npm run lint`. None of these were possible in the current shell because:

- `package-lock.json` is deleted (in the staged git status at the start of the session).
- `node_modules/` exists with 798 packages, but `node_modules/.bin/` is empty — none of the binaries (`next`, `eslint`, etc.) are linked.
- Calling `preview_start vertex-dev` returns: `'next' is not recognized as an internal or external command`.

To restore runtime checks, `npm install` is needed, which would regenerate the deleted lockfile. That's a deliberate user-state change, so it's flagged for the user to authorize rather than executed silently.

The five edits are pure className string substitutions — no logic change, no new imports, no JSX structural change. Build risk is essentially zero (no TypeScript types touched, no API surface changed, all classes already supported by Tailwind v4 and present in adjacent components in this codebase: `text-2xl`, `tracking-tight`, `max-w-xs`, `mb-4`, `sm:mb-0`, `gap-8`, `sm:gap-10`, `overflow-y-auto`, `pt-24`, `pb-10`, `gap-5`).

## Outstanding

User decision required: should `npm install` be run to regenerate `package-lock.json` + populate `.bin/` so the dev server, build, and lint can be exercised?

If yes:
- Start `vertex-dev` preview, resize to 375×812 (iPhone 13 mini) and 393×852 (iPhone 14 Pro).
- Open hamburger on `/en` and `/mk`. Confirm "Consulting" parent appears at the top of the overlay and the language toggle is reachable by scroll.
- Switch to `/consulting` and `/marketing`, confirm footer logo + accent + subscribe-button colors match each division theme.
- Resize to ≥1024 px, confirm footer is byte-identical (4 cols, original `text-h3` logo, 32 px gap).
- `npm run build` → expect a clean Turbopack compile + the pre-existing `Archivo`-Cyrillic type error noted in Session J (out of scope here).
- `npm run lint` → expect zero new warnings from the two edited files.

## Related

- Phase 6 — `src/_project-state/06_phase-06-navbar.md`
- Phase 7 — `src/_project-state/07_phase-07-footer.md`
- Session E — `src/_project-state/session-e_polish.md` (BackToTop FAB positioning, division accent unification)
- Session G — `src/_project-state/session-g_a11y-hardening.md` (mobile-overlay `inert` + Escape-to-close + focus-return — preserved by this fix)
- Session I — `src/_project-state/session-i_responsive-adapt.md` (similar surgical mobile-only Tailwind ladder fixes; same pattern as this file)
