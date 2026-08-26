# Session — New blog post: Google Maps visibility (2026-08-26)

One request: research what the niche is asking, write a blog post in the established
style, attach a fitting free stock image, publish to the live site. Copy hand-written
for this session, published through the same document shape and quality gates as the
Phase 13B generator (same pattern as `session-blog-it-infrastructure_2026-08-20.md`).

Everything below is what IS, not what should be.

---

## Niche research (why this topic)

Web research across MK-market SEO/local-marketing sources converged on one dominant
small-business question: **"why does my competitor show up on Google Maps and I don't?"**
Evidence:

- An MK-market SEO guide (`vpmedia.mk/blog/does-seo-in-macedonia-work`) names the
  incomplete/absent Google Business Profile as the #1 local mistake and stresses
  reviews + complete profiles as the local ranking levers.
- A 2026 North-Macedonia channel playbook (DataLatte) confirms the landscape the post
  speaks into: Google ~95% search share, Facebook dominant socially but not on the map,
  WhatsApp/Viber as the enquiry channels.
- Google's own 2026 docs: video verification is now the default path — the step where
  most owners stall; photos drive direction requests/calls.

The blog had nothing on local visibility, while IT infrastructure, websites, workflows
and AI tools were covered. This fills the gap. It also retires the closest backlog
duplicate ("Why Macedonian businesses need more than just a Facebook page") — same
underlying question, answered with sharper material.

## The post

| Field | Value |
|---|---|
| `_id` | `post-google-maps-visibility-small-business` |
| `slug` | `why-your-business-doesnt-show-up-on-google-maps` (shared EN/MK) |
| Title EN | Why your business doesn't show up on Google Maps — and how to fix it |
| Title MK | Зошто вашиот бизнис не се појавува на Google мапите — и како да го поправите |
| `author` | → `author-lazar` |
| `division` | `marketing` |
| `status` | `published` |
| `publishedAt` | 2026-08-26 |
| `readTime` | 7 |
| Tags EN | google business profile · local seo · maps · reviews |
| Tags MK | Google Business Profile · локално SEO · мапи · препораки |
| Featured image | Pexels → Sanity asset `image-8fcb96b596886609c0c2ca6f67646c8ca2baebf2-1880x1253-jpg` (phone showing a map app over a café table, photo by Theo Decker, https://www.pexels.com/photo/person-wearing-bracelets-holding-black-phone-5448160/) |

Live at:
- https://www.vertexconsulting.mk/en/blog/why-your-business-doesnt-show-up-on-google-maps
- https://www.vertexconsulting.mk/mk/blog/why-your-business-doesnt-show-up-on-google-maps

### Topic provenance

`topic-more-than-facebook-page` (seeded by `scripts/seed-topics.ts`, division
`marketing`, status was `pending`). Closed out manually after publishing —
`status: 'used'`, `usedAt`, `resultingPost` → this post — verified by read-back.
(The publisher script's built-in close-out missed because its guessed `_id`
`topic-why-macedonian-businesses-need-more-than-facebook-page` doesn't match the real
seed ID; see the script note below.)

### Structure (both locales)

7 × `h2`, EN 1082 words / MK 1013 words:

1. Your Facebook page is not on Google Maps — the GBP vs. Facebook-page distinction
2. Step one: find out if you are already listed — claim-vs-create fork
3. Verification is where most businesses give up — 2026 video-verification specifics
4. What fills the profile once you are in — category/hours/services/photos/description/messaging
5. Reviews decide who gets the call — asking method, bought-review warning, replies
6. The weekly routine that keeps you in the top three — ~15 min/week maintenance
7. Where we come in — honest-scope CTA

Internal links: `/marketing/social-media` (primary CTA) and
`/consulting/business-consulting` (the organisational hand-off). Both real routes;
locale-aware `<Link>` handling applies the `/en` `/mk` prefix as before.

---

## `scripts/publish-post-google-maps-visibility.ts`

New one-off publisher, clone of `publish-post-it-infrastructure.ts` with two deltas:

- **Env loading fixed:** loads BOTH `.env.local` and `env.local` (first-set-wins)
  instead of stopping at the first file found. As of 2026-08-26 this machine has a
  stub `.env.local` holding only the four Resend vars, so the old break-at-first-file
  loop aborted with "Missing Sanity env vars". The older seed scripts still have the
  old behaviour and remain broken on this layout until copied forward.
- **Known quirk:** the backlog-topic close-out inside the script uses a guessed
  `TOPIC_ID`; the real seeded ID differs, so the script logged "topic not found" and
  the topic was closed manually against Sanity (verified by read-back). Next publisher
  script should fetch the topic by title or list pending topics instead of guessing.

Otherwise identical guarantees: fixed `_id` + `createOrReplace`, image reuse on re-run,
`publishedAt` preserved on re-run, slug-collision and author-existence guards, real
`validateDraft()` gates (all pass), restricted `mdToPortableText()`, POST to
`/api/revalidate` at `siteConfig.url`.

Flags: `--check` · `--draft` · `--no-revalidate`.

---

## Verification (production)

- `/en/blog/<slug>` and `/mk/blog/<slug>` → **200**; `<title>` correct per locale;
  Sanity CDN og:image present on both.
- Body copy spot-checked in served HTML in both locales (EN + MK strings present).
- `POST /api/revalidate` → `200 {"ok":true,"revalidated":"blog","indexNow":{"skipped":"no-key"}}`.
- `/en/blog` listing contains the slug (picked up within minutes of the flush).
- `sitemap.xml` still serves the pre-publish cached copy — expected ISR lag, refreshes
  on next regeneration; llms.txt likewise (24h revalidate window).
- Backlog read-back: topic `used` with `resultingPost` pointing at the post.

**Pre-existing, not introduced here:** IndexNow skipped (`INDEXNOW_KEY` unset);
MK date renders in English on the listing (known ICU gap, `TRANSLATION_NOTES.md` #29).

## Deploy note

Content-only change: live the moment Sanity was written — nothing here requires a
Vercel deploy. The script + docs are committed on `main`; the push also carries the
pre-existing unpushed `da249fd` (case studies), flagged to Lazar before pushing.

---

# Part 2 — Em-dash sweep across all published posts (Lazar directive, same day)

Mid-session directive: "remove all em dashes from all blog posts". This closes the gap
`14ea8aa` ("copy: remove em dashes from all site text") explicitly flagged as out of
reach on the machine it was made from: *"Not covered: published blog posts in Sanity."*
`buildPrompt.ts` already carries the standing rule for future generated posts; this
sweep cleans the existing corpus.

## What ran

`scripts/dedash-published-posts.ts`: 66 hand-written replacements across the four
earlier published posts (the fifth, this session's Maps post, was de-dashed in its
source before re-publishing). Every replacement was authored per instance following
the `14ea8aa` rewrite rules (colon where the dash introduced a list/restatement,
comma for appositives, semicolon/full stop between independent clauses, parentheses
for paired dashes), never blanket-substituted. Replacements are applied per-span so
bold/link marks survive; the script counts every match before writing and aborts if
any rule matches zero or 2+ times.

Gotchas hit along the way (worth knowing for future copy sweeps):
- 10 of the initial rules crossed Portable Text span boundaries (e.g. bold term +
  rest-of-bullet live in separate spans, dash leading the second span). Rules were
  rewritten against the actual span contents.
- Bullet definitions would have rendered `Term : definition` without the leading
  space folded into the replacement.

The April-era `status: 'draft'` post (`JarLstVcRzJ90n7wDU4dFf`, "Four Signs Your
Business Needs a Workflow Audit", never public) still carries its 18 dashes,
deliberately untouched.

## Verification

- Sanity read-back: all 5 published `blogPost` docs contain zero em dashes
  (title/excerpt/body, both locales). Only the unpublished draft has any.
- All 5 posts × en/mk render **0 em dashes** in served HTML after the Vercel edge
  cache caught up (~1 min; `x-vercel-cache: HIT` briefly served stale copies even
  after `/api/revalidate`, because these routes are static-prerendered, not ISR-tagged).
- Blog tag flush re-sent (`{"ok":true}`).

## Not done

- The draft's dashes stay until that post is actually prepared for publication.
- No social posting pipeline triggered.
