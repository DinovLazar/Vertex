import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { routing, type Locale } from '@/i18n/routing'
import { Breadcrumbs } from '@/components/global'
import BlogPostClient from './BlogPostClient'

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug, locale)
  if (!post) {
    return generatePageMetadata({
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
      path: `/blog/${slug}`,
      locale,
      noIndex: true,
    })
  }
  // Social card = the post's own featured image, not the site-wide Vertex card.
  // Sanity's CDN does the 1.91:1 crop for us, so the asset can stay whatever
  // shape it was uploaded at: `crop=entropy` picks the busiest region rather
  // than blindly centring, and `fm=jpg` avoids handing WebP to the older
  // scrapers (LinkedIn, some chat clients) that still refuse to render it.
  // Posts with no image fall through to the site-wide card as before.
  const image = post.featuredImage
    ? {
        url: `${post.featuredImage.url}?w=1200&h=630&fit=crop&crop=entropy&fm=jpg&q=80`,
        width: 1200,
        height: 630,
        alt: post.featuredImage.alt?.[locale] ?? post.title,
      }
    : null

  return generatePageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    locale,
    image,
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>
}) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const post = await getPostBySlug(slug, locale)
  if (!post) notFound()
  const related = await getRelatedPosts(slug, locale, 2)
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  return (
    <BlogPostClient
      post={post}
      related={related}
      breadcrumbs={
        <Breadcrumbs
          items={[
            { label: tNav('blog'), href: '/blog' },
            { label: post.title },
          ]}
        />
      }
    />
  )
}
