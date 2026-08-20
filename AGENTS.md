# AGENTS.md — Vertex Consulting

## What this is
Bilingual (EN/MK) marketing site for **Vertex Consulting**, live at **https://vertexconsulting.mk**. Two themed divisions (Consulting / Marketing), Sanity-backed blog, Claude-powered chat widget, and an AI content-generator + Facebook/Instagram auto-posting pipeline behind `/admin/generate`.

## Stack
- **Next.js 16.2.3** App Router (Turbopack, RSC) + **React 19.2.4** + TypeScript strict. Package manager: **npm** (package-lock.json only).
- **Tailwind v4** — all theme config lives in `src/app/globals.css` via `@theme`. There is **no tailwind.config file**; don't create one. shadcn (`components.json`, style "base-nova") + CVA + lucide-react.
- **i18n: next-intl** — middleware is `src/proxy.ts` (Next 16 "proxy" convention, not `middleware.ts`). Locales `en`/`mk`, routes `/en/*` and `/mk/*`, dictionaries `messages/{en,mk}.json`. `/admin` and `/api` are locale-free (excluded in the proxy matcher).
- **CMS: Sanity** via next-sanity. Studio mounted at `/studio`; `sanity.config.ts` at root, schemas in `src/sanity/schemas/`.
- **AI:** `@anthropic-ai/sdk` — chat widget (`/api/chat`) + content generator (`src/lib/contentGenerator/`). Email: **Resend**. Animation: `motion` (import from `motion/react`), gsap, three/@react-three/fiber (Silk hero), ogl (Plasma hero).
- **Fonts: Archivo + Source Serif 4** via next/font in `src/app/[locale]/layout.tsx`. Older docs claiming Manrope/Onest or Sora/DM Sans are **stale** — ignore them.

## Commands
- `npm run dev` — Turbopack dev server (port 3000).
- `npm run build` / `npm run start` / `npm run lint`.
- One-off Sanity seeds (idempotent, read `.env.local`): `npx tsx scripts/seed-topics.ts`, `npx tsx scripts/seed-blog.ts`.
- Preview configs in `.claude/launch.json`: `vertex-dev` (dev, :3000) and `vertex-prod` (`npx next start -p 3001`). **Never run both at once** — they conflict on `.next` writes.
- **No test runner exists.** Verify by running the app.

## Repo layout
- `src/_project-state/` — **the project's persistent memory** (see Workflow).
- `src/app/[locale]/(site)/` — public pages (about, blog, consulting, contact, lazar, marketing, privacy, thank-you). `src/app/admin/` + `src/app/api/` — locale-free. `src/app/studio/[[...tool]]` — Sanity Studio.
- `src/components/{backgrounds,chat,global,sections,ui}` · `src/config/{site,navigation,projects,lazar}.ts` (edit `projects.ts` to publish "Our Work" cards) · `src/lib/` (ai, blog, contentGenerator, sanity, resend, telegram, meta, pexels…) · `src/proxy.ts`.
- Root: `D-15_Website_Design_Document.md` (product/design spec), `TRANSLATION_NOTES.md`, `.impeccable.md`, `.env.example` + `.env.local.example`. Root `README.md` is an encoding-mangled one-line heading — worthless, ignore it.

## Workflow — the project-state ritual
`src/_project-state/README.md` is the authoritative workflow doc. **Before any work:** read `current-state.md`, the relevant phase file, `file-map.md` (to locate files), and `00_stack-and-config.md`. **After any work:** update `current-state.md`, write a new phase/session file (`XX_phase-XX-short-name.md`, two-digit; ad-hoc sessions use `session-*.md`), and update `file-map.md`. Document **what IS, not what should be**.
- **Precedence:** live code > `current-state.md` / `file-map.md` (updated 2026-06-28) > phase writeups > `00_stack-and-config.md` (last updated 2026-04-15, **partially stale**: fonts, next.config, next-intl status).
- Phase status: 1–13C and 15A–15F complete. **Open: Phase 14 (SEO & Structured Data) and Phase 16 (Performance Audit & Launch).**
- Git: work directly on **main**; push to main → **Vercel auto-deploy** to vertexconsulting.mk. No PR/review machinery.

## Deploy & env
- **Vercel Hobby plan — 60s function cap.** The generate-post pipeline takes ~2–3 min, so it runs **manually from `npm run dev` on localhost only**, never as a Vercel function. Cron for it is deliberately not wired until Pro.
- **No `.env.local` exists on this machine** — contact form, newsletter, chat widget, Sanity blog content, and `/admin/generate` are inert locally until values are supplied (they live in the Vercel project). The code degrades gracefully: Sanity/Resend/blog guard against missing vars, and `next build` survives without them.
- Every `.env.local` value must also exist in Vercel env vars (Production / Preview / Development). Var **names** are catalogued in `.env.example` + `.env.local.example`. The `VERTEX_*` prefix is deliberate namespacing against shell-var shadowing — keep it for new vars.
- The Meta Page Access Token is long-lived (~60 days); `/admin/generate` shows an expiry banner keyed off `VERTEX_META_TOKEN_ISSUED_AT`.

## Hard constraints / Security
- **The GitHub repo (DinovLazar/Vertex) is PUBLIC.** Never commit secrets or real tokens; only the two `*.example` env files are tracked, everything else `.env*` is gitignored.
- `siteConfig.url` (`src/config/site.ts`) is the canonical base URL — `https://www.vertexconsulting.mk`, **www**, no trailing slash. Vercel serves the site on `www` and 308s the apex to it; the config said the apex until 2026-08-20, which made every canonical tag, hreflang alternate and sitemap entry point at a redirect. `siteConfig.domain` stays bare (`vertexconsulting.mk`) — it is display copy, and anything needing a real hostname derives it from `url`.
- In MK copy: brand names and "SEO" stay in **Latin script**. MK translations are LLM-drafted and await native-speaker review — log phrasing decisions in `TRANSLATION_NOTES.md`.

## Gotchas
- **Docs were written on Windows; this machine is macOS** (Apple Silicon, Node v26). Translate any Windows-specific advice (SWC win32 binary workaround, Segoe UI fallback notes, mk-MK Intl gaps) — it does not apply here. `.claude/settings.local.json` still carries dead Windows-path permission entries. `@types/node` is ^20 vs Node 26 installed; there is no `engines` field.
- **Turbopack cache corruption:** "Failed to open SST file" in dev logs → clear `.next/dev/cache` (or `rm -rf .next`) and restart. Also required after editing `src/proxy.ts`.
- Pending: `public/projects/daliborac.png` was captured while that site showed `[PLACEHOLDER]` content — re-capture when its real content ships (no code change needed).

## Canonical docs
`src/_project-state/README.md` (workflow rules + phase checklist) · `current-state.md` (full snapshot — extremely long lines, **grep it** rather than reading whole) · `file-map.md` (annotated per-file map) · numbered phase writeups `01_…17_`, `13a/b/c`, `phase-l1…l4` and `phase-l6` (there is no l5), `session-*.md` · root `D-15_Website_Design_Document.md` · `TRANSLATION_NOTES.md` · `.impeccable.md` (design context; its font/theme claims are stale).
