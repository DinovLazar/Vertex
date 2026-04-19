import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { getAllSlugs, getPostBySlug } from '@/lib/blog'
import { routing, type Locale } from '@/i18n/routing'
import BlogPostClient from './BlogPostClient'

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllSlugs().map((slug) => ({ locale, slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const post = getPostBySlug(slug, locale)
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
  const post = getPostBySlug(slug, locale)
  if (!post) notFound()
  return <BlogPostClient post={post} />
}
