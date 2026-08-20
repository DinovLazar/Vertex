# Accessibility Remediation Report — vertexconsulting.mk

**Standard:** WCAG 2.2 Level AA (which includes all of WCAG 2.1 AA — the standard referenced in ADA web-accessibility cases and the 2024 DOJ rule)
**Date:** 20 August 2026
**Branch:** `a11y-remediation`
**Pages audited:** 47 URLs — every public page in both English and Macedonian, plus the 404 page and the admin login

---

## The short version

The site was already in unusually good shape. Two earlier accessibility passes had done real work, and it shows: **the automated scanners found nothing at all.** Zero errors from axe, zero from pa11y, and a perfect 100/100 Lighthouse accessibility score — before I changed a single line.

That is exactly why this audit went further. Automated tools only catch roughly a third of accessibility problems, and they are blind to some of the most important ones. **Thirteen genuine WCAG failures were found by reading the code and measuring the running site — including one that made keyboard focus invisible across the entire website.** All thirteen are fixed.

### The big one

The site had a shared "focus ring" style — the outline that shows a keyboard user where they are on the page. It was written correctly, but a subtle quirk in how Tailwind (the styling tool this site uses) compiles that code meant **the ring was given a colour and a thickness but was never actually drawn.** Sixty-two places used it: every navigation link, every footer link, every clickable card, the breadcrumbs, the logo.

The practical effect: anyone navigating with a keyboard instead of a mouse — which includes people with motor disabilities, many blind users, and anyone whose mouse just broke — could not see where they were on the page. Every scanner scored this clean, because none of them check what a focus ring looks like when it is actually focused.

You can see the before and after in `docs/a11y-evidence/`.

### Totals

| Severity | Found | Fixed | Remaining |
|---|---|---|---|
| **Critical** (blocks a user entirely) | 2 | 2 | 0 |
| **Major** (serious barrier) | 9 | 9 | 0 |
| **Minor** (friction) | 2 | 2 | 0 |
| **Total** | **13** | **13** | **0** |

### Scanner results, before and after

| Check | Before | After |
|---|---|---|
| axe-core, dark theme (47 pages) | 0 violations | 0 violations |
| axe-core, light theme (47 pages) | 0 violations | 0 violations |
| pa11y WCAG2AA (47 pages) | 0 errors | 0 errors |
| Lighthouse accessibility — `/en` | 100 | 100 |
| Lighthouse accessibility — `/en/consulting` | 100 | 100 |
| Lighthouse accessibility — `/en/contact` | 100 | 100 |
| Colour pairs meeting their WCAG threshold | 43 of 60 | 48 of 60 |
| Keyboard stops with a visible focus ring (`/en/about`) | **3 of 16** | **16 of 16** |
| Keyboard stops with a visible focus ring (`/mk`) | **5 of 30** | **30 of 30** |
| Heading-order errors | 2 pages | 0 |

The scanner rows do not move, because the scanners never saw these problems. That is the honest headline of this report: **a clean automated score is not evidence of an accessible site.** The last four rows are where the real change happened.

Raw scan output is saved in `docs/a11y-scan-before/` and `docs/a11y-scan-after/`.

---

## What was found and fixed

| # | Page(s) | What was wrong | WCAG | Severity | What changed | File(s) |
|---|---|---|---|---|---|---|
| 1 | Every page | The shared focus-ring style compiled to "draw no outline", so keyboard users had **no visible focus indicator anywhere** — 62 call sites. | 2.4.7 Focus Visible (AA) | **Critical** | Declared the outline style explicitly so it can no longer be cancelled by Tailwind's internal variable. | `src/app/globals.css` |
| 2 | All forms | The same defect in the form-field focus style — the 2px ring never painted. (Fields still shifted border colour, so this was degraded rather than total.) | 2.4.7 Focus Visible (AA) | **Critical** | Same fix applied to `.form-input-focus`. | `src/app/globals.css` |
| 3 | Contact, footer newsletter (dark mode) | Form field borders sat at 1.64:1 against the field's own fill — below the 3:1 required. Since the fill is only 1.08:1 against the page, the border was the *only* thing making a field visible, and it wasn't visible enough. Light mode had already been fixed; dark had been explicitly deferred. | 1.4.11 Non-text Contrast (AA) | Major | Dark `--input-border` `#404040` → `#6C6C6C` (now 3.25:1 / 3.51:1). | `src/app/globals.css` |
| 4 | Admin login | The password field used the decorative card-border colour (1.78:1) instead of the dedicated form-field border token. | 1.4.11 Non-text Contrast (AA) | Major | Switched to `--input-border`. | `src/app/admin/login/page.tsx` |
| 5 | About page (dark mode) | The vertical line joining the company-timeline milestones was 1.64:1 — below 3:1. That line is what makes four dots read as one timeline, so it carries meaning. Light mode had been fixed; dark had not. | 1.4.11 Non-text Contrast (AA) | Major | Dark `--division-rule` `#404040` → `#6C6C6C` (3.25:1). | `src/app/globals.css` |
| 6 | Contact, newsletter (dark mode) | The border of a field *in an error state* was 1.22:1 — visually identical to a normal field, so the error state had no non-text indicator. | 1.4.11 Non-text Contrast (AA) | Minor | Dark `--form-error-border` from 20%-opacity red to solid `#FB2C36` (4.48:1). Same red, no new colour. | `src/app/globals.css` |
| 7 | Admin login (light mode) | The "Wrong password" message was 3.41:1 — below the 4.5:1 needed for body text — because it used a fixed red that doesn't adapt to the light theme. | 1.4.3 Contrast Minimum (AA) | Major | Switched to the theme-aware `--form-error-text` (5.87:1 light, 5.90:1 dark). | `src/app/admin/login/page.tsx` |
| 8 | Contact (EN + MK) | Name, email and phone fields had no `autocomplete`, so browsers and assistive tech couldn't identify what they collect or fill them automatically. | 1.3.5 Identify Input Purpose (AA) | Major | Added `autocomplete="name" / "email" / "tel"`. | `src/components/sections/ContactForm.tsx` |
| 9 | Every page (footer) | The newsletter email field had no `autocomplete`. | 1.3.5 Identify Input Purpose (AA) | Major | Added `autocomplete="email"`. | `src/components/global/Footer.tsx` |
| 10 | Contact (EN + MK) | On success the whole form is replaced by a confirmation card. Nothing announced it to a screen reader, and because the focused button was removed from the page, keyboard focus was dumped back to the top of the document. On the site's main conversion path, a blind user had no way to know the message sent. | 4.1.3 Status Messages (AA) | Major | Added `role="status"` and moved focus to the confirmation card. | `src/components/sections/ContactForm.tsx` |
| 11 | Every page (footer) | Same problem on newsletter signup. Errors were announced correctly; success was silent. | 4.1.3 Status Messages (AA) | Major | Added `role="status"` and focus handling. | `src/components/global/Footer.tsx` |
| 12 | Admin login | A wrong password reloads the page with the error already on it. A live-region announcement only fires on *changes*, so it said nothing — and the message sat after the auto-focused field, where it would never be reached. | 3.3.1 Error Identification (AA) | Major | Linked the message to the field with `aria-describedby` + `aria-invalid`, so it is read out with the field that has focus on arrival. | `src/app/admin/login/page.tsx` |
| 13 | `/en/blog`, `/mk/blog` | Blog post titles were `<h3>` directly beneath the page `<h1>`, skipping `<h2>`. Screen reader users navigating by heading hit a gap. | 1.3.1 Info and Relationships (A) | Major | Made the card's heading level a setting: `<h2>` on the listing, `<h3>` in the "Related posts" strip where it sits under its own `<h2>` and was already correct. | `src/components/sections/BlogCard.tsx`, `src/app/[locale]/(site)/blog/BlogListingClient.tsx` |

---

## Things I checked that turned out to be fine

Recording these so nobody re-investigates them later, and so the "zero remaining" claim is auditable.

| Checked | Verdict |
|---|---|
| Footer links measure 21.7px tall on desktop — under the 24px minimum | **Passes.** WCAG 2.2's target-size rule has a spacing exemption: undersized targets pass if a 24px circle centred on each doesn't touch another. Measured centre-to-centre distance is 34.8px minimum. Not a violation. |
| Blog excerpts appeared to clip when text spacing is increased | **False positive in my own test.** The excerpt uses a 3-line clamp; the container correctly grows with line-height (measured exactly 63px = 3 lines at the enforced 1.5 spacing). No content is lost beyond the by-design truncation. |
| 404 pages appeared to have no `lang` attribute | **False positive.** Fetching the raw HTML shows a bare shell because Next.js streams the real page in afterwards. In an actual browser the 404 has `lang`, one `<h1>`, one `<main>`, a skip link, nav and footer. |
| Admin login has no "skip to content" link | **Not a violation.** That rule exists to let people bypass blocks repeated across pages. The login page is a single form with no nav, header or footer — there is nothing to bypass. |
| Hero background animations (WebGL) run forever | **Handled.** All three respect the operating system's "reduce motion" setting and stop entirely. See the open item below for the remaining nuance. |
| Scroll-reveal animations might leave content invisible for reduced-motion users | **Handled.** The whole site is wrapped in `MotionConfig reducedMotion="user"`, so animations resolve to their final visible state. |
| Mobile menu might let keyboard focus escape behind the overlay | **Handled correctly.** It marks the page content `inert` while open. I tabbed 25 times and focus never escaped; Escape closes it and returns focus to the menu button. |
| Chat panel isn't a focus trap | **Correct as built.** It declares `aria-modal="false"` — it is a non-modal side panel, so trapping focus would be wrong. Escape closes it and the message log is a live region. |
| Macedonian text inside English pages would need a `lang` marker | **Not applicable.** No Cyrillic strings exist in the English dictionary, and Macedonian pages correctly declare `lang="mk"`. |
| Images missing alt text | **None.** Every image has meaningful alt text; decorative icons are correctly hidden from screen readers. |
| Clickable `<div>`s or `<span>`s pretending to be buttons | **None found** anywhere in the codebase. |
| Positive `tabindex` values (which break focus order) | **None found.** |
| Duplicate or missing page titles | **None.** All 47 pages have unique, descriptive titles. |
| Links in body text distinguished only by colour | **Fine.** Prose links are underlined. |

---

## Keyboard walkthrough

Tabbed through every page from the top, recording each stop. Full data in `docs/a11y-scan-after/keyboard-walkthrough.json`.

| Page | Tab stops | Skip link first? | Every stop has a visible focus ring? | Focus hidden behind anything? |
|---|---|---|---|---|
| `/en` (home) | 30 | Yes | Yes | No |
| `/en/contact` | 27 | Yes | Yes | No |
| `/en/blog` | 23 | Yes | Yes | No |
| `/en/consulting` | 21 | Yes | Yes | No |
| `/en/projects` | 21 | Yes | Yes | No |
| `/en/about` | 16 | Yes | Yes | No |
| `/mk` (Macedonian home) | 30 | Yes | Yes | No |
| `/admin/login` | 2 | N/A — nothing to skip | Yes | No |

Before the fix that column was **No**. Measured on the two pages I captured pre-fix data for: `/en/about` had a visible focus indicator on only **3 of 16** stops, and `/mk` on only **5 of 30**. The handful that did work were the skip link and a few buttons whose ring is drawn with a shadow rather than an outline, so they escaped the defect.

**Menus and panels**

| Component | Focus moves in | Contained while open | Escape closes | Focus returns to trigger |
|---|---|---|---|---|
| Mobile navigation menu | Yes | Yes — page content is marked `inert` | Yes | Yes |
| Chat panel | Yes — into the message input | Intentionally not trapped (non-modal side panel) | Yes | Yes |

One note on method: an early run flagged the skip link as "hidden behind something" on every page. That was my measurement sampling it mid-animation. Re-measured with the transition allowed to finish, it sits correctly at the top-left of the viewport and is fully clickable. Not a defect.

---

## Colour contrast

Every colour pair the site actually uses, in both themes, measured from the live page (so transparency is composited over its real backdrop rather than guessed). Text needs 4.5:1; borders, icons and focus rings need 3:1.

**Every text pair passes in both themes, before and after.** Five non-text pairs were below the bar and were raised. Twelve rows are marked "see notes" — those are explained directly below the table.

| Theme | What it is | Tokens | Colours | Before | After | Needs | Result |
|---|---|---|---|---|---|---|---|
| dark | Body/heading text on page ground | `--division-text-primary` on `--division-bg` | #f5f5f5 on #141414 | 16.9:1 | **16.9:1** | 4.5:1 | PASS |
| dark | Text on surface band | `--division-text-primary` on `--division-surface` | #f5f5f5 on #1c1c1c | 15.63:1 | **15.63:1** | 4.5:1 | PASS |
| dark | Text on card | `--division-text-primary` on `--division-card` | #f5f5f5 on #262626 | 13.88:1 | **13.88:1** | 4.5:1 | PASS |
| dark | Secondary text on page ground | `--division-text-secondary` on `--division-bg` | #a3a3a3 on #141414 | 7.3:1 | **7.3:1** | 4.5:1 | PASS |
| dark | Secondary text on surface | `--division-text-secondary` on `--division-surface` | #a3a3a3 on #1c1c1c | 6.76:1 | **6.76:1** | 4.5:1 | PASS |
| dark | Secondary text on card | `--division-text-secondary` on `--division-card` | #a3a3a3 on #262626 | 6:1 | **6:1** | 4.5:1 | PASS |
| dark | Muted text / overlines on ground | `--division-text-muted` on `--division-bg` | #909090 on #141414 | 5.77:1 | **5.77:1** | 4.5:1 | PASS |
| dark | Muted text on surface | `--division-text-muted` on `--division-surface` | #909090 on #1c1c1c | 5.34:1 | **5.34:1** | 4.5:1 | PASS |
| dark | Muted text on card | `--division-text-muted` on `--division-card` | #909090 on #262626 | 4.74:1 | **4.74:1** | 4.5:1 | PASS |
| dark | CTA banner heading | `--cta-banner-text` on `--cta-banner-bg` | #f5f5f5 on #0e0e0e | 17.71:1 | **17.71:1** | 4.5:1 | PASS |
| dark | CTA banner subtext | `--cta-banner-text-secondary` on `--cta-banner-bg` | #a3a3a3 on #0e0e0e | 7.65:1 | **7.65:1** | 4.5:1 | PASS |
| dark | CTA banner button label | `--cta-banner-accent-fg` on `--cta-banner-accent` | #0e0e0e on #f5f5f5 | 17.71:1 | **17.71:1** | 4.5:1 | PASS |
| dark | Solid accent button label on accent fill | `--division-bg` on `--division-accent` | #141414 on #f5f5f5 | 16.9:1 | **16.9:1** | 4.5:1 | PASS |
| dark | Form error text on input surface | `--form-error-text` on `--division-surface` | #ff6467 on #1c1c1c | 5.9:1 | **5.9:1** | 4.5:1 | PASS |
| dark | Form error text on page ground | `--form-error-text` on `--division-bg` | #ff6467 on #141414 | 6.38:1 | **6.38:1** | 4.5:1 | PASS |
| dark | Selected text | `--selection-fg` on `--selection-bg` | #f5f5f5 on #f5f5f538 | 8.74:1 | **8.74:1** | 4.5:1 | PASS |
| dark | Card/section border on ground | `--division-border` on `--division-bg` | #404040 on #141414 | 1.78:1 | **1.78:1** | 3:1 | see notes |
| dark | Border on surface | `--division-border` on `--division-surface` | #404040 on #1c1c1c | 1.64:1 | **1.64:1** | 3:1 | see notes |
| dark | Border on card | `--division-border` on `--division-card` | #404040 on #262626 | 1.46:1 | **1.46:1** | 3:1 | see notes |
| dark | Form input border on input fill | `--input-border` on `--division-surface` | #6c6c6c on #1c1c1c | 1.64:1 | **3.25:1** | 3:1 | PASS |
| dark | Form input border on page ground | `--input-border` on `--division-bg` | #6c6c6c on #141414 | 1.78:1 | **3.51:1** | 3:1 | PASS |
| dark | Focus ring on page ground | `--division-accent` on `--division-bg` | #f5f5f5 on #141414 | 16.9:1 | **16.9:1** | 3:1 | PASS |
| dark | Focus ring on surface | `--division-accent` on `--division-surface` | #f5f5f5 on #1c1c1c | 15.63:1 | **15.63:1** | 3:1 | PASS |
| dark | Focus ring on card | `--division-accent` on `--division-card` | #f5f5f5 on #262626 | 13.88:1 | **13.88:1** | 3:1 | PASS |
| dark | Horizontal rule on ground | `--division-rule` on `--division-bg` | #6c6c6c on #141414 | 1.78:1 | **3.51:1** | 3:1 | PASS |
| dark | Horizontal rule on surface | `--division-rule` on `--division-surface` | #6c6c6c on #1c1c1c | 1.64:1 | **3.25:1** | 3:1 | PASS |
| dark | Errored input border | `--form-error-border` on `--division-surface` | #fb2c36 on #1c1c1c | 1.22:1 | **4.48:1** | 3:1 | PASS |
| dark | CTA banner border | `--cta-banner-border` on `--cta-banner-bg` | #262626 on #0e0e0e | 1.28:1 | **1.28:1** | 3:1 | see notes |
| dark | Sticky nav bottom border | `--glass-nav-border` on `--division-bg` | #ffffff0f on #141414 | 1.16:1 | **1.16:1** | 3:1 | see notes |
| dark | Input FILL vs page ground (is the field visible at all?) | `--division-surface` on `--division-bg` | #1c1c1c on #141414 | 1.08:1 | **1.08:1** | 3:1 | see notes |
| light | Body/heading text on page ground | `--division-text-primary` on `--division-bg` | #0a0b12 on #fff | 19.64:1 | **19.64:1** | 4.5:1 | PASS |
| light | Text on surface band | `--division-text-primary` on `--division-surface` | #0a0b12 on #f1f4f9 | 17.81:1 | **17.81:1** | 4.5:1 | PASS |
| light | Text on card | `--division-text-primary` on `--division-card` | #0a0b12 on #fff | 19.64:1 | **19.64:1** | 4.5:1 | PASS |
| light | Secondary text on page ground | `--division-text-secondary` on `--division-bg` | #48505e on #fff | 8.12:1 | **8.12:1** | 4.5:1 | PASS |
| light | Secondary text on surface | `--division-text-secondary` on `--division-surface` | #48505e on #f1f4f9 | 7.37:1 | **7.37:1** | 4.5:1 | PASS |
| light | Secondary text on card | `--division-text-secondary` on `--division-card` | #48505e on #fff | 8.12:1 | **8.12:1** | 4.5:1 | PASS |
| light | Muted text / overlines on ground | `--division-text-muted` on `--division-bg` | #626a78 on #fff | 5.45:1 | **5.45:1** | 4.5:1 | PASS |
| light | Muted text on surface | `--division-text-muted` on `--division-surface` | #626a78 on #f1f4f9 | 4.94:1 | **4.94:1** | 4.5:1 | PASS |
| light | Muted text on card | `--division-text-muted` on `--division-card` | #626a78 on #fff | 5.45:1 | **5.45:1** | 4.5:1 | PASS |
| light | CTA banner heading | `--cta-banner-text` on `--cta-banner-bg` | #f7f8fa on #0a0b12 | 18.48:1 | **18.48:1** | 4.5:1 | PASS |
| light | CTA banner subtext | `--cta-banner-text-secondary` on `--cta-banner-bg` | #b9bfc9 on #0a0b12 | 10.62:1 | **10.62:1** | 4.5:1 | PASS |
| light | CTA banner button label | `--cta-banner-accent-fg` on `--cta-banner-accent` | #0a0b12 on #fff | 19.64:1 | **19.64:1** | 4.5:1 | PASS |
| light | Solid accent button label on accent fill | `--division-bg` on `--division-accent` | #fff on #0a0b12 | 19.64:1 | **19.64:1** | 4.5:1 | PASS |
| light | Form error text on input surface | `--form-error-text` on `--division-surface` | #b91c1c on #f1f4f9 | 5.87:1 | **5.87:1** | 4.5:1 | PASS |
| light | Form error text on page ground | `--form-error-text` on `--division-bg` | #b91c1c on #fff | 6.47:1 | **6.47:1** | 4.5:1 | PASS |
| light | Selected text | `--selection-fg` on `--selection-bg` | #0a0b12 on #0a0b1221 | 14.8:1 | **14.8:1** | 4.5:1 | PASS |
| light | Card/section border on ground | `--division-border` on `--division-bg` | #e3e7ec on #fff | 1.24:1 | **1.24:1** | 3:1 | see notes |
| light | Border on surface | `--division-border` on `--division-surface` | #e3e7ec on #f1f4f9 | 1.13:1 | **1.13:1** | 3:1 | see notes |
| light | Border on card | `--division-border` on `--division-card` | #e3e7ec on #fff | 1.24:1 | **1.24:1** | 3:1 | see notes |
| light | Form input border on input fill | `--input-border` on `--division-surface` | #858e9c on #f1f4f9 | 3:1 | **3:1** | 3:1 | PASS |
| light | Form input border on page ground | `--input-border` on `--division-bg` | #858e9c on #fff | 3.31:1 | **3.31:1** | 3:1 | PASS |
| light | Focus ring on page ground | `--division-accent` on `--division-bg` | #0a0b12 on #fff | 19.64:1 | **19.64:1** | 3:1 | PASS |
| light | Focus ring on surface | `--division-accent` on `--division-surface` | #0a0b12 on #f1f4f9 | 17.81:1 | **17.81:1** | 3:1 | PASS |
| light | Focus ring on card | `--division-accent` on `--division-card` | #0a0b12 on #fff | 19.64:1 | **19.64:1** | 3:1 | PASS |
| light | Horizontal rule on ground | `--division-rule` on `--division-bg` | #858e9c on #fff | 3.31:1 | **3.31:1** | 3:1 | PASS |
| light | Horizontal rule on surface | `--division-rule` on `--division-surface` | #858e9c on #f1f4f9 | 3:1 | **3:1** | 3:1 | PASS |
| light | Errored input border | `--form-error-border` on `--division-surface` | #ef4444 on #f1f4f9 | 3.41:1 | **3.41:1** | 3:1 | PASS |
| light | CTA banner border | `--cta-banner-border` on `--cta-banner-bg` | #ffffff24 on #0a0b12 | 1.44:1 | **1.44:1** | 3:1 | see notes |
| light | Sticky nav bottom border | `--glass-nav-border` on `--division-bg` | #0a0b121a on #fff | 1.25:1 | **1.25:1** | 3:1 | see notes |
| light | Input FILL vs page ground (is the field visible at all?) | `--division-surface` on `--division-bg` | #f1f4f9 on #fff | 1.1:1 | **1.1:1** | 3:1 | see notes |

### About the twelve "see notes" rows

These are all **decorative** boundaries, and WCAG 1.4.11 does not apply to them. The rule covers visual information *required to identify a control or understand a graphic*. It explicitly does not require decorative borders to meet 3:1.

- **Card and section borders** (`--division-border`) — the cards they outline are already identifiable by their fill, their heading and their content. The border is visual polish.
- **CTA banner border** and **sticky navigation hairline** — purely decorative separators.
- **"Input FILL vs page ground"** — this is a diagnostic row I added rather than a WCAG requirement. It measures whether a form field's *background* alone distinguishes it from the page (it doesn't — 1.08:1). That's precisely why the field's *border* has to clear 3:1, which it now does. The row is kept in the table because it's the evidence behind fix #3.

Raising `--division-border` itself would change the edge of every card on the site, which is a visual-design decision rather than an accessibility requirement. It is listed as an open item below rather than changed unilaterally.

---

## Needs your decision

Two items I deliberately did not change, because each is a judgement call that belongs to you rather than to me.

| # | Question | Background | My recommendation |
|---|---|---|---|
| 1 | Should card and section borders be made more visible? | `--division-border` is 1.78:1 in dark mode and 1.24:1 in light. As explained above this is **not a WCAG failure** — these borders are decorative. But they are very faint, and users with low vision may not perceive card edges at all. Raising it would subtly change the look of every card on the site. | **Leave as is for compliance; consider it as a design improvement.** If you want it, `#5A5A5A` (dark) and `#C9CED6` (light) would make edges clearly perceptible while still reading as quiet. This is a visual-design change and should be seen in a mockup before shipping. |
| 2 | Should the animated hero backgrounds get a visible pause button? | The three WebGL hero animations run continuously. They already stop completely for anyone whose operating system is set to "reduce motion", which is the standard and widely-accepted way to satisfy this. A strict reading of WCAG 2.2.2 asks for an on-page control to pause anything that moves for more than five seconds, regardless of that OS setting. | **Accept the current behaviour.** The animations are decorative, hidden from screen readers, and honour the OS setting. Adding a visible pause button to a marketing hero is intrusive and rarely done. If you ever face a formal audit that reads 2.2.2 strictly, this is the one item that could be argued — worth knowing, not worth changing now. |

---

## What still requires human testing

**This must be said plainly: automated scans and code review cannot replace testing with a real screen reader and real users.** Everything in this report was verified by measurement, code inspection and scripted keyboard simulation. None of that tells you what the site actually *sounds* like, or whether the experience makes sense to someone who depends on it.

If you can arrange only one thing, arrange a real person who uses a screen reader daily to walk through the contact form.

To test on a Mac, turn VoiceOver on with **Cmd + F5**. On Windows, NVDA is free.

The five flows worth testing by hand, in priority order:

1. **Send a message through the contact form** (`/en/contact`) — fill it in, submit it, and confirm the success confirmation is both *announced* and *lands focus in a sensible place*. This is the fix I am least able to verify without a real screen reader, and it is your most important conversion path.
2. **Navigate the whole site with only a keyboard** — no mouse at all. Confirm you can always see where you are, reach every menu, open and close the mobile menu, and that nothing traps you.
3. **Subscribe to the newsletter from the footer** — same question as the contact form: is the success message announced?
4. **Read a blog post with a screen reader** (`/en/blog` → any post) — check the heading structure now reads as a sensible outline, and that images and links make sense out of context.
5. **Use the site in Macedonian** (`/mk`) — confirm the screen reader switches to a Macedonian voice and pronounces the Cyrillic content correctly. This depends on the reader having a Macedonian voice installed and is worth confirming with a native speaker.

Also worth a manual look: the site at 200% browser zoom and on a real phone. My checks simulated both (320px width and a 640px-wide viewport) and found no loss of content, but simulated zoom and real zoom are not identical.

---

## Notes on how this was tested

- Scans ran against a **production build** (`next build` + `next start`), not the development server, so results reflect what visitors actually receive.
- Every page was scanned in **both light and dark themes**. Several of the fixes above only exist in dark mode, and a light-only audit would have missed all of them.
- Tools: axe-core 4.13, pa11y 9.1 (WCAG2AA, HTML CodeSniffer), Lighthouse 13.4, plus purpose-written scripts for contrast maths, target-size measurement including the spacing exemption, keyboard walkthrough, and reflow/zoom/text-spacing checks.
- Testing tools were installed **outside** the project so `package.json` is untouched. No new dependencies were added to the site.
- A `.env.local` holding only the two public Sanity values (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`) was created locally so real blog posts would render and could be audited. Those two values are public by design — they ship in the browser bundle of the live site. No secrets were used, and the file is git-ignored.
- The build and TypeScript both compile cleanly, and ESLint reports no problems on any changed file. No lint rules were disabled, no errors suppressed, and no focus outlines removed.

---

**Conformance target: Remediated toward WCAG 2.2 AA; see open items above.**
