# Phase 1 — Project Setup

## What was built
Bootstrapped a Next.js 16 + React 19 + TypeScript project with Tailwind v4 (CSS-first config), shadcn/ui (`base-nova` style, neutral base, Base UI primitives), and installed every dependency the later phases need (Motion, three.js + R3F, OGL, GSAP, Resend, Anthropic SDK, next-intl, next-sanity). Path alias `@/*` → `./src/*`.

## Files created
| File | Purpose |
|------|---------|
| `package.json` | Deps + `dev`/`build`/`start`/`lint` scripts |
| `tsconfig.json` | Strict TS, ES2017 target, `@/*` alias, Next plugin |
| `next.config.ts` | Empty `NextConfig` scaffold |
| `eslint.config.mjs` | Flat config extending `eslint-config-next` core-web-vitals + typescript |
| `postcss.config.mjs` | Registers `@tailwindcss/postcss` |
| `components.json` | shadcn config — style `base-nova`, neutral base, `lucide` icons |
| `.gitignore` | Standard Next.js ignores + env + tsbuildinfo |
| `next-env.d.ts` | Generated Next types |
| `src/app/favicon.ico` | Default favicon |
| `public/*.svg` | Default Next.js starter SVGs (file, globe, next, vercel, window) — not used in real pages |
| `.claude/launch.json` | Preview-tool config — `vertex-dev` on port 3000, `npm run dev`, autoPort enabled |

## Key technical decisions
- **Tailwind v4, no JS config file.** All theme tokens live in `@theme` blocks inside `globals.css`. This is intentional — v4's CSS-first API is the supported path.
- **shadcn `base-nova` style.** Picked over `new-york`/`default` because the button component pulls from `@base-ui/react`, which ships with richer accessibility primitives.
- **Path alias standardised as `@/`.** Every import in the project uses it.

## What the next phase should know
- No `src/hooks/` folder exists yet even though `components.json` aliases it.
- No root `tailwind.config.ts`. Do not create one — extend `@theme` in `globals.css` instead.
- `D-15_Website_Design_Document.md` at the repo root is the product spec for the whole site.
