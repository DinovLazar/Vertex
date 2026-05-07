import { sanityWriteClient } from '../sanity/client'
import { generateDraft } from './generateDraft'
import { validateDraft } from './validateDraft'
import { createPost, markTopicFailed } from './createPost'
import {
  postToFacebook as metaPostToFacebook,
  postToInstagram as metaPostToInstagram,
} from '../meta'
import { sendTelegramMessage, escapeHtml } from '../telegram'
import { siteConfig } from '@/config/site'

export type LogFn = (level: 'info' | 'warn' | 'error', msg: string) => void

interface GenerateNextPostArgs {
  publish?: boolean
  postToFacebook?: boolean
  postToInstagram?: boolean
  sendTelegramNotification?: boolean
  log?: LogFn
}

export interface GenerateNextPostResult {
  ok: boolean
  postId?: string
  slug?: string
  topicId?: string
  reason?: string
  facebookUrl?: string
  instagramUrl?: string
}

interface TopicQueryResult {
  _id: string
  title: { en: string; mk: string }
  description?: { en: string; mk: string }
  division: 'consulting' | 'marketing' | 'shared'
  targetService?: string
  assignedAuthor: { _id: string; name: string; role: { en: string; mk: string } } | null
}

interface AuthorQueryResult {
  _id: string
  name: string
  role: { en: string; mk: string }
}

const PICK_NEXT_TOPIC_QUERY = `
  *[_type == "topicBacklog" && status == "pending"]
    | order(priority asc, _createdAt asc)[0] {
      _id,
      title,
      description,
      division,
      targetService,
      "assignedAuthor": assignedAuthor->{ _id, name, role },
    }
`

const DEFAULT_AUTHORS_BY_DIVISION = {
  consulting: 'author-goran',
  marketing: 'author-lazar',
  shared: 'author-goran',
} as const

async function resolveAuthor(
  assignedAuthor: TopicQueryResult['assignedAuthor'],
  division: 'consulting' | 'marketing' | 'shared'
): Promise<{ ref: string; name: string; roleEn: string }> {
  if (assignedAuthor) {
    return {
      ref: assignedAuthor._id,
      name: assignedAuthor.name,
      roleEn: assignedAuthor.role.en,
    }
  }
  const fallbackId = DEFAULT_AUTHORS_BY_DIVISION[division]
  const author = await sanityWriteClient.fetch<AuthorQueryResult | null>(
    `*[_type == "author" && _id == $id][0]{ _id, name, role }`,
    { id: fallbackId }
  )
  if (!author) {
    throw new Error(
      `Default author ${fallbackId} not found — run scripts/seed-blog.ts first.`
    )
  }
  return { ref: author._id, name: author.name, roleEn: author.role.en }
}

/**
 * Pick the next pending topic and generate a post from it.
 *
 * By default creates a draft (`publish: false`) so Goran can review in Studio
 * before publishing. Phase 13C will flip the default for the weekly cron.
 */
export async function generateNextPost(
  opts: GenerateNextPostArgs = {}
): Promise<GenerateNextPostResult> {
  const log = opts.log ?? ((l, m) => console.log(`[${l}] ${m}`))
  const publish = opts.publish ?? false

  log('info', 'Picking next topic from backlog...')
  const topic = await sanityWriteClient.fetch<TopicQueryResult | null>(PICK_NEXT_TOPIC_QUERY)
  if (!topic) {
    log('warn', 'No pending topics in backlog. Add some in Sanity Studio.')
    return { ok: false, reason: 'no-pending-topics' }
  }
  log('info', `Topic picked: "${topic.title.en}" (division: ${topic.division})`)

  const author = await resolveAuthor(topic.assignedAuthor, topic.division)
  log('info', `Author: ${author.name} (${author.roleEn})`)

  log('info', 'Calling Claude (this takes 30-90s)...')
  let draft
  try {
    draft = await generateDraft({
      topicTitleEn: topic.title.en,
      topicTitleMk: topic.title.mk,
      topicDescriptionEn: topic.description?.en,
      topicDescriptionMk: topic.description?.mk,
      division: topic.division,
      targetService: topic.targetService,
      authorName: author.name,
      authorRoleEn: author.roleEn,
    })
  } catch (err: unknown) {
    const msg = `Claude generation failed: ${err instanceof Error ? err.message : String(err)}`
    log('error', msg)
    await markTopicFailed(topic._id, msg)
    if (opts.sendTelegramNotification !== false) {
      await sendTelegramMessage(
        `❌ <b>Blog generation failed</b>\n\n${escapeHtml(msg)}`
      ).catch(() => {})
    }
    return { ok: false, topicId: topic._id, reason: msg }
  }
  log('info', `Draft generated. Title (EN): "${draft.title.en}"`)

  log('info', 'Running quality gates...')
  const validation = validateDraft(draft)
  if (!validation.ok) {
    const msg = `Validation failed: ${validation.errors.join('; ')}`
    log('error', msg)
    await markTopicFailed(topic._id, msg)
    if (opts.sendTelegramNotification !== false) {
      await sendTelegramMessage(
        `❌ <b>Blog generation failed</b>\n\n${escapeHtml(msg)}`
      ).catch(() => {})
    }
    return { ok: false, topicId: topic._id, reason: msg }
  }
  log('info', 'Validation passed.')

  log('info', `Creating post in Sanity (publish=${publish})...`)
  let result
  try {
    result = await createPost({
      topicId: topic._id,
      draft,
      division: topic.division,
      authorRef: author.ref,
      publish,
    })
  } catch (err: unknown) {
    const msg = `Sanity write failed: ${err instanceof Error ? err.message : String(err)}`
    log('error', msg)
    await markTopicFailed(topic._id, msg)
    if (opts.sendTelegramNotification !== false) {
      await sendTelegramMessage(
        `❌ <b>Blog generation failed</b>\n\n${escapeHtml(msg)}`
      ).catch(() => {})
    }
    return { ok: false, topicId: topic._id, reason: msg }
  }
  log('info', `Post created: ${result.postId}, slug: ${result.slug}`)
  if (result.pexelsCredit) {
    log('info', `Featured image from Pexels by ${result.pexelsCredit.photographer}`)
  } else {
    log('warn', 'No featured image attached.')
  }

  // Revalidate the site so the new post (if published) appears immediately.
  // For drafts we skip — there's no public change to refresh.
  if (publish) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': process.env.REVALIDATE_SECRET ?? '',
        },
        body: JSON.stringify({ tag: 'blog' }),
      })
      if (res.ok) {
        log('info', 'Revalidated /blog on the live site.')
      } else {
        log('warn', `Revalidate returned ${res.status}`)
      }
    } catch (err) {
      log('warn', `Revalidate call failed (not fatal): ${err}`)
    }
  } else {
    log('info', 'Draft mode — skipping revalidate (no public change).')
  }

  // ---- Social media posting ----
  // Only attempt if the post was actually published. No point posting a link to a draft.
  const socialResults: {
    facebook?: { ok: true; url: string } | { ok: false; error: string }
    instagram?: { ok: true; url: string | null } | { ok: false; error: string }
  } = {}

  if (publish && opts.postToFacebook) {
    log('info', 'Posting to Facebook...')
    try {
      const fbResult = await metaPostToFacebook({
        message: draft.facebookCaption,
        link: `${siteConfig.url}/mk/blog/${result.slug}`,
      })
      socialResults.facebook = { ok: true, url: fbResult.postUrl }
      log('info', `Facebook posted: ${fbResult.postUrl}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      socialResults.facebook = { ok: false, error: msg }
      log('error', `Facebook post failed: ${msg}`)
    }
  }

  if (publish && opts.postToInstagram) {
    if (!result.imageAssetId) {
      log('warn', 'Skipping Instagram — no featured image attached.')
      socialResults.instagram = { ok: false, error: 'No featured image available' }
    } else {
      log('info', 'Posting to Instagram (5-20s for image processing)...')
      try {
        // Resolve the image asset's public CDN URL
        const imageDoc = await sanityWriteClient.fetch<{ url: string } | null>(
          `*[_id == $id][0]{ url }`,
          { id: result.imageAssetId }
        )
        const imageUrl = imageDoc?.url
        if (!imageUrl) throw new Error('Sanity image URL not found')

        const igResult = await metaPostToInstagram({
          imageUrl,
          caption: draft.instagramCaption,
        })
        socialResults.instagram = { ok: true, url: igResult.permalink }
        log('info', `Instagram posted: ${igResult.permalink ?? '(permalink pending)'}`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        socialResults.instagram = { ok: false, error: msg }
        log('error', `Instagram post failed: ${msg}`)
      }
    }
  }

  // ---- Telegram notification (success or partial) ----
  if (opts.sendTelegramNotification !== false) {
    log('info', 'Sending Telegram notification...')
    const lines: string[] = []
    if (publish) {
      lines.push(`✅ <b>Blog post published</b>`)
      lines.push('')
      lines.push(`<b>${escapeHtml(draft.title.en)}</b>`)
      lines.push(
        `<a href="${siteConfig.url}/mk/blog/${result.slug}">${siteConfig.url}/mk/blog/${result.slug}</a>`
      )
    } else {
      lines.push(`📝 <b>Blog draft created</b>`)
      lines.push('')
      lines.push(`<b>${escapeHtml(draft.title.en)}</b>`)
      lines.push('Review and publish at vertexconsulting.mk/studio')
    }

    if (socialResults.facebook) {
      lines.push('')
      if (socialResults.facebook.ok) {
        lines.push(`📘 Facebook: <a href="${socialResults.facebook.url}">view</a>`)
      } else {
        lines.push(`❌ Facebook failed: ${escapeHtml(socialResults.facebook.error)}`)
      }
    }
    if (socialResults.instagram) {
      if (socialResults.instagram.ok) {
        const link = socialResults.instagram.url
        lines.push(link ? `📸 Instagram: <a href="${link}">view</a>` : `📸 Instagram: posted`)
      } else {
        lines.push(`❌ Instagram failed: ${escapeHtml(socialResults.instagram.error)}`)
      }
    }

    const tg = await sendTelegramMessage(lines.join('\n'))
    if (tg.ok) {
      log('info', 'Telegram notification sent.')
    } else {
      log('warn', `Telegram notification failed (not fatal): ${tg.error}`)
    }
  }

  return {
    ok: true,
    postId: result.postId,
    slug: result.slug,
    topicId: topic._id,
    facebookUrl: socialResults.facebook?.ok ? socialResults.facebook.url : undefined,
    instagramUrl:
      socialResults.instagram?.ok && socialResults.instagram.url
        ? socialResults.instagram.url
        : undefined,
  }
}
