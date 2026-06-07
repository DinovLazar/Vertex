---
session: Projects Homepage ("Our Work")
date: 2026-06-02
status: complete
---

# Session — Homepage "Our Work" / Client Projects Showcase

## What was built

A new **"Our Work"** section on the homepage that showcases three client projects in a responsive `BorderGlow` card grid, inserted between `ServicesOverview` and `SocialProof`. The three projects (all Marketing division, all "Website & SEO management") are **Northgate Dental**, **Sunset Services**, and **Optimind**.

Screenshots and live links are **placeholders by design**. Each project's `image` and `href` default to `null`; a `null` image renders a clean grayscale placeholder (a large faint initial watermark + a "Screenshot coming soon" label), and a `null` href renders a muted, non-interactive "Coming soon" instead of a link. When Goran later edits a single config file (`src/config/projects.ts`) to set a real `image` path and `href`, that card automatically becomes a clickable, keyboard-focusable external link (opens in a new tab) with a "View project" affordance and the screenshot rendered via `next/image`.

Everything is bilingual (EN + MK) via a new `home.projects.*` translation namespace, and matches the existing grayscale, dark/light theme-aware design system.

## Files created

| File | What it is |
|------|-----------|
| `src/config/projects.ts` | The single source of truth Goran edits to publish work. Exports a `Project` interface (`name` / `division` / `image: string \| null` / `href: string \| null`) and `projects: Project[]` seeded with the three entries (all `image`/`href` = `null`). A self-documenting header comment walks through the publish workflow (drop image into `public/projects/`, set `image` + `href`; `null` = placeholder; external image hosts need a `next.config.ts` tweak). |
| `src/components/sections/ProjectsShowcase.tsx` | The server component. Self-contained: renders its own `<Section id="work">` + `AnimateIn` heading block + `StaggerContainer amount={0.1}` / `StaggerItem` card grid. Maps `projects` into `BorderGlow` cards; image-or-placeholder block (16:9) + body (division tag, name, service label, View-project/Coming-soon footer). The only interactivity is `BorderGlow`'s pointer-follow edge glow (client), so the section itself stays a server component. |
| `public/projects/.gitkeep` | Empty tracked file so the screenshots folder exists in git for Goran to drop images into. |

## Files modified

| File | What changed |
|------|-------------|
| `src/components/sections/index.ts` | Added `export { default as ProjectsShowcase } from './ProjectsShowcase'` after the `ServicesOverview` export (barrel now 19 components). |
| `src/app/[locale]/(site)/page.tsx` | Added `ProjectsShowcase` to the `@/components/sections` import and rendered `<ProjectsShowcase />` between `<ServicesOverview />`'s `</Section>` and the SocialProof section. Section comments renumbered 4→6 to stay accurate (`SECTION 4: OUR WORK`, `5: SOCIAL PROOF`, `6: CTA BANNER`). No other restructuring. |
| `messages/en.json` | Added `home.projects` (10 keys: overline/heading/subheading/divisionLabel/serviceLabel/viewProject/viewProjectAria/comingSoon/placeholder/imageAlt) inside `home`, between `servicesOverview` and `socialProof`. |
| `messages/mk.json` | Same 10 keys with Macedonian values. |
| `TRANSLATION_NOTES.md` | New `## "Our Work" section additions` block flagging the three MK strings most likely to want a native-speaker pass (`heading` "Неодамнешни проекти", `serviceLabel` "Веб-страница и SEO менаџмент", `placeholder` "Сликата е во подготовка"), each with alternatives. |

## Key technical decisions

- **Config-driven so a non-technical owner can publish work by editing one file.** All per-project data lives in `src/config/projects.ts`. Goran never touches the component, the barrel, the homepage, or the translations to publish a screenshot + link — just one typed array with a self-explanatory comment block. This mirrors the existing `src/config/site.ts` / `navigation.ts` "data in config, presentation in component" split.
- **Placeholder-by-default via nullable `image`/`href`.** Both fields are `string | null` and ship as `null`. The component branches on each independently: `image ?? grayscale placeholder`, `href ?? "Coming soon"`. So a project can have a link before a screenshot or vice-versa, and the "unpublished" state is the safe default — no broken `<img>` or dead link can ever render.
- **Server component; `BorderGlow` owns the only interactivity.** The section is `async` and uses `await getTranslations('home.projects')`, exactly like `ServicesOverview`. The pointer-follow glow is the lone interactive piece and it's already a client component, so no `'use client'` boundary was added at the section level.
- **MK flagged for native review.** The Macedonian copy is LLM-drafted (proficient, not native). Flagged in `TRANSLATION_NOTES.md` rather than silently shipped.

## Reconciliations vs the original brief's template

The brief supplied template code written without having read the live repo; these are the deliberate adjustments made after reading the actual code, all in service of matching the established patterns:

- **`BorderGlow` is a default export, not named.** Used `import BorderGlow from '@/components/ui/BorderGlow'` (the template assumed `import { BorderGlow }`). Props match `ServicesOverview` exactly: `borderRadius={12} glowRadius={40} glowIntensity={0.8} coneSpread={25} animated={false}`, and **no `colors` prop** — the component's theme-aware grayscale defaults (Phase L4/J) are correct, so passing a palette would risk the rainbow the design system rejects.
- **No double border; `rounded-[12px]` not `rounded-2xl`.** `BorderGlow` draws its own rounded container (`.border-glow-card` with `border-radius: var(--border-radius)`), so the template's `border border-white/10 rounded-2xl` on the inner `<article>` was dropped. The inner wrapper carries only `overflow-hidden rounded-[12px]` (matching `borderRadius={12}`) to clip the screenshot to the card's corners — exactly how `BlogCard` does it.
- **Theme-aware tokens, not baked `white/α`.** The template's `rgba(255,255,255,0.04)` / `border-white/10` / `text-white/40` would be invisible in light mode (the site has full light mode since Phases L1–L7). Everything routes through `--division-*` tokens (`--division-bg`/`surface`/`card`/`border`/`text-primary`/`secondary`/`muted`) instead, so the section renders correctly in both themes. The placeholder gradient is `linear-gradient(135deg, var(--division-card), var(--division-surface))`.
- **Site primitives + typography utilities.** Uses `<Section>` (which already provides the template's `py-20 md:py-28` + `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`), `<AnimateIn>` for the heading entrance, and `.overline` / `text-h2` / `text-h3` / `text-small` utilities — matching how `page.tsx` and `ServicesOverview` build their heading + cards, rather than the template's hand-rolled raw Tailwind type classes.
- **Neutral division dot.** The dot uses `--division-text-muted` (per the `ServicesOverview`/`BlogCard` comment "neutral — division is signaled by the label, not by color"), not the template's `--division-accent`.
- **Self-contained section.** The component renders its own `<Section>` + heading (like `CTABanner`), so the homepage insertion is a single `<ProjectsShowcase />` line, honoring the brief's Step 4. (`ServicesOverview`, by contrast, is a bare grid whose `<Section>` + heading live in `page.tsx`.)

## Verification done

- **`npm run build` clean** — `✓ Compiled successfully`, `Finished TypeScript in 11.6s` with zero TypeScript/ESLint errors, **50/50 static pages** generated. (The repeated `z-index is currently not supported` lines are pre-existing satori warnings from `opengraph-image.tsx`, unrelated.)
- **JSON validity** — both `messages/*.json` parse; `home.projects` has the same 10 keys in EN and MK.
- **`/en`** — DOM read-back confirms section order `divisions → services → work → proof` (after Services, before SocialProof), exactly 3 `.border-glow-card`s named Northgate Dental / Sunset Services / Optimind, overline "Our Work", heading "Recent client projects", "Marketing" ×3, "Website & SEO management", "Coming soon", and 0 `<a>` links (all `href` null). Card computed styles: `border-radius: 12px`, `--card-bg` `rgb(28,28,28)` (`--division-surface`, pops against the `#141414` section bg), `--glow-color: hsl(0deg 0% 85% / 80%)` (pure grayscale, no rainbow), gradient seed `#F5F5F5`; inner wrapper `group flex h-full flex-col overflow-hidden rounded-[12px]` with no extra border. Grid is 3 cols at ≥1024px, 2 at the `sm` range, 1 on mobile. Screenshot captured.
- **`/mk`** — fully Macedonian: "Нашата работа" / "Неодамнешни проекти" / subheading / "Маркетинг" / "Сликата е во подготовка" / "Наскоро" / "Веб-страница и SEO менаџмент". Only Latin is the brand names (Northgate Dental / Sunset Services / Optimind — correct per the locked convention) and the decorative initials N/S/O. Zero English UI leaks.
- **Published-state link wiring** — temporarily set Optimind's `href` to `https://example.com`: the card rendered as `<a href="https://example.com" target="_blank" rel="noopener noreferrer" aria-label="Open Optimind — opens in a new tab">` with the `.focus-ring` class, the lucide `ExternalLink` SVG, and "View project"; it was programmatically focusable (`document.activeElement`), while Northgate Dental (null href) stayed a non-link `<div>` "Coming soon". **Reverted to `null`.**
- **Mobile (375px)** — single column, full-width 343px cards (comfortable tap targets), all 3 present.
- **Entrance stagger** — animates to opacity 1 on the foregrounded load. During later measurements the items read opacity 0; root cause confirmed via `document.visibilityState === 'hidden'` — the headless preview tab was backgrounded, which throttles `requestAnimationFrame` and pauses Framer Motion's `whileInView` flip. The shipped, production-proven `ServicesOverview` (identical `StaggerContainer`/`StaggerItem` pattern) read opacity 0 in the exact same states, confirming this is a harness artifact with zero production impact, not a defect.
- **Reduced motion** — the section uses only the shared `AnimateIn` / `StaggerContainer` / `StaggerItem` primitives (under the global `MotionWrapper reducedMotion="user"`) plus standard `transition-*` utilities, which the global `@media (prefers-reduced-motion: reduce)` block in `globals.css` clamps to 0.01ms. No bespoke animation that could break; renders correctly by construction (`prefersReducedMotion` was `false` in the harness, confirming reduced motion wasn't masking anything).

## Follow-ups

- **Goran to publish the work.** Drop screenshots into `public/projects/` (e.g. `public/projects/northgate-dental.jpg`) and set the matching `image` + `href` in `src/config/projects.ts`. Local `/public` images need no config change; a screenshot hosted on another domain would need that host added to `images.remotePatterns` in `next.config.ts` (only `cdn.sanity.io` is whitelisted today).
- **Native-speaker MK pass** on the three flagged strings in `TRANSLATION_NOTES.md` before launch.
- **Optional: per-project custom descriptions.** All three currently share the single `home.projects.serviceLabel` ("Website & SEO management"). If projects later need distinct descriptions, add an optional `descriptionKey?: string` field to the `Project` interface and fall back to `serviceLabel` when it's absent — additive, no breaking change.
- **Optional: per-project division tag.** The `division` field already exists on each `Project` but the card currently shows a fixed `home.projects.divisionLabel` ("Marketing") since all three are Marketing. If a Consulting project is added, switch the tag to resolve from `project.division` (e.g. reuse `home.servicesOverview.divisionLabels.*`).
