/**
 * Meta Graph API helper — Facebook Page + Instagram Business posting.
 *
 * Auth: long-lived Page Access Token from VERTEX_META_PAGE_ACCESS_TOKEN.
 * Token lifetime is tied to the underlying User Access Token (~60 days).
 * Health is monitored via VERTEX_META_TOKEN_ISSUED_AT date stamp.
 *
 * Docs:
 *   FB:  https://developers.facebook.com/docs/pages-api/posts
 *   IG:  https://developers.facebook.com/docs/instagram-platform/content-publishing
 */

const GRAPH_API_VERSION = 'v21.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

interface MetaEnv {
  pageId: string
  igUserId: string
  pageToken: string
}

function loadMetaEnv(): MetaEnv {
  const pageId = process.env.VERTEX_META_PAGE_ID
  const igUserId = process.env.VERTEX_META_IG_USER_ID
  const pageToken = process.env.VERTEX_META_PAGE_ACCESS_TOKEN
  if (!pageId || !igUserId || !pageToken) {
    throw new Error(
      'Meta env vars missing. Check VERTEX_META_PAGE_ID, VERTEX_META_IG_USER_ID, VERTEX_META_PAGE_ACCESS_TOKEN in .env.local'
    )
  }
  return { pageId, igUserId, pageToken }
}

// ---------- Facebook Page posting ----------

export interface FacebookPostResult {
  postId: string
  postUrl: string
}

/**
 * Post a link with a caption to the Facebook Page feed.
 * Meta auto-builds the preview card from the link's OG tags.
 */
export async function postToFacebook(args: {
  message: string
  link: string
}): Promise<FacebookPostResult> {
  const { pageId, pageToken } = loadMetaEnv()

  const body = new URLSearchParams({
    message: args.message,
    link: args.link,
    access_token: pageToken,
  })

  const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
    method: 'POST',
    body,
    cache: 'no-store',
  })
  const json = await res.json()
  if (!res.ok || json.error) {
    throw new Error(
      `Facebook post failed: ${json.error?.message ?? `HTTP ${res.status}`} (code ${json.error?.code ?? '?'})`
    )
  }

  const postId: string = json.id
  const bareId = postId.split('_')[1] ?? postId
  return {
    postId,
    postUrl: `https://www.facebook.com/${pageId}/posts/${bareId}`,
  }
}

// ---------- Instagram Business posting ----------

export interface InstagramPostResult {
  mediaId: string
  permalink: string | null
}

/**
 * Three-step IG flow: create container → poll until ready → publish.
 * The container takes 2-15 seconds to process server-side before publish works.
 */
export async function postToInstagram(args: {
  imageUrl: string
  caption: string
}): Promise<InstagramPostResult> {
  const { igUserId, pageToken } = loadMetaEnv()

  if (args.caption.length > 2200) {
    throw new Error(`Instagram caption too long (${args.caption.length}, max 2200)`)
  }

  // Step 1: Create the media container
  const createBody = new URLSearchParams({
    image_url: args.imageUrl,
    caption: args.caption,
    access_token: pageToken,
  })
  const createRes = await fetch(`${GRAPH_BASE}/${igUserId}/media`, {
    method: 'POST',
    body: createBody,
    cache: 'no-store',
  })
  const createJson = await createRes.json()
  if (!createRes.ok || createJson.error) {
    throw new Error(
      `Instagram container creation failed: ${createJson.error?.message ?? `HTTP ${createRes.status}`}`
    )
  }
  const creationId: string = createJson.id

  // Step 2: Poll until the container reports FINISHED (typically 2-5s)
  await waitForContainerReady(creationId, pageToken)

  // Step 3: Publish
  const publishBody = new URLSearchParams({
    creation_id: creationId,
    access_token: pageToken,
  })
  const publishRes = await fetch(`${GRAPH_BASE}/${igUserId}/media_publish`, {
    method: 'POST',
    body: publishBody,
    cache: 'no-store',
  })
  const publishJson = await publishRes.json()
  if (!publishRes.ok || publishJson.error) {
    throw new Error(
      `Instagram publish failed: ${publishJson.error?.message ?? `HTTP ${publishRes.status}`}`
    )
  }

  const mediaId: string = publishJson.id

  // Best-effort: fetch the permalink. If this fails, the post is still published.
  let permalink: string | null = null
  try {
    const permaRes = await fetch(
      `${GRAPH_BASE}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(pageToken)}`,
      { cache: 'no-store' }
    )
    const permaJson = await permaRes.json()
    permalink = permaJson.permalink ?? null
  } catch {
    // ignore
  }

  return { mediaId, permalink }
}

async function waitForContainerReady(
  creationId: string,
  token: string,
  maxAttempts = 10,
  delayMs = 2000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${encodeURIComponent(token)}`,
      { cache: 'no-store' }
    )
    const json = await res.json()
    const status: string = json.status_code ?? 'IN_PROGRESS'
    if (status === 'FINISHED') return
    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Instagram container failed with status ${status}`)
    }
    await new Promise((r) => setTimeout(r, delayMs))
  }
  throw new Error('Instagram container did not finish processing within 20 seconds')
}

// ---------- Token health ----------

export interface TokenHealth {
  status: 'ok' | 'warning' | 'expired'
  issuedAt: string | null
  daysUntilExpiry: number | null
  message: string
}

/**
 * Estimate token expiry from VERTEX_META_TOKEN_ISSUED_AT.
 * Meta doesn't expose token introspection cleanly, so we count days from issue.
 */
export function getTokenHealth(): TokenHealth {
  const issuedAt = process.env.VERTEX_META_TOKEN_ISSUED_AT
  if (!issuedAt) {
    return {
      status: 'warning',
      issuedAt: null,
      daysUntilExpiry: null,
      message: 'VERTEX_META_TOKEN_ISSUED_AT not set. Add to .env.local for expiry warnings.',
    }
  }
  const issued = new Date(issuedAt)
  if (Number.isNaN(issued.getTime())) {
    return {
      status: 'warning',
      issuedAt,
      daysUntilExpiry: null,
      message: 'VERTEX_META_TOKEN_ISSUED_AT is not a valid ISO date.',
    }
  }
  const ageDays = Math.floor((Date.now() - issued.getTime()) / 86_400_000)
  const daysUntilExpiry = 60 - ageDays

  if (daysUntilExpiry <= 0) {
    return {
      status: 'expired',
      issuedAt,
      daysUntilExpiry,
      message: `Token is ${ageDays} days old — almost certainly expired. Regenerate before posting again.`,
    }
  }
  if (daysUntilExpiry <= 10) {
    return {
      status: 'warning',
      issuedAt,
      daysUntilExpiry,
      message: `Token expires in ${daysUntilExpiry} day(s). Regenerate soon.`,
    }
  }
  return {
    status: 'ok',
    issuedAt,
    daysUntilExpiry,
    message: `Token valid. ${daysUntilExpiry} days until rotation.`,
  }
}
