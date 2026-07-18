# Phase 17 — OptiMind legacy URL redirects (2026-07-18)

## What this phase did
Made the legacy OptiMind URLs `/demo` and `/terms` (and their locale-prefixed +
unprefixed variants) return a **308 permanent redirect to the locale homepage**
instead of 404-ing. One file changed: `next.config.ts`. No component, style, or
content changes.

## The problem
`optimind000.com` is the agency's former domain. It is configured at the
DNS/host level to 308-redirect to `vertexconsulting.mk`, and that redirect
**preserves the path**:

- `optimind000.com/` → `https://www.vertexconsulting.mk/en` ✅ works
- `optimind000.com/en/demo` → `…/en/demo` → **404** ❌ (before this phase)
- `optimind000.com/en/terms` → `…/en/terms` → **404** ❌ (before this phase)

Both `/en/demo` and `/en/terms` are still indexed by Google under the OptiMind
brand. The domain-level redirect was doing its job; the Vertex app simply had no
route at those paths and no `redirects()` block in `next.config.ts` to catch
them. **The fix belongs in the Vertex app, not in the DNS config** — redirects
declared in `next.config.ts` run *before* the next-intl proxy (`src/proxy.ts`),
so they resolve cleanly regardless of locale routing.

## The change — redirect table shipped
Added an `async redirects()` block to `next.config.ts`. `permanent: true` emits
a **308** (not a 301), matching the rest of the redirect chain. `:locale(en|mk)`
is a *constrained* path parameter — it matches only `en` or `mk`, so it cannot
swallow other routes.

| Source | Destination | Status |
|---|---|---|
| `/:locale(en\|mk)/demo` | `/:locale` | 308 |
| `/:locale(en\|mk)/terms` | `/:locale` | 308 |
| `/demo` | `/en` | 308 |
| `/terms` | `/en` | 308 |

So at runtime: `/en/demo` → `/en`, `/mk/demo` → `/mk`, `/en/terms` → `/en`,
`/mk/terms` → `/mk`, `/demo` → `/en`, `/terms` → `/en`.

**No catch-all** (e.g. `/:path*` → `/en`) was added, deliberately: it would
intercept every unmatched route and permanently break the localized 404 page
plus any route added in future. Explicit, constrained sources only.

`src/proxy.ts` (the next-intl middleware — Next 16 renamed `middleware.ts` →
`proxy.ts`) was **not touched**.

## Where redirects live + the rebuild caveat
Redirects live in `next.config.ts` under `async redirects()`. **They are baked
in at build time, not read at runtime** — a redirect config change only takes
effect after `npm run build` (and a Vercel redeploy in production). This is the
canonical place for any future legacy-URL → live-route mapping.

## Verification (against a production build)
`npm run build` completed with zero errors (all 50 static pages generated).
Then `npm run start` + `curl -sI`:

- **6 legacy paths** — all returned `308` with the correct `Location`:
  `/en/demo`→`/en`, `/mk/demo`→`/mk`, `/en/terms`→`/en`, `/mk/terms`→`/mk`,
  `/demo`→`/en`, `/terms`→`/en`.
- **8 existing routes** — `/en`, `/mk`, `/en/about`, `/en/contact`,
  `/en/privacy`, `/en/consulting`, `/en/marketing`, `/en/blog` — all `200`.
- **Unknown route** — `/en/this-route-does-not-exist` still `404` (confirms no
  catch-all snuck in).

## Files changed
- `next.config.ts` — added the `async redirects()` block (only functional change).
- Docs: `current-state.md` (shipped entry + Last updated/completed lines),
  `00_stack-and-config.md` (`### next.config.ts` section refreshed to describe
  the redirects block as the canonical legacy-URL home), `file-map.md`
  (`next.config.ts` row), this phase file.

## Deploy
Committed and pushed to `main` → Vercel auto-deploy to vertexconsulting.mk. The
redirects take effect once Vercel finishes the redeploy (build-time bake-in).
