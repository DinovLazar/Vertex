import { sanityClient, isSanityConfigured } from './sanity/client'
import {
  allPublishedPostsQuery,
  postBySlugQuery,
  postsByDivisionQuery,
  relatedPostsQuery,
  allSlugsQuery,
} from './sanity/queries'
import type { PortableTextBlock } from '@portabletext/types'
import type { Locale } from '@/i18n/routing'

// ---------- Sanity response shapes (pre-locale-collapse) -------------------

type Division = 'consulting' | 'marketing' | 'shared'

interface RawAuthor {
  name: string
  initials: string
  role: { en: string; mk: string } | null
  division: Division
  image: string | null
}

interface RawFeaturedImage {
  alt: { en: string; mk: string } | null
  asset: {
    url: string
    metadata: { dimensions: { width: number; height: number }; lqip: string } | null
  } | null
}

interface BlogPostRaw {
  _id: string
  slug: string
  title: { en: string; mk: string }
  excerpt: { en: string; mk: string }
  body: { en: PortableTextBlock[]; mk: PortableTextBlock[] }
  author: RawAuthor
  division: Division
  publishedAt: string
  readTime: number
  tags: { en: string[]; mk: string[] } | null
  featuredImage: RawFeaturedImage | null
}

// ---------- Public shape (after locale-collapse) ---------------------------

export interface BlogFeaturedImage {
  url: string
  alt: { en: string; mk: string } | null
  lqip: string | null
  dimensions: { width: number; height: number } | null
}

export interface BlogAuthor {
  name: string
  initials: string
  role: string
  division: Division
  image: string | null
}

export interface BlogPost {
  _id: string
  slug: string
  title: string
  excerpt: string
  body: PortableTextBlock[]
  author: BlogAuthor
  division: Division
  publishedAt: string
  readTime: number
  tags: string[]
  featuredImage: BlogFeaturedImage | null
}

// ---------- Helpers --------------------------------------------------------

function collapse(raw: BlogPostRaw, locale: Locale): BlogPost {
  return {
    _id: raw._id,
    slug: raw.slug,
    title: raw.title[locale],
    excerpt: raw.excerpt[locale],
    body: raw.body[locale],
    author: {
      name: raw.author.name,
      initials: raw.author.initials,
      role: raw.author.role?.[locale] ?? '',
      division: raw.author.division,
      image: raw.author.image,
    },
    division: raw.division,
    publishedAt: raw.publishedAt,
    readTime: raw.readTime,
    tags: raw.tags?.[locale] ?? [],
    featuredImage: raw.featuredImage?.asset
      ? {
          url: raw.featuredImage.asset.url,
          alt: raw.featuredImage.alt,
          lqip: raw.featuredImage.asset.metadata?.lqip ?? null,
          dimensions: raw.featuredImage.asset.metadata?.dimensions ?? null,
        }
      : null,
  }
}

// ---------- Configuration guard --------------------------------------------

// When Sanity isn't configured (e.g. a preview/CI build without CMS secrets),
// every fetch below short-circuits to an empty result instead of hitting the
// network. This keeps the build green and the marketing site fully functional;
// only the blog renders empty. Warn once so the cause is obvious in build logs.
let warnedUnconfigured = false
function blogUnavailable(): boolean {
  if (isSanityConfigured) return false
  if (!warnedUnconfigured) {
    warnedUnconfigured = true
    console.warn(
      '[blog] Sanity is not configured — missing NEXT_PUBLIC_SANITY_PROJECT_ID / ' +
        'NEXT_PUBLIC_SANITY_DATASET. Serving empty blog content. Set these env vars ' +
        '(for every Vercel environment, including Preview) to enable the CMS.',
    )
  }
  return true
}

// ---------- Public API -----------------------------------------------------

/**
 * Returns every published post for the given locale, newest first.
 * ISR: 60-second revalidate + tag `blog` for on-demand invalidation.
 */
export async function getAllPosts(locale: Locale): Promise<BlogPost[]> {
  if (blogUnavailable()) return []
  const raws = await sanityClient.fetch<BlogPostRaw[]>(
    allPublishedPostsQuery,
    {},
    { next: { revalidate: 60, tags: ['blog'] } }
  )
  return raws.map((r) => collapse(r, locale))
}

export async function getPostBySlug(slug: string, locale: Locale): Promise<BlogPost | null> {
  if (blogUnavailable()) return null
  const raw = await sanityClient.fetch<BlogPostRaw | null>(
    postBySlugQuery,
    { slug },
    { next: { revalidate: 60, tags: ['blog', `blog:${slug}`] } }
  )
  return raw ? collapse(raw, locale) : null
}

export async function getPostsByDivision(
  division: Division,
  locale: Locale
): Promise<BlogPost[]> {
  if (blogUnavailable()) return []
  const raws = await sanityClient.fetch<BlogPostRaw[]>(
    postsByDivisionQuery,
    { division },
    { next: { revalidate: 60, tags: ['blog'] } }
  )
  return raws.map((r) => collapse(r, locale))
}

export async function getRelatedPosts(
  slug: string,
  locale: Locale,
  limit: number = 2
): Promise<BlogPost[]> {
  if (blogUnavailable()) return []
  const current = await getPostBySlug(slug, locale)
  if (!current) return []
  const raws = await sanityClient.fetch<BlogPostRaw[]>(
    relatedPostsQuery,
    { division: current.division, excludeSlug: slug, limit },
    { next: { revalidate: 60, tags: ['blog'] } }
  )
  return raws.map((r) => collapse(r, locale))
}

/** Locale-neutral — slugs are shared across EN/MK. */
export async function getAllSlugs(): Promise<string[]> {
  if (blogUnavailable()) return []
  return sanityClient.fetch<string[]>(
    allSlugsQuery,
    {},
    { next: { revalidate: 300, tags: ['blog'] } }
  )
}
