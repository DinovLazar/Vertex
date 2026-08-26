# Session: New blog post, consulting vs. marketing (2026-08-26)

A customer-question research pass identified a recurring decision among Macedonian small-business owners: whether a slow-growth problem needs marketing or business consulting. The highest-priority pending Sanity topic matched this question exactly, so it was selected rather than inventing a new topic.

## Research basis

- Google Business Profile guidance confirms the local-search distinction between being discoverable and converting that attention into a visit or enquiry.
- North Macedonia local-marketing results consistently frame small-business growth around visibility, social channels, websites, and operational follow-through.
- The topic backlog had a priority-8 pending entry: `topic-consulting-vs-marketing-when-to-use-which`, with the angle that consulting fixes what the business does while marketing communicates it.

The post answers the practical question: **How do I know whether my business needs consulting or marketing first?**

## Published post

| Field | Value |
|---|---|
| `_id` | `post-consulting-vs-marketing-which-one` |
| Slug | `consulting-vs-marketing-which-one-does-your-business-need` |
| Title EN | Consulting vs. marketing: knowing which one your business actually needs |
| Title MK | Консалтинг наспроти маркетинг: како да знаете што навистина му треба на вашиот бизнис |
| Author | `author-lazar` |
| Division | `marketing` |
| Status | `published` |
| Read time | 6 minutes |
| Tags EN | business consulting, marketing strategy, small business, growth |
| Tags MK | деловен консалтинг, маркетинг стратегија, мал бизнис, раст |
| Featured image | Pexels image by Thirdman, uploaded to Sanity asset `image-a006b7b59baf7903079aaf0ed2ffb105c86cb27b-1880x1253-jpg` |

Both locales contain six h2 sections, with 739 English words and 657 Macedonian words. The copy contains no em dashes and links to the real `/marketing/social-media` and `/consulting/business-consulting` routes.

## Publishing

New idempotent publisher: `scripts/publish-post-consulting-vs-marketing.ts`. It is cloned from the established publisher pattern, uses fixed post/topic IDs, validates both locales through `validateDraft()`, uploads or reuses a Pexels image, creates the Sanity document, closes the selected backlog topic, and POSTs the `blog` revalidation tag to the canonical production URL.

Validation passed before publishing: EN 739 words, MK 657 words, excerpts 204/185 characters, six h2 sections per locale. Publish output confirmed Sanity write, topic close-out, featured-image upload, and production revalidation HTTP 200.

## Verification

- Sanity read-back: post is `published`, featured image exists, title/tags/division match, and the backlog topic is `used` with `resultingPost` pointing to the new post.
- `https://www.vertexconsulting.mk/en/blog/consulting-vs-marketing-which-one-does-your-business-need` returns HTTP 200 and the English title.
- `https://www.vertexconsulting.mk/mk/blog/consulting-vs-marketing-which-one-does-your-business-need` returns HTTP 200 and the Macedonian title.
- `https://www.vertexconsulting.mk/en/blog` returns HTTP 200.
- Production revalidation returned `{"ok":true,"revalidated":"blog"}`; IndexNow was skipped because no key is configured, which is pre-existing.

Content is live in Sanity and does not require a Vercel code deploy. The publisher and project-state records are committed on `main` after verification.
