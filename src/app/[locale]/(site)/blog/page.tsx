import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { generatePageMetadata } from '@/lib/metadata'
import { getAllPosts } from '@/lib/blog'
import { PageSchema } from '@/components/global'
import type { Locale } from '@/i18n/routing'
import BlogListingClient from './BlogListingClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog.meta' })
  return generatePageMetadata({
    title: t('title'),
    description: t('description'),
    path: '/blog',
    locale,
  })
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const posts = await getAllPosts(locale)
  const tMeta = await getTranslations({ locale, namespace: 'blog.meta' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  return (
    <>
      <PageSchema
        path="/blog"
        type="CollectionPage"
        name={tMeta('title')}
        description={tMeta('description')}
        breadcrumbLabel={tNav('blog')}
      />
      <BlogListingClient posts={posts} />
    </>
  )
}
