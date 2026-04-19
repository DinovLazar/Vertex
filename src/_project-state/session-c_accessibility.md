---
session: C
date: 2026-04-17
status: complete
---

# Session C — Accessibility Fixes

## What was built
Fixed three P1 accessibility findings from the audit plus one P3 polish item, in one pass:

1. **Focus-visible rings on every interactive surface** (WCAG 2.4.7). New `.focus-ring` utility added to `globals.css` (a fresh `@layer utilities` block, since none existed before) and applied to ~15 interactive surface types including nav-links, dropdown children, social icons, footer column links, all card-wrapping `<Link>`s (BlogCard, services grids, DivisionSplit), related-services pills, the back-to-blog link, the not-found / thank-you CTAs, and the navbar logo. The class uses `:focus-visible` so mouse users see no ring and keyboard users see a bright `var(--division-accent)` 2px outline at 2px offset.
2. **Form input focus indicators** (WCAG 1.4.11 — 3:1 non-text contrast). New `.form-input-focus` utility replaces 7× `focus:outline-none focus:border-[var(--division-accent)]` (6 in ContactForm, 1 in Footer newsletter). On focus, both the outline AND border switch to `var(--division-accent)`, giving a clearly visible ring rather than a 1px border-color shift that fails the contrast bar against dark form surfaces.
3. **44×44px touch-target floor on mobile** (Apple HIG / Material Design). Applied via `min-h-[44px] md:min-h-0` (mobile-only floor, desktop unchanged) on navbar nav-links + footer column links + back-to-top text button + footer logo + service-page related-pills + back-to-blog link + thank-you CTA. The hamburger button uses `h-11 w-11` (icon size override). Footer social icons use `min-h-[44px] min-w-[44px] p-3 inline-flex items-center justify-center` (was `p-2` → ~34px). The BackToTop floating FAB is now `h-11 w-11`. Blog filter pills inherit 44px from the new `pill` Button-CVA size.
4. **Footer logo aria-label unified with Navbar** (P3). Both components now read `${siteConfig.name} ${tCommon('logoAriaSuffix')}`. The key was moved from `nav.logoAriaSuffix` to `common.logoAriaSuffix` (single source of truth). EN: "home" / MK: "почетна".

## Files modified

| File | Change |
|------|--------|
| `src/app/globals.css` | New `@layer utilities` block at the bottom with `.focus-ring` (idle: outline-none; `:focus-visible`: outline-2 outline-offset-2 rounded-sm, color = `var(--division-accent)`) and `.form-input-focus` (idle: outline-none transition-colors; `:focus-visible`: outline-2 outline-offset-2 + border-color = `var(--division-accent)`). |
| `src/components/ui/button.tsx` | Extended CVA `size` variants with two new entries: `cta` (h-12 gap-2 px-6 text-sm rounded-button font-heading font-semibold — landing-page CTAs and form submits) and `pill` (h-11 gap-1.5 px-4 rounded-full text-sm font-medium — filter pills with built-in 44px touch floor). |
| `src/components/sections/CTABanner.tsx` | "Get in Touch" Link uses `cn(buttonVariants({ size: 'cta' }), 'text-base ... focus-ring')`. Used `buttonVariants` (not `<Button asChild>`) because the underlying `@base-ui/react` Button doesn't support `asChild` — `buttonVariants` is the standard shadcn pattern for link-as-button. |
| `src/components/sections/ContactForm.tsx` | Submit `<button>` → `<Button size="cta" className="w-full md:w-auto ...">`. All 6× `focus:outline-none focus:border-[var(--division-accent)] transition-colors` → `form-input-focus` (single `replace_all` Edit). |
| `src/components/global/Footer.tsx` | Newsletter input → `form-input-focus`. Newsletter submit `<button>` → `<Button className="h-auto px-5 py-2.5 ...">`. Back-to-top text `<button>` → `<Button variant="ghost" className="min-h-[44px] h-auto py-2 px-3 ...">`. Social-icon `<a>`s gained `min-h-[44px] min-w-[44px] p-3 inline-flex items-center justify-center focus-ring` (was `p-2`). Column-list `<Link>`s gained `inline-flex items-center min-h-[44px] md:min-h-0 ... focus-ring`. Address / phone / email anchors gained `focus-ring`. Logo Link uses `tCommon('logoAriaSuffix')` and `focus-ring`. |
| `src/components/global/Navbar.tsx` | Imports `Button` and `tCommon = useTranslations('common')`. Logo Link gained `focus-ring` and now reads `tCommon('logoAriaSuffix')`. Desktop no-children nav-links + dropdown-parent nav-links gained `inline-flex items-center min-h-[44px] md:min-h-0 md:py-2 ... focus-ring`. Dropdown child Links gained `focus-ring`. Desktop language-toggle `<button>` → `<Button variant="ghost" className="hidden md:inline-flex items-center min-h-[44px] gap-1.5 h-auto px-3 py-1.5 rounded-full ...">`. Desktop CTA Link gained `inline-flex items-center min-h-[44px] ... focus-ring`. Hamburger `<button>` → `<Button variant="ghost" size="icon" className="md:hidden h-11 w-11 ...">`. Mobile-overlay nav Links + child Links gained `inline-flex items-center min-h-[44px] px-2 ... focus-ring`. Mobile-overlay CTA Link gained the same treatment. Mobile-overlay language-toggle `motion.button` rebuilt as `motion.div` wrapper + `<Button variant="ghost" className="inline-flex items-center min-h-[44px] gap-1.5 h-auto px-3 py-2 ...">` to keep the entry-fade animation while picking up Button's focus-visible styling. |
| `src/components/global/BackToTop.tsx` | `motion.button` rebuilt as `motion.div` wrapper (keeps entry/exit + whileHover/whileTap animations) wrapping `<Button size="icon" className="h-11 w-11 rounded-full glass cursor-pointer">`. |
| `src/components/sections/FAQAccordion.tsx` | Trigger `<button>` → `<Button variant="ghost" className="w-full h-auto justify-between whitespace-normal gap-4 px-6 py-5 rounded-none font-heading text-base font-medium text-left ... [&>span]:flex-1 [&_svg]:size-[18px]">`. The `whitespace-normal` override is required because the Button base CVA includes `whitespace-nowrap` which would clip multi-line FAQ questions. |
| `src/app/[locale]/(site)/blog/BlogListingClient.tsx` | Filter pill `<button>` → `<Button size="pill" variant={isActive ? 'default' : 'outline'}>`. Active state inherits `bg-primary text-primary-foreground` (which already maps to `var(--division-accent)` / `var(--division-bg)` via the project's HSL token mapping). Inactive state uses className overrides for transparent bg and division-bordered styling. |
| `src/components/sections/BlogCard.tsx` | Whole-card wrapping `<Link>` gained `focus-ring`. |
| `src/components/sections/ConsultingServicesGrid.tsx` | Service card `<Link>` gained `focus-ring`. |
| `src/components/sections/MarketingServicesGrid.tsx` | Service card `<Link>` gained `focus-ring`. |
| `src/components/sections/ServicesOverview.tsx` | Service card `<Link>` gained `focus-ring`. |
| `src/components/sections/DivisionSplit.tsx` | Division card `<Link>` gained `focus-ring`. |
| `src/components/sections/ConsultingServicePage.tsx` | Related-services `<Link>` pills gained `inline-flex items-center min-h-[44px] ... focus-ring`. |
| `src/components/sections/MarketingServicePage.tsx` | Related-services `<Link>` pills gained `inline-flex items-center min-h-[44px] ... focus-ring`. |
| `src/app/[locale]/(site)/blog/[slug]/BlogPostClient.tsx` | Back-to-blog `<Link>` gained `min-h-[44px] ... focus-ring`. Inline prose body Links inside `renderInline()` were intentionally NOT given focus-ring — they're prose links, not primary navigation. |
| `src/app/[locale]/not-found.tsx` | "Back to home" CTA Link gained `inline-flex items-center min-h-[44px] ... focus-ring`. |
| `src/app/[locale]/(site)/thank-you/page.tsx` | Home CTA Link gained `inline-flex items-center min-h-[44px] ... focus-ring`. |
| `messages/en.json` | Moved `logoAriaSuffix: "home"` from `nav.*` to `common.*`. |
| `messages/mk.json` | Moved `logoAriaSuffix: "почетна"` from `nav.*` to `common.*`. |

## Key technical decisions

- **Hybrid focus-ring approach.** Button primitive's CVA already bakes in `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` via `--ring` (which maps to `0 0% 96%` HSL = bright white) — so `<Button>` elements get a white focus ring for free. For `<Link>` and other interactive non-button elements, the new `.focus-ring` utility class drives the same outline. Both end at `var(--division-accent)` (`#F5F5F5`) — same color across all three divisions because of the post-Finishing-Touches grayscale unification.
- **`.form-input-focus` extracted to a single utility** to avoid duplicating the 7 focus treatments. One Edit + `replace_all: true` did the swap in ContactForm; the Footer newsletter input got the same class hand-edited (the surrounding classes differ).
- **44×44px floor at mobile only** via `min-h-[44px] md:min-h-0` on text-link elements. Desktop nav-links revert to ~36px (compact), mobile gets the touch floor. Avoids overpadding desktop where mouse precision is fine.
- **Two new CVA size variants only** (`cta` and `pill`). Considered adding more (`accordion`, `nav-mobile-icon`, etc.) but most one-off button shapes were better served by `variant="ghost"` + className overrides — adding a CVA variant for every callsite would have inflated the primitive without reusable benefit. `cta` and `pill` are reused multiple times each (CTABanner + ContactForm submit + Footer back-to-top text use cta-related styling; filter pills use `pill`).
- **`asChild` not supported by `@base-ui/react`'s Button.** Discovered when build failed with type error `Property 'asChild' does not exist on type ButtonProps`. Switched CTABanner to the standard shadcn `cn(buttonVariants({ size: 'cta' }), '...')` pattern on the `<Link>` directly — this gives the Button visuals to a Link element without the wrapping-component dance. The plan's explicit `<Button asChild>` syntax was adapted accordingly; the visual result is identical.
- **Motion-wrapped buttons rebuilt as `motion.div` wrappers around `<Button>`.** The BackToTop FAB and the mobile-overlay language toggle both used `motion.button` for entry/exit + hover/tap animations. Wrapping a `<Button>` in `motion.div` preserves all animations while delegating focus styling to the Button primitive — cleaner than trying to make `motion.create(Button)` work with the underlying `@base-ui/react` Button's ref-forwarding.
- **`whitespace-normal` required on FAQ accordion Button.** The Button primitive's base class includes `whitespace-nowrap`, which clips multi-line FAQ questions. Override is local to the FAQAccordion callsite.
- **`logoAriaSuffix` lifted to `common.*` namespace** (single source of truth) instead of duplicating into `footer.*`. Both Navbar and Footer now read the same key. The old `nav.logoAriaSuffix` was deleted.

## Verification done

- `npm run build` passes (47 static pages prerendered across en + mk; one TypeScript error fixed mid-flow when CTABanner used `<Button asChild>` — switched to `buttonVariants()`).
- Mobile viewport (375×812):
  - Navbar hamburger = 44×44 ✓
  - Footer LinkedIn/Instagram/Facebook icons = 44×44 each ✓
  - Footer back-to-top text button = 44×112 ✓
  - Footer column nav-links = 44px tall ✓
  - Blog filter pills (All posts / Consulting / Marketing / General) = 44px tall each ✓
  - Mobile overlay nav-links (Consulting + 4 children + Marketing + 4 children + About + Blog + Contact) = 44px tall each ✓
  - Related-services pills on `/en/consulting/business-consulting` = 44px tall each, all carry `focus-ring` ✓
- Desktop viewport (1280×800):
  - Nav-links revert to 36px (mobile floor relaxed by `md:min-h-0`) ✓
  - Desktop language toggle stays at 44px (intentional — plan called for `min-h-[44px]`) ✓
  - Desktop CTA stays at 44px ✓
  - Homepage + CTABanner visual layout matches pre-Session-C screenshots ✓
- Form inputs: all 5 ContactForm visible inputs + Footer newsletter email input carry the `form-input-focus` class ✓
- FAQ accordion buttons render with `data-slot="button"` (proves Button primitive adoption); 5 buttons per service page, heights 114-186px (multi-line questions wrap correctly thanks to `whitespace-normal` override).
- Aria-labels: Navbar logo and Footer logo both read `Vertex Consulting home` on `/en` and `Vertex Consulting почетна` on `/mk` ✓
- CSS rules verified present in compiled stylesheets: `.focus-ring`, `.focus-ring:focus-visible`, `.form-input-focus`, `.form-input-focus:focus-visible` all match elements with the right outline-color (resolves to `rgb(245, 245, 245)`).
- No new console errors after final reload (older logs in the dev-server buffer reference stale code from mid-edit cycle — verified by reading the current source at the line numbers cited).
- Grep for raw `<button` in `src/` returns zero hits in component code (only matches in `_project-state/*.md` historical notes).

## What the next session should know

- The shadcn `<Button>` primitive (`src/components/ui/button.tsx`) is now the standard. Any new section component with a clickable button should use `<Button>` from `@/components/ui/button` — do not reintroduce raw `<button>` JSX.
- The `<Button>` component does NOT support `asChild` (the underlying `@base-ui/react` button doesn't expose Slot). For link-as-button, use `cn(buttonVariants({ size: '...' }), 'extra classes')` on the `<Link>` directly. See `CTABanner.tsx` for the pattern.
- The `.focus-ring` class should be added to any new `<Link>` element or interactive non-button (e.g. a custom div with onClick + role="button"). For `<Link>`s with a layout class like `inline-block` or `block`, add `focus-ring` alongside.
- The `.form-input-focus` class should be used on every new `<input>`, `<select>`, or `<textarea>`. Do not reintroduce bare `focus:outline-none`.
- The `cta` and `pill` Button size variants are now in the primitive — reuse them rather than re-creating sizing inline.
- For mobile-only touch-target floors on text Links, use `min-h-[44px] md:min-h-0`. Avoid setting unconditional height — desktop should stay compact.
- **The Button primitive's base CVA includes `whitespace-nowrap`.** Multi-line button content (FAQ triggers, anything with paragraph-length text) needs `whitespace-normal` in className to override.
- Session D's plan to rebuild FAQAccordion's height animation (currently animates `height: 'auto'`) to use a `grid-template-rows` transition can proceed unchanged — the trigger Button refactor done in this session does not touch the AnimatePresence + motion.div height animation. Carry the `whitespace-normal` override through any FAQ refactor.
- Session E (theme polish) and Session F (font swap for Cyrillic) remain the next priorities. Neither blocks Session D.
- The Footer logo aria-label change is the smallest change but the most subtle: the `logoAriaSuffix` key now lives in `common.*`, NOT `nav.*`. If a future component needs to reference the same suffix, import via `useTranslations('common')`.
