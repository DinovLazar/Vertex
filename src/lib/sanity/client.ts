import { createClient } from 'next-sanity'
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
export const apiVersion = '2024-10-01'

/**
 * True only when the Sanity CMS credentials are present in this environment.
 * The data layer in `@/lib/blog` checks this and short-circuits to empty
 * results when it's false, so a deploy that lacks the env vars (e.g. a preview
 * or CI build without CMS secrets) degrades the blog to empty rather than
 * failing the entire build.
 */
export const isSanityConfigured = Boolean(projectId && dataset)

// `createClient` throws "Configuration must contain `projectId`" at *module
// evaluation* when projectId is empty. Because this module is imported by the
// sitemap and every blog route, that throw previously aborted the whole
// `next build` whenever the env var was missing. Fall back to inert
// placeholders so importing this module is always safe; the `isSanityConfigured`
// guards in the data layer ensure we never actually issue a request with them.
const safeProjectId = projectId || 'unconfigured'
const safeDataset = dataset || 'production'

/**
 * Read-only client, served from the Sanity CDN. Used by every server-rendered
 * page to fetch published blog content. Fast, cached, safe to hit on cold path.
 */
export const sanityClient = createClient({
  projectId: safeProjectId,
  dataset: safeDataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})

/**
 * Write client with editor-role token. Only used by server-side automation
 * (seed script, Phase 13B content generator). Never imported from client code.
 */
export const sanityWriteClient = createClient({
  projectId: safeProjectId,
  dataset: safeDataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
