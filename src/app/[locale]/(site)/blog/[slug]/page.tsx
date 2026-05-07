import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { routing, type Locale } from '@/i18n/routing'
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
  return generatePageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    locale,
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
  return <BlogPostClient post={post} related={related} />
}
