# Phase L4 — Global Chrome Sweep (Light Mode)

Date: 2026-04-23

## What was built

Every component and utility that appears on every page is now theme-aware. The bulk of the work flowed through CSS variables defined once at the root and overridden under `html[data-theme="light"]` — so theme flips stay instantaneous across every descendant without a React re-render. One component (BorderGlow) needed a different approach because its `glowColor` prop is parsed in JS and can't consume a CSS variable; that one reads `useTheme()` inside the component and flips its HSL string based on resolved theme state.

`.glass` utility rewritten to consume `--glass-bg` + `--glass-border` CSS variables. The two redundant variants (`[data-division="consulting"] .glass`, `[data-division="marketing"] .glass`) deleted — post-Finishing-Touches v2 they held identical values to the base and served no purpose. `.glass-nav` (distinct utility used by the scrolled navbar backdrop) tokenized with its own `--glass-nav-bg` + `--glass-nav-border` pair because it needs a higher-alpha solid-ish tint, not a subtle overlay. BorderGlow component imports `useTheme()` from `@/components/global` and flips its default `glowColor` (HSL triplet `'0 0 85'` dark / `'232 30 7'` light) and `colors` (mesh palette: grayscale-bright dark / navy-dark light) based on resolved theme. `backgroundColor` default became `var(--borderglow-bg)` which chains through `var(--division-surface)` (already theme-aware via L1). All 6 BorderGlow call sites (ConsultingServicesGrid, MarketingServicesGrid, ServicesOverview, TeamGrid, TeamShowcase, BlogCard) had been passing 3 identical explicit props each (`colors`, `glowColor`, `backgroundColor`) — now that the defaults are correct those 18 prop lines were deleted.

Prose utility classes (`.prose-consulting`, `.prose-marketing`, `.prose-blog`) verified already fully tokenized post-Session-E — link color via `--division-accent`, strong + h2 + h3 via `--division-text-primary`, body via `--division-text-secondary`. No changes needed to the prose rules. Navbar's four `hover:bg-white/5` instances (dropdown children link, desktop language toggle, hamburger, mobile-overlay language toggle) and ThemeToggle's `BUTTON_SHAPE` constant's `hover:bg-white/5` and Footer's social-icon row `hover:bg-white/5` all converted to `hover:bg-[var(--nav-hover-bg)]` — a new token that resolves to `rgba(255,255,255,0.05)` in dark and `rgba(10,11,18,0.05)` in light. Footer hairline separator `style={{ backgroundColor: '#262626' }}` → `'var(--division-border)'` so it inverts cleanly. Footer brand SVGs already used `stroke="currentColor"` — verified, no change.

Dead CSS: `[data-division="marketing"] .glow-hover:hover` rule deleted. Flagged in L1 backlog; grep confirmed zero callers in `.tsx`/`.ts` files and the inline comment inside the rule literally said "superseded by BorderGlow in Phase 4". `@keyframes chat-trigger-pulse` rewritten — the baked-light `rgba(241, 243, 247, α)` pulse ring values became `rgba(var(--borderglow-glow) / α)` so the ring inverts to a dark-on-light pulse in light mode. Chat widget components (ChatWidget, ChatPanel, ChatMessage, TypingIndicator, BotIcon) audited — every color already uses `var(--color-*)` tokens which are theme-aware via L1, so no component-level edits needed in the chat tree.

One token tuning: light-mode `--division-text-muted: #9AA0AD` gave only 2.49:1 contrast against `--division-surface` (`#F8F9FA`) on footer muted links — fails WCAG AA. Raised to `#5F6670` (5.50:1 ✓ AA) while preserving the muted-vs-secondary visual hierarchy (`--division-text-secondary: #4B5563` at 8.59:1 still reads heavier). Dark-mode value (`#737373`) unchanged.

## Files modified

| File | What changed |
|------|-------------|
| `src/app/globals.css` | Added three CSS-variable token pairs under `:root` + `html[data-theme="light"]`: (1) `--borderglow-glow` / `--borderglow-bg` (the RGB triplet for future CSS consumers, the bg via `var(--division-surface)` — see Key technical decisions for why the RGB is kept even though the component flips color via JS); (2) `--glass-bg` / `--glass-border` / `--glass-bg-strong` / `--glass-border-strong` / `--glass-nav-bg` / `--glass-nav-border` — six values covering both `.glass` and `.glass-nav` surface pairs; (3) `--nav-hover-bg` for the chrome hover overlay. Rewrote `.glass` class to consume variables; deleted the redundant `[data-division="consulting"] .glass` and `[data-division="marketing"] .glass` variants. Rewrote `.glass-nav` to consume variables. Deleted the dead `[data-division="marketing"] .glow-hover:hover` rule (8 lines — flagged in L1 backlog, zero callers). Rewrote `@keyframes chat-trigger-pulse` to use `rgba(var(--borderglow-glow) / α)` instead of hardcoded `rgba(241,243,247,α)`. L1 token tune: `--division-text-muted` in light mode raised `#9AA0AD` → `#5F6670` with an inline comment explaining the contrast rationale. |
| `src/components/ui/BorderGlow.tsx` | Imported `useTheme` from `@/components/global`. Rewrote the function signature: `glowColor` no longer has a default string (makes the type optional), `backgroundColor` default changed from `'#120F17'` to `'var(--borderglow-bg)'`, `colors` default removed (now resolved theme-aware). Two new local variables inside the component body: `resolvedGlowColor = glowColor ?? (theme === 'light' ? '232 30 7' : '0 0 85')` and `resolvedColors = colors ?? (theme === 'light' ? ['#0A0B12', '#4B5563', '#9AA0AD'] : ['#F5F5F5', '#C9C9C9', '#A3A3A3'])`. Existing `buildGlowVars(glowColor, …)` call changed to `buildGlowVars(resolvedGlowColor, …)`; existing `buildGradientVars(colors)` call changed to `buildGradientVars(resolvedColors)`. All other logic (pointer-rAF throttling, animated-sweep effect, refs, rendered JSX) untouched. |
| `src/components/sections/ConsultingServicesGrid.tsx` | Removed 3 explicit props from `<BorderGlow>` usage: `colors={[...]}`, `glowColor="0 0 85"`, `backgroundColor="#1C1C1C"`. Now inherits theme-aware defaults. |
| `src/components/sections/MarketingServicesGrid.tsx` | Same 3-prop removal. |
| `src/components/sections/ServicesOverview.tsx` | Same 3-prop removal. |
| `src/components/sections/TeamGrid.tsx` | Same 3-prop removal. |
| `src/components/sections/TeamShowcase.tsx` | Same 3-prop removal. |
| `src/components/sections/BlogCard.tsx` | Same 3-prop removal. |
| `src/components/global/Navbar.tsx` | All 4 `hover:bg-white/5` patterns converted to `hover:bg-[var(--nav-hover-bg)]` (dropdown-child link, desktop language toggle, hamburger, mobile-overlay language toggle). |
| `src/components/global/ThemeToggle.tsx` | `BUTTON_SHAPE` constant's trailing `hover:bg-white/5` converted to `hover:bg-[var(--nav-hover-bg)]`. |
| `src/components/global/Footer.tsx` | Top-edge hairline separator `style={{ backgroundColor: '#262626' }}` → `'var(--division-border)'`. Social-icon row `hover:bg-white/5` converted to `hover:bg-[var(--nav-hover-bg)]`. |

## Key technical decisions

- **CSS variables over component-level theme-awareness for utility-class fixes.** Switching `html[data-theme="light"]` at the root is instantaneous for every descendant element and doesn't cost a React re-render. For utility classes (`.glass`, `.glass-nav`, hover overlays, chat-trigger pulse) this was always the right path. The only component that needs component-level `useTheme()` is BorderGlow — because its `glowColor` prop is parsed by JS.

- **BorderGlow uses `useTheme()`, not CSS variables, because its `glowColor` is parsed.** `BorderGlow.tsx:23-31` has `parseHSL(glowColor)` which regex-matches the triplet and extracts h/s/l as numbers. If `glowColor === 'var(--borderglow-glow)'`, the regex fails and the component falls back to `{ h: 40, s: 80, l: 80 }` (warm peach) — wrong visual in both themes. Flipping the string inside the component via `useTheme()` sidesteps the parser entirely. The runtime cost is a single React re-render per theme flip, which is negligible because theme flips are an explicit user action. Component still accepts an explicit `glowColor` prop override for unusual call sites that want a custom color — the `colors` override works the same way — which preserves flexibility without forcing a new prop shape on every call site.

- **Deleted the `.glass` division variants, not migrated.** Post-Finishing-Touches v2, both `[data-division="consulting"] .glass` and `[data-division="marketing"] .glass` held `rgba(255, 255, 255, 0.04)` / `rgba(255, 255, 255, 0.06)` — identical to each other and just a hair different from the base `.glass`'s `0.03` / `0.08`. The divergence is visually imperceptible and having three near-identical rules is a trap for future readers who might think divisions are meant to diverge. One rule, one token pair, done.

- **`.glass-nav` kept as a separate utility with its own token pair.** The navbar backdrop needs high-opacity tint (0.85 alpha — nearly-solid frosted panel so body content doesn't read through) and a more-subtle border. `.glass` is a subtle-overlay recipe (0.03 alpha — barely-there frosted panel). They're two different visual intents; collapsing them to one would force a compromise for one consumer. Kept as two pairs of tokens.

- **`--borderglow-glow` RGB triplet lives in `globals.css` even though the component doesn't consume it.** The component needs HSL triplets (parseHSL's format), so the RGB token isn't read by `BorderGlow.tsx` directly. But the chat-trigger-pulse keyframe uses `rgba(var(--borderglow-glow) / α)` — RGB triplet in space-separated form plugs directly into `rgba()`'s new slash-alpha syntax, which is valid CSS and resolves at paint time. Keeping the RGB token around makes the pattern available for future CSS-only utilities without each needing to hardcode both dark and light values.

- **`--borderglow-bg` chains through `var(--division-surface)`, not a standalone value.** Since every BorderGlow call site was passing `backgroundColor="#1C1C1C"` (dark `--division-surface`), the right semantic default is "the division surface." Chaining `--borderglow-bg: var(--division-surface)` means it automatically tracks whatever `--division-surface` resolves to, in either theme, without needing its own light/dark pair. Simpler, one source of truth.

- **`--nav-hover-bg` over Tailwind's `hover:bg-white/N` shorthand.** Tailwind's `hover:bg-white/5` expands to `hover:bg-[rgba(255,255,255,0.05)]` — literally white, 5% alpha. On a light-mode footer surface (`#F8F9FA`) that's invisible. On a dark-mode footer surface (`#1C1C1C`) it's the intended faint brightening. A CSS variable lets the same class list work in both themes without each caller duplicating the light/dark permutation.

- **Deleted dead `.glow-hover` instead of tokenizing it.** Grep confirmed zero callers in `.tsx`/`.ts` files. The inline comment in `globals.css` said "superseded by BorderGlow in Phase 4" — so it'd been dead for several phases already. Keeping dead code that tokenization would have "fixed" is a signal that the fix isn't needed. Deleted the rule.

- **CTABanner left as-is.** Session E had already migrated its background to `var(--color-ink)`. In light mode, `--color-ink` flips to `#FFFFFF` which matches `--division-bg` — so the banner loses its boundary against the page. The user's plan explicitly called this behavior "perfect": the dark-button-on-white inversion (19.64:1 contrast) carries the visual weight instead of a boundary. Preserving the semantic intent (CTABanner sits on "the deepest surface") which the token represents.

- **Button primitive audited, untouched.** Every CVA variant consumes shadcn HSL tokens (`bg-primary`, `text-primary-foreground`, `border-input`, `ring-ring`, etc.). L1's `html[data-theme="light"]` block overrides all 19 of those HSL tokens. So every Button variant on every page of the site picks up the right colors in both themes automatically. The primitive file has zero hardcoded hex.

- **L1 token tune: `--division-text-muted` in light mode raised from `#9AA0AD` to `#5F6670`.** The Footer muted links hit 2.49:1 contrast on `--division-surface` (`#F8F9FA`) — fails WCAG AA body text (4.5:1 required). `#5F6670` gives 5.50:1 ✓. Picked to preserve visible hierarchy: the light-mode `--division-text-secondary` is `#4B5563` (8.59:1 on the same surface), so muted should be lighter/less intense than secondary. `#5F6670` is distinctly lighter than `#4B5563` but still AA-compliant. Dark-mode value (`#737373`) was already AA-compliant against dark surface; unchanged.

- **Didn't invent new tokens for every edge case.** The Footer hairline reused the existing `--division-border` token (exact semantic match — it IS a hairline border, and the token swaps from `#404040` in dark to `#E5E7EB` in light). The glow-hover deletion freed us from inventing a dead-code token. Token proliferation is a maintenance cost; reuse where semantically correct.

## Component inventory updates

- **`BorderGlow`** — same public API shape, new theme-aware default values. Call sites no longer need to pass `glowColor` / `colors` / `backgroundColor` to get the correct grayscale sheen in the current theme; pass an explicit value only to override. New internal hook dependency: `useTheme()` from `@/components/global`. The component is now a `useTheme()` consumer, which means it will re-render on every theme flip — negligible since theme flips are explicit user actions (not in render hot paths).

## CSS classes and utilities added/changed

- **Rewritten:** `.glass` (consumes variables, division variants deleted).
- **Rewritten:** `.glass-nav` (consumes variables).
- **Deleted:** `[data-division="marketing"] .glow-hover:hover` (dead code).
- **Rewritten:** `@keyframes chat-trigger-pulse` (uses `rgba(var(--borderglow-glow) / α)`).
- **New tokens in `globals.css`:** `--glass-bg`, `--glass-border`, `--glass-bg-strong`, `--glass-border-strong`, `--glass-nav-bg`, `--glass-nav-border`, `--borderglow-glow`, `--borderglow-bg`, `--nav-hover-bg`. Each declared under `:root` (dark defaults) and overridden under `html[data-theme="light"]` (except `--borderglow-bg` which chains through `var(--division-surface)` and needs no explicit light override).
- **Tuned:** `--division-text-muted` in light mode (`#9AA0AD` → `#5F6670` for WCAG AA).

## Exports and barrel files

No changes. The `@/components/global` barrel already exported `useTheme` from Phase L1, which BorderGlow now imports from.

## Verification evidence

- `npm run build` clean — 48/48 static pages, zero TypeScript errors.
- **Dark-mode regression check (critical):** every L1 token reads its pre-phase value — `--color-ink: #0e0e0e`, `--division-bg: #141414`, `--division-accent: #f5f5f5`, body bg `rgb(20, 20, 20)`, body text `rgb(245, 245, 245)`. New L4 tokens in dark mode: `--glass-bg: #ffffff08` (correct rgba 0.03), `--glass-border: #ffffff14` (0.08), `--glass-nav-bg: #0e0e0ed9` (0.85), `--glass-nav-border: #ffffff0f` (0.06), `--nav-hover-bg: #ffffff0d` (0.05), `--borderglow-glow: 241 243 247`, `--borderglow-bg: #1c1c1c` (via `var(--division-surface)`).
- **Light-mode forward check:** every L4 token flips correctly — `--glass-bg: #0a0b120a` (0.04 dark-alpha), `--glass-border: #0a0b1214` (0.08), `--glass-nav-bg: #ffffffd9` (0.85 light), `--glass-nav-border: #0a0b1214` (0.08 dark-alpha), `--nav-hover-bg: #0a0b120d` (0.05 dark-alpha), `--borderglow-glow: 10 11 18`, `--borderglow-bg: #f8f9fa` (division-surface in light). Body bg `rgb(255, 255, 255)`, body text `rgb(10, 11, 18)`.
- **Navbar in light mode:** `getComputedStyle(header.glass-nav)` returns `background-color: rgba(255, 255, 255, 0.85)`, `border-bottom-color: rgba(10, 11, 18, 0.08)`, `backdrop-filter: blur(12px)`. Visible as subtle frosted panel with a thin dark hairline — the intended "not invisible, not heavy" character.
- **Footer in light mode:** `background-color: rgb(248, 249, 250)` (= `--division-surface`), distinct from page bg; hairline reads the `--division-border` token.
- **BorderGlow cards on `/en/consulting` in light mode:** all 4 ConsultingServicesGrid cards — `--card-bg: #f8f9fa`, `--glow-color: hsl(232deg 30% 7% / 80%)` (dark navy), `--gradient-one: radial-gradient(at 80% 55%, #0A0B12 0px, transparent 50%)`, `--gradient-base: linear-gradient(#0A0B12 0 100%)` — theme-flipped correctly.
- **Rapid theme-toggle test (4 consecutive clicks via `button.click()`):** body bg flips `rgb(20, 20, 20) ↔ rgb(255, 255, 255)` on each click, aria-label swaps between "Switch to light mode" and "Switch to dark mode", localStorage persists (`vertex-theme: 'light'` after the final odd-numbered click), no stuck states, no new console errors.
- **CTABanner in light mode on `/en/blog`:** banner bg `rgb(255, 255, 255)` (via `var(--color-ink)`), h2 `rgb(10, 11, 18)` (contrast 19.64:1 ✓), subtext `rgb(75, 85, 99)` (= `--division-text-secondary`), button bg `rgb(10, 11, 18)` + text `rgb(255, 255, 255)` (contrast 19.64:1 ✓).
- **WCAG AA contrast in light mode** — body text on page bg: **19.64:1 ✓** (well above 4.5:1); footer muted link on footer surface: **5.50:1 ✓** (after `--division-text-muted` tune from `#9AA0AD` → `#5F6670`; pre-tune was 2.49:1 which failed AA); nav link (idle, `--division-text-secondary`) approximated on navbar glass: **7.56:1 ✓**; CTA button white-on-dark: **19.64:1 ✓**. All four critical spot-checks pass.
- **Console:** only the pre-existing Phase L1 "Encountered a script tag while rendering React component" React 19 dev-mode false positives — known, unrelated.
- **Final hex-sweep post-phase:** `src/components/` hex hits remaining are all permitted exceptions — `src/components/backgrounds/*` (shader props, Phase L3), `BorderGlow.css` gradient-math fallbacks (defensive-only per the user's instruction), `BorderGlow.tsx` resolved-colors comment + array (theme-selected in JS), inside comments only. Zero uncategorized hex in the component layer.

## What broke (briefly) and recovered

During Step 11, Turbopack's CSS cache didn't pick up the `--division-text-muted` token value change for about 30 seconds after the edit — the served CSS chunk continued serving the `#9AA0AD` value while the file on disk had `#5F6670`. Verified the file content was correct via grep, then added + removed a blank line inside the same selector block to force a file-mtime bump — Turbopack recompiled on the nudge and the new value surfaced in the browser. Post-nudge the contrast check read 5.50:1 as expected. This is a known Turbopack dev-mode CSS caching quirk; doesn't affect production builds.

## What the next phase (L3) should know

- The page frame (navbar, footer, CTABanner, page background, prose, all Button variants) looks correct in both themes on every route.
- The three hero backgrounds are now the only remaining visibly-broken surfaces in light mode:
  - **Silk** (homepage hero) — Three.js shader with a color uniform baked to a dark value. Needs the uniform to swap based on theme. Component consumes `color` prop (current default `'#2A2D33'`). The wrapper component (`BackgroundSilk`) could read `useTheme()` and pass the right hex down.
  - **GridMotion** (consulting hero) — GSAP-animated tiled metallic panels. The panel gradient uses hardcoded dark values (`#14171C`, `#A8ACB4`, `#4A4E56`) in the `.metallic-panel` utility class (`globals.css`). Needs parallel light-mode values — the class itself would need token-ized gradients.
  - **Plasma or solid** (marketing hero) — if Plasma is still mounted, same shader-uniform flip as Silk. If removed per Finishing-Touches v2 and the hero is a solid background, it already works via L1 tokens.
- L3 components should consume `useTheme()` from `@/components/global` in their WRAPPER components (`BackgroundSilk`, `BackgroundPlasma`) — keep shader files themselves theme-agnostic and feed them colors as props.
- Performance consideration: shaders on mobile already reduce DPR to 1 (Session H). Light-mode shader colors may need slight opacity tuning because light-mode can look noisier at lower DPR. Test on mobile early in L3.
- `.metallic-panel` CSS utility (`globals.css`) has 4 hardcoded hex values in its brushed + radial gradients (`#14171C`, `#A8ACB4`, `#4A4E56`, `#14171C`) plus two rgba-literal shadows. Handle in L3 as part of the consulting-hero work.

## What the phase after (L5) should know

- Every "appears on every page" surface is done. L5 needs to sweep section-level components that still have hardcoded dark-only styling. The backlog (from the cross-codebase hex/white-N grep):
  - HeroSection shell (`hover:bg-white/5`)
  - DivisionSplit (`rgba(245,245,245,α)` literals for hover bg / card bg / border — Option A conversion needs token-aware alpha overlays)
  - ServicesOverview card icon containers (`bg-white/5 group-hover:bg-white/10`)
  - ConsultingServicesGrid card icon containers (same)
  - MarketingServicesGrid card icon containers (same)
  - TeamGrid avatar borders (`border-white/10 bg-white/5`)
  - TeamShowcase avatar borders (`border-white/20 bg-[rgba(255,255,255,0.08)]`)
  - MarketingServicePage related-services pills (`hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`)
  - ConsultingServicePage related-services pills (`hover:bg-white/5`)
  - FAQAccordion trigger hover (`hover:bg-white/5`)
  - BlogListingClient filter pill borders (`hover:border-white/20`)
  - Privacy page prose (inherits from prose tokens — should already be correct, verify)
  - Thank-you page (trivial — short confirmation text)
- The pattern is the same as L4's Navbar/Footer work: where a `hover:bg-white/N` or `border-white/N` exists, either convert to `hover:bg-[var(--nav-hover-bg)]` (for the hover overlay pattern) or invent a more specific token if the semantics diverge (a border-color overlay vs a bg overlay).
- CTABanner visual weight in light mode currently relies on the dark button + heading carrying contrast since the banner's bg matches the page. If the next design direction is "banner needs a visible boundary in light mode," consider a different token (perhaps `--color-surface` instead of `--color-ink` — that gives `#F8F9FA` in light, subtly different from `#FFFFFF` page).
- Token tuning: the `--division-text-muted` bump from `#9AA0AD` → `#5F6670` in light mode was an L1 tuning done during L4 to fix Footer contrast. If L5 finds more failing spots, the same token-adjust-and-retest pattern applies.
