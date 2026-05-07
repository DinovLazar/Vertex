import { sanityWriteClient } from '../sanity/client'
import { searchPexelsPhoto, downloadPexelsPhoto } from '../pexels'
import type { GeneratedPost } from './toolSchema'

interface CreatePostArgs {
  topicId: string
  draft: GeneratedPost
  division: 'consulting' | 'marketing' | 'shared'
  authorRef: string
  publish: boolean
}

export interface CreatePostResult {
  postId: string
  slug: string
  imageAssetId: string | null
  pexelsCredit: { photographer: string; url: string } | null
}

async function uploadPexelsImage(
  pexelsQuery: string
): Promise<{ assetId: string; credit: { photographer: string; url: string } } | null> {
  const photo = await searchPexelsPhoto(pexelsQuery)
  if (!photo) return null

  const buffer = await downloadPexelsPhoto(photo)
  const asset = await sanityWriteClient.assets.upload('image', buffer, {
    filename: `pexels-${photo.id}.jpg`,
    contentType: 'image/jpeg',
  })

  return {
    assetId: asset._id,
    credit: { photographer: photo.photographer, url: photo.url },
  }
}

export async function createPost(args: CreatePostArgs): Promise<CreatePostResult> {
  const { topicId, draft, division, authorRef, publish } = args

  // Step 1: Upload featured image. Non-blocking — if Pexels fails, we proceed
  // without an image; the BlogCard + post page already fall back gracefully.
  let image: { assetId: string; credit: { photographer: string; url: string } } | null = null
  try {
    image = await uploadPexelsImage(draft.pexelsQuery)
  } catch (err) {
    console.warn(`[generator] Pexels upload failed, proceeding without image:`, err)
  }

  // Step 2: Check slug uniqueness. If a post with this slug already exists,
  // append today's date so we don't clash with an earlier post on the same topic.
  let finalSlug = draft.slug
  const existing = await sanityWriteClient.fetch<string | null>(
    `*[_type == "blogPost" && slug.current == $slug][0]._id`,
    { slug: finalSlug }
  )
  if (existing) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    finalSlug = `${draft.slug}-${datePart}`
  }

  // Step 3: Create the post document in Sanity.
  const postDoc: Record<string, unknown> = {
    _type: 'blogPost',
    title: { _type: 'localizedString', en: draft.title.en, mk: draft.title.mk },
    slug: { _type: 'slug', current: finalSlug },
    excerpt: { _type: 'localizedText', en: draft.excerpt.en, mk: draft.excerpt.mk },
    body: {
      _type: 'localizedPortableText',
      en: draft.body.en,
      mk: draft.body.mk,
    },
    author: { _type: 'reference', _ref: authorRef },
    division,
    publishedAt: new Date().toISOString(),
    readTime: draft.readTime,
    tags: { en: draft.tags.en, mk: draft.tags.mk },
    status: publish ? 'published' : 'draft',
  }

  if (image) {
    postDoc.featuredImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: image.assetId },
      alt: { _type: 'localizedString', en: draft.imageAlt.en, mk: draft.imageAlt.mk },
    }
  }

  const created = await sanityWriteClient.create(postDoc as never)

  // Step 4: Mark the topic as used and link to the resulting post.
  await sanityWriteClient
    .patch(topicId)
    .set({
      status: 'used',
      usedAt: new Date().toISOString(),
      resultingPost: { _type: 'reference', _ref: created._id },
    })
    .commit()

  return {
    postId: created._id,
    slug: finalSlug,
    imageAssetId: image?.assetId ?? null,
    pexelsCredit: image?.credit ?? null,
  }
}

/**
 * Marks the topic as 'failed' with a short reason so the cron in 13C skips it
 * instead of retrying the same broken topic on every run.
 */
export async function markTopicFailed(topicId: string, reason: string): Promise<void> {
  await sanityWriteClient
    .patch(topicId)
    .set({
      status: 'failed',
      failureReason: reason.slice(0, 500),
    })
    .commit()
}
