# Session: New blog post, upgrade accounting software (2026-08-29)

## Topic selection and research

The highest-priority pending entry in the live Sanity `topicBacklog` was selected rather than inventing a topic:

| Field | Value |
|---|---|
| Topic ID | `topic-when-to-upgrade-accounting-software` |
| Priority | 7 |
| Division | Consulting |
| Target service | `/consulting/it-systems` |
| Title EN | When to upgrade your accounting software, and when to wait |
| Title MK | Кога да го надградите сметководствениот софтвер, а кога да почекате |

The article is for Macedonian small-business owners deciding whether their current mix of invoices, spreadsheets, bank statements and accountant handoffs has become a business bottleneck.

One local, source-linked point is included: on 5 January 2026, the Ministry of Finance announced the start of implementing the E-faktura system and described it as a move away from paper-heavy processes and physical documents. The post does not make a legal or tax-compliance claim from that announcement. It tells readers to confirm requirements for their own business with their accountant.

Source: [Ministry of Finance announcement](https://finance.gov.mk/mk-MK/odnosi-so-javnost/novosti/dimitrieska-kocoska-sistemot-e-faktura-seriozen-cekor-vo-borbata-so-sivata-ekonomija-i-reforma-vo-javnite-finansii).

## Published post

| Field | Value |
|---|---|
| `_id` | `post-when-to-upgrade-accounting-software` |
| Slug | `when-to-upgrade-accounting-software-and-when-to-wait` |
| Author | `author-goran` |
| Division | `consulting` |
| Status | `published` |
| Read time | 7 minutes |
| Tags EN | accounting software, small business, invoices, business systems |
| Tags MK | сметководствен софтвер, мал бизнис, фактури, деловни системи |
| Featured image | Pexels photo by Kaboompics, uploaded as Sanity asset `image-c42f39d56668aa7dbe2de18e86b766da4324d735-1880x1253-jpg` |

The post distinguishes genuine upgrade signals from ordinary inconvenience: late decision-useful information, duplicate entry, a process owned by one person's memory, unreliable digital invoice handling, and a lack of evidence that a tool will remove a specific bottleneck. It closes with two-week evidence gathering and a real-workflow vendor demonstration rather than a generic feature checklist.

Both locales contain seven h2 sections. The `validateDraft()` gate passed before publication: EN 1,030 words, MK 992 words, excerpts 159/138 characters, four tags per locale, and no banned phrases. The complete published copy contains no em dashes. Internal links point to `/consulting/it-systems` and `/consulting/workflow-restructuring`.

## Publishing and verification

New idempotent publisher: `scripts/publish-post-upgrade-accounting-software.ts`.

It loads both `.env.local` and `env.local`, validates the draft, guards against slug/author/topic collisions, uploads or reuses a Pexels image, writes the post, closes the exact topic, reads both documents back from Sanity, and revalidates the canonical production URL.

Publish output confirmed:

- Sanity post written as `published`.
- Backlog topic changed to `used` with `resultingPost` pointing at the new post.
- Revalidation returned HTTP 200 with `{ "ok": true, "revalidated": "blog" }`.
- IndexNow was skipped because the existing deployment has no configured key.

After the Vercel cache refresh window, production verification passed:

- `https://www.vertexconsulting.mk/en/blog/when-to-upgrade-accounting-software-and-when-to-wait` returned 200, the correct English title, body copy and Consulting route link, plus the Sanity CDN `og:image`.
- `https://www.vertexconsulting.mk/mk/blog/when-to-upgrade-accounting-software-and-when-to-wait` returned 200, the correct Macedonian title, body copy and Consulting route link, plus the same Sanity CDN `og:image`.
- `https://www.vertexconsulting.mk/en/blog` returned 200 and lists the post at its locale route.

## Environment note

This host had no system `node`, `npm` or `npx`, while the repo already had its dependencies and local `tsx` binary. A non-tracked Node v24.20.0 binary was downloaded to `~/.cache/node-v24.20.0-linux-x64` for this session and added to `PATH` only while validating, linting and running the publisher. No dependency or lockfile change was made.

## Files changed

- `scripts/publish-post-upgrade-accounting-software.ts` — idempotent bilingual Sanity publisher.
- `TRANSLATION_NOTES.md` — MK terminology and E-faktura source notes.
- `src/_project-state/current-state.md` — current shipped-content snapshot.
- `src/_project-state/file-map.md` — publisher entry.
- `src/_project-state/session-blog-upgrade-accounting-software_2026-08-29.md` — this factual session record.

The Sanity content is live independently of a Vercel code deploy. The publisher and project-state records still need their normal task-prefixed commit and push.
